export const BACKEND_ADDRESS = 'https://backend.ianhon.com/hastebin';

export function toHex(i: number): string {
    let result = i.toString(16).padStart(8, '0');
    return `${result.substring(0, 4)}-${result.substring(4, 8)}`;
}

export function fromHex(h: string): number {
    return parseInt(h.replace('-', ''), 16);
}
