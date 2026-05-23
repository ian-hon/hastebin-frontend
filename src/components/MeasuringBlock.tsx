import SyntaxHighlighter from "react-syntax-highlighter";
import { MEASUREMENT_QUALITY, measureFontMetrics } from "../lib/utils/fontMetrics";
import { oneDark as highlightTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useEffect } from "react";
import type React from "react";

interface MeasuringBlockProps {
    codeContainerRef: React.RefObject<HTMLDivElement | null>;
    setFontMetrics: React.Dispatch<React.SetStateAction<{
        lineHeight: number;
        charWidth: number;
        baseOffsetX: number;
        baseOffsetY: number;
    }>>;
}

export const MeasuringBlock = ({ codeContainerRef, setFontMetrics }: MeasuringBlockProps) => {
    // render a 100 x 100 grid of '0'
    // then measure its width and height for font metrics
    const measureContent = Array(MEASUREMENT_QUALITY).fill('0'.repeat(MEASUREMENT_QUALITY)).join('\n');

    // measure font metrics whenever this component is rerendered
    useEffect(() => {
        console.log('font metrics measured');
        if (!codeContainerRef.current) return;
        const timer = setTimeout(() => {
            measureFontMetrics(codeContainerRef, setFontMetrics);
        }, 100);
        return () => clearTimeout(timer);
    });

    return <SyntaxHighlighter
        className="measuring-block"
        style={highlightTheme}
        customStyle={{
            margin: 0,
            padding: 0,
            fontFamily: 'var(--font-mono)',
            background: 'transparent',
            height: '100%',
            overflow: 'visible',
            opacity: '0',
            whiteSpace: 'nowrap',
        }}
        wrapLongLines={false}
    >
        {measureContent}
    </SyntaxHighlighter>
}

export default MeasuringBlock;