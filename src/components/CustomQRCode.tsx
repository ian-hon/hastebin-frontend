import { useMemo } from "react";
import QRCode from "qrcode";

export interface QRCodeProps {
    value: string,
    bgColor: string,
    fgColor: string,
    // cant, need width and height for svg size calculation
    // pixelStyles: string,
    size: number,
    // cellSize: number,
    gap: number,
    borderRadius: number,
    errorCorrectionLevel?: QRCode.QRCodeErrorCorrectionLevel
}

const CustomQRCode = ({
    value,
    bgColor,
    fgColor,
    // pixelStyles,
    size,
    gap,
    borderRadius,
    errorCorrectionLevel = "L"
}: QRCodeProps) => {
    const modules: QRCode.BitMatrix = useMemo(() => {
        const qr = QRCode.create(value, { errorCorrectionLevel });
        return qr.modules;
    }, [value, errorCorrectionLevel]);

    const length = modules.size;
    const actualCellSize = (size - gap * length) / length;

    // return <svg></svg>

    return <svg width={size} height={size} style={{ backgroundColor: bgColor }}>
        {
            // im not too sure why, but it only works as Array, not as map
            // maybe because its svg
            Array.from(modules.data).map((cell: number, index: number) => {
                if (!cell) return null;
                const x = index % length;
                const y = Math.floor(index / length);
                // console.log(x, y);
                // console.log(index % length, index / length);
                return (
                    <rect
                        key={index}
                        x={x * (actualCellSize + gap)}
                        y={y * (actualCellSize + gap)}
                        width={actualCellSize}
                        height={actualCellSize}
                        rx={borderRadius ?? actualCellSize / 2}
                        ry={borderRadius ?? actualCellSize / 2}
                        fill={fgColor}
                    />
                )
            })
        }
    </svg>
}

export default CustomQRCode;