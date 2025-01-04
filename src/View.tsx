import { useEffect, useState } from 'react';
import styles from './App.module.css';
import newIcon from './assets/plus.svg';
import helpIcon from './assets/help.svg';
import { useNavigate, useParams } from "react-router-dom";
import Guide from './Guide';
import { BACKEND_ADDRESS, fromHex, toHex } from './contants';

import SyntaxHighlighter from 'react-syntax-highlighter';
import { tomorrowNightBlue } from 'react-syntax-highlighter/dist/esm/styles/hljs';

// import 'highlight.js/styles/tokyo-night-dark.css';
// import highlight from 'highlight.js';

export default function View() {
    let navigate = useNavigate();
    let params = useParams();

    useEffect(() => {
        if ((params.id == undefined) || (params.id == 'help') || (fetched)) {
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

            changeFetched(true);
            changeParsed(r['content'][0][1].toString());
            changeAuthor(r['signature']);
        })
    })

    const [fetched, changeFetched] = useState(false);

    const [parsed, changeParsed] = useState('');

    const [author, changeAuthor] = useState('');

    if (params.id == 'help') {
        return <Guide/>
    }

    return (
        <div id={styles.page}>
            <div id={styles.navbar}>
                <div id={styles.actions}>
                    <div className={styles.action} onClick={() => {
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
                        {author.length == 0 ? 'no author provided' : `author : ${author}`}
                    </h5>
                </div>
            </div>
            <div id={styles.container}>
                <div id={styles.content}>
                    <SyntaxHighlighter id={styles.parsed} style={tomorrowNightBlue} aria-label={fetched ? '' : 'loading'} customStyle={{
                        fontSize:'1.33rem',
                        fontFamily:'Source Code Pro'
                    }}>
                        { fetched ? parsed : 'fetching code...' }
                    </SyntaxHighlighter>
                </div>
            </div>
        </div>
    );
}
