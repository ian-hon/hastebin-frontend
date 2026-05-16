const COMMENT_QUALITY = 50;

export function measureFontMetrics(codeContainerRef: React.RefObject<HTMLDivElement | null>, content: string, setFontMetrics: React.Dispatch<React.SetStateAction<{
    lineHeight: number;
    charWidth: number;
    baseOffsetX: number;
    baseOffsetY: number;
}>>) {
    const codeElement = codeContainerRef.current?.querySelector('code, pre');
    if (!codeElement) return;

    const containerRect = codeContainerRef.current!.getBoundingClientRect();
    const range = document.createRange();
    const walker = document.createTreeWalker(codeElement, NodeFilter.SHOW_TEXT, null);

    // means that its empty, so just use fallback values
    const firstNode = walker.nextNode();
    if (!firstNode?.textContent) return;

    // the range deletion function shows what ranges actually mostly do
    // https://www.w3.org/TR/DOM-Level-2-Traversal-Range/ranges.html#:~:text=incorrect.-,2.6.%20Deleting%20Content%20with%20a%20Range,-One

    // here, we take the first very first node's first character, then get the base offset
    // https://www.w3.org/TR/DOM-Level-2-Traversal-Range/ranges.html#:~:text=incorrect.-,2.6.%20Deleting%20Content%20with%20a%20Range,-One
    // base offset
    range.setStart(firstNode, 0);
    range.setEnd(firstNode, 1);
    const firstCharRect = range.getBoundingClientRect();
    const baseOffsetX = firstCharRect.left - containerRect.left;
    const baseOffsetY = firstCharRect.top - containerRect.top;

    // get each element height
    let lineHeight = 0;
    const lines = content.split('\n');
    if (lines.length >= 2) {
        walker.currentNode = codeElement; // cos we did .nextNode previously to get firstNode, so just reset back
        let charCount = 0;
        const secondLineStart = lines[0].length + 1;
        let node: Text | null;

        while ((node = walker.nextNode() as Text | null)) {
            const nodeLen = node.textContent?.length || 0;
            if ((charCount + nodeLen) > secondLineStart) {
                const offset = secondLineStart - charCount;
                range.setStart(node, offset);
                range.setEnd(node, offset + 1);
                // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
                lineHeight = range.getBoundingClientRect().top - firstCharRect.top;
                break;
            }
            charCount += nodeLen;
        }
    }

    // get a char width
    let charWidth = 0;
    let previousBiggest = 0; // just incase we dont find one that matches COMMENT_QUALITY
    walker.currentNode = codeElement; // reset again
    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
        const nodeText = node.textContent || '';
        if (nodeText.length >= COMMENT_QUALITY) {
            range.setStart(node, 0);
            range.setEnd(node, COMMENT_QUALITY);
            charWidth = range.getBoundingClientRect().width / COMMENT_QUALITY;
            break;
        } else if (nodeText.length > previousBiggest) {
            range.setStart(node, 0);
            range.setEnd(node, nodeText.length);
            charWidth = range.getBoundingClientRect().width / nodeText.length;
            previousBiggest = nodeText.length;
        }
    }

    if (!lineHeight || !charWidth) {
        const style = window.getComputedStyle(codeElement);
        const fontSize = parseFloat(style.fontSize);

        if (!lineHeight) {
            lineHeight = style.lineHeight === 'normal' ? fontSize * 1.5 : parseFloat(style.lineHeight);
        }

        if (!charWidth) {
            // if cannot get width then we just a span ourselves, and measure its width
            const span = document.createElement('span');
            span.style.font = style.font;
            span.style.position = 'absolute';
            span.style.visibility = 'hidden';
            span.textContent = '0'.repeat(COMMENT_QUALITY);
            document.body.appendChild(span);
            charWidth = span.offsetWidth / COMMENT_QUALITY;
            document.body.removeChild(span);
        }
    }

    setFontMetrics({ lineHeight, charWidth, baseOffsetX, baseOffsetY });
    console.log('computed ', { lineHeight, charWidth, baseOffsetX, baseOffsetY });
}