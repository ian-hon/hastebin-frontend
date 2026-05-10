import { CircleQuestionMark, Copy, FileDiff, GitFork, Plus } from 'lucide-react';
import { QRCode } from 'react-qr-code';
import CustomQRCode from './CustomQRCode';

export interface TaskBarProps {
    // true is when creating a paste
    // false is when viewing
    createMode: boolean,
    parent: string | undefined
}

const TaskBar = ({
    createMode,
    ...props
}: TaskBarProps) => {
    return <div {...props} className="absolute bottom-5 bg-primary drop-shadow-red p-4 rounded-lg z-10 border-2 border-border">
        <div className="flex-row flex gap-4 mb-4">
            {
                (!createMode ? [
                    {
                        text: 'new paste',
                        icon: (p: any) => <Plus {...p} />,
                        onClick: () => { },
                    },
                    {
                        text: 'how to use',
                        icon: (p: any) => <CircleQuestionMark {...p} />,
                        onClick: () => { }
                    }
                ] : [
                    {
                        text: 'new paste',
                        icon: (p: any) => <Plus {...p} />,
                        onClick: () => { },
                    },
                    {
                        text: 'copy',
                        icon: (p: any) => <Copy {...p} />,
                        onClick: () => { }
                    },
                    {
                        text: 'fork',
                        icon: (p: any) => <GitFork {...p} />,
                        onClick: () => { }
                    },
                    ...(parent ? [{
                        text: 'diff',
                        icon: (p: any) => <FileDiff {...p} />,
                        onClick: () => { }
                    }] : []),
                    {
                        text: 'how to use',
                        icon: (p: any) => <CircleQuestionMark {...p} />,
                        onClick: () => { }
                    },
                ].filter(i => i.text != 'diff')).map((i, index) => <div key={index} onClick={i.onClick} className={`
                        flex flex-row gap-2 items-center justify-between cursor-pointer
                        duration-300 opacity-50 hover:opacity-100 transform-gpu
                        ${index == 0 ? "" : "border-l-2 border-slate-700 pl-4"}`} // https://tailwindcss.com/docs/transform#hardware-acceleration
                >
                    {i.icon({ size: 20, color: "var(--color-text)" })}
                    <h3 className="text-md text-text">{i.text}</h3>
                </div>)
            }
        </div>
        {
            createMode ?
                <div className="">
                    {/* for paste creation */}
                    <div className="">
                        <div className="flex flex-row gap-[2ch]">
                            <div className="">
                                <div className="flex flex-row gap-[1ch] items-center">
                                    <h3 className="text-text opacity-50 min-w-[11ch]">author</h3>
                                    <h3 className="text-text">john doe</h3>
                                </div>
                                <div className="flex flex-row gap-[1ch] items-center">
                                    <h3 className="text-text opacity-50 min-w-[11ch]">views</h3>
                                    <h3 className="text-text">200</h3>
                                </div>
                            </div>
                            <div className="">
                                <div className="flex flex-row gap-[1ch] items-center">
                                    <h3 className="text-text opacity-50 min-w-[11ch]">expires in</h3>
                                    <h3 className="text-text">6 days</h3>
                                </div>
                                <div className="flex flex-row gap-[1ch] items-center">
                                    <h3 className="text-text opacity-50 min-w-[11ch]">forked from</h3>
                                    <h3 className="text-text">fc3a</h3>
                                </div>
                            </div>
                        </div>
                        <div className="">
                            <input placeholder="verify signature"></input>
                            <CircleQuestionMark color="var(--color-text)" className="opacity-50" />
                        </div>
                    </div>
                    <div>
                        {/* ugly 😭 */}
                        {/* <QRCode value={'huh'} size={128} bgColor='transparent' fgColor='var(--color-text)' className="opacity-90" /> */}
                        <CustomQRCode value={'huh'} size={128} bgColor='transparent' fgColor='var(--color-text)' gap={2} borderRadius={10} />
                    </div>
                </div> :
                <div className="">
                    {/* for paste viewing */}
                </div>
        }
    </div>
};

export default TaskBar;