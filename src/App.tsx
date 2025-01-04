import { useState } from 'react';
import styles from './App.module.css';
import saveIcon from './assets/save.svg';
import newIcon from './assets/plus.svg';
import filesIcon from './assets/files.svg';
import helpIcon from './assets/help.svg';
import deleteIcon from './assets/trash.svg';
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
    const [author, changeAuthor] = useState('');

    const [isMultiFile, changeIsMultiFile] = useState(false);

    const [tabs, changeTabs] = useState<Array<Array<string>>>(new Array(
        new Array('main', ''),
    ));
    const [activeTab, changeActiveTab] = useState(tabs[0]);
    const [activeTabIndex, changeActiveTabIndex] = useState(0);

    function switchTab(n: number) {
        let t = tabs;
        t[activeTabIndex][1] = content;
        changeTabs(t);

        changeActiveTabIndex(n);

        changeActiveTab(tabs[n]);
        changeContent(tabs[n][1]);
    }

    function changeMode(multiFile: boolean) {
        changeIsMultiFile(multiFile);
    }

    function deleteTab(n: number) {
        if (tabs.length == 1) {
            return;
        }

        if (activeTabIndex == n) {
            switchTab(0);
        } else if (activeTabIndex > n) {
            changeActiveTabIndex(a => a - 1);
        }

        let t = tabs;
        t.splice(n, 1);
        changeTabs(t);

        changeTabs(t => [...t]); // mfw react hooks arent hooking
    }

    function addTab() {
        changeTabs(t => [...t, new Array('new', '')]);
    }

    function renameTab(n: number, name: string) {
        let t = tabs;
        t[n][0] = name;
        changeTabs(t);
        changeTabs(t => [...t]);
    }

    return (
        <div id={styles.page}>
            <div id={styles.navbar}>
                <div id={styles.actions}>
                    <div className={styles.action} onClick={() => {
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
                        changeIsMultiFile(false);

                        let t = new Array(new Array('main', ''));

                        changeTabs(t);
                        changeActiveTab(t[0]);
                        changeActiveTabIndex(0);
                    }}>
                        <img src={newIcon} />
                        <h5>
                            new
                        </h5>
                    </div>
                    <div className={styles.action} aria-label={isMultiFile ? 'active' : ''} onClick={() => { changeIsMultiFile(f => !f); }}>
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
                    <input spellCheck={false} id={styles.signature} value={author} onChange={(e) => { changeAuthor(e.target.value) }} placeholder='author (optional)'></input>
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
                <div id={styles.explorer} aria-label={isMultiFile ? '' : 'single'}>
                    {
                        tabs.map((e, i) => <div className={styles.tab} key={i} aria-label={activeTab == e ? 'active' : ''} onClick={() => { switchTab(i); }}>
                            <input spellCheck={false} value={e[0]} onChange={(event) => { renameTab(i, event.target.value) }}/>
                            <img src={deleteIcon} onClick={(e) => {
                                e.stopPropagation();
                                deleteTab(i);
                            }} />
                        </div>)
                    }
                    <div id={styles.add} onClick={() => { addTab(); }}>
                        <img src={newIcon} />
                    </div>
                </div>
                <div id={styles.content}>
                    <textarea onKeyDown={keyPressed} spellCheck={false} onChange={(e) => {
                        changeContent(e.target.value);
                    }} value={content} />
                </div>
            </div>
        </div>
    );
}
