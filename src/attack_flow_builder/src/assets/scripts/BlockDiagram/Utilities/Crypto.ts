export class Crypto { 

    /**
     * Returns a randomly generated v4 UUID.
     * @returns 
     *  A string containing a randomly generated, 36 character long v4 UUID.
     */
    public static randomUUID(): string {
        if(crypto.randomUUID) {
            // Use built-in browser function, if available
            return crypto.randomUUID();
        } else {
            return (`${1e7}-${1e3}-${4e3}-${8e3}-${1e11}`).replace(/[018]/g, c => 
                (parseInt(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> parseInt(c) / 4).toString(16)
            );
        }
    }

}
