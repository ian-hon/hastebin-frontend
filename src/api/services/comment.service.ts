import { apiClient } from '../client';
import { type Comment } from '../../types/comment';

export interface CreateCommentRequest {
    paste_id: number;
    content: string;
    author?: string;
    from_row: number;
    from_column: number;
    to_row: number;
    to_column: number;
}

export interface CreateCommentResponse {
    id: number;
}

export const commentApi = {
    async fetchComment(id: number): Promise<Comment> {
        const response = await apiClient.get<Comment>(`/comment/fetch/${id}`);
        return response.data;
    },

    async fetchCommentsByPaste(pasteId: number): Promise<Comment[]> {
        const response = await apiClient.get<Comment[]>(
            `/comment/paste/${pasteId}`
        );
        return response.data;
    },

    // PLEASE AXIOS DOCS HAVE A SEARCH FUNCTION
    async createComment(
        data: CreateCommentRequest
    ): Promise<CreateCommentResponse> {
        const response = await apiClient.post<CreateCommentResponse>(
            '/comment/create',
            data
        );
        return response.data;
    },
};
