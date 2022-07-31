import * as React from 'react';
import { FileContent } from './FileContent';
import { FileMetaData } from './FileMetaData';
import { useParams } from 'react-router-dom';
import * as TagTools from '../TagTools'
import { TagList } from '../TagList'
import * as API from '../hydrus-backend';

import IconRelated from '../assets/related.svg'
import IconLeft from '../assets/arrow-left.svg'
import Info from '../assets/info.svg'
import IconRight from '../assets/arrow-right.svg'

import { getRelatedVisibile, getRelatedNamespaces } from '../StorageUtils';
import { useNavigate } from "react-router-dom";

import { isLandscapeMode, isMobile } from '../styleUtils';

import './FilePage.css'
import '../SearchPage/GroupButton.css'
import { RelatedFilesSideBar } from './RelatedFilesSideBar';

interface FilePageProps {
  globalState: any;
}

export function FilePage(props: FilePageProps) {
  interface FilePageParams {
    hash: string | undefined;
  }
  const { fileHash } = useParams();
  const [metadata, setMetaData] = React.useState<API.MetadataResponse>();
  const [tags, setTags] = React.useState([]);
  const [relatedVisible, setRelateVisible] = React.useState(getRelatedVisibile())
  const [sidebarVisible, setSidebarVisible] = React.useState(false);

  const [landscape, setLandscape] = React.useState<boolean>(isLandscapeMode())

  const navigate = useNavigate()

  //console.log(props.globalState?.getGlobalValue())
  //props.globalState?.setGlobalValue('filepage')

  function isLandscapeMode() {
    if (window.screen.orientation.type.includes('portrait')) { return false }
    return true
  }

  //If file hash changes reload tags
  React.useEffect(() => {
    loadTags();
  }, [fileHash])

  function returnFileLink(hash: string): string {
    return "/file/" + hash
  }

  function handleScreenChange() {
    if (window.screen.orientation.type.includes('portrait')) { setLandscape(false); document.exitFullscreen(); return }
    setLandscape(true)
    document.documentElement.requestFullscreen()

  }

  React.useEffect(() => {
    window.screen.orientation.addEventListener('change', handleScreenChange)
    return () => {
      window.screen.orientation.removeEventListener('change', handleScreenChange)
    }
  }, [])

  //"This is ... too much" - George L.
  //TODO find some way to simplify this whole next/prev image

  function PreviousImage(): void {
    if (sessionStorage.getItem('group-hashes') === null) { return PreviousSearchImage() }
    let searchList: Array<string> = JSON.parse(sessionStorage.getItem('hashes-search') || '')
    let elementList: Array<string> = JSON.parse(sessionStorage.getItem('group-hashes') || '')
    let index = elementList.indexOf(fileHash || '')
    //Move to next
    if (index - 1 < 0) { return PreviousSearchImage() }
    if (searchList.indexOf(elementList[index - 1]) === -1) {
      if (searchList.indexOf(fileHash||'') !== -1) {
        sessionStorage.setItem('hashes-search-last-valid', JSON.stringify(fileHash))
      }
    }
    navigate(returnFileLink(elementList[index - 1]), { replace: true })
  }

  function NextImage(): void {
    if (sessionStorage.getItem('group-hashes') === null) { return NextSearchImage() }
    let searchList: Array<string> = JSON.parse(sessionStorage.getItem('hashes-search') || '')
    let elementList: Array<string> = JSON.parse(sessionStorage.getItem('group-hashes') || '')
    let index = elementList.indexOf(fileHash || '')
    //Move to next
    if (index + 1 >= elementList.length) { return NextSearchImage() }
    if (searchList.indexOf(elementList[index + 1]) === -1) {
      if (searchList.indexOf(fileHash||'') !== -1) {
        sessionStorage.setItem('hashes-search-last-valid', JSON.stringify(fileHash))
      }
    }
    navigate(returnFileLink(elementList[index + 1]), { replace: true })
  }

  function PreviousSearchImage(): void {
    if (sessionStorage.getItem('hashes-search') === null) { return }
    let elementList: Array<string> = JSON.parse(sessionStorage.getItem('hashes-search') || '')
    let index = elementList.indexOf(fileHash || '')
    if (index === -1) {
      if (sessionStorage.getItem('hashes-search-last-valid') !== null) {
        index = elementList.indexOf(JSON.parse(sessionStorage.getItem('hashes-search-last-valid') || ''))
      }
      else {
        return
      }
    }
    //If first/last file in set don't do anything
    if (index - 1 < 0) { return }
    //If currently tracking group related files delete them
    if (sessionStorage.getItem('group-hashes') !== null) {
      let groupHashes: Array<string> = JSON.parse(sessionStorage.getItem('group-hashes') || '')
      if (groupHashes.indexOf(elementList[index - 1]) === -1) { sessionStorage.removeItem('group-hashes') }
    }
    navigate(returnFileLink(elementList[index - 1]), { replace: true })
  }

  function NextSearchImage(): void {
    if (sessionStorage.getItem('hashes-search') === null) { return }
    let elementList: Array<string> = JSON.parse(sessionStorage.getItem('hashes-search') || '')
    let index = elementList.indexOf(fileHash || '')
    if (index === -1) {
      if (sessionStorage.getItem('hashes-search-last-valid') !== null) {
        index = elementList.indexOf(JSON.parse(sessionStorage.getItem('hashes-search-last-valid') || ''))
      }
      else {
        return
      }
    }
    //If first/last file in set don't do anything
    if (index + 1 >= elementList.length) { return }
    //If currently tracking group related files delete them
    if (sessionStorage.getItem('group-hashes') !== null) {
      let groupHashes: Array<string> = JSON.parse(sessionStorage.getItem('group-hashes') || '')
      if (groupHashes.indexOf(elementList[index + 1]) === -1) { sessionStorage.removeItem('group-hashes') }
    }

    navigate(returnFileLink(elementList[index + 1]), { replace: true })
  }

  const handleKeyPress = (e: KeyboardEvent) => {

  }

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [])

  async function loadTags() {
    let response = await API.api_get_file_metadata({ hash: fileHash, hide_service_names_tags: true })
    if (!response) { return }
    let data: API.MetadataResponse = response.data.metadata[0]
    let allKnownTags = sessionStorage.getItem('hydrus-all-known-tags') || '';
    let responseTags = data.service_keys_to_statuses_to_display_tags[allKnownTags][API.ServiceStatusNumber.Current]
    let tagTuples = TagTools.transformIntoTuple(TagTools.tagArrayToMap(responseTags))
    tagTuples = tagTuples.sort((a, b) => TagTools.compareNamespaces(a, b))
    setMetaData(response.data.metadata[0])
    // @ts-ignore
    setTags(tagTuples)
  }

  function getRelatedButtonStyle(enabled: boolean) {
    if (enabled) { return "topBarButton" }
    return "topBarButton transparent"
  }

  function getFilePageStyle(mobile: boolean, landscape: boolean): string {
    if (mobile) {
      if (metadata?.mime.includes('video')) { return 'filePage mobile' } //This exist so rotating screen doesn't break the video playback
      if (landscape) { return "filePage mobile landscape" }
      return "filePage mobile"
    }
    return "filePage"
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

  function isSidebarExpanded() {
    if (sidebarVisible) { return true }
    return false;
  }

  function getSideBarStyle() {
    if (isMobile()) {
      if (isSidebarExpanded()) { return "contentSideBar mobile active" }
      return "contentSideBar mobile"
    }
    return "contentSideBar"
  }

  function switchSidebar() {
    setSidebarVisible(!sidebarVisible);
  }

  return <>
    <div className={getPaddingStyle()}></div>
    <div className={getTopBarStyle()}>
      <div id='home-button-padding' className="topBarButton" />
      <img src={IconRelated} className={getRelatedButtonStyle(relatedVisible)} onClick={() => { switchRelatedVisible() }} />
      <img src={IconLeft} className="topBarButton" onClick={() => { PreviousImage() }} />
      <img src={IconRight} className="topBarButton" onClick={() => { NextImage() }} />
      {(isMobile()) && <img src={Info} className="topBarButton" onClick={() => { switchSidebar() }} />}

    </div>
    <div className={getFilePageStyle(isMobile(), isLandscapeMode())}>
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
            nextSearchImage={NextSearchImage}
            previousSearchImage={PreviousSearchImage}
          />}
      </div>

      <RelatedFilesSideBar visible={relatedVisible} fileHash={fileHash} tags={tags} />
    </div>
  </>;
}
