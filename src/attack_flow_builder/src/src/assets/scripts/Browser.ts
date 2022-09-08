/**
 * Opens an element in fullscreen.
 * @param el
 *  The element to fullscreen.
 *  (Default: `document.body`)
 */
export function fullscreen(el: HTMLElement = document.body) {
    let cast = el as any;
    if (cast.requestFullscreen) {
        cast.requestFullscreen();
    } else if (cast.webkitRequestFullscreen) {
        // Safari
        cast.webkitRequestFullscreen();
    } else if (cast.msRequestFullscreen) {
        // IE11
        cast.msRequestFullscreen();
    }
}
