import './App.css'
import FileBrowser from './components/FileBrowser';
import { useEffect, useState } from 'react';
import TaskBar from './components/TaskBar';
import type { PasteFile } from './types';

function keyPressed(k: any) {
  if (k.key == 'Tab') {
    k.preventDefault();

    const start = k.target.selectionStart;
    const end = k.target.selectionEnd;

    // insert a \t at cursor, then artificially move the cursor forward by one
    k.target.value = k.target.value.substring(0, start) + '\t' + k.target.value.substring(end);
    k.target.selectionStart = k.target.selectionEnd = start + 1;
  }
}

function App() {
  const [content, setContent] = useState("");

  const [activeFile, setActiveFile] = useState(0);
  const [files, setFiles] = useState<PasteFile[]>([
    {
      fileName: "main",
      content: ""
    }
  ]);

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

  function createNewFile() {
    setFiles(f => [
      ...f,
      {
        fileName: "new",
        content: ""
      }
    ]);
  }

  function renameFile(index: number, name: string) {
    setFiles(f => {
      const newFiles = [...f];
      newFiles[index] = { ...newFiles[index], fileName: name };
      return newFiles;
    })
  }

  function deleteFile(index: number) {
    if (files.length <= 1) {
      // dont delete all the files lmao
      return;
    }

    if (activeFile == index) {
      setActiveFile(0);
    } else {
      if (index < activeFile) {
        setActiveFile(f => f - 1);
      }
    }

    setFiles(f => f.filter((_, i) => i !== index));
  }

  useEffect(() => {
    console.log(files);
  }, [files])
  // #endregion

  return <div className="relative flex overflow-hidden m-0 p-0 w-full h-screen max-h-screen flex-col justify-center items-center bg-background">
    <FileBrowser files={files} activeFile={activeFile} onChangeFile={changeFile} onDeleteFile={deleteFile} onCreateFile={createNewFile} onRenameFile={renameFile} />
    <div className="overflow-scroll flex-1 w-full bg-background p-4">
      <textarea className="w-full h-full text-nowrap text-text text-xl font-mono bg-background outline-none resize-none" autoFocus={true} onKeyDown={keyPressed} spellCheck={false} onChange={(e) => {
        setContent(e.target.value);
      }} value={content} />
    </div>
    <TaskBar className="absolute" />
  </div>
}

export default App;
