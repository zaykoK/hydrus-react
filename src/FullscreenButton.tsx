// @ts-ignore
import IconFullscreenOn from './assets/fullScreenOn.svg'
// @ts-ignore
import IconFullscreenOff from './assets/fullScreenOff.svg'
import { useState } from 'react';

import './FullscreenButton.css'

export function FullscreenButton() {
    const [enabled,setEnabled] = useState(false)

    function toggleFullscreen(){
      setEnabled(!enabled)
      if(document.fullscreenElement != null){
        document.exitFullscreen()
        return
      }
      document.documentElement.requestFullscreen()
      return
    }

    function getIcon(enabled:boolean){
      if (!enabled) {
        return IconFullscreenOn
      }
      return IconFullscreenOff
    }

    return <img
      className='topBarButton'
      src={getIcon(enabled)}
      onClick={() => { toggleFullscreen() }} />
  }

export default FullscreenButton;