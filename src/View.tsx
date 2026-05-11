import './App.css'
import FileBrowser from './components/FileBrowser';
import { useEffect, useState, useMemo } from 'react';
import type { ChecksumPair, Paste, PasteFile } from './types';
import ViewingTaskBar from './components/ViewingTaskBar';
import { useParams } from 'react-router';
import { pasteApi } from './api/services/paste.service';
import { fromHex } from './lib/utils';
import { detectLanguage } from './lib/language';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark as highlightTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';
// import { vscDarkPlus as highlightTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';

function View() {
    const { id } = useParams<{ id: string }>();
    const [paste, setPaste] = useState<Paste | undefined>();
    const [checksumPair, setChecksumPair] = useState<ChecksumPair | undefined>(undefined);
    const [content, setContent] = useState("");
    const [activeFile, setActiveFile] = useState(0);
    const [files, setFiles] = useState<PasteFile[]>([
        {
            fileName: "main",
            content: ""
        }
    ]);

    const language = useMemo(() => {
        const fileName = files[activeFile]?.fileName || 'main';
        return detectLanguage(fileName, content);
    }, [activeFile, files, content]);

    useEffect(() => {
        if (!id) return;
        pasteApi.fetchPaste(fromHex(id)).then(paste => {
            setPaste(paste.paste);
            let parsedFiles: PasteFile[];
            try {
                parsedFiles = JSON.parse(paste.paste.content) as PasteFile[];
            } catch {
                parsedFiles = [{ fileName: 'main', content: paste.paste.content }];
            }
            setFiles(parsedFiles);
            setContent(parsedFiles[0]?.content ?? '');
            setChecksumPair(paste.checksum_pair);
        });
    }, [id])

    // #region file-switching
    function changeFile(index: number) {
        setFiles(f => {
            const newFiles = [...f];
            newFiles[activeFile] = { ...newFiles[activeFile], content };
            return newFiles;
        })
        setActiveFile(index);
        setContent(files[index].content);
    }
    // #endregion

    return <div className="relative flex overflow-hidden m-0 p-0 w-full h-screen max-h-screen flex-col justify-center items-center bg-background">
        <FileBrowser readOnly={true} files={files} activeFile={activeFile} onChangeFile={changeFile} />
        <div className="overflow-scroll no-scrollbar flex-1 w-full bg-background p-4">
            <SyntaxHighlighter
                language={language}
                style={highlightTheme}
                customStyle={{
                    margin: 0,
                    padding: 0,
                    fontFamily: 'var(--font-mono)',
                    background: 'transparent',
                    height: '100%',
                    whiteSpace: 'nowrap',
                }}
                wrapLongLines={false}
            >
                {content}
            </SyntaxHighlighter>
        </div>
        {
            paste && <ViewingTaskBar paste={paste} checksumPair={checksumPair} />
        }
    </div>
}

export default View;
