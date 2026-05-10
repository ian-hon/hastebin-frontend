export { apiClient, ApiError } from './client';
export { pasteApi } from './services/paste.service';
export { commentApi } from './services/comment.service';

export type {
    CreatePasteRequest,
    CreatePasteResponse,
} from './services/paste.service';

export type {
    CreateCommentRequest,
    CreateCommentResponse,
} from './services/comment.service';
