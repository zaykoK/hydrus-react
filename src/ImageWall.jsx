import React, { useEffect, useState } from 'react';
import { ImageThumbnail } from "./ImageThumbnail";
import { PageButtons } from './PageButtons';
import colors from './stylingVariables';



export function ImageWall(props) {

  let viewSize = 32
  if (props.type === 'comic') {
    viewSize = 14
  }

  const [thumbs, setThumbs] = useState(CreateNewThumbnailList(props.page))


  function CreateNewThumbnailList(page) {
    let list = [];
    for (let id = 0 + ((page - 1) * viewSize); id < Math.min((page) * viewSize, props.hashes.length); id++) {
      list.push(
        <ImageThumbnail
          loadMeta={true}
          type={props.type}
          addTag={props.addTag}
          key={props.hashes[id]}
          hash={props.hashes[id]}
        />);
    }
    return list;
  }

  //Redraw when image hashes or page changes
  useEffect(() => {
    setThumbs(CreateNewThumbnailList(props.page))
  }, [props.hashes, props.page])


  const WrapperListStyle = {
    display: 'flex',
    flexFlow: 'row wrap',
    placeItems: "flex-start",
    padding: '15px',
    gap: '15px',
    borderRadius: '15px',
    //justifyContent: 'space-evenly'
  };

  function returnPageCount() {
    let count = Math.max(Math.floor(props.hashes.length / (viewSize)) + 1, 1)
    return count
  }

  function WrapperList(props) {
    return (
      <div id="wall" style={WrapperListStyle}>{props.thumbs}</div>
    );
  }

  const imageWallStyle = {
    background: colors.COLOR3,
    height: 'fit-content',
    gridColumn: '2',
    margin:'0px 0px 30px 0px'
  }

  return (
    <div style={imageWallStyle}>
      <WrapperList
        key={props.hashes}
        page={props.page}
        thumbs={thumbs} />
      <PageButtons
        type={'comic'}
        pages={returnPageCount()}
        offset={6}
        currentPage={parseInt(props.page)}
        changePage={props.changePage} />
    </div>
  );
}
