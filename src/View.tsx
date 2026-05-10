import './App.css'
import FileBrowser from './components/FileBrowser';
import { useEffect, useState } from 'react';
import type { Paste, PasteFile } from './types';
import ViewingTaskBar from './components/ViewingTaskBar';
import { useParams } from 'react-router';
import { pasteApi } from './api/services/paste.service';
import { fromHex } from './lib/utils';

function View() {
    const { id } = useParams<{ id: string }>();
    const [paste, setPaste] = useState<Paste | undefined>();
    const [content, setContent] = useState("");
    const [activeFile, setActiveFile] = useState(0);
    const [files, setFiles] = useState<PasteFile[]>([
        {
            fileName: "main",
            content: ""
        }
    ]);

    useEffect(() => {
        if (!id) return;
        pasteApi.fetchPaste(fromHex(id)).then(paste => {
            setPaste(paste);
            let parsedFiles: PasteFile[];
            try {
                parsedFiles = JSON.parse(paste.content) as PasteFile[];
            } catch {
                parsedFiles = [{ fileName: 'main', content: paste.content }];
            }
            setFiles(parsedFiles);
            setContent(parsedFiles[0]?.content ?? '');
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
        <div className="overflow-scroll flex-1 w-full bg-background p-4">
            <textarea className="w-full h-full text-nowrap text-text text-xl font-mono bg-background outline-none resize-none" autoFocus={true} spellCheck={false} value={content} contentEditable={false} />
        </div>
        {
            paste && <ViewingTaskBar paste={paste} />
        }
    </div>
}

export default View;
