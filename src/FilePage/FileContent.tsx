import * as React from 'react';
import * as API from '../hydrus-backend';
import { useSwipeable } from 'react-swipeable';

import { isLandscapeMode } from '../styleUtils';

import './FileContent.css'

interface FileContentProps {
  hash: string | undefined;
  type: string;
  mobile: boolean;
  nextImage: Function;
  previousImage: Function;
}

export function FileContent(props: FileContentProps) {
  const [content, setContent] = React.useState(API.api_get_file_address(props.hash));

  React.useEffect(() => {
    setContent(API.api_get_file_address(props.hash))
  }, [props]);

  interface ContentProps {
    nextImage: Function;
    previousImage: Function;
    mobile: boolean;
    type: string;
    content: string | undefined;
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

    const [style, changeStyle] = React.useState(getStartingStyle())

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
    }

    const handleMouseScroll = (e: WheelEvent) => {
      //console.log(e.deltaY)
      if (sessionStorage.getItem('fullscreen-view') === 'true') {
        const el = document.querySelector('.styleFitWidth')
        console.log(el)

        if (e.deltaY > 0) { console.log('scrolling down') }
        if (e.deltaY < 0) { console.log('scrolling up') }
      }
    }

    React.useEffect(() => {
      document.addEventListener('keydown', handleKeyPress)
      document.addEventListener('wheel', handleMouseScroll)

      return () => {
        document.removeEventListener('keydown', handleKeyPress)
        document.removeEventListener('wheel', handleMouseScroll)
      }
    }, [])

    if (props.type.includes("image")) {
      return <img
        {...swipeHandlers}
        onClick={() => changeZoom()}
        src={props.content}
        className={style}
        alt={props.hash} />
    }
    if (props.type.includes("video")) {
      return <video
        {...swipeHandlers}
        className={style}
        autoPlay loop controls
        src={props.content} />
    }
    //Default case - just use a thumbnail
    return <img
      {...swipeHandlers}
      src={API.api_get_file_thumbnail_address(props.hash)}
      className={style}
      alt={props.hash} />
  }

  function getContentWrapperStyle() {
    if (isLandscapeMode()) { return "contentWrapper mobile landscape" }
    return "contentWrapper"
  }

  return (
    <div key={props.hash} className={getContentWrapperStyle()} >
      <Content type={props.type} content={content} hash={props.hash} mobile={props.mobile} nextImage={props.nextImage} previousImage={props.previousImage} />
    </div>
  );
};