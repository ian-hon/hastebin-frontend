import { useEffect, useState } from 'react';
import styles from './App.module.css';
import newIcon from './assets/plus.svg';
import helpIcon from './assets/help.svg';
import eyeIcon from './assets/eye.svg';
import copyIcon from './assets/copy.svg';
import filledArrowIcon from './assets/filled-arrow.svg';
import { useNavigate, useParams } from "react-router-dom";
import Guide from './Guide';
import { BACKEND_ADDRESS, fromHex, toHex } from './constants';

import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark as highlightTheme } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useQRCode } from 'next-qrcode';

// import 'highlight.js/styles/tokyo-night-dark.css';
import highlight from 'highlight.js';

export default function View() {
    let navigate = useNavigate();
    let params = useParams();

    const { Canvas } = useQRCode();

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
                changeAuthor(r['signature']);
                changeViews(r['views']);

                changeTabs(r['content']);

                changeParsed(r['content'][0][1]);
                changeActiveTab(r['content'][0]);

                let lang = highlight.highlightAuto(r['content'][0][1]).language;
                changeLanguage(lang == undefined ? '' : lang);

                // change browser header
                document.querySelectorAll('meta[name="theme-color"]').forEach(element => {
                    element.setAttribute('content', window.getComputedStyle(document.body).getPropertyValue(r['content'].length > 1 ? '--secondary' : '--background'));
                });
            })
    })

    const [navbarActive, changeNavbarActive] = useState(true);

    const [fetched, changeFetched] = useState(false);

    const [parsed, changeParsed] = useState('');

    const [author, changeAuthor] = useState('');
    const [views, changeViews] = useState(0);

    const [tabs, changeTabs] = useState(new Array());
    const [activeTab, changeActiveTab] = useState(tabs[0]);

    const [language, changeLanguage] = useState('');

    function switchTab(n: number) {
        let lang = highlight.highlightAuto(tabs[n][1]).language;
        changeLanguage(lang == undefined ? '' : lang);

        changeParsed(tabs[n][1]);
        changeActiveTab(tabs[n]);
    }

    if (params.id == 'help') {
        return <Guide />
    }

    return (
        <div id={styles.page}>
            <div id={styles.navbar}>
                <div id={styles.toggle} onClick={() => {
                    changeNavbarActive(!navbarActive);
                }}>
                    <img src={filledArrowIcon} aria-label={navbarActive ? 'open' : 'closed'} />
                </div>
                {
                    navbarActive ?
                        <div id={styles.container}>
                            <div id={styles.actions}>
                                <div className={styles.action} onClick={() => {
                                    navigator.clipboard.writeText(parsed);
                                }}>
                                    <img src={copyIcon} />
                                    <h5>
                                        copy all
                                    </h5>
                                </div>
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
                            <hr />
                            <div id={styles.details}>
                                <h5 id={styles.signature} aria-label={author.length == 0 ? 'none' : ''}>
                                    {author.length == 0 ? 'no author provided' : `author : ${author}`}
                                </h5>
                                <div id={styles.views}>
                                    <img src={eyeIcon} />
                                    <h5>
                                        {views}
                                    </h5>
                                </div>
                            </div>
                            <div id={styles.qrContainer}>
                                <Canvas text={window.location.href} options={{
                                    errorCorrectionLevel: 'M',
                                    margin: 1,
                                    scale: 4,
                                    color: {
                                        dark: '#e2e1f9',
                                        light: '#252739ff',
                                    },
                                }} />
                            </div>
                            <div id={styles.shareableLink} onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                            }}>
                                <h5>
                                    {window.location.href}
                                </h5>
                                <h5>
                                    click to copy
                                </h5>
                            </div>
                        </div> : <></>
                }
            </div>
            <div id={styles.container}>
                <div id={styles.explorer} aria-label={tabs.length > 1 ? '' : 'single'}>
                    {
                        tabs.map((e, i) => <div className={styles.tab} key={i} aria-label={activeTab == e ? 'active' : ''} onClick={() => { switchTab(i); }}>
                            <h5>{e[0]}</h5>
                        </div>)
                    }
                </div>
                <div id={styles.parsedContainer} aria-label={tabs.length > 1 ? '' : 'extended'}>
                    <SyntaxHighlighter language={language} id={styles.parsed} style={highlightTheme} aria-label={fetched ? '' : 'loading'} customStyle={{
                        fontSize: '1.33rem',
                        fontFamily: 'Source Code Pro',
                        overflow: 'scroll'
                    }}>
                        {fetched ? parsed : 'fetching code...'}
                    </SyntaxHighlighter>
                </div>
            </div>
        </div>
    );
}
