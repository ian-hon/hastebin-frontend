export function toHex(i: number): string {
    return i.toString(16);
}

export function fromHex(h: string): number {
    return parseInt(h.replace('-', ''), 16);
}

export function createHash(input: string): Promise<ArrayBuffer> {
    const data = new TextEncoder().encode(input);
    return crypto.subtle.digest('SHA-256', data)
}

export function bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        // for each item there, we convert the decimal int to hex string (with necessary padding)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

export function getTimeRemaining(expiry: number): string {
    const length = Math.floor(expiry - (new Date().getTime())) / 1000;

    if (length < 0) {
        return 'expired';
    }

    const d = Math.floor(length / 86400);
    const h = Math.floor((length % 86400) / 3600);
    const m = Math.floor((length % 3600) / 60);

    let t = "";
    let flag = true;
    for (const e of [[d, 'd'], [h, 'h'], [m, 'm']]) {
        if ((e[0] == 0) && flag) {
            continue;
        }
        flag = false;
        t += `${e[0]}${e[1]} `;
    }

    return t;
};
