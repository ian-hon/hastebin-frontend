export type ExpiryOption = 'none' | '1_hour' | '6_hour' | '12_hour' | '1_day' | '3_day' | '7_day' | '30_day';

export interface PasteFile {
    fileName: string,
    content: string
}

export interface Paste {
    id: number;
    content: string;
    title?: string;
    author?: string;
    views: number;
    comments_enabled: boolean;
    created_at: number;
    expires_at?: number;
    forked_from?: number;
}