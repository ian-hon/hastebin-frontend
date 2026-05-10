import { apiClient } from '../client';
import { type Paste } from '../../types/paste';

export interface CreatePasteRequest {
    content: string;
    title?: string;
    author?: string;
    comments_enabled: boolean;
    checksum_passphrase?: string;
    expires_at?: number;
    forked_from?: number;
}

export interface CreatePasteResponse {
    id: number;
}

export const pasteApi = {
    async fetchPaste(id: number | string): Promise<Paste> {
        const response = await apiClient.get<Paste>(`/paste/fetch/${id}`);
        return response.data;
    },

    // WHY DOES AXIOS DOCS NOT HAVE A SEARCH BAR???
    // https://axios.rest/pages/advanced/request-method-aliases.html#request-aliases
    // https://deadsimplechat.com/blog/axios-get-and-post-examples/
    async createPaste(data: CreatePasteRequest): Promise<CreatePasteResponse> {
        const response = await apiClient.post<CreatePasteResponse>(
            '/paste/create',
            data
        );
        return response.data;
    },
};
