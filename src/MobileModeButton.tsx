import IconMobile from './assets/mode-mobile.svg'
import IconDesktop from './assets/mode-desktop.svg'
import { useState } from 'react';

import { setMobileStyle, getMobileStyle } from './StorageUtils';

import './MobileModeButton.css'
import { isMobile } from './styleUtils';

export function MobileModeButton() {
  const [mobileMode, setMobileMode] = useState(stringToBool(getMobileStyle()))

  function stringToBool(value: string): boolean {
    if (value === 'true') { return true }
    return false
  }

  function toggleMobileMode() {
    setMobileStyle(!mobileMode)
    setMobileMode(!mobileMode)
    window.location.reload()
  }

  function getNavLinkStyle() {
    if (isMobile()) { return "navLink mobile" }
    return "navLink"
  }

  function getNavButtonStyle() {
    if (isMobile()) { return "topBarButton mobile" }
    return "topBarButton"
  }

  function getLabelText() {
    if (mobileMode) {return 'Mobile'}
    return "Desktop"
  }

  function getIcon(enabled: boolean) {
    if (enabled) {
      return IconMobile
    }
    return IconDesktop
  }

  return <div className={getNavLinkStyle()}>
    <img className={getNavButtonStyle()}
         src={getIcon(mobileMode)}
         onClick={() => { toggleMobileMode() }} />
    <div className="navButtonLabel">{getLabelText()}</div>
  </div>
}

export default MobileModeButton;