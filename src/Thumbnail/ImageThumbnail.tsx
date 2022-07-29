import * as React from 'react';
import * as API from '../hydrus-backend';
import { useNavigate } from "react-router-dom";
import * as TagTools from '../TagTools'
import WidgetCount from './WidgetCount';
import WidgetFileType from './WidgetFileType';

import './ImageThumbnail.css'
import { isMobile } from '../styleUtils';

// @ts-check

interface ImageThumbnailProps {
  hash: string;
  currentImage?: boolean;
  loadMeta: boolean;
  addTag: Function;
  replace: boolean;
  type: string;
  count?: number;
}


export const ImageThumbnail = React.memo((props: ImageThumbnailProps) => {
  const [thumbnail, setThumbnail] = React.useState(API.api_get_file_thumbnail_address(props.hash));
  const [metadata, setMetadata] = React.useState();

  const navigate = useNavigate();



  function getThumbStyle(type: string): string {
    //console.log(type)
    switch (type) {
      case 'comic':
        return "thumbnail thumbnailComic"
      default: //case 'image':
        if (props.currentImage) {
          return "thumbnail thumbnailImage currentThumbnail"
        }
        else {
          return "thumbnail thumbnailImage"
        }
    }
  }

  function getWrapperStyle(type: string): string {
    switch (type) {
      case 'comic':
        return 'thumbnailWrapper thumbnailWrapperComic'
      default: //image
        if(isMobile()) {return 'thumbnailWrapper mobile'}
        return 'thumbnailWrapper'
    }
  }

  function createTagPreview(args: { metadata: API.MetadataResponse | undefined, spaces: Array<string> }) {
    if (args.metadata != null) {
      return createTagList({ metadata: args.metadata, spaces: args.spaces });
    }
    return "";
  }

  function createTagList(args: { metadata: API.MetadataResponse, spaces: Array<string> }) {
    if (args.metadata != null) {
      let index = sessionStorage.getItem('hydrus-all-known-tags')
      if (!index) { return }

      let tags = args.metadata.service_keys_to_statuses_to_display_tags[index][API.ServiceStatusNumber.Current];

      let tagsSorted = TagTools.transformIntoTuple(TagTools.tagArrayToMap(tags))
      let tagArrays = []
      for (let space in args.spaces) {
        let t = tagsSorted.filter((element) => element["namespace"] === args.spaces[space])
        let innerArray = []
        for (let element in t) {
          let tagStyle = TagTools.getTagTextStyle(t[element].namespace)
          if (parseInt(element) != t.length) {
            tagStyle = {
              ...tagStyle,
              paddingRight: '5px',
              cursor:'pointer'
            }
          }
          innerArray.push(
            <span
              key={t[element].value}
              style={tagStyle}
              onClick={(() => { props.addTag(args.spaces[space] + ':' + t[element].value) })}
            >
              {t[element].value}
            </span>
          );
        }
        tagArrays.push(innerArray)
      }
      let finalString = []
      for (let space in tagArrays) {
        finalString.push(<p key={props.hash + args.spaces[space]} style={{ margin: '0px' }}>{tagArrays[space]}</p>)
      }
      return finalString;
    }
    return ''
  }

  async function GrabMetadata(hash: string) {
    let responseMeta = await API.api_get_file_metadata({ hash: hash, hide_service_names_tags: true })
    if (!responseMeta) { return }
    let meta = responseMeta.data.metadata[0]

    setMetadata(meta)
  }

  React.useEffect(() => {
    if (metadata == undefined && props.loadMeta) {
      GrabMetadata(props.hash);
    }
  }, []);

  function returnFileLink() {
    return "/file/" + props.hash
  }

  function ThumbContent(props: { thumbnail: string | undefined, type: string, hash: string, replace: boolean }) {

    function determineThumbNavigation(replace: boolean) {
      sessionStorage.setItem('searchScroll', window.scrollY.toString())
      navigate(returnFileLink(), { replace: replace })
    }

    return <img
      className={getThumbStyle(props.type)}
      onContextMenu={(e) => e.preventDefault()}
      onClick={() => { determineThumbNavigation(props.replace) }}
      loading='lazy'
      src={props.thumbnail}
      alt={props.hash} />
  }

  const thumbnailTopTags: Array<string> = ['creator', 'series']
  const thumbnailBottomTags: Array<string> = []

  return (
    <div className={getWrapperStyle(props.type)}
      key={"thumb-" + props.hash}>
      {(isMobile() === false) && <div className='topTags'>
        {createTagPreview({ metadata: metadata, spaces: thumbnailTopTags })}
      </div>}
      <div className='bottomTags'>
        <WidgetCount count={props.count} />
        <WidgetFileType metadata={metadata} />
        {createTagPreview({ metadata: metadata, spaces: thumbnailBottomTags })}
      </div>
      <ThumbContent
        type={props.type}
        replace={props.replace}
        thumbnail={thumbnail}
        hash={props.hash}
      />
    </div>
  );
});

export const MemoThumbnail = React.memo(ImageThumbnail);