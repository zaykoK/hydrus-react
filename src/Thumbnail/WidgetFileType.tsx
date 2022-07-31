import IconImage from '../assets/filetype-picture.svg'
import IconVideo from '../assets/filetype-video.svg'
import IconOther from '../assets/filetype-unknown.svg'
import { MetadataResponse } from '../hydrus-backend';
import './WidgetFileType.css'

interface WidgetFileTypeProps {
  metadata:MetadataResponse|undefined;

}

function WidgetFileType(props:WidgetFileTypeProps) {
    if (props === undefined) {return <></>}


    if (props.metadata?.mime.includes('video')){
      return <div className="WidgetFileTypeWrapper"><img src={IconVideo} className="WidgetFileTypeIcon" /></div>
    }
    if (props.metadata?.mime.includes('image')){
      return <div className="WidgetFileTypeWrapper"><img src={IconImage} className="WidgetFileTypeIcon" /></div>
    }
    if (props.metadata?.mime.includes('application')){
      return <div className="WidgetFileTypeWrapper"><img src={IconOther} className="WidgetFileTypeIcon" /></div>
    }
    return <div className="WidgetFileTypeWrapper"><img src={IconImage} className="WidgetFileTypeIcon"/></div>
  }
  export default WidgetFileType