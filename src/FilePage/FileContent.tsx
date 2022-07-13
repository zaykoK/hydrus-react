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

export function FileContent (props: FileContentProps) {
  const [content, setContent] = React.useState(API.api_get_file_address(props.hash));

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

    const [style, changeStyle] = React.useState(getStartingStyle())

    function getStartingStyle() {
      if (props.mobile) {
        if (isLandscapeMode()) { return 'styleFitHeight mobile landscape' }
        return 'styleFitWidth'
      }
      return 'styleFitHeight'
    }


    function changeZoom() {
      if (props.mobile) {
        return
      }
      switch (style) {
        case 'styleFitHeight':
          changeStyle('styleFitWidth');
          break;
        case 'styleFitWidth':
          changeStyle('styleFitHeight');
          break;
      }
    }

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

  function getContentWrapperStyle(){
    if (isLandscapeMode()) {return "contentWrapper mobile landscape"}
    return "contentWrapper"
  }

  return (
    <div key={props.hash} className={getContentWrapperStyle()} >
      <Content type={props.type} content={content} hash={props.hash} mobile={props.mobile} nextImage={props.nextImage} previousImage={props.previousImage} />
    </div>
  );
};