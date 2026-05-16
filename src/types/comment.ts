export interface Comment {
    paste_id: number;
    id: number;
    content: string;
    author: string | null;
    created_at: number;
    page_index: number;
    from_row: number;
    from_column: number;
    to_row: number;
    to_column: number;
}