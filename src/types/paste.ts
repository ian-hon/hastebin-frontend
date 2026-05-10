export interface PasteFile {
    fileName: string,
    content: string
}

export interface Paste {
    id: number;
    files: PasteFile[];
    title?: string;
    author?: string;
    views: number;
    comments_enabled: boolean;
    created_at: number;
    expires_at?: number;
    forked_from?: number;
}