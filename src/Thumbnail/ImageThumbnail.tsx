import * as React from 'react';
import * as API from '../hydrus-backend';
import { NavigateFunction, useNavigate, useParams } from "react-router-dom";
import * as TagTools from '../TagTools'
import WidgetCount from './WidgetCount';
import WidgetCountTag from './WidgetCountTag';
import WidgetFileType from './WidgetFileType';

import './ImageThumbnail.css'
import { isMobile } from '../styleUtils';
import { getComicNamespace, getGroupNamespace } from '../StorageUtils';

import TagLink from './TagLink';

import { readParams } from '../SearchPage/URLParametersHelpers';
import { createListOfUniqueTags, generateSearchURL } from '../SearchPage/SearchPageHelpers';

// @ts-check

interface ImageThumbnailProps {
  hash: string;
  currentImage?: boolean;
  loadMeta: boolean;
  replace: boolean;
  type: string;
  metadata?: Array<API.MetadataResponse>;
  size?: number;
  navigate: NavigateFunction;
  hideWidgetCount?: boolean;
}

interface ThumbContentProps {
  thumbnail: string | undefined;
  type: string, hash: string;
  replace: boolean;
  currentImage?: boolean;
  navigate: NavigateFunction;
}

const EMPTYSTRING = ''

function returnFilePageURL(hash: string, urlParameters: string | undefined, type: string) {
  let params = readParams(urlParameters)
  let url = generateSearchURL(params.tags, parseInt(params.page), hash, type)

  return "/search/" + url
}

