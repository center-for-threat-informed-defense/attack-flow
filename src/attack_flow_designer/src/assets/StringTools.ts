export function capitalize(text: string): string {
    return `${ text[0].toLocaleUpperCase() }${ text.substring(1) }`
}

export function sentenceCase(text: string): string {
    return text.split(/(\s+)/).map(s => capitalize(s)).join("");
}