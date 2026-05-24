import './App.css'
import FileBrowser from './components/FileBrowser';
import { useEffect, useState, useMemo, useRef } from 'react';
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
import MeasuringBlock from './components/MeasuringBlock';
import { decrypt } from './lib/utils/crypto';
import { parsePasteFiles } from './lib/utils/parseFiles';
import CommentHighlight from './components/CommentHighlight';
import CommentForm from './components/CommentForm';
import PasswordPrompt from './components/PasswordPrompt';
import { useCommentInteractions } from './hooks/useCommentInteractions';

function View() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const [paste, setPaste] = useState<Paste | undefined>();
    const [content, setContent] = useState("fetching paste, wait a moment...");
    const [activeFile, setActiveFile] = useState(0);
    const [files, setFiles] = useState<PasteFile[]>([{ fileName: "main", content: "" }]);

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

    const commentInteractions = useCommentInteractions(paste, content, activeFile, codeContainerRef);

    // call api
    useEffect(() => {
        if (!id) return;
        pasteApi.fetchPaste(fromHex(id)).then(async paste => {
            console.log(paste);
            setPaste(paste.paste);
            const parsedFiles = parsePasteFiles(paste.paste.content);

            // check if encrypted
            const hasEncryption = parsedFiles.some(file => file.algo);
            if (hasEncryption) {
                setEncryptedFiles(parsedFiles);

                // then check if password is given
                const urlPassword = searchParams.get('password');
                if (urlPassword) {
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
                    const parsedForkedFiles = parsePasteFiles(forkedPaste.paste.content);
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

    const handleCreateCommentWithUpdate = async (content: string, author: string) => {
        try {
            const updatedComments = await commentInteractions.handleCreateComment(content, author);
            if (updatedComments) setComments(updatedComments);
        } catch {
            alert('Failed to create comment. Please try again.');
        }
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

    const oldContent = useMemo(() => forkedFiles[activeFile]?.content ?? '', [forkedFiles, activeFile]);

    return <div className="relative flex no-scrollbar overflow-hidden m-0 p-0 w-full h-full flex-col justify-center items-center bg-background">
        <FileBrowser readOnly={true} files={files} activeFile={activeFile} onChangeFile={changeFile} />
        <div className="overflow-scroll no-scrollbar flex-1 w-full bg-background p-4 relative" onMouseUp={commentInteractions.handleTextSelection} onTouchEnd={commentInteractions.handleTextSelection}>
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
                                hoveredComment={commentInteractions.hoveredComment}
                                onMouseEnter={commentInteractions.handleCommentMouseEnter}
                                onMouseLeave={commentInteractions.handleCommentMouseLeave}
                            />
                        ))}

                        {commentInteractions.selectedText && paste?.comments_enabled && !commentInteractions.showCommentForm && (
                            <div
                                className="fixed pointer-events-auto z-50 px-2"
                                style={{
                                    top: `${commentInteractions.selectedText.y}px`,
                                    left: `${commentInteractions.selectedText.x}px`,
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
                                    onClick={() => commentInteractions.setShowCommentFormWithRef(true)}
                                    className="bg-accentDim border-2 border-border text-accent text-xs sm:text-sm font-medium py-2 px-3 sm:px-4 rounded drop-shadow-red transition-colors duration-300 opacity-100 hover:opacity-80 active:opacity-80 whitespace-nowrap cursor-pointer"
                                >
                                    Create Comment
                                </button>
                            </div>
                        )}

                        {commentInteractions.selectedText && commentInteractions.showCommentForm && (
                            <CommentForm
                                selectedText={commentInteractions.selectedText}
                                onCancel={commentInteractions.cancelCommentCreation}
                                onCreate={handleCreateCommentWithUpdate}
                            />
                        )}
                    </div>
                </>
            )}
        </div>
        {
            paste && <ViewingTaskBar onDiffToggle={() => { setDiffEnabled(e => !e) }} paste={paste} />
        }
        <PasswordPrompt
            isOpen={showPasswordPrompt}
            password={password}
            onPasswordChange={setPassword}
            onSubmit={handleDecrypt}
            onCancel={() => navigate('/')}
            error={decryptionError}
            isLoading={isDecrypting}
        />
    </div>
}

export default View;
