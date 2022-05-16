import React, { useEffect, useState } from 'react';
import * as API from './hydrus-backend';

export const FileContent = React.memo((props) => {
  const [content, setContent] = useState(API.api_get_file_address(props.hash));

  const ThumbnailStyle = {
    padding: '0px',
    maxHeight: '97vh',
    maxWidth: '75vw',
    objectFit: 'contain',
    background: '#1e1e1e',
    imageRendering: '-webkit-optimize-contrast'
  };

  const wrapperStyle = {
    position: 'relative',
    background: '#1e1e1e',
    minHeight: '97vh',
    height: 'auto',
    overflow: 'hidden',
  }

  useEffect(() => {
    setContent(API.api_get_file_address(props.hash))
  }, [props]);

  function Content(props) {
    const [state, changeState] = useState('fit')
    const [style, changeStyle] = useState({
      padding: '0px',
      height: '97vh',
      maxWidth: '75vw',
      objectFit: 'contain',
      background: '#1e1e1e',
      imageRendering: '-webkit-optimize-contrast',
      cursor:'zoom-in'
    })

    function nextState() {
      console.log('switching state: ' + state)
      console.log(style)
      switch (state) {
        case 'fit':
          changeState('full')
          changeStyle({
            padding: '0px',
            objectFit: 'fit',
            background: '#1e1e1e',
            imageRendering: '-webkit-optimize-contrast',
            cursor:'zoom-in'
          });
          break;
        case 'full':
          changeState('zoom')
          changeStyle({
            padding: '0px',
            height: '100%',
            width: '100%',
            objectFit: 'fit',
            background: '#1e1e1e',
            imageRendering: '-webkit-optimize-contrast',
            cursor:'zoom-out'
          });
          break;
        case 'zoom':
          changeState('fit')
          changeStyle({
            padding: '0px',
            height: '97vh',
            maxWidth: '75vw',
            objectFit: 'contain',
            background: '#1e1e1e',
            imageRendering: '-webkit-optimize-contrast',
            cursor:'zoom-in'
          });
          break;
        default:
          changeState('fit')
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
      style={ThumbnailStyle} 
      autoPlay loop controls 
      src={props.content} />
    }
    if (props.type.includes("application")) {
      return <img 
      onClick={() => { console.log('This should at some point trigger file download') }}
      src={API.api_get_file_thumbnail_address(props.hash)}
      style={style} 
      alt={props.hash} />
    }

  }

  return (
    <div key={props.hash} style={wrapperStyle} >
      <Content type={props.type} content={content} hash={props.hash} />
    </div>
  );
});