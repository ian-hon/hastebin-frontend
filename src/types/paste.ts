export interface PasteFile {
    fileName: string,
    content: string
}

export interface Paste {
    id: number;
    files: PasteFile[];
    title: string | null;
    author: string | null;
    views: number;
    comments_enabled: boolean;
    created_at: number;
    expires_at: number | null;
    forked_from: number | null;
}