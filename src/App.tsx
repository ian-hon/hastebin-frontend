import './App.css'
import FileBrowser from './components/FileBrowser';
import { useEffect, useState } from 'react';
import type { ExpiryOption, PasteFile } from './types';
import CreationTaskBar from './components/CreationTaskBar';
import { useSearchParams, useNavigate } from 'react-router';
import { pasteApi } from './api/services/paste.service';
import { fromHex, toHex } from './lib/utils/format';

const EXPIRY_MS: Record<ExpiryOption, number | undefined> = {
  none: undefined,
  '1_hour': 3600 * 1000,
  '6_hour': 6 * 3600 * 1000,
  '12_hour': 12 * 3600 * 1000,
  '1_day': 24 * 3600 * 1000,
  '3_day': 3 * 24 * 3600 * 1000,
  '7_day': 7 * 24 * 3600 * 1000,
  '30_day': 30 * 24 * 3600 * 1000,
};

// https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/selectionStart
function keyPressed(k: React.KeyboardEvent<HTMLTextAreaElement>) {
  if (k.key == 'Tab') {
    k.preventDefault();

    // https://developer.mozilla.org/en-US/docs/Web/API/Event/currentTarget
    const start = k.currentTarget.selectionStart;
    const end = k.currentTarget.selectionEnd;

    // insert a \t at cursor, then artificially move the cursor forward by one
    k.currentTarget.value = k.currentTarget.value.substring(0, start) + '\t' + k.currentTarget.value.substring(end);
    k.currentTarget.selectionStart = k.currentTarget.selectionEnd = start + 1;
  }
}

function App() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const copyId = searchParams.get('copy');
  const forkId = searchParams.get('fork');

  const [forkedFrom, setForkedFrom] = useState<number | undefined>();

  const [content, setContent] = useState("");

  const [activeFile, setActiveFile] = useState(0);
  const [files, setFiles] = useState<PasteFile[]>([{ fileName: "main", content: "" }]);

  useEffect(() => {
    const sourceId = copyId ?? forkId;
    if (!sourceId) return;

    pasteApi.fetchPaste(fromHex(sourceId)).then(paste => {
      let parsedFiles: PasteFile[];
      try {
        parsedFiles = JSON.parse(paste.paste.content) as PasteFile[];
      } catch {
        parsedFiles = [{ fileName: 'main', content: paste.paste.content }];
      }
      setFiles(parsedFiles);
      setContent(parsedFiles[0]?.content ?? '');
      if (forkId) setForkedFrom(paste.paste.id);
    });
  }, [copyId, forkId]);

  const onPaste = async (options: { author: string; expiry: ExpiryOption; signature: string }) => {
    // cos the current file might not have the current content
    // if we set the hook, it will not update immediately, so just recreate the list here
    const updatedFiles = files.map((f, i) =>
      i === activeFile ? { ...f, content } : f
    );
    const expiryOffset = EXPIRY_MS[options.expiry];
    const result = await pasteApi.createPaste({
      content: JSON.stringify(updatedFiles),
      author: options.author || undefined,
      comments_enabled: true,
      checksum_passphrase: options.signature || undefined,
      expires_at: expiryOffset ? Date.now() + expiryOffset : undefined,
      forked_from: forkedFrom,
    });
    navigate(`/${toHex(result.id)}`);
  };

  // #region file-switching
  function changeFile(index: number) {
    if (index === activeFile) return;

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
      // if the active file is after the deleted one, decrement the active file
      if (index < activeFile) {
        setActiveFile(f => f - 1);
      }
    }

    setFiles(f => f.filter((_, i) => i !== index));
  }
  // #endregion

  return <div className="relative flex no-scrollbar overflow-hidden m-0 p-0 w-full h-screen max-h-screen flex-col justify-center items-center bg-background">
    <FileBrowser readOnly={false} files={files} activeFile={activeFile} onChangeFile={changeFile} onDeleteFile={deleteFile} onCreateFile={createNewFile} onRenameFile={renameFile} />
    <div className="overflow-scroll no-scrollbar flex-1 w-full bg-background p-4">
      <textarea className="w-full h-full text-nowrap text-text text-xl font-mono bg-background outline-none resize-none" autoFocus={true} onKeyDown={keyPressed} spellCheck={false} onChange={(e) => {
        setContent(e.target.value);
      }} value={content} />
    </div>
    <CreationTaskBar onPaste={onPaste} />
  </div>
}

export default App;
