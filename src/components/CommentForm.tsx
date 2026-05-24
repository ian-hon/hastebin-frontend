import { memo, useState } from 'react';

interface CommentFormProps {
    selectedText: { x: number; y: number; fromRow: number; fromColumn: number; toRow: number; toColumn: number };
    onCancel: () => void;
    onCreate: (content: string, author: string) => void;
}

const CommentForm = memo(({
    selectedText,
    onCancel,
    onCreate
}: CommentFormProps) => {
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

export default CommentForm;
