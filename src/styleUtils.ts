/** Returns true if running in mobile view mode
 * 
 * @param width 
 * @returns 
 */
  export function isMobile(width: number) {
    if (width < 450) { return true }
    return false
  }