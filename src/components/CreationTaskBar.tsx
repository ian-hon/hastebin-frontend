import { CircleQuestionMark, ClipboardPaste, Plus, RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import { generatePhrase } from '../lib/bip39';

export type ExpiryOption = 'none' | '1_hour' | '6_hour' | '12_hour' | '1_day' | '3_day' | '7_day' | '30_day';

const CreationTaskBar = ({
    ...props
}) => {
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
        setSignature(generatePhrase(6).join(' '));
    };

    return <div {...props} className="absolute bottom-5 bg-primary drop-shadow-red p-4 rounded-lg z-10 border-2 border-border">
        <div className="flex-row flex gap-4 mb-4">
            {
                [
                    {
                        text: 'new paste',
                        icon: (p: any) => <Plus {...p} />,
                        onClick: () => { },
                    },
                    {
                        text: 'guide',
                        icon: (p: any) => <CircleQuestionMark {...p} />,
                        onClick: () => { }
                    }
                ].map((i, index) => <div key={index} onClick={i.onClick} className={`
                        flex flex-row gap-2 items-center justify-between cursor-pointer
                        duration-300 opacity-50 hover:opacity-100 transform-gpu
                        ${index == 0 ? "" : "border-l-2 border-slate-700 pl-4"}`} // https://tailwindcss.com/docs/transform#hardware-acceleration
                >
                    {i.icon({ size: 20, color: "var(--color-text)" })}
                    <h3 className="text-sm text-text">{i.text}</h3>
                </div>)
            }
            <div className="flex-1 flex flex-row justify-end">
                <div className="input-base flex flex-row self-end w-fit items-center gap-[1ch] bg-accentDim border-accent cursor-pointer">
                    <h3 className="text-accent font-semibold">paste!</h3>
                    <ClipboardPaste className="" color="var(--color-accent)" size={16} />
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
                    className="input-base flex-1"
                    value={signature}
                    onChange={handleSignatureChange}
                />
                <RefreshCcw className="input-base cursor-pointer active:opacity-80 select-none" size={40} onClick={generateRandomSignature} />
            </div>
        </div>
    </div>
};

export default CreationTaskBar;