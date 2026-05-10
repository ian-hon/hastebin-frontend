import { ChevronDown, CircleQuestionMark, Copy, FileDiff, GitFork, Plus } from 'lucide-react';
import CustomQRCode from './CustomQRCode';
import type { Paste } from '../types';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toHex } from '../lib/utils';

export interface ViewingTaskBarProps {
    paste: Paste
}

const ViewingTaskBar = ({
    paste,
    ...props
}: ViewingTaskBarProps) => {
    const navigate = useNavigate();

    const [isOpened, setOpened] = useState(true);
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState(0);

    // #region signature
    const [verifySignature, setVerifySignature] = useState<string>('');
    const handleVerifySignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVerifySignature(e.target.value);
    };
    // #endregion

    useEffect(() => {
        if (contentRef.current) {
            // I LEARNT THIS YEARS AGO
            const computedStyle = window.getComputedStyle(contentRef.current);
            setContentHeight(contentRef.current.offsetHeight + parseFloat(computedStyle.marginBottom));
        }
    }, [contentRef]);

    const yOffset = isOpened ? 0 : contentHeight;

    return <div className="absolute bottom-0 flex items-center justify-center" style={{
        transform: `translateY(${yOffset}px)`,
        transition: 'transform 0.3s ease-in-out'
    }}>
        <div className="
        absolute
        p-2 px-4 h-10 -top-12 z-11
        bg-primary
        rounded-lg border-2 border-border
        group
        " onClick={() => { setOpened(t => !t) }}>
            {/* https://tailwindcss.com/docs/hover-focus-and-other-states#styling-based-on-parent-state */}
            <ChevronDown color="var(--color-text)" className="duration-300 transform-gpu opacity-50 cursor-pointer group-hover:opacity-100" />
        </div>
        <div ref={contentRef} {...props} className="bg-primary mb-5 drop-shadow-red p-4 rounded-lg z-10 border-2 border-border">
            <div className="flex-row flex gap-4 mb-4">
                {
                    [
                        {
                            text: 'new paste',
                            icon: (p: any) => <Plus {...p} />,
                            onClick: () => { navigate('/') },
                        },
                        {
                            text: 'copy',
                            icon: (p: any) => <Copy {...p} />,
                            onClick: () => { navigate(`/?copy=${toHex(paste.id)}`) }
                        },
                        {
                            text: 'fork',
                            icon: (p: any) => <GitFork {...p} />,
                            onClick: () => { navigate(`/?fork=${toHex(paste.id)}`) }
                        },
                        ...(paste.forked_from ? [{
                            text: 'diff',
                            icon: (p: any) => <FileDiff {...p} />,
                            onClick: () => { }
                        }] : []),
                        {
                            text: 'guide',
                            icon: (p: any) => <CircleQuestionMark {...p} />,
                            onClick: () => { navigate('/guide') }
                        },
                    ].map((i, index) => <div key={index} onClick={i.onClick} className={`
                        flex flex-row gap-2 items-center justify-between cursor-pointer
                        duration-300 opacity-50 hover:opacity-100 transform-gpu
                        ${index == 0 ? "" : "border-l-2 border-slate-700 pl-4"}`} // https://tailwindcss.com/docs/transform#hardware-acceleration
                    >
                        {i.icon({ size: 20, color: "var(--color-text)" })}
                        <h3 className="text-sm text-text">{i.text}</h3>
                    </div>)
                }
            </div>
            <div className="flex flex-row gap-4">
                {/* for paste viewing */}
                <div className="">
                    <div className="gap-3">
                        <div className="flex flex-row gap-[1ch] items-center">
                            <h3 className="text-text opacity-50 min-w-[11ch]">author</h3>
                            <h3 className={paste.author ? 'text-text' : 'text-textDim'}>{paste.author ?? 'anonymous'}</h3>
                        </div>
                        <div className="flex flex-row gap-[1ch] items-center">
                            <h3 className="text-text opacity-50 min-w-[11ch]">views</h3>
                            <h3 className="text-text">200</h3>
                        </div>
                        {
                            paste.expires_at && <div className="flex flex-row gap-[1ch] items-center">
                                <h3 className="text-text opacity-50 min-w-[11ch]">expires in</h3>
                                <h3 className="text-text">6 days</h3>
                            </div>
                        }
                        {
                            paste.forked_from && <div className="flex flex-row gap-[1ch] items-center">
                                <h3 className="text-text opacity-50 min-w-[11ch]">forked from</h3>
                                <h3 className="text-text">{paste.forked_from}</h3>
                            </div>
                        }
                    </div>
                    <div className="flex flex-row gap-[1ch] items-center mt-4">
                        <input
                            placeholder="verify signature"
                            className="text-text p-2 py-1 bg-dimBackground rounded-md border-2 border-border"
                            value={verifySignature}
                            onChange={handleVerifySignatureChange}
                        />
                        <CircleQuestionMark color="var(--color-text)" className="opacity-50 transform-gpu duration-300 hover:opacity-100 cursor-pointer" />
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <CustomQRCode value={'lojal;sdfjsfjsjflsfd'} size={128} bgColor='transparent' fgColor='var(--color-text)' gap={1} borderRadius={1} />
                    <a href="#" className="text-text mt-2 text-sm italic duration-300 opacity-50 hover:opacity-100 transform-gpu">
                        {/* <h3 className="text-text">{'hastebin.ianhon.com/1234'}</h3> */}
                        {'hastebin.ianhon.com/1234'}
                    </a>
                </div>
            </div>
        </div>
    </div>
};

export default ViewingTaskBar;