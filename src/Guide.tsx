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
            title: "signing your pastes",
            steps: [
                "during paste creation, enter your signature",
                "enter a signature",
                "or, click the 'generate' button",
                "verify a paste belongs to you by sharing the signature",
            ],
            mediaURL: "signing.mov.gif"
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
        <div className="relative min-h-screen p-32 flex flex-col items-center justify-start gap-[1em]">
            <div className="bg-secondary p-4 py-3 rounded-xl border-border border-2 flex flex-row gap-[1ch] items-center absolute top-[1em] left-[2ch] cursor-pointer">
                <HomeIcon color="var(--color-text)" size={20} />
                <h3 className="text-text text-lg" onClick={() => {
                    navigate('/');
                }}>homepage</h3>
            </div>
            <div className="w-full max-w-5xl">
                <div className="mb-12">
                    <h2 className="text-4xl font-semibold text-left text-text">how to use</h2>
                </div>
                {
                    sections.map((e, index) => <div key={index} className="mb-24 flex flex-row gap-16 items-start">
                        <div className="flex flex-col gap-3 flex-1">
                            <h2 className="text-2xl font-medium text-accent mb-4">{e.title}</h2>
                            {
                                e.steps.map((s, s_index) => <h3 key={s_index} className="text-base text-text leading-relaxed ml-4">
                                    {`${s_index + 1}. ${s}`}
                                </h3>)
                            }
                            {
                                e.note && <h5 className="text-sm text-text/30 italic mt-3 ml-4">
                                    {e.note}
                                </h5>
                            }
                        </div>
                        <div className="flex-1">
                            <img className="rounded-2xl w-full" src={`/guide/${e.mediaURL}`} />
                        </div>
                    </div>)
                }
            </div>
            <div className="mt-4 flex flex-col gap-1 text-center">
                <a href="https://ianhon.com" target='_blank' className="text-text text-sm mb-1">ian-hon</a>
                <div className="flex gap-3 text-xs text-text/50 justify-center">
                    <a href="https://github.com/ian-hon/hastebin" target="_blank" className='transform-gpu hover:text-text duration-300 cursor-pointer'>api: axum.rs + sqlx</a>
                    <a>•</a>
                    <a href="https://github.com/ian-hon/hastebin-frontend" target="_blank" className='transform-gpu hover:text-text duration-300 cursor-pointer'>frontend: react + tailwind + vite</a>
                </div>
                <a href="mailto:dev@ianhon.com" className="text-xs text-accent/60 hover:text-accent transition-colors mt-2">
                    say hi! or request a feature
                </a>
            </div>
        </div>
    );
};

export default Guide;