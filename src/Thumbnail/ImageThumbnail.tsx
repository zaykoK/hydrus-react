import * as React from 'react';
import * as API from '../hydrus-backend';
import { useNavigate } from "react-router-dom";
import * as TagTools from '../TagTools'
import WidgetCount from './WidgetCount';
import WidgetCountTag from './WidgetCountTag';
import WidgetFileType from './WidgetFileType';

import './ImageThumbnail.css'
import { isMobile } from '../styleUtils';
import { getComicNamespace, getGroupNamespace } from '../StorageUtils';

import TagLink from './TagLink';

// @ts-check

interface ImageThumbnailProps {
  hash: string;
  currentImage?: boolean;
  loadMeta: boolean;
  addTag: Function;
  replace: boolean;
  type: string;
  metadata?: Array<API.MetadataResponse>;
  size?: number;
}


export const ImageThumbnail = React.memo((props: ImageThumbnailProps) => {
  const [thumbnail, setThumbnail] = React.useState(API.api_get_file_thumbnail_address(props.hash));
  const [metadata, setMetadata] = React.useState();

  const navigate = useNavigate();



  function getThumbStyle(type: string): string {
    let style = 'thumbnail'
    //console.log(type)
    switch (type) {
      case 'comic':
        style += " thumbnailComic"
      default: //case 'image':
        style += " thumbnailImage"
        if (props.currentImage) {
          style += " currentThumbnail"
        }
    }
    return style
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
      if (tags === undefined) {
        tags = []
      }
      let tagsSorted = TagTools.transformIntoTuple(TagTools.tagArrayToMap(tags))
      let t = tagsSorted.filter((element) => element["namespace"] === space)
      if (t[0] === undefined) {
        return ''
      }
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

      //const LIMIT = 200

      let tags = args.metadata.service_keys_to_statuses_to_display_tags[index][API.ServiceStatusNumber.Current];
      if (tags === undefined) {
        tags = []
      }

      let tagsSorted = TagTools.transformIntoTuple(TagTools.tagArrayToMap(tags))
      let tagArrays = []
      for (let space in args.spaces) {
        let t = tagsSorted.filter((element) => element["namespace"] === args.spaces[space])
        let innerArray = []
        let limitCount = 0
        for (let element in t) {
          let tagStyle = TagTools.getTagTextStyle(t[element].namespace)

          //If tag limit reach stop adding new ones
          //THIS IS EXPERIMENTAL
          //if (limitCount === LIMIT) {break}

          if (parseInt(element) !== t.length) {
            tagStyle = {
              ...tagStyle,
              paddingRight: '5px',
              cursor: 'pointer',
            }
          }
          innerArray.push(TagLink({ style: tagStyle, addTag: props.addTag, tag: t[element].value, namespace: t[element].namespace }))
          limitCount += 1
        }
        tagArrays.push(innerArray)
      }
      let finalString = []
      for (let space in tagArrays) {
        if (props.type === 'comic') {
          finalString.push(<p onContextMenu={(e) => e.preventDefault()} key={props.hash + args.spaces[space]} style={{ margin: '0px', overflow: 'hidden', display: 'flex', flexWrap: 'wrap' }}>{tagArrays[space]}</p>)
        }
        else {
          finalString.push(<p onContextMenu={(e) => e.preventDefault()} key={props.hash + args.spaces[space]} style={{ margin: '0px' }}>{tagArrays[space]}</p>)
        }

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

  function returnFilePageURL() {
    return "/file/" + props.hash
  }

  function ThumbContent(props: { thumbnail: string | undefined, type: string, hash: string, replace: boolean }) {
    function determineThumbNavigation(replace: boolean) {
      sessionStorage.setItem('searchScroll', window.scrollY.toString())
      navigate(returnFilePageURL(), { replace: replace })
    }

    return <img
      className={getThumbStyle(props.type)}
      onContextMenu={(e) => e.preventDefault()}
      onClick={() => { determineThumbNavigation(props.replace) }}
      loading='lazy'
      src={props.thumbnail}
      alt={props.hash} />
  }

  const thumbnailTopTags: Array<string> = ['creator', 'person', 'series']
  const thumbnailBottomTags: Array<string> = []

  function getComicCardStyle() {
    let style = 'comicCard'
    if (isMobile()) { style += ' mobile' }
    return style
  }
  function getComicCardTitleStyle() {
    let style = 'comicCardTitle'
    if (isMobile()) { style += ' mobile' }
    return style
  }
  function getComicCardContentStyle() {
    let style = 'comicCardContent'
    if (isMobile()) { style += ' mobile' }
    return style
  }
  function getComicCardThumbnailRowStyle() {
    let style = 'comicCardThumbnailRow'
    if (isMobile()) { style += ' mobile' }
    return style
  }
  function getComicCardMetadataRowStyle() {
    let style = 'comicCardMetadataRow'
    if (isMobile()) { style += ' mobile' }
    return style
  }
  function getComicCardThumbnailRowMetadataStyle() {
    let style = 'comicCardThumbnailRowMetadata'
    if (isMobile()) { style += ' mobile' }
    return style
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
          <div className={getComicCardThumbnailRowMetadataStyle()}>
            {createTagPreview({ metadata: metadata, spaces: ['language'] })}
          </div>

        </div>
        <div className={getComicCardMetadataRowStyle()}>

          {createTagPreview({ metadata: metadata, spaces: ['creator'] })}
          {createTagPreview({ metadata: metadata, spaces: ['circle'] })}
          {createTagPreview({ metadata: metadata, spaces: ['series'] })}
          <WidgetCountTag tag={getComicTitle(metadata, getComicNamespace(), false)} />
          {/* TODO Those tags should be limited to something like max 15-20 tags, and selection of which should be done by counting all tags on files in the collection (assuming that separate file tags differ from each other) and showing essentialy the 15-20 that happen most across all files in collection. Other solution is to use separate tag repository for group tags. Or keep as is and force users to tag 0/1st page with the correct comic tags OR maybe just maybe hydrus-dev will deliever nice support for image groups and this will be a single API call... ahh dreams. */}
          <div style={{ fontSize: 'small' }}>
            {createTagPreview({ metadata: metadata, spaces: [''] })}
          </div>
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
        <WidgetCount tag={getComicTitle(metadata, getGroupNamespace(), false)} />
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