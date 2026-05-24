import './App.css'
import FileBrowser from './components/FileBrowser';
import { useEffect, useState, useMemo, useRef, memo, useCallback } from 'react';
import type { Comment, Paste, PasteFile } from './types';
import ViewingTaskBar from './components/ViewingTaskBar';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { pasteApi } from './api/services/paste.service';
import { fromHex } from './lib/utils/format';
import { detectLanguage } from './lib/language';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark as highlightTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { commentApi } from './api';
import { processSelectedText } from './lib/utils/selectText';
import MeasuringBlock from './components/MeasuringBlock';
import { decrypt } from './lib/utils/crypto';

const CommentHighlight = memo(({
    comment,
    content,
    fontMetrics,
    hoveredComment,
    onMouseEnter,
    onMouseLeave
}: {
    comment: Comment;
    content: string;
    fontMetrics: { lineHeight: number; charWidth: number; baseOffsetX: number; baseOffsetY: number };
    hoveredComment: number | null;
    onMouseEnter: (id: number) => void;
    onMouseLeave: () => void;
}) => {
    const fromTop = comment.from_row * fontMetrics.lineHeight + fontMetrics.baseOffsetY;
    const fromLeft = comment.from_column * fontMetrics.charWidth + fontMetrics.baseOffsetX;

    const lines = content.split("\n");

    const highlightLocations = [];
    for (let i = comment.from_row; i <= comment.to_row; i++) {
        const lineWidth = lines[i].length;
        highlightLocations.push([
            0, // x
            i, // y
            lineWidth, // ending (not width)
        ]);
    }

    highlightLocations[0][0] = comment.from_column;
    highlightLocations[highlightLocations.length - 1][2] = comment.to_column;

    return (
        <div key={comment.id}>
            {
                highlightLocations.map((e, index) => {
                    return <div
                        key={`${comment.id}-${index}`}
                        className={`absolute pointer-events-auto bg-yellow-500/10 bg-opacity-20 cursor-pointer hover:bg-opacity-30 transition-opacity ${index == (highlightLocations.length - 1) ? 'border-b-2 border-yellow-500/50' : ''}`}
                        style={{
                            top: `${(e[1] * fontMetrics.lineHeight) + fontMetrics.baseOffsetY}px`,
                            left: `${(e[0] * fontMetrics.charWidth) + fontMetrics.baseOffsetX}px`,
                            width: `${((e[2] - e[0]) * fontMetrics.charWidth)}px`,
                            height: `${fontMetrics.lineHeight}px`,
                        }}
                        onMouseEnter={() => onMouseEnter(comment.id)}
                        onMouseLeave={onMouseLeave}
                    />
                })
            }

            {hoveredComment === comment.id && (
                <div
                    className="absolute pointer-events-auto z-50"
                    style={{
                        top: `${fromTop - 8}px`,
                        left: `${fromLeft}px`,
                        transform: 'translateY(-100%)',
                    }}
                >
                    <div className="bg-primary text-text rounded-lg drop-shadow-red p-2 sm:p-3 border-2 border-border min-w-48 sm:min-w-64 max-w-[90vw] sm:max-w-md">
                        <div className="text-xs text-textDim mb-1">
                            {comment.author ?? 'anonymous'} • {new Date(comment.created_at * 1000).toLocaleString()}
                        </div>
                        <div className="text-xs sm:text-sm whitespace-pre-wrap break-words">
                            {comment.content}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

const CommentForm = memo(({
    selectedText,
    onCancel,
    onCreate
}: {
    selectedText: { x: number; y: number; fromRow: number; fromColumn: number; toRow: number; toColumn: number };
    onCancel: () => void;
    onCreate: (content: string, author: string) => void;
}) => {
    const [commentContent, setCommentContent] = useState("");
    const [commentAuthor, setCommentAuthor] = useState("");

    const handleSubmit = () => {
        onCreate(commentContent, commentAuthor);
        setCommentContent("");
        setCommentAuthor("");
    };

    return (
        <div
            className="fixed pointer-events-auto z-50 px-2 max-w-full"
            style={{
                top: `${selectedText.y}px`,
                left: `${selectedText.x}px`,
                transform: 'translate(-50%, calc(-100% - 8px))',
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="bg-primary rounded-lg drop-shadow-red border-2 border-border p-3 sm:p-4 w-[90vw] max-w-sm sm:max-w-md">
                <div className="mb-3">
                    <input
                        type="text"
                        value={commentAuthor}
                        onChange={(e) => setCommentAuthor(e.target.value)}
                        placeholder="author (optional)"
                        className="w-full text-sm sm:text-base text-text p-2 py-1 bg-dimBackground rounded-md border-2 border-border focus:outline-none focus:border-accent"
                    />
                </div>
                <div className="mb-3">
                    <textarea
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        placeholder="comment text"
                        rows={3}
                        className="w-full text-sm sm:text-base text-text p-2 py-1 bg-dimBackground rounded-md border-2 border-border focus:outline-none focus:border-accent resize-none"
                        autoFocus
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="px-3 py-1.5 text-sm bg-dimBackground border-2 border-border text-text rounded duration-300 opacity-50 hover:opacity-100 active:opacity-100 transition-opacity"
                    >
                        cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!commentContent.trim()}
                        className="px-3 py-1.5 text-sm bg-accentDim border-2 border-accent text-accent rounded duration-300 hover:opacity-80 active:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                    >
                        add
                    </button>
                </div>
            </div>
        </div>
    );
});

function View() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const [paste, setPaste] = useState<Paste | undefined>();
    const [content, setContent] = useState("fetching paste, wait a moment...");
    const [activeFile, setActiveFile] = useState(0);
    const [files, setFiles] = useState<PasteFile[]>([
        {
            fileName: "main",
            content: ""
        }
    ]);

    // encryption
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const [password, setPassword] = useState('');
    const [decryptionError, setDecryptionError] = useState('');
    const [isDecrypting, setIsDecrypting] = useState(false);
    const [encryptedFiles, setEncryptedFiles] = useState<PasteFile[]>([]);

    // just toggles
    const [diffEnabled, setDiffEnabled] = useState(false);

    // from api
    const [forkedFiles, setForkedFiles] = useState<PasteFile[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);

    // comment creation
    const [selectedText, setSelectedText] = useState<{
        fromRow: number;
        fromColumn: number;
        toRow: number;
        toColumn: number;
        x: number;
        y: number;
    } | null>(null);
    const [showCommentForm, setShowCommentForm] = useState(false);
    const showCommentFormRef = useRef(false);
    const setShowCommentFormWithRef = (value: boolean) => {
        showCommentFormRef.current = value;
        setShowCommentForm(value);
    };
    const [hoveredComment, setHoveredComment] = useState<number | null>(null);
    const [fontMetrics, setFontMetrics] = useState<{ lineHeight: number; charWidth: number; baseOffsetX: number; baseOffsetY: number }>({
        // some default fallback values
        lineHeight: 20,
        charWidth: 8.4,
        baseOffsetX: 16,
        baseOffsetY: 16
    });
    const codeContainerRef = useRef<HTMLDivElement>(null);

    // the text selection algo would be different
    const isMobile = useMemo(() => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }, []);

    const language = useMemo(() => {
        const fileName = files[activeFile]?.fileName || 'main';
        return detectLanguage(fileName, content);
    }, [activeFile, files, content]);

    const currentPageComments = useMemo(() => {
        return comments.filter(comment => comment.page_index === activeFile);
    }, [comments, activeFile]);

    // call api
    useEffect(() => {
        if (!id) return;
        pasteApi.fetchPaste(fromHex(id)).then(async paste => {
            setPaste(paste.paste);
            let parsedFiles: PasteFile[];
            try {
                parsedFiles = JSON.parse(paste.paste.content) as PasteFile[];
            } catch {
                parsedFiles = [{ fileName: 'main', content: paste.paste.content }];
            }

            // check if encrypted
            const hasEncryption = parsedFiles.some(file => file.algo);
            if (hasEncryption) {
                setEncryptedFiles(parsedFiles);

                // then check if password is given
                const urlPassword = searchParams.get('password');
                if (urlPassword) {
                    // console.log(urlPassword);
                    // console.log(decodeURIComponent(urlPassword));
                    try {
                        const decryptedFiles = await Promise.all(
                            parsedFiles.map(async (file) => {
                                if (file.algo) {
                                    const decryptedContent = await decrypt(file.content, urlPassword);
                                    return { fileName: file.fileName, content: decryptedContent };
                                }
                                return file;
                            })
                        );

                        setFiles(decryptedFiles);
                        setContent(decryptedFiles[0]?.content ?? '');

                        // then load comments
                        if (paste.paste.id) {
                            commentApi.fetchCommentsByPaste(paste.paste.id).then(setComments);
                        }
                    } catch {
                        setShowPasswordPrompt(true);
                        setDecryptionError('auto-decryption failed - invalid password in URL');
                        setContent('paste is encrypted. enter password to decrypt.');
                    }
                } else {
                    // no password, so just show the regular modal
                    setShowPasswordPrompt(true);
                    setContent('paste is encrypted. enter password to decrypt.');
                }
            } else {
                // continue normally
                setFiles(parsedFiles);
                setContent(parsedFiles[0]?.content ?? '');
            }

            // fetch forked files if isnt undefined
            if (paste.paste.forked_from) {
                pasteApi.fetchPaste(paste.paste.forked_from).then(forkedPaste => {
                    let parsedForkedFiles: PasteFile[];
                    try {
                        parsedForkedFiles = JSON.parse(forkedPaste.paste.content) as PasteFile[];
                    } catch {
                        // incase
                        parsedForkedFiles = [{ fileName: 'main', content: forkedPaste.paste.content }];
                    }
                    setForkedFiles(parsedForkedFiles);
                }).catch(() => {
                    setForkedFiles([]);
                });
            }

            if (!hasEncryption) {
                // honestly theres nothing stopping users from just fetching regardless
                // TODO: encrypt comments as well
                commentApi.fetchCommentsByPaste(paste.paste.id).then(setComments);
            }
        }).catch((e) => {
            console.log(e);
            navigate(`/`);
        });
    }, [id, navigate, searchParams])

    const handleTextSelection = () => {
        setTimeout(() => {
            if (showCommentFormRef.current) return;

            const selection = window.getSelection();
            const selectionLength = selection?.toString().trim().length ?? 0;

            if (showCommentForm || !selection || selection.isCollapsed || !paste?.comments_enabled || selectionLength <= 0) {
                setSelectedText(null);
                return;
            }

            if (!codeContainerRef.current) return;

            processSelectedText(content, codeContainerRef.current, selection, selectionLength, setSelectedText);
        }, 100);
    };

    const changeFile = (index: number) => {
        setFiles(f => {
            const newFiles = [...f];
            newFiles[activeFile] = { ...newFiles[activeFile], content };
            return newFiles;
        });
        setActiveFile(index);
        setContent(files[index].content);
    };

    const handleDecrypt = async () => {
        if (!password) {
            setDecryptionError('password not provided');
            return;
        }

        setIsDecrypting(true);
        setDecryptionError('');

        try {
            const decryptedFiles = await Promise.all(
                encryptedFiles.map(async (file) => {
                    // should put the encryption as a per paste context, not per file context
                    if (file.algo) {
                        const decryptedContent = await decrypt(file.content, password);
                        return { fileName: file.fileName, content: decryptedContent };
                    }
                    return file;
                })
            );

            setFiles(decryptedFiles);
            setContent(decryptedFiles[0]?.content ?? '');
            setShowPasswordPrompt(false);

            if (paste) {
                commentApi.fetchCommentsByPaste(paste.id).then(setComments);
            }
        } catch (error) {
            setDecryptionError(error instanceof Error ? error.message : 'invalid password');
        } finally {
            setIsDecrypting(false);
        }
    };

    const oldContent = useMemo(() => forkedFiles[activeFile]?.content ?? '', [forkedFiles, activeFile]);

    // #region comment events
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // ctrl + / command
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();

                const selection = window.getSelection();
                const selectionLength = selection?.toString().trim().length ?? 0;
                if (!selection || selection.isCollapsed || !paste?.comments_enabled || (selectionLength <= 0) || !codeContainerRef.current) {
                    return;
                }

                if (selectedText) {
                    setShowCommentForm(true);
                    return;
                }

                processSelectedText(content, codeContainerRef.current, selection, selectionLength, setSelectedText);
                setShowCommentForm(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [paste, selectedText, content]);

    const handleCreateComment = useCallback(async (content: string, author: string) => {
        if (!selectedText || !paste) return;

        try {
            await commentApi.createComment({
                paste_id: paste.id,
                content: content,
                author: author.trim() || undefined,
                page_index: activeFile,
                from_row: selectedText.fromRow,
                from_column: selectedText.fromColumn,
                to_row: selectedText.toRow,
                to_column: selectedText.toColumn,
            });

            setComments(await commentApi.fetchCommentsByPaste(paste.id));
            setShowCommentFormWithRef(false);
            setSelectedText(null);
            window.getSelection()?.removeAllRanges();
        } catch {
            alert('Failed to create comment. Please try again.');
        }
    }, [selectedText, paste, activeFile]);

    const cancelCommentCreation = useCallback(() => {
        setShowCommentFormWithRef(false);
        setSelectedText(null);
        window.getSelection()?.removeAllRanges();
    }, []);

    const handleCommentMouseEnter = useCallback((id: number) => {
        setHoveredComment(id);
    }, []);

    const handleCommentMouseLeave = useCallback(() => {
        setHoveredComment(null);
    }, []);
    // #endregion

    return <div className="relative flex no-scrollbar overflow-hidden m-0 p-0 w-full h-full flex-col justify-center items-center bg-background">
        <FileBrowser readOnly={true} files={files} activeFile={activeFile} onChangeFile={changeFile} />
        <div className="overflow-scroll no-scrollbar flex-1 w-full bg-background p-4 relative" onMouseUp={handleTextSelection} onTouchEnd={handleTextSelection}>
            {diffEnabled ? (
                <ReactDiffViewer
                    oldValue={oldContent}
                    newValue={content}
                    splitView={false}
                    useDarkTheme={true}
                    hideLineNumbers={false}
                    showDiffOnly={false}
                    styles={{
                        variables: {
                            dark: {
                                diffViewerBackground: 'transparent',
                                emptyLineBackground: 'transparent',

                                addedBackground: 'var(--color-diffAdded)',
                                addedColor: 'var(--color-text)',
                                removedBackground: 'var(--color-diffRemoved)',
                                removedColor: 'var(--color-text)',

                                wordAddedBackground: 'var(--color-diffWordAdded)',
                                wordRemovedBackground: 'var(--color-diffWordRemoved)',

                                addedGutterBackground: 'var(--color-diffAddedGutter)',
                                removedGutterBackground: 'var(--color-diffRemovedGutter)',

                                gutterBackground: 'var(--color-dimBackground)',
                                gutterBackgroundDark: 'var(--color-dimBackground)',

                                highlightBackground: 'var(--color-diffHighlight)',
                                highlightGutterBackground: 'var(--color-diffHighlight)',
                            }
                        },
                        line: {
                            fontFamily: 'var(--font-mono)',
                            whiteSpace: 'pre',
                        },
                    }}
                />
            ) : (
                <>
                    <div className="relative overflow-scroll no-scrollbar" ref={codeContainerRef}>
                        <MeasuringBlock codeContainerRef={codeContainerRef} setFontMetrics={setFontMetrics} />
                        <SyntaxHighlighter
                            language={language}
                            style={highlightTheme}
                            customStyle={{
                                margin: 0,
                                padding: 0,
                                fontFamily: 'var(--font-mono)',
                                background: 'transparent',
                                height: '100%',
                                overflow: 'visible',
                                whiteSpace: 'nowrap',
                            }}
                            wrapLongLines={false}
                        >
                            {content}
                        </SyntaxHighlighter>

                        {currentPageComments.map((comment) => (
                            <CommentHighlight
                                key={comment.id}
                                comment={comment}
                                content={content}
                                fontMetrics={fontMetrics}
                                hoveredComment={hoveredComment}
                                onMouseEnter={handleCommentMouseEnter}
                                onMouseLeave={handleCommentMouseLeave}
                            />
                        ))}

                        {selectedText && paste?.comments_enabled && !showCommentForm && (
                            <div
                                className="fixed pointer-events-auto z-50 px-2"
                                style={{
                                    top: `${selectedText.y}px`,
                                    left: `${selectedText.x}px`,
                                    // for mobile (iOS specifically), we render the button underneath the selection
                                    // or else the default selection tooltip gets in the way
                                    transform: isMobile
                                        ? 'translate(-50%, calc(100% + 8px))'
                                        : 'translate(-50%, calc(-100% - 8px))',
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                onTouchEnd={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => setShowCommentFormWithRef(true)}
                                    className="bg-accentDim border-2 border-border text-accent text-xs sm:text-sm font-medium py-2 px-3 sm:px-4 rounded drop-shadow-red transition-colors duration-300 opacity-100 hover:opacity-80 active:opacity-80 whitespace-nowrap cursor-pointer"
                                >
                                    Create Comment
                                </button>
                            </div>
                        )}

                        {selectedText && showCommentForm && (
                            <CommentForm
                                selectedText={selectedText}
                                onCancel={cancelCommentCreation}
                                onCreate={handleCreateComment}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
        {
            paste && <ViewingTaskBar onDiffToggle={() => { setDiffEnabled(e => !e) }} paste={paste} />
        }
        {showPasswordPrompt && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-primary rounded-lg drop-shadow-red border-2 border-border p-6 max-w-md w-full">
                    <h2 className="text-text text-xl font-bold mb-8">encrypted paste</h2>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleDecrypt();
                            }
                        }}
                        placeholder="password"
                        className="w-full text-text p-3 bg-dimBackground rounded-md border-2 border-border focus:outline-none focus:border-accent mb-2"
                        autoFocus
                    />
                    {decryptionError && (
                        <p className="text-red-500 text-sm mb-3">{decryptionError}</p>
                    )}
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => navigate('/')}
                            className="cursor-pointer px-4 py-2 text-sm bg-dimBackground border-2 border-border text-text rounded duration-300 opacity-50 hover:opacity-100 active:opacity-100 transition-opacity"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDecrypt}
                            disabled={isDecrypting || !password}
                            className="cursor-pointer px-4 py-2 text-sm bg-accentDim border-2 border-accent text-accent rounded duration-300 hover:opacity-80 active:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                        >
                            {isDecrypting ? 'Decrypting...' : 'Decrypt'}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
}

export default View;
