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
import { getRelatedVisibile, getRelatedNamespaces } from './StorageUtils';

export function FilePage() {
  let { fileHash } = useParams();

  const [metadata, setMetaData] = useState();
  const [tags, setTags] = useState();
  const [relatedVisible, setRelateVisible] = useState(getRelatedVisibile())

  const [width, setWidth] = useState(window.innerWidth)

  function getMobileStyle(width) {
    if (width < 450) { return true }
    return false
  }

  function returnStyle(mobile) {
    const contentStyle = {
      display: "grid",
      gridTemplateColumns: 'minmax(auto,1fr) minmax(auto,5fr)'
    }

    if (mobile) {
      return {
        display: 'grid',
        gridTemplateColumns: 'auto',
        gridTemplateRows: 'auto auto auto'
      }
    }
    return contentStyle
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

  function returnRelatedStyle(mobile) {
    if (mobile) {
      return {
        background: colors.COLOR2,
        padding: '5px',
        borderRadius: '10px',
        position: 'fixed',
        bottom: '0px',
        minHeight: '0',
        maxHeight: '27vh',
        width: '100vw',
        overflowY: 'auto',
        overflowX: 'auto',
        boxShadow: '0 0 5px 0 black',
        fontSize: '1em',
        zIndex: '30'
      }
    }
    return {
      background: colors.COLORRELATED,
      padding: '5px',
      borderRadius: '10px',
      position: 'fixed',
      right: '0px',
      top: '0px',
      height: '99vh',
      maxWidth: '27vh',
      overflowY: 'auto',
      overflowX: 'hidden',
      boxShadow: '0 0 5px 0 black',
      fontSize: '1em',
      zIndex: '30'
    }

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
    position: 'fixed',
    top: '0px',
    display: 'flex',
    flexFlow: 'rows',
    fontSize: 'larger',
    background: colors.COLOR1,
    width:'100vw',
    height: '49px',
    boxShadow: '0 0 5px 0 black',
    zIndex: '1'
  }

  const barStylePadding = {
    height: '51px',
  }

  function returnRelatedElements(metadata) {
    let returned = []
    if (metadata == undefined) { return returned }
    let spaces = getRelatedNamespaces()
    for (let element in spaces) {
      returned.push(
        <RelatedFiles
          currentHash={fileHash}
          key={spaces[element] + returnTagsFromNamespace(spaces[element])}
          tags={returnTagsFromNamespace(spaces[element])}
          space={spaces[element]}
          mobile={getMobileStyle(width)}
        />
      )
    }
    return returned
  }

  function getContentStyle(mobile) {
    if (mobile) {
      return {
        gridRow: '1',
        gridColumn: '1'
      }
    }
    return {
      gridRow: '1',
      gridColumn: '2'
    }
  }

  function switchRelatedVisible() {
    if (relatedVisible) {
      localStorage.setItem('related-visible', false)
      setRelateVisible(false)
      return
    }
    localStorage.setItem('related-visible', true)
    setRelateVisible(true)
  }




  return <>
    <div style={barStylePadding}></div>
    <div style={barStyle}>
      <div id='home-button-padding' style={relatedSwitchStyle} />
      <img src={IconRelated} style={returnRelatedSwitchStyle(relatedVisible)} onClick={() => { switchRelatedVisible() }} />
    </div>
    <div style={returnStyle(getMobileStyle(width))}>
      <div>

        {(tags != undefined) && <TagList tags={tags} blacklist={[]} visibleCount={false} mobile={getMobileStyle(width)} />}
        {(metadata != undefined) && <FileMetaData metadata={metadata} />}

      </div>
      <div
        style={getContentStyle(getMobileStyle(width))}
      >
        {(metadata != undefined) &&
          <FileContent
            hash={fileHash}
            type={metadata.mime}
            mobile={getMobileStyle(width)} />}
      </div>

      {(relatedVisible) && <div style={returnRelatedStyle(getMobileStyle(width))}>
        {returnRelatedElements(metadata)}
      </div>}
    </div>
  </>;
}
