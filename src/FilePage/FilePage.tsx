import * as React from 'react';
import { FileContent } from './FileContent';
import { FileMetaData } from './FileMetaData';
import { useParams } from 'react-router-dom';
import * as TagTools from '../TagTools'
import { TagList } from '../TagList'
import * as API from '../hydrus-backend';
import { RelatedFiles } from './RelatedFiles';
// @ts-ignore
import IconRelated from '../assets/related.svg'
// @ts-ignore
import IconLeft from '../assets/arrow-left.svg'
// @ts-ignore
import IconRight from '../assets/arrow-right.svg'
import { getRelatedVisibile, getRelatedNamespaces } from '../StorageUtils';
import FullscreenButton from '../FullscreenButton';
import { useNavigate } from "react-router-dom";

import { isMobile, isLandscapeMode } from '../styleUtils';

import './FilePage.css'
import '../SearchPage/GroupButton.css'

export function FilePage() {
  interface FilePageParams {
    hash: string | undefined;
  }
  const { fileHash } = useParams();
  const [metadata, setMetaData] = React.useState<API.MetadataResponse>();
  const [tags, setTags] = React.useState([]);
  const [relatedVisible, setRelateVisible] = React.useState(getRelatedVisibile())

  const [screenOrientation, setScreenOrientation] = React.useState(window.screen.orientation.type)

  const navigate = useNavigate()

  function getFilePageStyle(mobile: boolean): string {
    if (mobile) {
      if (isLandscapeMode()) { return "filePage mobile landscape" }
      return "filePage mobile"
    }
    return "filePage"
  }

  //If file hash changes reload tags
  React.useEffect(() => {
    loadTags();
  }, [fileHash])

  React.useEffect(() => {
    console.log('changed orientation of screen')
  }, [screenOrientation])

  function returnFileLink(hash: string): string {
    return "/file/" + hash
  }

  function PreviousImage(): void {
    //Grab image list
    //Use SessionStorage?
    if (sessionStorage.getItem('group-hashes') === null) { return }
    let elementList = JSON.parse(sessionStorage.getItem('group-hashes') || '')
    let index = elementList.indexOf(fileHash)
    //Move to next
    if (index - 1 < 0) { return }
    navigate(returnFileLink(elementList[index - 1]), { replace: true })
  }


  function NextImage(): void {
    //Grab image list
    //Use SessionStorage?
    if (sessionStorage.getItem('group-hashes') === null) { return }
    let elementList = JSON.parse(sessionStorage.getItem('group-hashes') || '')
    let index = elementList.indexOf(fileHash)
    //Move to next
    if (index + 1 >= elementList.length) { return }
    navigate(returnFileLink(elementList[index + 1]), { replace: true })
  }

  async function loadTags() {
    let response = await API.api_get_file_metadata({ hash: fileHash, hide_service_names_tags: true })
    if (!response) { return }
    let data: API.MetadataResponse = response.data.metadata[0]
    let allKnownTags = sessionStorage.getItem('hydrus-all-known-tags') || '';
    let responseTags = data.service_keys_to_statuses_to_display_tags[allKnownTags][0]
    let tagTuples = TagTools.transformIntoTuple(TagTools.tagArrayToMap(responseTags))
    // @ts-ignore
    tagTuples = tagTuples.sort((a, b) => TagTools.compareNamespaces(a, b))
    //console.log(response.data.metadata[0])
    setMetaData(response.data.metadata[0])
    // @ts-ignore
    setTags(tagTuples)
  }

  function getRelatedStyle(visible: boolean): string {
    let className = 'relatedStyle'
    if (isMobile()) {
      className += ' mobile'
      if (isLandscapeMode()) { className += ' landscape' }
    }
    if (!visible) { className += ' hidden' }
    return className
  }

  function getRelatedButtonStyle(enabled: boolean) {
    if (enabled) { return "topBarButton" }
    return "topBarButton transparent"
  }

  interface RelatedFilesListProps {
    fileHash: string | undefined;
    tags: Array<string>
  }

  function RelatedFilesList(props: RelatedFilesListProps) {
    if (!fileHash) { return }
    function returnTagsFromNamespace(tags: Array<string>, namespace: string) {
      //This function returns an array of joined tag strings from tuples
      //{namespace:'character',value:'uzumaki naruto'} => 'character:uzumaki naruto'
      if (tags === undefined) { return }
      // @ts-ignore
      let list: Array<TagTools.Tuple> = tags.filter((element) => element["namespace"] === namespace)
      let joined = []
      for (let tag in list) {
        joined.push(list[tag].namespace + ':' + list[tag].value) //It has to have namespace
      }
      return joined
    }

    let returned = []
    //if (props.metadata == undefined) { return returned }
    let spaces = getRelatedNamespaces()
    for (let element in spaces) {
      let newElement = <RelatedFiles
        id={'relatedElements' + element}
        currentHash={props.fileHash}
        key={spaces[element] + returnTagsFromNamespace(props.tags, spaces[element])}
        tags={returnTagsFromNamespace(props.tags, spaces[element])}
        space={spaces[element]}
        mobile={isMobile()}
      />
      returned.push(newElement)
    }
    return returned
  }

  function getContentStyle(mobile: boolean) {
    if (mobile) {
      if (isLandscapeMode()) { return "fileContent mobile landscape" }
      return "fileContent mobile"
    }
    return "fileContent"
  }

  function switchRelatedVisible() {
    if (relatedVisible) {
      localStorage.setItem('related-visible', 'false')
      setRelateVisible(false)
      return
    }
    localStorage.setItem('related-visible', 'true')
    setRelateVisible(true)
  }

  function getPaddingStyle() {
    if (isMobile()) {
      if (isLandscapeMode()) { return "barStylePadding mobile landscape" }
      return "barStylePadding mobile"
    }
    return "barStylePadding"
  }

  function getTopBarStyle() {
    if (isMobile()) {
      if (isLandscapeMode()) { return "topBar filePageTopBar mobile landscape" }
      return "topBar filePageTopBar mobile"
    }
    return "topBar filePageTopBar"
  }

  function getSideBarStyle() {
    if (isMobile()) { return "contentSideBar mobile" }
    return "contentSideBar"
  }

  return <>
    <div className={getPaddingStyle()}></div>
    <div className={getTopBarStyle()}>
      <div id='home-button-padding' className="topBarButton" />
      <img src={IconRelated} className={getRelatedButtonStyle(relatedVisible)} onClick={() => { switchRelatedVisible() }} />
      <img src={IconLeft} className="topBarButton" onClick={() => { PreviousImage() }} />
      <img src={IconRight} className="topBarButton" onClick={() => { NextImage() }} />
      <FullscreenButton />

    </div>
    <div className={getFilePageStyle(isMobile())}>
      <div className={getSideBarStyle()}>
        {(tags != undefined) && <TagList tags={tags} blacklist={[]} visibleCount={false} mobile={isMobile()} />}
        {(metadata != undefined) && <FileMetaData metadata={metadata} />}
      </div>
      <div className={getContentStyle(isMobile())} >
        {(metadata != undefined) &&
          <FileContent
            hash={fileHash}
            type={metadata.mime}
            mobile={isMobile()}
            previousImage={PreviousImage}
            nextImage={NextImage}
          />}
      </div>

      <div className={getRelatedStyle(relatedVisible)}>

        {RelatedFilesList({ fileHash: fileHash, tags: tags })} {/* has to be done this to prevent unnecessary refreshes of list when changing files */}
      </div>
    </div>
  </>;
}
