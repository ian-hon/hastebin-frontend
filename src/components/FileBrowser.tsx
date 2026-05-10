import { Plus, X } from 'lucide-react';
import type { PasteFile } from "../types";

export interface FileBrowserProps {
    files: PasteFile[];

    activeFile: number;
    onCreateFile: () => void;
    onChangeFile: (index: number) => void;
    onDeleteFile: (index: number) => void;

    onRenameFile: (index: number, name: string) => void;
}

const FileBrowser = ({
    files,
    activeFile,
    onCreateFile,
    onChangeFile,
    onDeleteFile,

    onRenameFile,
    ...props
}: FileBrowserProps) => {
    return <div className="bg-secondary w-full h-10 flex flex-row justify-start items-center" {...props}>
        {
            files.map((f, index) =>
                <div onClick={() => { onChangeFile(index) }} key={index} className={`${index == activeFile ? "bg-background" : ""} h-full w-fit gap-4 px-4 py-3 flex flex-row justify-between items-center cursor-pointer`}>
                    <input className="text-text font-mono font-semibold outline-none" onChange={(e) => { onRenameFile(index, e.target.value) }} value={f.fileName} />
                    {
                        (files.length > 1) && <X className="opacity-50 cursor-pointer" color="white" onClick={(e) => { e.stopPropagation(); onDeleteFile(index) }} />
                    }
                </div>
            )
        }
        <Plus className="h-full mx-2 cursor-pointer" onClick={onCreateFile} color="white" />
    </div>;
}

export default FileBrowser;