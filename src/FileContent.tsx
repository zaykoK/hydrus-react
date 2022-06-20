import * as React from 'react';
import * as API from './hydrus-backend';
import { useSwipeable } from 'react-swipeable';

interface FileContentProps {
  hash: string | undefined;
  type: string;
  mobile: boolean;
  nextImage: Function;
  previousImage: Function;

}


export const FileContent = React.memo((props: FileContentProps) => {
  const [content, setContent] = React.useState(API.api_get_file_address(props.hash));

  const wrapperStyle = {
    position: 'relative',
    height: 'auto',
    overflow: 'hidden',
  } as React.CSSProperties;

  React.useEffect(() => {
    setContent(API.api_get_file_address(props.hash))
  }, [props]);

  interface ContentProps {
    nextImage: Function;
    previousImage: Function;
    mobile: boolean;
    type: string;
    content: string|undefined;
    hash: string | undefined;
  }

  function Content(props: ContentProps) {
    const swipeHandlers = useSwipeable({
      onSwipedLeft: (eventData) => {
        //console.log("Swipe LEft",eventData);
        props.nextImage()
      },
      onSwipedRight: (eventData) => {
        //console.log("Swipe Rite",eventData);
        props.previousImage()
      },
      onTap: (eventData) => {
        changeZoom()
      }
    })

    const styleFitHeight = {
      padding: '0px',
      height: '94vh',
      width: 'auto',
      maxWidth: '100%',
      objectFit: 'contain',
      imageRendering: '-webkit-optimize-contrast',
      cursor: 'zoom-in'
    } as React.CSSProperties;

    const styleFitWidth = {
      padding: '0px',
      height: '100%',
      width: '100%',
      objectFit: 'contain',
      imageRendering: '-webkit-optimize-contrast',
      cursor: 'zoom-out'
    } as React.CSSProperties;

    const [state, changeState] = React.useState('fit-height')
    const [style, changeStyle] = React.useState(getStartingStyle())



    function getStartingStyle() {
      //console.log(props.mobile)
      if (props.mobile) {
        return styleFitWidth
      }
      return styleFitHeight
    }


    function changeZoom() {
      if (props.mobile) {
        return
      }

      switch (state) {
        case 'fit-height':
          changeState('fit-width')
          changeStyle(styleFitWidth);
          break;
        case 'fit-width':
          changeState('fit-height')
          changeStyle(styleFitHeight);
          break;
        default:
          changeState('fit-height')
      }
    }


    if (props.type.includes("image")) {
      return <img
        {...swipeHandlers}
        onClick={() => changeZoom()}
        src={props.content}
        style={style}
        alt={props.hash} />
    }
    if (props.type.includes("video")) {
      return <video
        {...swipeHandlers}
        style={style}
        autoPlay loop controls
        src={props.content} />
    }
    //Default case - just use a thumbnail
    return <img
      {...swipeHandlers}
      src={API.api_get_file_thumbnail_address(props.hash)}
      style={style}
      alt={props.hash} />

  }

  return (
    <div key={props.hash} style={wrapperStyle} >
      <Content type={props.type} content={content} hash={props.hash} mobile={props.mobile} nextImage={props.nextImage} previousImage={props.previousImage} />
    </div>
  );
});