import styles from './Guide.module.css';

import instructionGif from './assets/help.png';
import saveIcon from './assets/save.svg';
import filesIcon from './assets/files.svg';
import chevronIcon from './assets/chevron-left.svg';
import { Link } from 'react-router-dom';

export default function Guide() {
    return <div id={styles.page}>
        <Link to='/' id={styles.return}>
            <img src={chevronIcon} />
            <h5>
                back to hastebin
            </h5>
        </Link>
        <div id={styles.header}>
            <h3>
                welcome to hastebin
            </h3>
            <h4>
                the hassle-free, quick and simple way to share code
            </h4>
            <h4 style={{
                marginTop:'2em'
            }}>
                note : ignore the '?'s, i havent finished those
            </h4>
        </div>
        <div id={styles.instructions}>
            <h3>
                how to use :
            </h3>
            <div id={styles.steps}>
                <div>
                    <h4>1. paste code</h4>
                    <div>
                        <h4>2. press</h4>
                        <img src={saveIcon}/>
                    </div>
                    <h4>3. share url</h4>
                </div>
                <img src={instructionGif}/>
            </div>
        </div>
        <div id={styles.multiFile}>
            <h3>multiple files?</h3>
            <div>
                <div>
                    <h4>press</h4>
                    <img src={filesIcon}/>
                </div>
                <img src={instructionGif} />
            </div>
        </div>
        <div id={styles.credits}>
            <span>
                <h5>made by</h5>
                <a href='https://ianhon.com' target='_blank'>
                    ian-hon
                </a>
                <h5 style={{
                    marginLeft:'1ch',
                    opacity: 0.5,
                    fontStyle:'italic'
                }}>
                    in 3 days
                </h5>
            </span>
            <div id={styles.stack}>
                {/* <h5>axum.rs, sqlx, react.js, supabase, postgresql, aws, vercel</h5> */}
                <h5>
                    <a href='https://www.github.com/ian-hon/hastebin-frontend' target='_blank'>frontend</a> : react.js
                </h5>
                <h5>
                    <a href='https://www.github.com/ian-hon/hastebin' target='_blank'>backend</a> : axum.rs + sqlx
                </h5>
                <h5>data : supabase + postgresql</h5>
                <h5>hosting : aws + vercel</h5>
            </div>
        </div>
    </div>
}