function ThumbContent(props: ThumbContentProps) {
  let { parm } = useParams<string>()


  function determineThumbNavigation(replace: boolean) {
    sessionStorage.setItem('searchScroll', window.scrollY.toString())
    props.navigate(returnFilePageURL(props.hash, parm, props.type), { replace: replace })
  }

  function getThumbStyle(type: string): string {
    let style = 'thumbnail'
    //console.log(type)
    switch (type) {
      case 'comic':
        style += " thumbnailComic"
      default: //case 'image':
        style += " thumbnailImage"
        if (props.currentImage !== undefined && props.currentImage === false) {
          style += " inactiveThumbnail"
        }
    }
    return style
  }

  return <img
    className={getThumbStyle(props.type)}
    onContextMenu={(e) => e.preventDefault()}
    onClick={() => { determineThumbNavigation(props.replace) }}
    loading='lazy'
    src={props.thumbnail}
    alt={props.hash} />
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

const thumbnailTopTags: Array<string> = ['creator', 'person', 'series']
const thumbnailBottomTags: Array<string> = []

function ImageThumbnail(props: ImageThumbnailProps) {
  const [thumbnail, setThumbnail] = React.useState(API.api_get_file_thumbnail_address(props.hash));
  const [metadata, setMetadata] = React.useState<API.MetadataResponse>();
  const [metadataGroup, setMetadataGroup] = React.useState<Array<TagTools.Tuple>>([])

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
        break
      default: //image
    }
    if (isMobile()) {
      style += ' mobile'
    }
    return style
  }

  function createTagPreview(args: { metadata: API.MetadataResponse | undefined, spaces: Array<string> }) {
    if (args.metadata !== undefined) {
      return createTagList({ metadata: args.metadata, spaces: args.spaces });
    }
    return "";
  }

  function createTagPreviewFromGroup(args: { metadataGroup: Array<TagTools.Tuple>, spaces: Array<string>, limit?: number }) {
    if (args.metadataGroup !== undefined) {
      let limit = 20
      if (args.limit) { limit = args.limit }

      let tagArrays = []
      for (let space in args.spaces) {
        //Filter the tags that match the space
        let tags = metadataGroup.filter((element) => element["namespace"] === args.spaces[space])
        //Display the tags
        let innerArray = []
        let limitCount = 0

        //Sort the tags by the order of count
        tags.sort((a, b) => { return b.count - a.count })
        //console.log(tags)


        for (let tag in tags) {
          let tagStyle = TagTools.getTagTextStyle(tags[tag].namespace)

          //If tag limit reach stop adding new ones
          //THIS IS EXPERIMENTAL
          if (limitCount === limit) { break }

          if (parseInt(tag) !== tags.length) {
            tagStyle = {
              ...tagStyle,
              marginRight: '0.5em',
              cursor: 'pointer',
            }
          }
          innerArray.push(TagLink({ style: tagStyle, tag: tags[tag].value, namespace: tags[tag].namespace, navigate: props.navigate, type: props.type }))
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
          innerArray.push(TagLink({ style: tagStyle, tag: t[element].value, namespace: t[element].namespace, navigate: props.navigate, type: props.type }))
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

  async function GrabMetadata(hash: string, group: boolean, tag: string) {
    let meta: API.MetadataResponse = {
      duration: null,
      ext: '',
      file_id: 0,
      has_audio: false,
      hash: '',
      height: 0,
      width: 0,
      size: 0,
      time_modified: 0,
      is_inbox: false,
      is_local: false,
      is_trashed: false,
      known_urls: [],
      mime: '',
      num_frames: 0,
      num_words: 0,
      file_services: {
        current: {
          key: '',
          time_imported: 0
        },
        deleted: {}
      },
      service_keys_to_statuses_to_display_tags: {},
      service_keys_to_statuses_to_tags: {}
    }
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
    //Load rest of metadata for the hash
    if (group === true) {
      //Get a group-title or doujin-title namespace for the hash
      let index = sessionStorage.getItem('hydrus-all-known-tags')
      if (index === null) { console.warn('no index for all tags, something went wrong, try refreshing'); index = '' }
      let tags = meta.service_keys_to_statuses_to_display_tags[index][API.ServiceStatusNumber.Current];
      if (tags === undefined) {
        tags = []
      }
      let tagsSorted = TagTools.transformIntoTuple(TagTools.tagArrayToMap(tags))
      let t: Array<TagTools.Tuple> = tagsSorted.filter((element) => element["namespace"] === getComicNamespace())
      //Load hashes for all the tags in that namespace
      let namespaceHashes = await API.api_get_files_search_files({ tags: [[t[0].namespace + ':' + t[0].value]], return_hashes: true })
      //console.log(namespaceHashes)

      let namespaceMetadata = await API.api_get_file_metadata({ hashes: namespaceHashes.data.hashes, hide_service_names_tags: true })
      //console.log(namespaceMetadata?.data.metadata)

      ///UNFINISHED///
      ///Process the tags loaded
      ///Commented for now
      let uniqueTags = createListOfUniqueTags(namespaceMetadata?.data.metadata)
      //console.log(uniqueTags)
      setMetadataGroup(uniqueTags)

      // 

      ///Should eventually get all tags from related files, process them count and eventually send further so they can be displayed in some manner
      ///What i want is some sort of "most common in given group" tag displayed, so if most files have "character:naruto" - that gets the first spot, then the second most visible etc.
      ///This is ofc filtered by given namespace



    }


    setMetadata(meta)
  }

  React.useEffect(() => {
    if (metadata == undefined && props.loadMeta) {
      //Grab metadata for single file
      if (props.type === 'comic') {
        GrabMetadata(props.hash, true, 'doujin-title');
      }
      else {
        GrabMetadata(props.hash, false, '');
      }

    }
  }, []);

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
        {getComicTitle(metadata, getComicNamespace(), true)}
      </div>
      <div className={getComicCardContentStyle()}>
        <div className={getComicCardThumbnailRowStyle()}>
          <ThumbContent
            navigate={props.navigate}
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

          {createTagPreviewFromGroup({ metadataGroup: metadataGroup, spaces: ['creator','circle','series'] })}

          <div style={{ fontSize: 'small' }}>
            {createTagPreviewFromGroup({ metadataGroup: metadataGroup, spaces: ['chapter', 'volume'] })}
          </div>
          <WidgetCountTag tag={getComicTitle(metadata, getComicNamespace(), false)} />
          {/* TODO Those tags should be limited to something like max 15-20 tags, and selection of which should be done by counting all tags on files in the collection (assuming that separate file tags differ from each other) and showing essentialy the 15-20 that happen most across all files in collection. Other solution is to use separate tag repository for group tags. Or keep as is and force users to tag 0/1st page with the correct comic tags OR maybe just maybe hydrus-dev will deliever nice support for image groups and this will be a single API call... ahh dreams. */}
          <div style={{ fontSize: 'small' }}>
            {createTagPreviewFromGroup({ metadataGroup: metadataGroup, spaces: ['', 'gender', 'character'] })}
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
        {(props.hideWidgetCount === undefined || props.hideWidgetCount === true) ? <WidgetCount tag={getComicTitle(metadata, getGroupNamespace(), false)} /> : <></>}
        <WidgetFileType mime={metadata?.mime || EMPTYSTRING} />
        {createTagPreview({ metadata: metadata, spaces: thumbnailBottomTags })}
      </div>
      <ThumbContent
        navigate={props.navigate}
        type={props.type}
        replace={props.replace}
        thumbnail={thumbnail}
        hash={props.hash}
        currentImage={props.currentImage}
      />
      {/* <div className='wrapperLabel'>{createTagPreview({ metadata: metadata, spaces: ['group-title'] })}</div> */}
    </div>
  );
};

export const MemoThumbnail = React.memo(ImageThumbnail);