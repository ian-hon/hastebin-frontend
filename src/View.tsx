import './App.css'
import FileBrowser from './components/FileBrowser';
import { useEffect, useState, useMemo, useRef } from 'react';
import type { ChecksumPair, Comment, Paste, PasteFile } from './types';
import ViewingTaskBar from './components/ViewingTaskBar';
import { useParams } from 'react-router';
import { pasteApi } from './api/services/paste.service';
import { fromHex } from './lib/utils/format';
import { detectLanguage } from './lib/language';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark as highlightTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { commentApi } from './api';
import { measureFontMetrics } from './lib/utils/fontMetrics';

function View() {
    const { id } = useParams<{ id: string }>();
    const [paste, setPaste] = useState<Paste | undefined>();
    const [checksumPair, setChecksumPair] = useState<ChecksumPair | undefined>(undefined);
    const [content, setContent] = useState("");
    const [activeFile, setActiveFile] = useState(0);
    const [files, setFiles] = useState<PasteFile[]>([
        {
            fileName: "main",
            content: ""
        }
    ]);

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
    const [commentContent, setCommentContent] = useState("");
    const [commentAuthor, setCommentAuthor] = useState("");
    const [hoveredComment, setHoveredComment] = useState<number | null>(null);
    const [fontMetrics, setFontMetrics] = useState<{ lineHeight: number; charWidth: number; baseOffsetX: number; baseOffsetY: number }>({
        // some default fallback values
        lineHeight: 20,
        charWidth: 8.4,
        baseOffsetX: 16,
        baseOffsetY: 16
    });
    const codeContainerRef = useRef<HTMLDivElement>(null);

    const language = useMemo(() => {
        const fileName = files[activeFile]?.fileName || 'main';
        return detectLanguage(fileName, content);
    }, [activeFile, files, content]);

    const currentPageComments = useMemo(() => {
        return comments.filter(comment => comment.page_index === activeFile);
    }, [comments, activeFile]);

    useEffect(() => {
        if (!id) return;
        pasteApi.fetchPaste(fromHex(id)).then(paste => {
            setPaste(paste.paste);
            let parsedFiles: PasteFile[];
            try {
                parsedFiles = JSON.parse(paste.paste.content) as PasteFile[];
            } catch {
                parsedFiles = [{ fileName: 'main', content: paste.paste.content }];
            }
            setFiles(parsedFiles);
            setContent(parsedFiles[0]?.content ?? '');
            setChecksumPair(paste.checksum_pair);

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

            commentApi.fetchCommentsByPaste(paste.paste.id).then(setComments);
        });
    }, [id])

    function processSelectedText(e: HTMLElement, selection: Selection, selectionLength: number) {
        const range = selection.getRangeAt(0);
        const codeContainer = e.querySelector('code, pre');
        if (!codeContainer) return;

        // i highkey think there is a better way to do this
        const walker = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, null);
        let charsBeforeSelection = 0;
        let node: Text | null;
        while ((node = walker.nextNode() as Text | null)) {
            if (node === range.startContainer) {
                charsBeforeSelection += range.startOffset;
                break;
            }
            charsBeforeSelection += node.textContent?.length || 0;
        }

        const lines = content.split('\n');
        const calcPosition = (charOffset: number) => {
            let charCount = 0;
            for (let i = 0; i < lines.length; i++) {
                if (charCount + lines[i].length >= charOffset) {
                    return { row: i, column: charOffset - charCount };
                }
                charCount += lines[i].length + 1;
            }
            return { row: 0, column: 0 };
        };

        const start = calcPosition(charsBeforeSelection);
        const end = calcPosition(charsBeforeSelection + selectionLength);
        const rect = range.getBoundingClientRect();
        const containerRect = codeContainerRef.current?.getBoundingClientRect();
        if (!containerRect) return;

        setSelectedText({
            fromRow: start.row,
            fromColumn: start.column,
            toRow: end.row,
            toColumn: end.column,
            x: rect.left - containerRect.left + rect.width / 2,
            y: rect.top - containerRect.top,
        });
    }

    useEffect(() => {
        if (!codeContainerRef.current || !content) return;
        // TODO: call this on window resize too
        const timer = setTimeout(() => {
            measureFontMetrics(codeContainerRef, content, setFontMetrics)
        }, 100);
        return () => clearTimeout(timer);
    }, [content, activeFile]);

    const handleTextSelection = (e: React.MouseEvent) => {
        // anchorNode: #text "{text}"
        // anchorOffset: 74
        // baseNode: #text "{text}"
        // baseOffset: 74
        // direction: "none"
        // extentNode: #text "{text}"
        // extentOffset: 78
        // focusNode: #text "{text}"
        // focusOffset: 78
        // isCollapsed: false
        // rangeCount: 1
        // type: "Range"

        const selection = window.getSelection();
        const selectionLength = selection?.toString().trim().length ?? 0;
        console.log('selection', selection);
        if (showCommentForm || !selection || selection.isCollapsed || !paste?.comments_enabled || (selectionLength <= 0)) {
            setSelectedText(null);
            return;
        }

        processSelectedText(e.currentTarget as HTMLElement, selection, selectionLength);
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

                processSelectedText(codeContainerRef.current, selection, selectionLength);
                setShowCommentForm(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [paste, selectedText, content]);

    const handleCreateComment = async () => {
        if (!selectedText || !paste) return;

        try {
            await commentApi.createComment({
                paste_id: paste.id,
                content: commentContent,
                author: commentAuthor.trim() || undefined,
                page_index: activeFile,
                from_row: selectedText.fromRow,
                from_column: selectedText.fromColumn,
                to_row: selectedText.toRow,
                to_column: selectedText.toColumn,
            });

            setComments(await commentApi.fetchCommentsByPaste(paste.id));
            setShowCommentForm(false);
            setCommentContent("");
            setCommentAuthor("");
            setSelectedText(null);
            window.getSelection()?.removeAllRanges();
        } catch {
            alert('Failed to create comment. Please try again.');
        }
    };

    const cancelCommentCreation = () => {
        setShowCommentForm(false);
        setCommentContent("");
        setCommentAuthor("");
        setSelectedText(null);
        window.getSelection()?.removeAllRanges();
    };
    // #endregion

    return <div className="relative flex no-scrollbar overflow-hidden m-0 p-0 w-full h-screen max-h-screen flex-col justify-center items-center bg-background">
        <FileBrowser readOnly={true} files={files} activeFile={activeFile} onChangeFile={changeFile} />
        <div className="overflow-scroll no-scrollbar flex-1 w-full bg-background p-4 relative" onMouseUp={handleTextSelection}>
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

                        {currentPageComments.map((comment) => {
                            const fromTop = comment.from_row * fontMetrics.lineHeight + fontMetrics.baseOffsetY;
                            const fromLeft = comment.from_column * fontMetrics.charWidth + fontMetrics.baseOffsetX;

                            const lines = content.split("\n");

                            const highlightLocations = [];
                            for (let i = comment.from_row; i <= comment.to_row; i++) {
                                // console.log(i);

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
                                                className={`absolute pointer-events-auto bg-yellow-500/10 bg-opacity-20 cursor-pointer hover:bg-opacity-30 transition-opacity ${index == (highlightLocations.length - 1) ? 'border-b-2 border-yellow-500/50' : ''}`}
                                                style={{
                                                    top: `${(e[1] * fontMetrics.lineHeight) + fontMetrics.baseOffsetY}px`,
                                                    left: `${(e[0] * fontMetrics.charWidth) + fontMetrics.baseOffsetX}px`,
                                                    width: `${((e[2] - e[0]) * fontMetrics.charWidth)}px`,
                                                    height: `${fontMetrics.lineHeight}px`,
                                                }}
                                                onMouseEnter={() => setHoveredComment(comment.id)}
                                                onMouseLeave={() => setHoveredComment(null)}
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
                                            <div className="bg-primary text-text rounded-lg drop-shadow-red p-3 border-2 border-border min-w-64 max-w-md">
                                                <div className="text-xs text-textDim mb-1">
                                                    {comment.author ?? 'anonymous'} • {new Date(comment.created_at * 1000).toLocaleString()}
                                                </div>
                                                <div className="text-sm whitespace-pre-wrap wrap-break-word">
                                                    {comment.content}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {selectedText && paste?.comments_enabled && !showCommentForm && (
                            <div
                                className="absolute pointer-events-auto z-50"
                                style={{
                                    top: `${selectedText.y}px`,
                                    left: `${selectedText.x}px`,
                                    transform: 'translate(-50%, calc(-100% - 8px))',
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => setShowCommentForm(true)}
                                    className="bg-accentDim border-2 border-accent text-accent text-sm font-medium py-2 px-4 rounded drop-shadow-red transition-colors duration-300 opacity-100 hover:opacity-80 whitespace-nowrap cursor-pointer"
                                >
                                    Create Comment
                                </button>
                            </div>
                        )}

                        {selectedText && showCommentForm && (
                            <div
                                className="absolute pointer-events-auto z-50"
                                style={{
                                    top: `${selectedText.y}px`,
                                    left: `${selectedText.x}px`,
                                    transform: 'translate(-50%, calc(-100% - 8px))',
                                }}
                                onMouseDown={(e) => e.stopPropagation()}
                                onMouseUp={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="bg-primary rounded-lg drop-shadow-red border-2 border-border p-4 w-80">
                                    <div className="mb-3">
                                        <input
                                            type="text"
                                            value={commentAuthor}
                                            onChange={(e) => setCommentAuthor(e.target.value)}
                                            placeholder="author (optional)"
                                            className="w-full text-text p-2 py-1 bg-dimBackground rounded-md border-2 border-border focus:outline-none focus:border-accent"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <textarea
                                            value={commentContent}
                                            onChange={(e) => setCommentContent(e.target.value)}
                                            placeholder="comment text"
                                            rows={3}
                                            className="w-full text-text p-2 py-1 bg-dimBackground rounded-md border-2 border-border focus:outline-none focus:border-accent resize-none"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={cancelCommentCreation}
                                            className="px-3 py-1.5 text-sm bg-dimBackground border-2 border-border text-text rounded duration-300 opacity-50 hover:opacity-100 transition-opacity"
                                        >
                                            cancel
                                        </button>
                                        <button
                                            onClick={handleCreateComment}
                                            disabled={!commentContent.trim()}
                                            className="px-3 py-1.5 text-sm bg-accentDim border-2 border-accent text-accent rounded duration-300 hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                                        >
                                            add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
        {
            paste && <ViewingTaskBar onDiffToggle={() => { setDiffEnabled(e => !e) }} paste={paste} checksumPair={checksumPair} />
        }
    </div>
}

export default View;
