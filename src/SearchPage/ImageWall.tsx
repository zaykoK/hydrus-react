import * as React from 'react';
import { ImageThumbnail } from '../Thumbnail/ImageThumbnail';
import PageButtons from './PageButtons';

import './ImageWall.css'

import {isMobile} from '../styleUtils'

// @ts-check

interface ImageWallProps {
  grouping: boolean;
  type: string;
  page: number;
  hashes: Array<string>;
  addTag: Function;
  changePage: Function;
  counts: Map<any, any>;
}

export function ImageWall(props: ImageWallProps) {
  let width = (5/6) * (window.innerWidth);
  let elements = Math.floor( width/180);

  let viewSize = 50;
  if (props.type === 'comic') {
    viewSize = 14
  }

  const [thumbs, setThumbs] = React.useState(CreateNewThumbnailList(props.page))

  function CreateNewThumbnailList(page: number) {
    let hashSlice = props.hashes.slice(0 + ((page - 1) * viewSize), Math.min((page) * viewSize, props.hashes.length))
    let list: Array<JSX.Element> = [];
    for (let hash of hashSlice) {
      list.push(
        <ImageThumbnail
          loadMeta={true}
          type={props.type}
          addTag={props.addTag}
          key={hash}
          hash={hash}
          count={props.counts.get(hash)}
          replace={false}
        />);
    }
    return list;
  }

  function getHashSlice(hashes: Array<string>, page: number): string {
    let slices = ''
    for (let id = 0 + ((page - 1) * viewSize); id < Math.min((page) * viewSize, props.hashes.length); id++) {
      slices += props.hashes[id]
    }

    return slices
  }

  //Redraw when image hashes or page changes
  React.useEffect(() => {
    setThumbs(CreateNewThumbnailList(props.page))
  }, [props.hashes, props.page])

  function returnPageCount() {
    let count = Math.max(Math.floor(props.hashes.length / (viewSize)) + 1, 1)
    return count
  }

  function WrapperList(props: { thumbs: Array<JSX.Element> }) {
    return (
      <div className="WrapperList">{props.thumbs}</div>
    );
  }

  function getOffsetValue(mobile:boolean):number {
    if (mobile) {return 2}
    return 6
  }

  return (
    <div className='imageWall' >
      <WrapperList
        key={getHashSlice(props.hashes, props.page)}
        thumbs={thumbs} />
      <PageButtons
        pages={returnPageCount()}
        offset={getOffsetValue(isMobile())}
        currentPage={props.page}
        changePage={props.changePage} />
    </div>
  );
}
