import * as React from 'react';
import * as API from '../hydrus-backend';
import { useSwipeable } from 'react-swipeable';

import { isLandscapeMode, isMobile } from '../styleUtils';

import './FileContent.css'

import { TransformComponent, TransformWrapper } from "@pronestor/react-zoom-pan-pinch"

interface FileContentProps {
  hash: string | undefined;
  type: string;
  mobile: boolean;
  nextImage: Function;
  previousImage: Function;
  nextSearchImage: Function;
  previousSearchImage: Function;
}

export function FileContent(props: FileContentProps) {
  const [content, setContent] = React.useState(API.api_get_file_address(props.hash));

  React.useEffect(() => {
    setContent(API.api_get_file_address(props.hash))
  }, [props]);

  interface ContentProps {
    nextImage: Function;
    previousImage: Function;
    nextSearchImage: Function;
    previousSearchImage: Function;
    mobile: boolean;
    type: string;
    content: string | undefined;
    hash: string | undefined;
  }

  function Content(props: ContentProps) {
    const swipeHandlers = useSwipeable({
      onSwipedLeft: (eventData) => {
        props.nextImage()
      },
      onSwipedRight: (eventData) => {
        props.previousImage()
      },
      onTap: (eventData) => {
        changeZoom()
      },
      delta: 150
    })

    const [style, changeStyle] = React.useState(getStartingStyle())
    const [src, setSrc] = React.useState(API.api_get_file_thumbnail_address(props.hash))
    const [loaded, setLoaded] = React.useState<boolean>(false)

    function getStartingStyle() {
      if (props.mobile) {
        if (isLandscapeMode()) { return 'styleFitHeight mobile landscape' }
        return 'styleFitHeight mobile'
      }
      if (sessionStorage.getItem('fullscreen-view') === 'true') { return 'styleFitWidth' }
      return 'styleFitHeight'
    }

    function changeZoom() {
      if (props.mobile) {
        return
      }
      switch (style) {
        case 'styleFitHeight':
          changeStyle('styleFitWidth');
          sessionStorage.setItem('fullscreen-view', 'true')
          break;
        case 'styleFitWidth':
          changeStyle('styleFitHeight');
          sessionStorage.setItem('fullscreen-view', 'false')
          break;
      }
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { props.nextImage() }
      if (e.key === "ArrowLeft") { props.previousImage() }
      if (e.key === "ArrowUp") { props.nextSearchImage() }
      if (e.key === "ArrowDown") { props.previousSearchImage() }
    }

    const handleMouseScroll = (e: WheelEvent) => {
      //console.log(e.deltaY)
      if (sessionStorage.getItem('fullscreen-view') === 'true') {
        const el = document.querySelector('.styleFitWidth')
        //console.log(el)

        //What I want to get here is ability to zoom in/out with mouse scroll and pan with drag

        if (e.deltaY > 0) { console.log('scrolling down') }
        if (e.deltaY < 0) { console.log('scrolling up') }
      }
    }

    function loadFullSizeImage():void {
      const img = new Image()
      img.src = props.content || ''
      img.onload = () => {setSrc(img.src); setLoaded(true)}
    }

    React.useEffect(() => {
      document.addEventListener('keydown', handleKeyPress)
      //document.addEventListener('wheel', handleMouseScroll)
      
      //Immediately start loading full size image, and when ready change to it
      loadFullSizeImage()


      return () => {
        document.removeEventListener('keydown', handleKeyPress)
        //document.removeEventListener('wheel', handleMouseScroll)
      }
    }, [])

    //Basically in case of images
    //When in portait mode
    if (props.type.includes("image")) {
      let image = <img
        {...swipeHandlers}
        onClick={() => changeZoom()}
        onLoad={() => console.log(props.content)}
        onContextMenu={(e) => e.preventDefault()}
        src={src}
        className={style}
        alt={props.hash} />
      if (isLandscapeMode() && isMobile()) {
        return <TransformWrapper
          centerZoomedOut={true}
          minScale={1}
          initialScale={1}><TransformComponent>
            {image}</TransformComponent></TransformWrapper>
      }
      return image
    }
    if (props.type.includes("video")) {
      return <video
        {...swipeHandlers}
        onContextMenu={(e) => e.preventDefault()}
        className={style}
        autoPlay loop controls
        src={props.content} />
    }
    //Default case - just use a thumbnail
    return <img
      {...swipeHandlers}
      onContextMenu={(e) => e.preventDefault()}
      src={API.api_get_file_thumbnail_address(props.hash)}
      className={style}
      alt={props.hash} />
  }

  function getContentWrapperStyle() {
    if (isLandscapeMode() && !props.type.includes('video')) { return "contentWrapper mobile landscape" }
    return "contentWrapper"
  }

  return (
    <div key={props.hash} className={getContentWrapperStyle()} >
      <Content type={props.type} content={content} hash={props.hash} mobile={props.mobile} nextImage={props.nextImage} previousImage={props.previousImage} nextSearchImage={props.nextSearchImage} previousSearchImage={props.previousSearchImage} />
    </div>
  );
};