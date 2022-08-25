import * as React from 'react';
import * as API from '../hydrus-backend';
import { useNavigate } from "react-router-dom";
import * as TagTools from '../TagTools'
import WidgetCount from './WidgetCount';
import WidgetCountTag from './WidgetCountTag';
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
  metadata?: Array<API.MetadataResponse>;
  size?: number;
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
    let style = "thumbnailWrapper"
    if (props.size !== undefined) {
      switch (props.size) {
        case 0:
          style += ' xsmall'
          break
        case 1:
          style += ' small'
          break
        case 2:
          style += ' medium'
          break
        case 3:
          style += ' large'
          break
      }
    }

    switch (type) {
      case 'comic':
        style += ' comic'
      default: //image
        if (isMobile()) {
          style += ' mobile'
        }

    }
    return style
  }

  function createTagPreview(args: { metadata: API.MetadataResponse | undefined, spaces: Array<string> }) {
    if (args.metadata != null) {
      return createTagList({ metadata: args.metadata, spaces: args.spaces });
    }
    return "";
  }

  function getComicTitle(metadata: API.MetadataResponse | undefined, space: string, spaceless: boolean): string {
    if (metadata != null) {
      let index = sessionStorage.getItem('hydrus-all-known-tags')
      if (!index) { return '' }

      let tags = metadata.service_keys_to_statuses_to_display_tags[index][API.ServiceStatusNumber.Current];
      let tagsSorted = TagTools.transformIntoTuple(TagTools.tagArrayToMap(tags))
      let t = tagsSorted.filter((element) => element["namespace"] === space)
      if (spaceless) {
        return t[0].value
      }
      return t[0].namespace + ':' + t[0].value
    }
    return ''
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
          if (parseInt(element) !== t.length) {
            tagStyle = {
              ...tagStyle,
              paddingRight: '5px',
              cursor: 'pointer',
            }
          }
          innerArray.push(
            <span
              key={t[element].value}
              style={tagStyle}
              onClick={(() => {
                if (args.spaces[space] === '') {
                  props.addTag(t[element].value)
                }
                else {
                  props.addTag(args.spaces[space] + ':' + t[element].value)
                }
              })}
            >
              {t[element].value}
            </span>
          );
        }
        tagArrays.push(innerArray)
      }
      let finalString = []
      for (let space in tagArrays) {
        finalString.push(<p key={props.hash + args.spaces[space]} style={{ margin: '0px',overflow:'hidden',display:'flex',flexWrap:'wrap' }}>{tagArrays[space]}</p>)
      }
      return finalString;
    }
    return ''
  }

  async function GrabMetadata(hash: string) {
    let meta
    if (props.metadata !== undefined && props.metadata.length > 0) {
      //Find index of hash
      for (let element of props.metadata) {
        if (element.hash === props.hash) {
          meta = element;
          break
        }
      }
    }
    else {
      let responseMeta = await API.api_get_file_metadata({ hash: hash, hide_service_names_tags: true })
      if (!responseMeta) { return }
      meta = responseMeta.data.metadata[0]
    }
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

  interface ResultOverviewProps {
    metadata: API.MetadataResponse
  }

  function getComicCardStyle() {
    let style = 'comicCard'
    if (isMobile()) {style += ' mobile'}
    return style
  }
  function getComicCardTitleStyle() {
    let style = 'comicCardTitle'
    if (isMobile()) {style += ' mobile'}
    return style
  }
  function getComicCardContentStyle() {
    let style = 'comicCardContent'
    if (isMobile()) {style += ' mobile'}
    return style
  }
  function getComicCardThumbnailRowStyle() {
    let style = 'comicCardThumbnailRow'
    if (isMobile()) {style += ' mobile'}
    return style
  }
  function getComicCardMetadataRowStyle() {
    let style = 'comicCardMetadataRow'
    if (isMobile()) {style += ' mobile'}
    return style
  }

  function ResultOverview(props: ResultOverviewProps) {

    return <div className='resultOverview'>
      <div className='metadataSection'>
        <div className='coverSection'>

        </div>
        <div className='resultTags'>

        </div>
      </div>
      <div className='resultList'>

      </div>
    </div>

  }
  if (props.type === 'comic') {
    return <div className={getComicCardStyle()}>
      <div className={getComicCardTitleStyle()}>
        {getComicTitle(metadata, 'doujin-title', true)}
      </div>
      <div className={getComicCardContentStyle()}>
        <div className={getComicCardThumbnailRowStyle()}>
          <ThumbContent
            type={props.type}
            replace={props.replace}
            thumbnail={thumbnail}
            hash={props.hash}
          />
        </div>
        <div className={getComicCardMetadataRowStyle()}>

          {createTagPreview({ metadata: metadata, spaces: ['creator'] })}
          {createTagPreview({ metadata: metadata, spaces: ['series'] })}
          <WidgetCountTag tag={getComicTitle(metadata, 'doujin-title', false)} />
          {/* TODO Those tags should be limited to something like max 15-20 tags, and selection of which should be done by counting all tags on files in the collection (assuming that separate file tags differ from each other) and showing essentialy the 15-20 that happen most across all files in collection. Other solution is to use separate tag repository for group tags. Or keep as is and force users to tag 0/1st page with the correct comic tags OR maybe just maybe hydrus-dev will deliever nice support for image groups and this will be a single API call... ahh dreams. */}
          {createTagPreview({ metadata: metadata, spaces: [''] })}
        </div>
      </div>
    </div>
  }

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
      {/* <div className='wrapperLabel'>{createTagPreview({ metadata: metadata, spaces: ['group-title'] })}</div> */}
    </div>
  );
});

export const MemoThumbnail = React.memo(ImageThumbnail);