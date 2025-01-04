import { useState } from 'react';
import styles from './App.module.css';
import saveIcon from './assets/save.svg';
import newIcon from './assets/plus.svg';
import filesIcon from './assets/files.svg';
import helpIcon from './assets/help.svg';
import { useNavigate } from "react-router-dom";

function keyPressed(k: any) {
    if (k.key == 'Tab') {
        k.preventDefault();
        console.log('tab pressed');

        let start = k.target.selectionStart;
        let end = k.target.selectionEnd;

        k.target.value = k.target.value.substring(0, start) + '\t' + k.target.value.substring(end);
        k.target.selectionStart = k.target.selectionEnd = start + 1;
    }
}

export default function App() {
    let navigate = useNavigate();

    const [content, changeContent] = useState('');

    const [isCreate, changeIsCreate] = useState(true);
    const [isMultiFile, changeIsMultiFile] = useState(false);

    return (
        <div id={styles.page}>
            <div id={styles.navbar}>
                <div id={styles.actions}>
                    <div className={styles.action} aria-label={ isCreate ? '' : 'disabled' } onClick={() => {
                        if (!isCreate) {
                            return;
                        }
                        console.log('save');
                    }}>
                        <img src={saveIcon} />
                        <h5>
                            save
                        </h5>
                    </div>
                    <div className={styles.action} onClick={() => {
                        changeContent('');
                        navigate('/');
                        changeIsCreate(true);
                        changeIsMultiFile(false);
                    }}>
                        <img src={newIcon} />
                        <h5>
                            new
                        </h5>
                    </div>
                    <div className={styles.action}>
                        <img src={filesIcon} />
                        <h5>
                            multiple files
                        </h5>
                    </div>
                    <div className={styles.action} onClick={() => {
                        navigate('/help')
                    }}>
                        <img src={helpIcon} />
                        <h5>
                            how to use
                        </h5>
                    </div>
                </div>
                <hr/>
                <div id={styles.details}>
                    <div id={styles.language}>
                        <label htmlFor="languageSelect">
                            language : 
                        </label>
                        <select id={styles.languageSelect}>
                            <optgroup label="popular">
                                <option>py</option>
                                <option>java</option>
                                <option>javascript</option>
                                <option>html</option>
                                <option>css</option>
                                <option>rust</option>
                            </optgroup>
                            <hr/>
                            <option>asm</option>
                            <option>c</option>
                            <option>cpp</option>
                            <option>c#</option>
                        </select>
                    </div>
                    <input id={styles.signature} placeholder='author (optional)'></input>
                </div>
            </div>
            <div id={styles.container}>
                <div id={styles.guide} aria-label={ content.length == 0 ? '' : 'invisible' }>
                    <h3>1. paste code</h3>
                    <div>
                        <h3>2. press</h3>
                        <img src={saveIcon}/>
                    </div>
                </div>
                <div id={styles.content}>
                    <textarea readOnly={!isCreate} onKeyDown={keyPressed} spellCheck={false} onChange={(e) => {
                        changeContent(e.target.value);
                        // changeParsed(highlight.highlightAuto(content).value);
                    }} value={content} />
                    {/* <div dangerouslySetInnerHTML={{ __html: parsed }}/> */}
                </div>
            </div>
        </div>
    );
}
