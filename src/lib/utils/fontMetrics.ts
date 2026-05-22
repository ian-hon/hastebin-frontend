import React from 'react';

export const MEASUREMENT_QUALITY = 100;

export function measureFontMetrics(
    codeContainerRef: React.RefObject<HTMLDivElement | null>,
    setFontMetrics: React.Dispatch<React.SetStateAction<{
        lineHeight: number;
        charWidth: number;
        baseOffsetX: number;
        baseOffsetY: number;
    }>>
) {
    const block = document.querySelector('.measuring-block');
    const containerRect = codeContainerRef.current!.getBoundingClientRect(); // pray and hope :pray:
    console.log(block);
    if (!block) {
        return;
    }

    const range = document.createRange();
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, null);
    const textNode = walker.nextNode() as Text;

    console.log(textNode);

    // get top left char
    range.setStart(textNode, 0);
    range.setEnd(textNode, 1);
    const topLeftChar = range.getBoundingClientRect();

    const baseOffsetX = topLeftChar.left - containerRect.left;
    const baseOffsetY = topLeftChar.top - containerRect.top;

    let previous = { ...textNode }; // need to copy? is this holding ref or value? i wish this was rust
    let passed = 0;
    let next = walker.nextNode() as Text;
    while (next != null) {
        previous = next;
        next = walker.nextNode() as Text;
        passed += 1;
    }

    console.log(previous, next, passed);

    // get bottom right char
    range.setStart(previous, MEASUREMENT_QUALITY - 1);
    range.setEnd(previous, MEASUREMENT_QUALITY);
    const bottomRightChar = range.getBoundingClientRect();

    // console.log(bottomRightChar);

    setFontMetrics({
        lineHeight: (bottomRightChar.bottom - topLeftChar.top) / MEASUREMENT_QUALITY,
        charWidth: (bottomRightChar.right - topLeftChar.left) / MEASUREMENT_QUALITY,
        baseOffsetX,
        baseOffsetY
    })

    // console.log(block);
    codeContainerRef.current!.removeChild(block);
}
