import { getMobileStyle } from "./StorageUtils"

/** Returns true if running in mobile view mode
 */
export function isMobile() {
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
        // true for mobile device
        return true
      }else{
        // false for not mobile device
        return false
      }


    if (getMobileStyle() === 'true') { return true }
    return false
}

export function isLandscapeMode() {
    if (window.screen.orientation.type === ('landscape-primary' || 'landscape-secondary')) { return true }
    return false
}

//TODO
//Just add a static setting for mobile/desktop mode