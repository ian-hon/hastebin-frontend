import { CircleQuestionMark, ClipboardPaste, Plus, RefreshCcw, type LucideProps } from 'lucide-react';
import { useState } from 'react';
import { generatePhrase } from '../lib/bip39';
import { useNavigate } from 'react-router';
import type { ExpiryOption } from '../types';

export interface CreationTaskBarProps {
    onPaste: (options: { author: string; expiry: ExpiryOption; signature: string }) => void;
    commentsEnabled: boolean;
    setCommentsEnabled: (enabled: boolean) => void;
}

const CreationTaskBar = ({
    onPaste,
    commentsEnabled,
    setCommentsEnabled,
    ...props
}: CreationTaskBarProps) => {
    const navigate = useNavigate();

    const [author, setAuthor] = useState<string>('');
    const [expiry, setExpiry] = useState<ExpiryOption>('none');
    const [signature, setSignature] = useState<string>('');

    const handleAuthorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAuthor(e.target.value);
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setExpiry(e.target.value as ExpiryOption);
    };

    const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSignature(e.target.value);
    };

    const generateRandomSignature = () => {
        setSignature(generatePhrase(3).join(' '));
    };

    return <div {...props} className="absolute bottom-5 bg-primary drop-shadow-red p-4 rounded-lg z-10 border-2 border-border">
        <div className="flex-row flex gap-4 mb-4">
            {
                [
                    {
                        text: 'new paste',
                        icon: (p: LucideProps) => <Plus {...p} />,
                        onClick: () => { navigate('/') },
                    },
                    {
                        text: 'guide',
                        icon: (p: LucideProps) => <CircleQuestionMark {...p} />,
                        onClick: () => { navigate('/guide') }
                    }
                ].map((i, index) => <div key={index} onClick={i.onClick} className={`
                        flex flex-row gap-2 items-center justify-between cursor-pointer
                        duration-300 opacity-50 hover:opacity-100 transform-gpu
                        self-start
                        ${index == 0 ? "" : "border-l-2 border-slate-700 pl-4"}`} // https://tailwindcss.com/docs/transform#hardware-acceleration
                >
                    {i.icon({ size: 20, color: "var(--color-text)" })}
                    <h3 className="text-sm text-text">{i.text}</h3>
                </div>)
            }
            <div className="flex flex-1 items-end justify-end">
                <div
                    onClick={() => setCommentsEnabled(!commentsEnabled)}
                    className="flex items-center gap-2 cursor-pointer select-none duration-300 opacity-50 transform-gpu hover:opacity-100"
                >
                    <div className={`w-4 h-4 border-2 rounded transition-colors ${commentsEnabled
                        ? 'bg-accent border-accent'
                        : 'bg-transparent border-text'
                        }`} />
                    <span className="text-text text-sm">comments</span>
                </div>
            </div>
        </div>
        <div className="">
            {/* for paste viewing */}
            <div className="flex items-stretch gap-2">
                <input
                    placeholder='author (optional)'
                    className="input-base"
                    value={author}
                    onChange={handleAuthorChange}
                />
                {/* https://react.dev/reference/react-dom/components/select#reading-the-select-box-value-when-submitting-a-form */}
                <select
                    name="expiryInput"
                    className="input-base flex-1 text-text appearance-none cursor-pointer"
                    value={expiry}
                    onChange={handleExpiryChange}
                >
                    <option value="none">no expiry</option>
                    <option value="1_hour">1 hour</option>
                    <option value="6_hour">6 hours</option>
                    <option value="12_hour">12 hours</option>
                    <option value="1_day">1 day</option>
                    <option value="3_day">3 days</option>
                    <option value="7_day">1 week</option>
                    <option value="30_day">1 month</option>
                </select>
            </div>
            <div className="flex items-stretch gap-2 mt-2">
                <input
                    placeholder='signature (optional)'
                    className="input-base flex-1 rounded-r-none"
                    value={signature}
                    onChange={handleSignatureChange}
                />
                <RefreshCcw className="input-base cursor-pointer active:opacity-80 select-none -ml-3 rounded-l-none" size={40} onClick={generateRandomSignature} />
                <div className="flex-1 flex flex-row ml-4 justify-end">
                    <div className="input-base flex flex-row self-end w-fit items-center gap-[1ch] bg-accentDim border-accent cursor-pointer" onClick={() => onPaste({ author, expiry, signature })}>
                        <h3 className="text-accent">paste!</h3>
                        <ClipboardPaste className="" color="var(--color-accent)" size={16} />
                    </div>
                </div>
            </div>
        </div>
    </div>
};

export default CreationTaskBar;