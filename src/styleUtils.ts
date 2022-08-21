import { getMobileStyle } from "./StorageUtils"

/** Returns true if running in mobile view mode
 */
export function isMobile() {
    if (getMobileStyle() === 'true') { return true }
    return false
}

export function isLandscapeMode() {
    if (window.screen.orientation.type === ('landscape-primary' || 'landscape-secondary')) { return true }
    return false
}

//TODO
//Just add a static setting for mobile/desktop mode