import { Plus, X } from 'lucide-react';
import type { PasteFile } from "../types";

export interface FileBrowserProps {
    files: PasteFile[];

    activeFile: number;
    readOnly: boolean;


    onCreateFile?: () => void;
    onChangeFile: (index: number) => void;
    onDeleteFile?: (index: number) => void;

    onRenameFile?: (index: number, name: string) => void;
}

const FileBrowser = ({
    files,

    activeFile,
    readOnly,

    onCreateFile,
    onChangeFile,
    onDeleteFile,

    onRenameFile,

    ...props
}: FileBrowserProps) => {
    return <div className="bg-secondary w-full h-10 flex flex-row justify-start items-center overflow-x-auto no-scrollbar" {...props}>
        {
            readOnly ? files.map((f, index) =>
                <div onClick={() => { onChangeFile(index) }} key={index} className={`${index == activeFile ? "bg-background" : ""} h-full w-fit gap-4 px-3 sm:px-4 py-3 flex flex-row justify-between items-center cursor-pointer flex-shrink-0`}>
                    <h3 className="text-text text-sm sm:text-base font-mono font-semibold outline-none whitespace-nowrap">{f.fileName}</h3>
                </div>
            ) :
                <>
                    {
                        files.map((f, index) =>
                            <div onClick={() => { onChangeFile(index) }} key={index} className={`${index == activeFile ? "bg-background" : ""} h-full w-fit gap-4 px-3 sm:px-4 py-3 flex flex-row justify-between items-center cursor-pointer flex-shrink-0`}>
                                <input className="text-text text-sm sm:text-base font-mono font-semibold outline-none w-20 sm:w-auto" onChange={(e) => { onRenameFile!(index, e.target.value) }} value={f.fileName} />
                                {
                                    (files.length > 1) && <X className="opacity-50 cursor-pointer flex-shrink-0" color="white" size={16} onClick={(e) => { e.stopPropagation(); onDeleteFile!(index) }} />
                                }
                            </div>
                        )
                    }
                    < Plus className="h-full mx-2 cursor-pointer flex-shrink-0" onClick={onCreateFile} color="white" size={20} />
                </>
        }
    </div>;
}

export default FileBrowser;