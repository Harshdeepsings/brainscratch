import crypto from "crypto";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz1234567890";

/**
 * Cryptographically secure random alphanumeric string generator
 * Replaces insecure Math.random() to prevent PRNG seed prediction
 */
export function random(len: number): string {
    const bytes = crypto.randomBytes(len);
    let result = "";
    const alphabetLength = ALPHABET.length;

    for (let i = 0; i < len; i++) {
        const byte = bytes[i] ?? 0;
        result += ALPHABET[byte % alphabetLength];
    }

    return result;
}
