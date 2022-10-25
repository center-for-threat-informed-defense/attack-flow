/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.2 Copyright (C) Paul Johnston 1999 - 2009
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 * Updated by Michael Carenzo 2022.
 */

const hex = "0123456789abcdef";

/**
 * Converts a 32-bit number to hex (least significant byte first).
 * @param num
 *  The number.
 * @returns
 *  The hex string.
 */
function toHex(num: number): string {
    let str = "";
    for (let i = 0; i <= 3; i++) {
        str += hex.charAt((num >> (i * 8 + 4)) & 0x0F) + hex.charAt((num >> (i * 8)) & 0x0F);
    }
    return str;
}

/**
 * Converts a string into an array of blocks. Each block contains 16, 32-bit,
 * words. Size padding and padding bits are appended per the MD5 standard.  
 * @param str
 *  The string.
 * @returns
 *  The set of blocks flattened into a single array.
 */
function stringToBlocks(str: string): number[] {
    let i;
    let size = ((str.length + 8) >> 6) + 1;
    let blocks = new Array(size * 16).fill(0);
    for (i = 0; i < str.length; i++) {
        blocks[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
    }
    blocks[i >> 2] |= 0x80 << ((i % 4) * 8);
    blocks[size * 16 - 2] = str.length * 8;
    return blocks;
}

/**
 * Adds two numbers (wrapping at 2^32). This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 * @param x
 *  The first operand.
 * @param y
 *  The second operand.
 * @returns
 *  The sum.
 */
function add(x: number, y: number): number {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xFFFF);
}

/**
 * Rotates a 32-bit number `cnt` bits to the left.
 * @param num
 *  The number.
 * @param cnt
 *  The number of bits to rotate by.
 * @returns
 *  The new number.
 */
function rol(num: number, cnt: number): number {
    return (num << cnt) | (num >>> (32 - cnt));
}

/**
 * CMN transform function.
 * @param q
 *  The result of the F, G, H, or I auxiliary function.
 * @param a
 *  First 32-bit word.
 * @param b
 *  Second 32-bit word.
 * @param x 
 *  32-bit word from a message block.
 * @param s
 *  The number of bits to rotate by.
 * @param t
 *  Sin table parameter (abs(sin(i))).
 * @returns
 *  Transform result.
 */
function cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
    return add(rol(add(add(a, q), add(x, t)), s), b);
}

/**
 * FF transform operation.
 * @param a
 *  First 32-bit word.
 * @param b
 *  Second 32-bit word.
 * @param c
 *  Third 32-bit word.
 * @param d
 *  Fourth 32-bit word.
 * @param x
 *  32-bit word from a message block.
 * @param s
 *  The number of bits to rotate by.
 * @param t
 *  Sin table parameter (abs(sin(i))).
 * @returns
 *  Transform result.
 */
function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t);
}

/**
 * GG transform operation.
 * @param a
 *  First 32-bit word.
 * @param b
 *  Second 32-bit word.
 * @param c
 *  Third 32-bit word.
 * @param d
 *  Fourth 32-bit word.
 * @param x
 *  32-bit word from a message block.
 * @param s
 *  The number of bits to rotate by.
 * @param t
 *  Sin table parameter (abs(sin(i))).
 * @returns
 *  Transform result.
 */
function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return cmn((b & d) | (c & (~d)), a, b, x, s, t);
}

/**
 * HH transform operation.
 * @param a
 *  First 32-bit word.
 * @param b
 *  Second 32-bit word.
 * @param c
 *  Third 32-bit word.
 * @param d
 *  Fourth 32-bit word.
 * @param x
 *  32-bit word from a message block.
 * @param s
 *  The number of bits to rotate by.
 * @param t
 *  Sin table parameter (abs(sin(i))).
 * @returns
 *  Transform result.
 */
function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return cmn(b ^ c ^ d, a, b, x, s, t);
}

/**
 * II transform operation.
 * @param a
 *  First 32-bit word.
 * @param b
 *  Second 32-bit word.
 * @param c
 *  Third 32-bit word.
 * @param d
 *  Fourth 32-bit word.
 * @param x
 *  32-bit word from a message block.
 * @param s
 *  The number of bits to rotate by.
 * @param t
 *  Sin table parameter (abs(sin(i))).
 * @returns
 *  Transform result.
 */
function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/**
 * Calculates the MD5 hash of a string.
 * @param str
 *  The string.
 * @returns
 *  The MD5 digest.
 */
