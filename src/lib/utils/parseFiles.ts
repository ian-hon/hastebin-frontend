import type { PasteFile } from '../../types';

export function parsePasteFiles(content: string): PasteFile[] {
    try {
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) ? parsed : [{ fileName: 'main', content }];
    } catch {
        return [{ fileName: 'main', content }];
    }
}
