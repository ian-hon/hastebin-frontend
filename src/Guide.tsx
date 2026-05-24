import { HomeIcon } from 'lucide-react';
import { useNavigate } from 'react-router';

interface GuideSectionProps {
    title: string;
    steps: string[];
    mediaURL?: string;
    note?: string;
}

const Guide = () => {
    const navigate = useNavigate();

    const sections: GuideSectionProps[] = [
        {
            title: "sharing code",
            steps: [
                "paste your code",
                "press 'paste'",
                "share the link/qr"
            ],
            mediaURL: "create_paste.mov.gif"
        },
        {
            title: "multi-file sharing",
            steps: [
                "click (+) to create another file",
                "paste/write your code in the files",
                "paste & share"
            ],
            mediaURL: "multi_file.mov.gif"
        },
        {
            title: "forking & diffing",
            steps: [
                "when viewing a paste, press 'fork'",
                "make your changes to the paste",
                "paste & share",
                "press diff to see changes made"
            ],
            mediaURL: "forking_diffing.mov.gif"
        },
        {
            title: "encrypting your pastes",
            steps: [
                "during paste creation, enter a password",
                "share the password separately",
                "when viewing, enter the password to decrypt",
            ],
            note: "encryption is done client-side; the server never sees your password",
            mediaURL: "encryption.mov.gif"
        },
        {
            title: "commenting",
            steps: [
                "select text",
                "press 'create comment', and enter your comment",
            ],
            note: "works only when comments are enabled, on paste creation",
            mediaURL: "comments.mov.gif"
        }
    ];

    return (
        <div className="relative min-h-screen p-4 sm:p-8 md:p-16 lg:p-32 flex flex-col items-center justify-start gap-[1em] overflow-y-scroll">
            <div className="bg-secondary p-3 py-2 sm:p-4 sm:py-3 rounded-xl border-border border-2 flex flex-row gap-[1ch] items-center absolute top-[0.5em] left-[0.5ch] sm:top-[1em] sm:left-[2ch] cursor-pointer">
                <HomeIcon color="var(--color-text)" size={20} className="sm:block" />
                <h3 className="text-text text-sm sm:text-base md:text-lg" onClick={() => {
                    navigate('/');
                }}>homepage</h3>
            </div>
            <div className="w-full max-w-5xl px-2 sm:px-0">
                <div className="mb-6 sm:mb-8 md:mb-12 mt-12 sm:mt-0">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-left text-text">how to use</h2>
                </div>
                {
                    sections.map((e, index) => <div key={index} className="mb-12 sm:mb-16 md:mb-24 flex flex-col md:flex-row gap-6 sm:gap-8 md:gap-16 items-start">
                        <div className="flex flex-col gap-2 sm:gap-3 flex-1 w-full">
                            <h2 className="text-xl sm:text-2xl font-medium text-accent mb-2 sm:mb-4">{e.title}</h2>
                            {
                                e.steps.map((s, s_index) => <h3 key={s_index} className="text-sm sm:text-base text-text leading-relaxed ml-2 sm:ml-4">
                                    {`${s_index + 1}. ${s}`}
                                </h3>)
                            }
                            {
                                e.note && <h5 className="text-xs sm:text-sm text-text/30 italic mt-2 sm:mt-3 ml-2 sm:ml-4">
                                    {e.note}
                                </h5>
                            }
                        </div>
                        <div className="flex-1 w-full">
                            <img className="rounded-2xl w-full" src={`/guide/${e.mediaURL}`} />
                        </div>
                    </div>)
                }
            </div>
            <div className="mt-4 flex flex-col gap-1 text-center px-4">
                <a href="https://ianhon.com" target='_blank' className="text-text text-sm mb-1">ian-hon</a>
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-3 text-xs text-text/50 justify-center">
                    <a href="https://github.com/ian-hon/hastebin" target="_blank" className='transform-gpu hover:text-text duration-300 cursor-pointer'>api: axum.rs + sqlx</a>
                    <a className="hidden sm:block">•</a>
                    <a href="https://github.com/ian-hon/hastebin-frontend" target="_blank" className='transform-gpu hover:text-text duration-300 cursor-pointer'>frontend: react + tailwind + vite</a>
                </div>
                <a href="https://github.com/ian-hon/hastebin-vscode-extension" className="text-xs text-accent/60 hover:text-accent transition-colors mt-2">
                    dont want to use the website? get the VSCode extension
                </a>
                <a href="mailto:dev@ianhon.com" className="text-xs text-accent/60 hover:text-accent transition-colors mt-2">
                    say hi! or request a feature
                </a>
            </div>
        </div>
    );
};

export default Guide;