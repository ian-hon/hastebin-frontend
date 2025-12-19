import styles from './App.module.css';

export default function App() {
    return (
        <div id={styles.page}>
            <div id={styles.container}>
                <h1>hi, i just got ddosed.</h1>
                <p>the backend just got ddosed. im working to restore it and deal with the large incurred costs. <i>(probably need a few hours)</i></p>
                <p>sorry for the downtime - hundreds use hastebin daily and i truly truly appreciate it.</p>
                <p>forever long as i am able to, this will remain 100% free.</p>
                <p style={{ marginTop: '5ch' }}>btw, im a 19-year-old full-time student running this out of pocket (backend, domain, hosting, db)</p>
                <p>questions or ideas? throw it in this <a target="_blank" href="https://forms.gle/926ZoXNmpvm9M8kX8">google form!</a></p>
                <p>want to get in touch? email me at <a target="_blank" href="mailto:ianhon2807@gmail.com">ianhon2807@gmail.com</a></p>
                <p className={styles.note}>ps: password-protected pastes & expiry dates coming soon</p>
            </div>
        </div >
    );
}
