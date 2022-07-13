// @ts-ignore
import IconMobile from './assets/mode-mobile.svg'
// @ts-ignore
import IconDesktop from './assets/mode-desktop.svg'
import { useState } from 'react';

import { setMobileStyle, getMobileStyle } from './StorageUtils';

import './MobileModeButton.css'

export function MobileModeButton() {
  const [mobileMode, setMobileMode] = useState(stringToBool(getMobileStyle()))

  function stringToBool(value: string): boolean {
    if (value === 'true') { return true }
    return false
  }

  function toggleMobileMode() {
    setMobileStyle(!mobileMode)
    setMobileMode(!mobileMode)
  }

  function getIcon(enabled: boolean) {
    if (enabled) {
      return IconMobile
    }
    return IconDesktop
  }

  return <img
    className='buttonMobile'
    src={getIcon(mobileMode)}
    onClick={() => { toggleMobileMode() }} />
}

export default MobileModeButton;