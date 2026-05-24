import { useState, useCallback, useRef, useEffect, type RefObject } from 'react';
import { commentApi } from '../api';
import type { Paste } from '../types';
import { processSelectedText } from '../lib/utils/selectText';

interface SelectedText {
    fromRow: number;
    fromColumn: number;
    toRow: number;
    toColumn: number;
    x: number;
    y: number;
}

export function useCommentInteractions(
    paste: Paste | undefined,
    content: string,
    activeFile: number,
    codeContainerRef: RefObject<HTMLDivElement | null>
) {
    const [selectedText, setSelectedText] = useState<SelectedText | null>(null);
    const [showCommentForm, setShowCommentForm] = useState(false);
    const [hoveredComment, setHoveredComment] = useState<number | null>(null);
    const showCommentFormRef = useRef(false);

    const setShowCommentFormWithRef = (value: boolean) => {
        showCommentFormRef.current = value;
        setShowCommentForm(value);
    };

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

    // ctrl + / command
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
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
    }, [paste, selectedText, content, codeContainerRef]);

    const handleCreateComment = useCallback(async (commentContent: string, author: string) => {
        if (!selectedText || !paste) return null;

        await commentApi.createComment({
            paste_id: paste.id,
            content: commentContent,
            author: author.trim() || undefined,
            page_index: activeFile,
            from_row: selectedText.fromRow,
            from_column: selectedText.fromColumn,
            to_row: selectedText.toRow,
            to_column: selectedText.toColumn,
        });

        const updatedComments = await commentApi.fetchCommentsByPaste(paste.id);
        setShowCommentFormWithRef(false);
        setSelectedText(null);
        window.getSelection()?.removeAllRanges();

        return updatedComments;
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

    return {
        selectedText,
        showCommentForm,
        hoveredComment,
        setShowCommentFormWithRef,
        handleTextSelection,
        handleCreateComment,
        cancelCommentCreation,
        handleCommentMouseEnter,
        handleCommentMouseLeave,
    };
}
