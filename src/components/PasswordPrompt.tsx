interface PasswordPromptProps {
    isOpen: boolean;
    password: string;
    onPasswordChange: (password: string) => void;
    onSubmit: () => void;
    onCancel: () => void;
    error: string;
    isLoading: boolean;
}

function PasswordPrompt({ isOpen, password, onPasswordChange, onSubmit, onCancel, error, isLoading }: PasswordPromptProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-primary rounded-lg drop-shadow-red border-2 border-border p-6 max-w-md w-full">
                <h2 className="text-text text-xl font-bold mb-8">encrypted paste</h2>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => onPasswordChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            onSubmit();
                        }
                    }}
                    placeholder="password"
                    className="w-full text-text p-3 bg-dimBackground rounded-md border-2 border-border focus:outline-none focus:border-accent mb-2"
                    autoFocus
                />
                {error && (
                    <p className="text-red-500 text-sm mb-3">{error}</p>
                )}
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={onCancel}
                        className="cursor-pointer px-4 py-2 text-sm bg-dimBackground border-2 border-border text-text rounded duration-300 opacity-50 hover:opacity-100 active:opacity-100 transition-opacity"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        disabled={isLoading || !password}
                        className="cursor-pointer px-4 py-2 text-sm bg-accentDim border-2 border-accent text-accent rounded duration-300 hover:opacity-80 active:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
                    >
                        {isLoading ? 'Decrypting...' : 'Decrypt'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PasswordPrompt;
