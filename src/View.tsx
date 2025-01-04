import { useEffect, useState } from 'react';
import styles from './App.module.css';
import saveIcon from './assets/save.svg';
import newIcon from './assets/plus.svg';
import filesIcon from './assets/files.svg';
import helpIcon from './assets/help.svg';
import 'highlight.js/styles/github.css';
import { useNavigate, useParams } from "react-router-dom";
import Guide from './Guide';
import { BACKEND_ADDRESS, fromHex, toHex } from './contants';

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

export default function View() {
    let navigate = useNavigate();
    let params = useParams();

    useEffect(() => {
        if ((params.id == undefined) || (params.id == 'help') || (content.length != 0)) {
            return;
        }

        let id = fromHex(params.id);
        console.log(`id checked : ${id}`);

        // check for presence
        fetch(`${BACKEND_ADDRESS}/fetch/${id}`)
        .then((r) => r.json())
        .then((r) => {
            if (r == null) {
                navigate('/');
                return;
            }

            console.log(r);

            changeContent(r['content']);
            changeAuthor(r['signature']);
        })
    })

    const [content, changeContent] = useState('');
    // const [parsed, changeParsed] = useState('');

    const [author, changeAuthor] = useState('');

    if (params.id == 'help') {
        return <Guide/>
    }

    return (
        <div id={styles.page}>
            <div id={styles.navbar}>
                {/* tabs with curved edges
                <div id={styles.tabContainer}>
                    {
                        tabs.map(
                            (m, i) =>
                            <div className={styles.tab} key={i} aria-label={activeTab - i == 1 ? 'before' : (activeTab - i == -1 ? 'after' : activeTab == i ? 'current' : '')}>
                                <div id={styles.content}>
                                    <h3>
                                        {m[0]}
                                    </h3>
                                    <img src={cross}/>
                                </div>
                            </div>
                        )
                    }
                </div> */}
                <div id={styles.actions}>
                    <div className={styles.action} onClick={() => {
                        changeContent('');
                        navigate('/');
                    }}>
                        <img src={newIcon} />
                        <h5>
                            new
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
                    <h5 id={styles.signature} aria-label={author.length == 0 ? 'none' : ''}>
                        {author.length == 0 ? 'no author provided' : author}
                    </h5>
                </div>
            </div>
            <div id={styles.container}>
                <div id={styles.content}>
                    <textarea readOnly={true} onKeyDown={keyPressed} spellCheck={false} onChange={(e) => {
                        changeContent(e.target.value);
                        // changeParsed(highlight.highlightAuto(content).value);
                    }} value={content} />
                    {/* <div dangerouslySetInnerHTML={{ __html: parsed }}/> */}
                </div>
            </div>
        </div>
    );
}
