import * as React from 'react';
import * as API from '../hydrus-backend';
import { NavigateFunction } from "react-router-dom";
import * as TagTools from '../TagTools'
import WidgetCount from './WidgetCount';
import WidgetFileType from './WidgetFileType';

import './ImageThumbnail.css'
import { isMobile } from '../styleUtils';
import { getComicNamespace, getGroupNamespace } from '../StorageUtils';

import TagLink from './TagLink';
import { createListOfUniqueTags, getAllTagsServiceKey, loadServiceData } from '../SearchPage/SearchPageHelpers';
import ResultComicCard from './ResultComicCard';
import { MemoThumbContent as ThumbContent } from './ThumbContent';
import { TagList } from '../TagList';
import { useState } from 'react';
import { MetadataResponse } from '../MetadataResponse';

// @ts-check

interface ImageThumbnailProps {
  hash: string;
  currentImage?: boolean;
  loadMeta: boolean;
  replace: boolean;
  type: string;
  metadata?: Array<MetadataResponse>;
  size?: number;
  navigate: NavigateFunction;
  hideWidgetCount?: boolean;
  disableLink?: boolean;
}

const EMPTYSTRING = ''

export function createTagPreview(args: { metadata: MetadataResponse | undefined, spaces: Array<string>, type: string, hash: string, navigate: NavigateFunction }) {
  if (args.metadata !== undefined) {
    return createTagList({
      metadata: args.metadata, spaces: args.spaces,
      type: args.type,
      hash: args.hash,
      navigate: args.navigate
    });
  }
  return "";
}


export function createTagList(args: { metadata: MetadataResponse, spaces: Array<string>, type: string, hash: string, navigate: NavigateFunction }) {
  if (args.metadata != null) {
    //const LIMIT = 200

    let tags = API.getTagsFromMetadata(args.metadata, 'ImportedTags', loadServiceData())

    let tagsSorted = TagTools.transformIntoTuple(TagTools.tagArrayToMap(tags.get(getAllTagsServiceKey()) || []))
    let tagArrays = []
    if (args.type === 'comic') {
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

          innerArray.push(TagLink({ style: tagStyle, tag: t[element].value, namespace: t[element].namespace, navigate: args.navigate, type: args.type }))
          limitCount += 1
        }
        tagArrays.push(innerArray)
      }
    }
    let finalString = []
    if (args.type === 'comic') {
      for (let space in tagArrays) {
        finalString.push(<p onContextMenu={(e) => e.preventDefault()} key={args.hash + args.spaces[space]} style={{ margin: '0px', overflow: 'hidden', display: 'flex', flexWrap: 'wrap' }}>{tagArrays[space]}</p>)
      }
    }
    else {
      tagsSorted = tagsSorted.sort((a, b) => TagTools.compareNamespaces(a, b))
      finalString.push(<TagList tags={tagsSorted} visibleCount={false} type={'image'} />)
    }
    return finalString;
  }
  return ''
}

export function getComicTitle(metadata: MetadataResponse | undefined, space: string, spaceless: boolean): string {
  if (metadata != null) {

    let tags = API.getTagsFromMetadata(metadata, '', loadServiceData())
    let tagsSorted = TagTools.transformIntoTuple(TagTools.tagArrayToMap(tags.get(getAllTagsServiceKey()) || []))
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

const thumbnailTopTags: Array<string> = ['creator', 'person', 'series', 'character', '']
const thumbnailBottomTags: Array<string> = []

function ImageThumbnail(props: ImageThumbnailProps) {
  const [thumbnail, setThumbnail] = useState(API.api_get_file_thumbnail_address(props.hash));
  const [metadata, setMetadata] = useState<MetadataResponse>();
  const [metadataGroup, setMetadataGroup] = useState<Array<TagTools.Tuple>>([])

  const [loading, setLoading] = useState<boolean>(true)

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
        case 4:
          style += ' fill'
          break
        case 5:
          style += ' relatedSmall'
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


  async function GrabMetadata(hash: string, group: boolean, tag: string) {
    let meta: MetadataResponse = {
      duration: null,
      ext: '',
      file_id: 0,
      has_audio: false,
      hash: '',
      height: 0,
      width: 0,
      size: 0,
      time_modified: 0,
      time_modified_details: {},
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
      tags: {}
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
      let responseMeta = await API.api_get_file_metadata({ hash: hash })
      if (!responseMeta) { return }
      meta = responseMeta.data.metadata[0]
    }
    //Load rest of metadata for the hash
    if (group === true) {
      //Get a group-title or doujin-title namespace for the hash
      let tags = API.getTagsFromMetadata(meta, '', loadServiceData())

      let tagsSorted = TagTools.transformIntoTuple(TagTools.tagArrayToMap(tags.get(getAllTagsServiceKey()) || []))
      let t: Array<TagTools.Tuple> = tagsSorted.filter((element) => element["namespace"] === getComicNamespace())
      //Load hashes for all the tags in that namespace
      let namespaceHashes = await API.api_get_files_search_files({ tags: [[t[0].namespace + ':' + t[0].value]], return_hashes: true })
      if (namespaceHashes) {
        //console.log(namespaceHashes)

        let namespaceMetadata = await API.api_get_file_metadata({ hashes: namespaceHashes.data.hashes })
        if (namespaceMetadata) { // Should never fail
          //console.log(namespaceMetadata?.data.metadata)

          ///UNFINISHED///
          ///Process the tags loaded
          ///Commented for now
          let uniqueTags = createListOfUniqueTags(namespaceMetadata?.data.metadata)
          //console.log(uniqueTags)
          setMetadataGroup(uniqueTags.get(getAllTagsServiceKey()) || [])

          // 
        }
      }
      ///Should eventually get all tags from related files, process them count and eventually send further so they can be displayed in some manner
      ///What i want is some sort of "most common in given group" tag displayed, so if most files have "character:naruto" - that gets the first spot, then the second most visible etc.
      ///This is ofc filtered by given namespace
    }
    setMetadata(meta)
  }

  React.useEffect(() => {
    if (metadata === undefined && props.loadMeta) {
      //Grab metadata for single file
      if (props.type === 'comic') {
        GrabMetadata(props.hash, true, 'doujin-title');
      }
      else {
        GrabMetadata(props.hash, false, '');
      }

    }
  }, []);

  if (props.type === 'comic') {
    return <ResultComicCard metadata={metadata} navigate={props.navigate} type={props.type} replace={props.replace} thumbnail={thumbnail || ''} hash={props.hash} metadataGroup={metadataGroup} />
  }

  let type = props.type.replace('related ', '')

  return (
    <div className={getWrapperStyle(props.type)}
      key={"thumb-" + props.hash}>
      {/* {(isMobile() === false) && <div className='topTags'>
        {createTagPreview({
          metadata: metadata, spaces: thumbnailTopTags,
          type: props.type,
          hash: props.hash,
          navigate: props.navigate
        })}
      </div>}
      <div className='bottomTags'>
        {(props.hideWidgetCount === undefined || props.hideWidgetCount === true) ? <WidgetCount tag={getComicTitle(metadata, getGroupNamespace(), false)} /> : null}
        <WidgetFileType mime={metadata?.mime || EMPTYSTRING} />
      </div> */}
      <ThumbContent
        navigate={props.navigate}
        type={type}
        replace={props.replace}
        thumbnail={thumbnail}
        hash={props.hash}
        currentImage={props.currentImage}
        disableLink={props.disableLink}
      />
    </div>
  );
};

export const MemoThumbnail = React.memo(ImageThumbnail);