// @ts-ignore
import IconFullscreenOn from './assets/fullScreenOn.svg'
// @ts-ignore
import IconFullscreenOff from './assets/fullScreenOff.svg'
import colors from './stylingVariables';
import { useState } from 'react';


export function FullscreenButton() {
    const [enabled,setEnabled] = useState(false)

    function returnButtonStyle(enabled:boolean) {
      if (!enabled) { return ButtonStyle }
      return ButtonStyle
    }

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



    const ButtonStyle = {
      height: '1.5em',
      width: '1.5em',
      background: colors.COLOR2,
      margin: '0px',
      padding: '0px',
      borderRadius: '10px',
      cursor: 'pointer',
      opacity: '0.7'
    }

    return <img
      src={getIcon(enabled)}
      style={returnButtonStyle(enabled)}
      onClick={() => { toggleFullscreen() }} />
  }

export default FullscreenButton;