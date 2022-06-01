import IconImage from './assets/filetype-picture.svg'
import IconVideo from './assets/filetype-video.svg'
import IconOther from './assets/filetype-unknown.svg'

function WidgetFileType(props) {
    if (props === undefined) {return}

    const iconStyle = {
      position:'absolute',
      bottom:'0px',
      left:'0px',
      background:'#000000d1',
      padding:'3px',
      borderRadius:'0px 10px 0px 0px',
      opacity:'0.6',
      pointerEvents:'none'
    }
    const svgStyle = {
      width:'20px',
      height:'20px'
    }


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