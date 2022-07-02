import * as React from 'react';
import { ImageThumbnail } from './Thumbnail/ImageThumbnail';
import PageButtons from './PageButtons';

import './ImageWall.css'

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
  let viewSize = 32
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

  return (
    <div className='imageWall' >
      <WrapperList
        key={getHashSlice(props.hashes, props.page)}
        thumbs={thumbs} />
      <PageButtons
        pages={returnPageCount()}
        offset={6}
        currentPage={props.page}
        changePage={props.changePage} />
    </div>
  );
}
