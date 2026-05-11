import hljs from 'highlight.js';
import { languageMap } from './languageMap';

export function detectLanguage(fileName: string, content: string): string {
    // try see the language from the filename, if not then use the highlight.js auto detect function
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext && languageMap[ext]) {
        return languageMap[ext];
    }

    if (content.trim()) {
        const result = hljs.highlightAuto(content);
        if (result.language) {
            return result.language;
        }
    }

    return 'text';
}

export { languageMap } from './languageMap';
