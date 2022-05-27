import React, { useEffect, useState } from 'react';
import { FileContent } from './FileContent';
import { useParams } from 'react-router-dom';
import * as TagTools from './TagTools'
import { TagList } from './TagList'
import { FileMetaData } from './FileMetaData';
import * as API from './hydrus-backend';
import { RelatedFiles } from './RelatedFiles';
import IconRelated from './assets/related.svg'
import colors from './stylingVariables';

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
    let tagTuples = TagTools.transformIntoTuple(TagTools.tagArrayToMap(responseTags))
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
    background: colors.COLORRELATED,
    padding: '5px',
    borderRadius: '10px',
    position: 'fixed',
    right: '0px',
    height: '99vh',
    maxWidth: '27vh',
    overflowY: 'auto',
    overflowX: 'hidden',
    boxShadow: '0 0 5px 0 black',
    fontSize: '1em',

  }

  function returnRelatedSwitchStyle(enabled) {
    if (enabled) { return relatedSwitchStyle }
    return { ...relatedSwitchStyle, opacity: '0.3' }
  }

  const relatedSwitchStyle = {
    height: '1.5em',
    width: '1.5em',
    background: colors.COLOR2,
    margin: '5px',
    padding: '5px',
    borderRadius: '10px',
    cursor: 'pointer',
    opacity: '0.7'
  }

  const barStyle = {
    display: 'flex',
    flexFlow: 'rows',
    fontSize: 'larger',
    background: colors.COLOR1,
    height: '49px',
    boxShadow: '0 0 5px 0 black',
  }

  const groupedNamespaces = ['group-title', 'pixiv-title', 'kemono-title', 'doujin-title', 'title']

  function returnRelatedElements(metadata) {
    let returned = []
    if (metadata == undefined) { return returned }
    for (let element in groupedNamespaces) {
      returned.push(
        <RelatedFiles
          currentHash={fileHash}
          key={groupedNamespaces[element] + returnTagsFromNamespace(groupedNamespaces[element])}
          tags={returnTagsFromNamespace(groupedNamespaces[element])}
          space={groupedNamespaces[element]} />
      )
    }
    return returned
  }


  return <>
    <div style={contentStyle}>
      <div>
        <div style={barStyle}>
          <div id='home-button-padding' style={relatedSwitchStyle} />
          <img src={IconRelated} style={returnRelatedSwitchStyle(relatedVisible)} onClick={() => { setRelateVisible(!relatedVisible) }} />
        </div>
        {(tags != undefined) && <TagList tags={tags} blacklist={[]} visibleCount={false} />}
        {(metadata != undefined) && <FileMetaData metadata={metadata} />}

      </div>
      {(metadata != undefined) && <FileContent hash={fileHash} type={metadata.mime} />}
      {(relatedVisible) && <div style={relatedStyle}>
        {returnRelatedElements(metadata)}
      </div>}
    </div>
  </>;
}
