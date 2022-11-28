import * as React from 'react';
import { MemoThumbnail as ImageThumbnail } from '../Thumbnail/ImageThumbnail';

import './ImageWall.css'

import { ResultGroup } from './SearchPage';
import { MemoWrapperList as WrapperList } from './WrapperList';
import { useNavigate } from 'react-router-dom';
import ResultComponent from './ResultComponent';

interface ImageWallProps {
  grouping: boolean;
  type: string;
  page: number;
  results: Array<ResultGroup>;
  addTag: Function;
  changePage: Function;
  loadingProgress: string;
  loaded: boolean;
  empty: boolean;
  thumbnailSize?: number;
}

export function ImageWall(props: ImageWallProps) {
  const [thumbs, setThumbs] = React.useState<JSX.Element[]>([])

  const navigate = useNavigate()


  function CreateNewThumbnailList() {
    let resultSlice = props.results
    let list: Array<JSX.Element> = [];
    if (props.type === 'comic') {
      for (let result of resultSlice) {
        list.push(
          <ImageThumbnail
            navigate={navigate}
            loadMeta={true}
            type={props.type}
            key={result.cover}
            hash={result.cover}
            replace={false}
            metadata={result.entries}
            size={1}
            hideWidgetCount={props.grouping}
          />);
      }
    }
    else {
      for (let result of resultSlice) {
        let key = result.cover + result.title
        list.push(
          <ResultComponent key={key}
            navigate={navigate} result={result} type={props.type} grouping={props.grouping}
          />
        )
      }
    }
    return list;
  }

  function getHashSlice(hashes: Array<ResultGroup>): string {
    let slices = ''

    //let condition = Math.min((page) * viewSize, props.results.length)

    for (let result of hashes) {
      slices += result?.title
    }

    return slices
  }

  //Redraw when image hashes or page changes
  React.useEffect(() => {
    setThumbs(CreateNewThumbnailList())
  }, [props.results])

  React.useEffect(() => {
    if (props.loaded === false && thumbs.length > 0) {
      setThumbs([])
    }
  }, [props.loaded])

  const sm = getHashSlice(props.results)

  return (
    <div className='imageWall' >
      {(props.empty) ? 
      <div className='emptyStyle'>No results</div> 
      : <WrapperList
          key={sm}
          thumbs={thumbs}
          type={props.type}
          loadingProgress={props.loadingProgress}
          loaded={props.loaded}
        />}
    </div>
  );
}
