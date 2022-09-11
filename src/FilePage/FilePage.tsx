import * as React from 'react';
import { MemoFileContent as FileContent } from './FileContent';
//import { FileContent } from './FileContent';
import { FileMetaData } from './FileMetaData';
import { useParams } from 'react-router-dom';
import * as TagTools from '../TagTools'
import { TagList } from '../TagList'
import * as API from '../hydrus-backend';

import IconRelated from '../assets/related.svg'
import IconLeft from '../assets/arrow-left.svg'
import Info from '../assets/info.svg'
import IconRight from '../assets/arrow-right.svg'

import { getRelatedVisibile } from '../StorageUtils';
import { useNavigate } from "react-router-dom";

import { isMobile } from '../styleUtils';

import './FilePage.css'
import '../SearchPage/GroupButton.css'
import { RelatedFilesSideBar } from './RelatedFilesSideBar';
import { NextImage, NextSearchImage, PreviousImage, PreviousSearchImage } from './ImageControls';

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

  const emptyBlacklist = React.useRef([])

  const [landscape, setLandscape] = React.useState<boolean>(isLandscapeMode()) //This exists so page redraws on orientation change

  const navigate = useNavigate()

  function isLandscapeMode() {
    if (window.screen.orientation.type.includes('portrait')) { return false }
    return true
  }


  function handleScreenChange() {
    if (window.screen.orientation.type.includes('portrait')) {
      setLandscape(false);
      document.exitFullscreen();
      return
    }
    setLandscape(true)
    document.documentElement.requestFullscreen()
  }

 

  const handleKeyPress = (e: KeyboardEvent) => {

  }

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    window.screen.orientation.addEventListener('change', handleScreenChange)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      window.screen.orientation.removeEventListener('change', handleScreenChange)
    }
  }, [])

  //If file hash changes reload tags
  React.useEffect(() => {
    loadTags();
  }, [fileHash])

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
    let style = 'topBarButton relatedButton'
    if (!enabled) { style += " inactive" }
    if (isMobile()) { style += ' mobile'}
    if (isLandscapeMode()) { style += ' landscape'}
    return style
  }

  function getFilePageStyle(mobile: boolean, landscape: boolean): string {
    if (mobile) {
      if (metadata?.mime.includes('video')) { return 'filePage mobile' } //This exist so rotating screen doesn't break the video playback
      if (landscape) { return "filePage mobile landscape" }
      return "filePage mobile"
    }
    return "filePage"
  }

  function generateClassName(name: string): string {
    let className = name
    if (isMobile()) {
      className += ' mobile'
      if (isLandscapeMode()) {
        className += ' landscape'
      }
    }
    return className
  }

  function switchRelatedVisible() {
    if (sidebarVisible) {
      setSidebarVisible(!sidebarVisible)
    }
    if (relatedVisible) {
      localStorage.setItem('related-visible', 'false')
      setRelateVisible(false)
      return
    }
    localStorage.setItem('related-visible', 'true')
    setRelateVisible(true)
  }

  function isSidebarExpanded() {
    if (sidebarVisible) { return true }
    return false;
  }

  function getSideBarStyle() {
    let style = 'contentSideBar'
    if (isMobile()) {
      style += ' mobile'
    }
    if (isSidebarExpanded()) {
      style += " active"
    }
    if (isLandscapeMode()) {
      style += ' sideBarLandscape'
    }
    return style
  }

  function switchSidebar() {
    if (relatedVisible) {
      setRelateVisible(!relatedVisible)
    }
    setSidebarVisible(!sidebarVisible);
  }

  if (isMobile()) {
    return <>
      <div className={getSideBarStyle()}>
        {(tags !== undefined) && <TagList tags={tags} visibleCount={false} />}
        {(metadata !== undefined) && <FileMetaData metadata={metadata} />}
      </div>

      <div className={generateClassName('barStylePadding')}></div>
      <div className={generateClassName('topBar filePageTopBar')}>
        <div id='home-button-padding' className="topBarButton" />
        <img src={IconRelated} alt='related switch' className={getRelatedButtonStyle(relatedVisible)} onClick={() => { switchRelatedVisible() }} />
        <img src={IconLeft} alt='previous' className="topBarButton" onClick={() => { PreviousImage(fileHash,navigate) }} />
        <img src={IconRight} alt='next' className="topBarButton" onClick={() => { NextImage(fileHash,navigate) }} />
        {(isMobile()) && <img src={Info} alt='sidebar switch' className="topBarButton" onClick={() => { switchSidebar() }} />}

      </div>
      <div className={getFilePageStyle(isMobile(), isLandscapeMode())}>
        <div className={generateClassName('fileContent')} >
          {(metadata !== undefined) &&
            <FileContent
              hash={fileHash}
              type={metadata.mime}
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


  return <>
    <div className={generateClassName('barStylePadding')}></div>
    <div className={generateClassName('topBar filePageTopBar')}>
      <div id='home-button-padding' className="topBarButton" />
      <img src={IconRelated} alt='related switch' className={getRelatedButtonStyle(relatedVisible)} onClick={() => { switchRelatedVisible() }} />
      <img src={IconLeft} alt='previous' className="topBarButton" onClick={() => { PreviousImage(fileHash,navigate) }} />
      <img src={IconRight} alt='next' className="topBarButton" onClick={() => { NextImage(fileHash,navigate) }} />
      {(isMobile()) && <img src={Info} alt='sidebar switch' className="topBarButton" onClick={() => { switchSidebar() }} />}

    </div>
    <div className={getFilePageStyle(isMobile(), isLandscapeMode())}>
      <div className={getSideBarStyle()}>
        {(tags !== undefined) && <TagList tags={tags} visibleCount={false} />}
        {(metadata !== undefined) && <FileMetaData metadata={metadata} />}
      </div>
      <div key={'FilePageContentWrapper' + fileHash + isMobile().toString()} className={generateClassName('fileContent')} >
        {(metadata !== undefined) &&
          <FileContent
            hash={fileHash}
            type={metadata.mime}
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
