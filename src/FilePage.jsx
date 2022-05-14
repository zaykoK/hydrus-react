import React, { useEffect, useState } from 'react';
import { FileContent } from './FileContent';
import { useParams } from 'react-router-dom';
import * as TagTools from './TagTools'
import { TagList } from './TagList'
import { FileMetaData } from './FileMetaData';
import * as API from './hydrus-backend';
import { RelatedFiles } from './RelatedFiles';

export function FilePage() {
  let { fileHash } = useParams();

  const [metadata, setMetaData] = useState();
  const [tags, setTags] = useState();
  const [relatedVisible, setRelateVisible] = useState(true)

  const contentStyle = {
    display: "grid",
    gridTemplateColumns: 'minmax(auto,1fr) minmax(auto,5fr)'
  }
  //If file hash changes reload tags
  useEffect(() => {
    loadTags();
  }, [fileHash])

  async function loadTags() {
    let response = await API.api_get_file_metadata({ hash: fileHash, hide_service_names_tags: true })
    
    let responseTags = response.data.metadata[0].service_keys_to_statuses_to_display_tags[sessionStorage.getItem('hydrus-all-known-tags')][0]
    let tagTuples = TagTools.transformIntoTuple(responseTags)
    tagTuples = tagTuples.sort((a, b) => TagTools.compareNamespaces(a, b))
    //console.log(response.data.metadata[0])
    setMetaData(response.data.metadata[0])
    setTags(tagTuples)
  }

  function returnTagsFromNamespace(namespace) {
    let list = tags.filter((element) => element["namespace"] === namespace)

    let joined = []
    for (let tag in list) {
      joined.push(list[tag].namespace + ':' + list[tag].value) //It has to have namespace
    }
    return joined
  }

  const relatedStyle = {
    background: '#252526b3',
    padding: '5px',
    borderRadius: '10px',
    position: 'fixed',
    right: '0px',
    height: '96vh',
    overflowY: 'scroll',
    overflowX: 'hidden'
  }

  const relatedSwitchStyle = { height: '25px', width: '25px', background: 'red' }

  return <>
    <div style={contentStyle}>
      <div>
        <div style={relatedSwitchStyle} onClick={() => { setRelateVisible(!relatedVisible) }}>R</div>
        {(tags != undefined) && <TagList tags={tags} blacklist={[]} />}
        {(metadata != undefined) && <FileMetaData metadata={metadata} />}

      </div>
      {(metadata != undefined) && <FileContent hash={fileHash} type={metadata.mime} />}
      <div style={relatedStyle}>
        {((metadata != undefined) && relatedVisible) &&
          <RelatedFiles
            currentHash={fileHash}
            key={'pixiv-title' + returnTagsFromNamespace('pixiv-title')}
            tags={returnTagsFromNamespace('pixiv-title')}
            space='pixiv-title' />}
        {((metadata != undefined) && relatedVisible) &&
          <RelatedFiles
            currentHash={fileHash}
            key={'group-title' + returnTagsFromNamespace('group-title')}
            tags={returnTagsFromNamespace('group-title')}
            space='group-title' />}
        {((metadata != undefined) && relatedVisible) &&
          <RelatedFiles
            currentHash={fileHash}
            key={'kemono-title' + returnTagsFromNamespace('kemono-title')}
            tags={returnTagsFromNamespace('kemono-title')}
            space='kemono-title' />}
        {((metadata != undefined) && relatedVisible) &&
          <RelatedFiles
            currentHash={fileHash}
            key={'doujin-title' + returnTagsFromNamespace('doujin-title')}
            tags={returnTagsFromNamespace('doujin-title')}
            space='doujin-title' />}
        {((metadata != undefined) && relatedVisible) &&
          <RelatedFiles
            currentHash={fileHash}
            key={'title' + returnTagsFromNamespace('title')}
            tags={returnTagsFromNamespace('title')}
            space='title' />}
      </div>
    </div>
  </>;
}
