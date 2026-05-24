import { memo } from 'react';
import type { Comment } from '../types';

interface CommentHighlightProps {
    comment: Comment;
    content: string;
    fontMetrics: { lineHeight: number; charWidth: number; baseOffsetX: number; baseOffsetY: number };
    hoveredComment: number | null;
    onMouseEnter: (id: number) => void;
    onMouseLeave: () => void;
}

const CommentHighlight = memo(({
    comment,
    content,
    fontMetrics,
    hoveredComment,
    onMouseEnter,
    onMouseLeave
}: CommentHighlightProps) => {
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

export default CommentHighlight;
