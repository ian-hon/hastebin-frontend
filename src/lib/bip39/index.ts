import { wordlist } from "./wordlist";

// how did i get this pattern?
// in short, the meta mask extension is open source
// inside there, they use this bip39 package.
// https://github.com/MetaMask/metamask-extension/blob/04edd4094ebe8e976123445288eb076c735b01eb/package.json#L419
// 
// its filled with functionality, but all we want is
// to generate a X long passphrase for the paste signature.
//
// the bip39 package stores their wordlist in a .ts file,
// so thats what im doing here too
// https://github.com/paulmillr/scure-bip39/blob/main/src/index.ts

export function getWordlist(): string[] {
    return wordlist;
}

export function generatePhrase(length: number): string[] {
    const result = [];
    for (let i = 0; i < length; i++) {
        result.push(wordlist[Math.floor(Math.random() * wordlist.length)]);
    }
    return result;
}
