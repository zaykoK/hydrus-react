import React, { useEffect, useState } from 'react';
import * as API from './hydrus-backend';
export const FileContent = React.memo((props) => {
  const [content, setContent] = useState(API.api_get_file_address(props.hash));

  const wrapperStyle = {
    position: 'relative',
    height: 'auto',
    overflow: 'hidden',
  }

  useEffect(() => {
    setContent(API.api_get_file_address(props.hash))
  }, [props]);

  function Content(props) {

    const styleFitHeight = {
      padding: '0px',
      height: '94vh',
      width: 'auto',
      maxWidth: '100%',
      objectFit: 'contain',
      imageRendering: '-webkit-optimize-contrast',
      cursor: 'zoom-in'
    }

    const styleFitWidth = {
      padding: '0px',
      height: '100%',
      width: '100%',
      objectFit: 'fit',
      imageRendering: '-webkit-optimize-contrast',
      cursor: 'zoom-out'
    }

    const [state, changeState] = useState('fit-height')
    const [style, changeStyle] = useState(getStartingStyle())

   

    function getStartingStyle() {
      //console.log(props.mobile)
      if (props.mobile) {
        return styleFitWidth
      }
      return styleFitHeight
    }


    function nextState() {
      if (props.mobile){
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
        onClick={() => { nextState() }}
        src={props.content}
        style={style}
        alt={props.hash} />
    }
    if (props.type.includes("video")) {
      return <video
        style={style}
        autoPlay loop controls
        src={props.content} />
    }
    if (props.type.includes("application")) {
      return <img
        src={API.api_get_file_thumbnail_address(props.hash)}
        style={style}
        alt={props.hash} />
    }

  }

  return (
    <div key={props.hash} style={wrapperStyle} >
      <Content type={props.type} content={content} hash={props.hash} mobile={props.mobile} />
    </div>
  );
});