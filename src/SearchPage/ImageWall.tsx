import * as React from 'react';
import { ImageThumbnail } from '../Thumbnail/ImageThumbnail';
import PageButtons from './PageButtons';

import './ImageWall.css'

import { isMobile } from '../styleUtils'
import { Result } from './SearchPage';
import { MemoWrapperList as WrapperList } from './WrapperList';
import { useNavigate } from 'react-router-dom';

interface ImageWallProps {
  grouping: boolean;
  type: string;
  page: number;
  hashes: Array<Result>;
  addTag: Function;
  changePage: Function;
  loadingProgress: string;
  loaded: boolean;
  empty: boolean;
  thumbnailSize?:number;
}

export function ImageWall(props: ImageWallProps) {
  const [loaded, setLoaded] = React.useState<boolean>(false)

  const navigate = useNavigate()

  let width = (5 / 6) * (window.innerWidth);
  let elements = Math.floor(width / 180);


  //TODO
  //tie this into some sort of user settings
  let viewSize = 500;
  if (props.type === 'comic') {
    viewSize = 60
  }

  const [thumbs, setThumbs] = React.useState<JSX.Element[]>([]) //Used to have 

  function CreateNewThumbnailList(page: number) {

    let hashSlice = props.hashes.slice(0 + ((page - 1) * viewSize), Math.min((page) * viewSize, props.hashes.length))
    let list: Array<JSX.Element> = [];
    for (let hash of hashSlice) {
      list.push(
        <ImageThumbnail
          navigate={navigate}
          loadMeta={true}
          type={props.type}
          key={hash.cover}
          hash={hash.cover}
          replace={false}
          metadata={hash.entries}
          size={2}
        />);
    }
    return list;
  }

  function getHashSlice(hashes: Array<Result>, page: number): string {
    let slices = ''

    let condition = Math.min((page) * viewSize, props.hashes.length)

    for (let id = 0 + ((page - 1) * viewSize); id < condition; id++) {
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

    document.addEventListener('keyup', handleKeyPress)
    return () => {
      document.removeEventListener('keyup', handleKeyPress)
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


  function getOffsetValue(mobile: boolean): number {
    if (mobile) { return 2 }
    return 6
  }

  const sm = getHashSlice(props.hashes, props.page)

  return (
    <div className='imageWall' >
      {(props.empty) ? <div className='emptyStyle'>No results</div> : <>
      <WrapperList
        key={sm}
        thumbs={thumbs}
        type={props.type}
        loadingProgress={props.loadingProgress}
        loaded={props.loaded} />
      <PageButtons
        pages={returnPageCount()}
        offset={getOffsetValue(isMobile())}
        currentPage={props.page}
        changePage={props.changePage} /></> }
    </div>
  );
}
