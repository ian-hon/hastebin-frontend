export function processSelectedText(
    codeContainerRef: React.RefObject<HTMLDivElement | null>,
    content: string,
    e: HTMLElement,
    selection: Selection,
    selectionLength: number,
    setSelectedText: React.Dispatch<React.SetStateAction<{
        fromRow: number;
        fromColumn: number;
        toRow: number;
        toColumn: number;
        x: number;
        y: number;
    } | null>>
) {
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const codeContainer = e.querySelector('code, pre');
    if (!codeContainer) return;

    // i highkey think there is a better way to do this
    const walker = document.createTreeWalker(e, NodeFilter.SHOW_TEXT, null);
    let charsBeforeSelection = 0;
    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
        if (node === range.startContainer) {
            charsBeforeSelection += range.startOffset;
            break;
        }
        charsBeforeSelection += node.textContent?.length || 0;
    }

    const lines = content.split('\n');
    const calcPosition = (charOffset: number) => {
        let charCount = 0;
        for (let i = 0; i < lines.length; i++) {
            if (charCount + lines[i].length >= charOffset) {
                return { row: i, column: charOffset - charCount };
            }
            charCount += lines[i].length + 1;
        }
        return { row: 0, column: 0 };
    };

    const start = calcPosition(charsBeforeSelection);
    const end = calcPosition(charsBeforeSelection + selectionLength);
    const rect = range.getBoundingClientRect();

    const result = {
        fromRow: start.row,
        fromColumn: start.column,
        toRow: end.row,
        toColumn: end.column,
        x: rect.left + rect.width / 2,
        y: rect.top,
    };

    setSelectedText(result);
}