// @ts-ignore
import IconImage from './assets/filetype-picture.svg'
// @ts-ignore
import IconVideo from './assets/filetype-video.svg'
// @ts-ignore
import IconOther from './assets/filetype-unknown.svg'
import { MetadataResponse } from './hydrus-backend';


interface WidgetFileTypeProps {
  metadata:MetadataResponse|undefined;

}

function WidgetFileType(props:WidgetFileTypeProps) {
    if (props === undefined) {return <></>}

    const iconStyle = {
      position:'absolute',
      bottom:'0px',
      left:'0px',
      background:'#000000d1',
      padding:'3px',
      borderRadius:'0px 10px 0px 0px',
      opacity:'0.6',
      pointerEvents:'none'
    } as React.CSSProperties
    const svgStyle = {
      width:'20px',
      height:'20px'
    } as React.CSSProperties


    if (props.metadata?.mime.includes('video')){
      return <div style={iconStyle}><img src={IconVideo} style={svgStyle} /></div>
    }
    if (props.metadata?.mime.includes('image')){
      return <div style={iconStyle}><img src={IconImage} style={svgStyle} /></div>
    }
    if (props.metadata?.mime.includes('application')){
      return <div style={iconStyle}><img src={IconOther} style={svgStyle} /></div>
    }
    return <div style={iconStyle}><img src={IconImage} style={svgStyle} /></div>
  }
  export default WidgetFileType