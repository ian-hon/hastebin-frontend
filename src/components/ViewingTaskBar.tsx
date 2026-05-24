import { ChevronDown, CircleQuestionMark, Copy, FileDiff, GitFork, Plus, type LucideProps } from 'lucide-react';
import CustomQRCode from './CustomQRCode';
import type { Paste } from '../types';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getTimeRemaining, toHex } from '../lib/utils/format';

export interface ViewingTaskBarProps {
    paste: Paste,
    onDiffToggle: () => void;
}

const ViewingTaskBar = ({
    paste,
    onDiffToggle,
    ...props
}: ViewingTaskBarProps) => {
    const navigate = useNavigate();

    const [isOpened, setOpened] = useState(true);
    const contentRef = useRef<HTMLDivElement>(null);
    const [contentHeight, setContentHeight] = useState(0);

    useEffect(() => {
        if (contentRef.current) {
            // I LEARNT THIS YEARS AGO
            const computedStyle = window.getComputedStyle(contentRef.current);
            setContentHeight(contentRef.current.offsetHeight + parseFloat(computedStyle.marginBottom));
        }
    }, [contentRef]);

    const yOffset = isOpened ? 0 : contentHeight;

    const pasteUrl = `${window.location.origin}/${toHex(paste.id)}`;

    return <div className="absolute bottom-0 flex items-center justify-center w-full px-2 sm:px-0 sm:w-auto" style={{
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
            <ChevronDown color="var(--color-text)" className="duration-300 transform-gpu opacity-50 cursor-pointer group-hover:opacity-100" style={{
                transform: `rotate(${isOpened ? 0 : 180}deg)`
            }} />
        </div>
        <div ref={contentRef} {...props} className="bg-primary mb-5 drop-shadow-red p-3 sm:p-4 rounded-lg z-10 border-2 border-border w-full sm:w-auto max-w-full">
            <div className="flex flex-wrap gap-3 sm:gap-4 mb-4">
                {
                    [
                        {
                            text: 'new paste',
                            icon: (p: LucideProps) => <Plus {...p} />,
                            onClick: () => { navigate('/') },
                        },
                        {
                            text: 'copy',
                            icon: (p: LucideProps) => <Copy {...p} />,
                            onClick: () => { navigate(`/?copy=${toHex(paste.id)}`) }
                        },
                        {
                            text: 'fork',
                            icon: (p: LucideProps) => <GitFork {...p} />,
                            onClick: () => { navigate(`/?fork=${toHex(paste.id)}`) }
                        },
                        ...(paste.forked_from ? [{
                            text: 'diff',
                            icon: (p: LucideProps) => <FileDiff {...p} />,
                            onClick: onDiffToggle
                        }] : []),
                        {
                            text: 'guide',
                            icon: (p: LucideProps) => <CircleQuestionMark {...p} />,
                            onClick: () => { navigate('/guide') }
                        },
                    ].map((i, index) => <div key={index} onClick={i.onClick} className={`
                        flex flex-row gap-2 items-center justify-between cursor-pointer
                        duration-300 opacity-50 hover:opacity-100 active:opacity-100 transform-gpu
                        ${index == 0 ? "" : "sm:border-l-2 border-slate-700 sm:pl-4"}`} // https://tailwindcss.com/docs/transform#hardware-acceleration
                    >
                        {i.icon({ size: 20, color: "var(--color-text)" })}
                        <h3 className="text-sm text-text whitespace-nowrap">{i.text}</h3>
                    </div>)
                }
            </div>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                {/* for paste viewing */}
                <div className="flex-1">
                    <div className="gap-3">
                        <div className="flex flex-row gap-[1ch] items-center">
                            <h3 className="text-text text-sm opacity-50 min-w-[11ch]">author</h3>
                            <h3 className={`text-sm ${paste.author ? 'text-text' : 'text-textDim'} truncate`}>{paste.author ?? 'anonymous'}</h3>
                        </div>
                        <div className="flex flex-row gap-[1ch] items-center">
                            <h3 className="text-text text-sm opacity-50 min-w-[11ch]">views</h3>
                            <h3 className="text-text text-sm">{paste.views}</h3>
                        </div>
                        {
                            paste.expires_at && <div className="flex flex-row gap-[1ch] items-center">
                                <h3 className="text-text text-sm opacity-50 min-w-[11ch]">expires in</h3>
                                <h3 className="text-text text-sm">{getTimeRemaining(paste.expires_at)}</h3>
                            </div>
                        }
                        {
                            paste.forked_from && <div className="flex flex-row gap-[1ch] items-center">
                                <h3 className="text-text text-sm opacity-50 min-w-[11ch]">forked from</h3>
                                <h3 className="text-text text-sm cursor-pointer underline-offset-2 hover:underline truncate" onClick={() => { navigate(`/${toHex(paste.forked_from!)}`) }}>{toHex(paste.forked_from)}</h3>
                            </div>
                        }
                    </div>
                </div>
                <div className="flex flex-col items-center shrink-0">
                    <CustomQRCode value={pasteUrl} size={128} bgColor='transparent' fgColor='var(--color-text)' gap={1} borderRadius={1} />
                    <div className="flex flex-row items-center justify-center mt-2 duration-300 opacity-50 hover:opacity-100 active:opacity-100 transform-gpu cursor-copy active:opacity-30 max-w-full" onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                    }}>
                        <h3 className="text-text text-xs sm:text-sm italic truncate">
                            {pasteUrl.replace(/^https?:\/\//, '')}
                        </h3>
                        <Copy className="ml-2 shrink-0" size={15} color="var(--color-text)" />
                    </div>
                </div>
            </div>
        </div>
    </div>
};

export default ViewingTaskBar;