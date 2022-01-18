/**
 * Bounds the provided number within the specified range.
 * 
 * Example:
 * clamp(41, 0, 100) returns 41. 
 * clamp(-120, 0, 100) returns 0.
 * clamp(231, 0, 100) returns 100.
 * 
 * @param n
 *  The number to bound.
 * @param min
 *  The lower boundary of the range.
 * @param max
 *  The upper boundary of the range.
 * @returns
 *  The number's bounded value.
 */
export function clamp(n: number, min: number, max: number) {
    return Math.min(Math.max(n, min), max);
}

/**
 * Converts date to ISO string.
 * @param date
 *  The date to convert.
 * @returns
 *  The converted date.
 */
export function toIsoString(date: Date) {
    let tzo = -date.getTimezoneOffset();
    let dif = tzo >= 0 ? '+' : '-';
    return date.getFullYear() +
        '-' + format(date.getMonth() + 1) +
        '-' + format(date.getDate()) +
        'T' + format(date.getHours()) +
        ':' + format(date.getMinutes()) +
        ':' + format(date.getSeconds()) +
        dif + format(tzo / 60) +
        ':' + format(tzo % 60);
}

/**
 * Pads a number with 0.
 * @param num
 *  The number to pad.
 * @returns
 *  The padded number.
 */
function format(num: number) {
    return `${Math.floor(Math.abs(num))}`.padStart(2, "0");
};