export function MD5(str: string): string {
    let x = stringToBlocks(str),
        a = 1732584193,
        b = -271733879,
        c = -1732584194,
        d = 271733878;

    for (let i = 0; i < x.length; i += 16) {

        let old_a = a,
            old_b = b,
            old_c = c,
            old_d = d;

        // Round 1

        a = ff(a, b, c, d, x[i + 0], 7, -680876936);
        d = ff(d, a, b, c, x[i + 1], 12, -389564586);
        c = ff(c, d, a, b, x[i + 2], 17, 606105819);
        b = ff(b, c, d, a, x[i + 3], 22, -1044525330);
        a = ff(a, b, c, d, x[i + 4], 7, -176418897);
        d = ff(d, a, b, c, x[i + 5], 12, 1200080426);
        c = ff(c, d, a, b, x[i + 6], 17, -1473231341);
        b = ff(b, c, d, a, x[i + 7], 22, -45705983);
        a = ff(a, b, c, d, x[i + 8], 7, 1770035416);
        d = ff(d, a, b, c, x[i + 9], 12, -1958414417);
        c = ff(c, d, a, b, x[i + 10], 17, -42063);
        b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
        a = ff(a, b, c, d, x[i + 12], 7, 1804603682);
        d = ff(d, a, b, c, x[i + 13], 12, -40341101);
        c = ff(c, d, a, b, x[i + 14], 17, -1502002290);
        b = ff(b, c, d, a, x[i + 15], 22, 1236535329);

        // Round 2

        a = gg(a, b, c, d, x[i + 1], 5, -165796510);
        d = gg(d, a, b, c, x[i + 6], 9, -1069501632);
        c = gg(c, d, a, b, x[i + 11], 14, 643717713);
        b = gg(b, c, d, a, x[i + 0], 20, -373897302);
        a = gg(a, b, c, d, x[i + 5], 5, -701558691);
        d = gg(d, a, b, c, x[i + 10], 9, 38016083);
        c = gg(c, d, a, b, x[i + 15], 14, -660478335);
        b = gg(b, c, d, a, x[i + 4], 20, -405537848);
        a = gg(a, b, c, d, x[i + 9], 5, 568446438);
        d = gg(d, a, b, c, x[i + 14], 9, -1019803690);
        c = gg(c, d, a, b, x[i + 3], 14, -187363961);
        b = gg(b, c, d, a, x[i + 8], 20, 1163531501);
        a = gg(a, b, c, d, x[i + 13], 5, -1444681467);
        d = gg(d, a, b, c, x[i + 2], 9, -51403784);
        c = gg(c, d, a, b, x[i + 7], 14, 1735328473);
        b = gg(b, c, d, a, x[i + 12], 20, -1926607734);

        // Round 3

        a = hh(a, b, c, d, x[i + 5], 4, -378558);
        d = hh(d, a, b, c, x[i + 8], 11, -2022574463);
        c = hh(c, d, a, b, x[i + 11], 16, 1839030562);
        b = hh(b, c, d, a, x[i + 14], 23, -35309556);
        a = hh(a, b, c, d, x[i + 1], 4, -1530992060);
        d = hh(d, a, b, c, x[i + 4], 11, 1272893353);
        c = hh(c, d, a, b, x[i + 7], 16, -155497632);
        b = hh(b, c, d, a, x[i + 10], 23, -1094730640);
        a = hh(a, b, c, d, x[i + 13], 4, 681279174);
        d = hh(d, a, b, c, x[i + 0], 11, -358537222);
        c = hh(c, d, a, b, x[i + 3], 16, -722521979);
        b = hh(b, c, d, a, x[i + 6], 23, 76029189);
        a = hh(a, b, c, d, x[i + 9], 4, -640364487);
        d = hh(d, a, b, c, x[i + 12], 11, -421815835);
        c = hh(c, d, a, b, x[i + 15], 16, 530742520);
        b = hh(b, c, d, a, x[i + 2], 23, -995338651);

        // Round 4

        a = ii(a, b, c, d, x[i + 0], 6, -198630844);
        d = ii(d, a, b, c, x[i + 7], 10, 1126891415);
        c = ii(c, d, a, b, x[i + 14], 15, -1416354905);
        b = ii(b, c, d, a, x[i + 5], 21, -57434055);
        a = ii(a, b, c, d, x[i + 12], 6, 1700485571);
        d = ii(d, a, b, c, x[i + 3], 10, -1894986606);
        c = ii(c, d, a, b, x[i + 10], 15, -1051523);
        b = ii(b, c, d, a, x[i + 1], 21, -2054922799);
        a = ii(a, b, c, d, x[i + 8], 6, 1873313359);
        d = ii(d, a, b, c, x[i + 15], 10, -30611744);
        c = ii(c, d, a, b, x[i + 6], 15, -1560198380);
        b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
        a = ii(a, b, c, d, x[i + 4], 6, -145523070);
        d = ii(d, a, b, c, x[i + 11], 10, -1120210379);
        c = ii(c, d, a, b, x[i + 2], 15, 718787259);
        b = ii(b, c, d, a, x[i + 9], 21, -343485551);

        a = add(a, old_a);
        b = add(b, old_b);
        c = add(c, old_c);
        d = add(d, old_d);
    }

    return toHex(a) + toHex(b) + toHex(c) + toHex(d);
}
