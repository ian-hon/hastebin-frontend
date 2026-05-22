import SyntaxHighlighter from "react-syntax-highlighter";
import { MEASUREMENT_QUALITY } from "../lib/utils/fontMetrics";
import { oneDark as highlightTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';

export const MeasuringBlock = () => {
    // render a 100 x 100 grid of '0'
    // then measure its width and height for font metrics
    const measureContent = Array(MEASUREMENT_QUALITY).fill('0'.repeat(MEASUREMENT_QUALITY)).join('\n');

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