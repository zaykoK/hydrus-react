import * as React from 'react';
import { ImageThumbnail } from '../Thumbnail/ImageThumbnail';
import PageButtons from './PageButtons';

import './ImageWall.css'

import { isMobile } from '../styleUtils'
import { Result } from './SearchPage';

interface ImageWallProps {
  grouping: boolean;
  type: string;
  page: number;
  hashes: Array<Result>;
  addTag: Function;
  changePage: Function;
  loadingProgress: string;
  loaded: boolean;
}

export function ImageWall(props: ImageWallProps) {
  const [loaded, setLoaded] = React.useState<boolean>(false)

  let width = (5 / 6) * (window.innerWidth);
  let elements = Math.floor(width / 180);

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
          key={hash.cover}
          hash={hash.cover}
          count={hash.entries.length}
          replace={false}
        />);
    }
    return list;
  }

  function getHashSlice(hashes: Array<Result>, page: number): string {
    let slices = ''
    for (let id = 0 + ((page - 1) * viewSize); id < Math.min((page) * viewSize, props.hashes.length); id++) {
      slices += hashes[id]?.cover
    }

    return slices
  }



  React.useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      function NextPage() {
        if (props.page + 1 <= returnPageCount()) { props.changePage(props.page + 1) }
      }
      function PreviousPage() {
        if (props.page - 1 > 0) { props.changePage(props.page - 1) }

      }

      if (e.key === "ArrowRight") { NextPage() }
      if (e.key === "ArrowLeft") { PreviousPage() }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  })

  //Redraw when image hashes or page changes
  React.useEffect(() => {
    setThumbs(CreateNewThumbnailList(props.page))
  }, [props.hashes, props.page])

  function returnPageCount() {
    let count = Math.max(Math.floor(props.hashes.length / (viewSize)) + 1, 1)
    return count
  }

  function WrapperList(props: { thumbs: Array<JSX.Element>, loadingProgress: string, loaded: boolean }) {
    return ((props.loaded && thumbs.length > 0) &&
      <div className="WrapperList">{props.thumbs}</div> || <div className="WrapperList loading">LOADING {props.loadingProgress}</div>
    );
  }

  function getOffsetValue(mobile: boolean): number {
    if (mobile) { return 2 }
    return 6
  }

  return (
    <div className='imageWall' >
      <WrapperList
        key={getHashSlice(props.hashes, props.page)}
        thumbs={thumbs}
        loadingProgress={props.loadingProgress}
        loaded={props.loaded} />
      <PageButtons
        pages={returnPageCount()}
        offset={getOffsetValue(isMobile())}
        currentPage={props.page}
        changePage={props.changePage} />
    </div>
  );
}
