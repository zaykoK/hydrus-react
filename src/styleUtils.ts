/** Returns true if running in mobile view mode
 */
export function isMobile() {
    if (window.innerWidth < 610) { return true }
    return false
}

//TODO
//Just add a static setting for mobile/desktop mode