import * as React from 'react';
import { MemoFileContent as FileContent } from './FileContent';
import { FileMetaData } from './FileMetaData';
import { useParams } from 'react-router-dom';
import * as TagTools from '../TagTools'
import { TagListTabs } from '../TagList'
import * as API from '../hydrus-backend';
import { MetadataResponse } from '../MetadataResponse';

import IconRelated from '../assets/related.svg'
import IconLeft from '../assets/arrow-left.svg'
import Info from '../assets/info.svg'
import IconRight from '../assets/arrow-right.svg'
import IconDoubleLeft from '../assets/arrow-double-left.svg'
import IconDoubleRight from '../assets/arrow-double-right.svg'
import IconBack from '../assets/back.svg'

import { getRelatedVisibile } from '../StorageUtils';
import { useNavigate } from "react-router-dom";
import { isMobile } from '../styleUtils';

import './FilePage.css'
import '../SearchPage/GroupButton.css'
import { RelatedFilesSideBar } from './RelatedFilesSideBar';
import { NextImage, NextSearchImage, PreviousImage, PreviousSearchImage } from './ImageControls';
import { readParams } from '../SearchPage/URLParametersHelpers';
import { createListOfUniqueTags, generateSearchURL } from '../SearchPage/SearchPageHelpers';

interface FilePageProps {
  setNavigationExpanded: Function;
  hash: string;
  type:string;
}

export type relatedDataCartType = {
  hash: string;
  tags: Map<string,Array<TagTools.Tuple>>;
}

export function FilePage(props: FilePageProps) {
  interface FilePageParams {
    hash: string | undefined;
  }
  const fileHash = props.hash;
  const { currentURLParameters } = useParams();
  const [metadata, setMetaData] = React.useState<MetadataResponse>()
  const [tags, setTags] = React.useState<Map<string,Array<TagTools.Tuple>>>(new Map())

  const [relatedDatacart, setRelatedDatacart] = React.useState<relatedDataCartType>({ hash: '', tags: new Map() })

  const [relatedVisible, setRelateVisible] = React.useState(getRelatedVisibile())
  const [sidebarVisible, setSidebarVisible] = React.useState(false)
  const [topBarVisible, setTopBarVisible] = React.useState(true)

  const [transcodedHash, setTranscodedHash] = React.useState<string | undefined>()

  const emptyBlacklist = React.useRef([])

  const abortControllerMetadata = React.useRef<AbortController | undefined>()

  const [landscape, setLandscape] = React.useState<boolean>(isLandscapeMode()) //This exists so page redraws on orientation change

  const navigate = useNavigate()

  function isLandscapeMode() {
    if (window.screen.orientation.type.includes('portrait')) { return false }
    return true
  }

  function closeImageWindow() {
    let params = readParams(currentURLParameters)

    let url = generateSearchURL(params.tags, parseInt(params.page), '', params.type)

    navigate('/search/' + url, { replace: false })

  }

  function handleScreenChange() {
    if (window.screen.orientation.type.includes('portrait')) {
      setLandscape(false);
      return
    }
    setLandscape(true)
  }

  //MBY add a little reminder in corner of icons showing button bind for it

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Tab") { e.preventDefault(); switchSidebar(); return }
    if (e.key === "Escape") { e.preventDefault(); closeImageWindow(); return }
    if (e.key === 'r') { e.preventDefault(); switchRelatedVisible(); return }
  }

  React.useEffect(() => {
    //document.addEventListener('keydown', handleKeyPress)
    window.screen.orientation.addEventListener('change', handleScreenChange)

    return () => {
      //document.removeEventListener('keydown', handleKeyPress)
      window.screen.orientation.removeEventListener('change', handleScreenChange)
    }
  }, [])

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyPress)
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  })

  //If file hash changes reload tags
  React.useEffect(() => {
    loadTags();
  }, [fileHash])

  async function loadTags() {
    if (abortControllerMetadata.current) {
      abortControllerMetadata.current.abort()
    }
    abortControllerMetadata.current = new AbortController()

    let response = await API.api_get_file_metadata({ hash: fileHash, abortController: abortControllerMetadata.current }).catch((reason) => { return })
    if (!response) { return }
    let data: MetadataResponse = response.data.metadata[0]
    let tags = createListOfUniqueTags([data])
    //let responseTags = API.getTagsFromMetadata(data,'ImportedTags')
    //let tagTuples = TagTools.transformIntoTuple(TagTools.tagArrayToMap(responseTags.get(getAllTagsServiceKey()) || []))
    //tagTuples = tagTuples.sort((a, b) => TagTools.compareNamespaces(a, b))
    /*
    let resp = await API.api_get_file_relationships({hash:props.hash})
    let relationship:API.FileRelationshipResponse
    if (resp !== undefined) {
      relationship = resp.data.file_relationships
      for (let [key,value] of Object.entries(relationship)) {
        console.log(value)
      }
    }
    */

    setMetaData(response.data.metadata[0])
    // @ts-ignore
    setTags(tags)
    setRelatedDatacart({ hash: fileHash || '', tags: tags })
  }

  function getRelatedButtonStyle(enabled: boolean) {
    let style = 'topBarButton relatedButton'
    if (!enabled) { style += " inactive" }
    if (isMobile()) { style += ' mobile' }
    if (isLandscapeMode()) { style += ' landscape' }
    return style
  }

  function getFilePageStyle(mobile: boolean, landscape: boolean): string {
    let style = 'filePage'
    if (mobile) {
      style += ' mobile'
      if (metadata?.mime.includes('video')) { return style } //This exist so rotating screen doesn't break the video playback
      if (landscape) { style += ' landscape' }
    }
    return style
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

  function toggleTopBarVisible():void {
    setTopBarVisible(!topBarVisible)
  }

  function getTopBarStyle():string {
    let style = generateClassName('topBar filePageTopBar')
    if (topBarVisible) {style += ' visible'}
    if (isMobile()) style += ' mobile'
    if (isSidebarExpanded()) style += ' expanded'
    if (relatedVisible) style += ' expanded related'
    return style
  }

  function switchRelatedVisible() {
    if (isMobile() && sidebarVisible) {
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
    if (isMobile() && relatedVisible) {
      setRelateVisible(!relatedVisible)
    }
    setSidebarVisible(!sidebarVisible);
  }

  function getButtonSidebarToggleStyle(active: boolean): string {
    let style = 'topBarButton'
    if (!active) {
      style += ' inactive'
    }
    return style
  }

  function getSidebarScreenOverlayStyle(): string {
    let style = 'sidebarOverlay'
    if (sidebarVisible) { style += ' active' }
    return style
  }

  if (isMobile()) {
    return <>
      <div className={getSideBarStyle()}>

        {(tags !== undefined) && <TagListTabs type='image' tags={tags} visibleCount={false} />}
        {(metadata !== undefined) && <FileMetaData metadata={metadata} transcode={transcodedHash} />}
      </div>
      <div className={getSidebarScreenOverlayStyle()} onClick={() => { setSidebarVisible(false) }} ></div>

      <div className={getTopBarStyle()}>
        <img src={IconRelated} alt='related switch' className={getRelatedButtonStyle(relatedVisible)} onContextMenu={(e) => { e.preventDefault() }} onClick={() => { switchRelatedVisible() }} />
        <img src={IconLeft} alt='previous' className="topBarButton" onContextMenu={(e) => { e.preventDefault(); PreviousSearchImage(fileHash, navigate, false, currentURLParameters) }} onClick={() => { PreviousImage(fileHash, navigate, currentURLParameters) }} />
        <img src={IconRight} alt='next' className="topBarButton" onContextMenu={(e) => { e.preventDefault(); NextSearchImage(fileHash, navigate, currentURLParameters) }} onClick={() => { NextImage(fileHash, navigate, currentURLParameters) }} />
        <img src={Info} alt='sidebar switch' onContextMenu={(e) => { e.preventDefault() }} className={getButtonSidebarToggleStyle(sidebarVisible)} onClick={() => { switchSidebar() }} />

      </div>
      <div className={getFilePageStyle(isMobile(), isLandscapeMode())}>
        <div className={generateClassName('fileContent')} >
          {(metadata !== undefined) &&
            <FileContent
              hash={fileHash}
              type={metadata.mime}
              setTranscodedHash={setTranscodedHash}
              setTopBarVisible={toggleTopBarVisible}
            />}
        </div>

        <div className={generateClassName('backIconWrapper')}>
          <img src={IconBack} alt='back' className="topBarButton active" onClick={() => { closeImageWindow() }} />
        </div>
        <RelatedFilesSideBar visible={relatedVisible} relatedData={relatedDatacart} landscape={landscape} type={props.type} />
      </div>
    </>;
  }

  return <>
    <div className={generateClassName('topBar filePageTopBar')}>
      <img src={IconBack} alt='back' className={getRelatedButtonStyle(true)} onClick={() => { closeImageWindow() }} />
      <img src={IconRelated} alt='related switch' className={getRelatedButtonStyle(relatedVisible)} onClick={() => { switchRelatedVisible() }} />
      <img src={Info} alt='sidebar switch' onContextMenu={(e) => { e.preventDefault() }} className={getButtonSidebarToggleStyle(sidebarVisible)} onClick={() => { switchSidebar() }} />
      <img src={IconDoubleLeft} alt='previousGroup' className="topBarButton" onClick={() => { PreviousSearchImage(fileHash, navigate, false, currentURLParameters) }} />
      <img src={IconLeft} alt='previous' className="topBarButton" onClick={() => { PreviousImage(fileHash, navigate, currentURLParameters) }} />
      <img src={IconRight} alt='next' className="topBarButton" onClick={() => { NextImage(fileHash, navigate, currentURLParameters) }} />
      <img src={IconDoubleRight} alt='nextGroup' className="topBarButton" onClick={() => { NextSearchImage(fileHash, navigate, currentURLParameters) }} />

    </div>
    <div className={getFilePageStyle(isMobile(), isLandscapeMode())}>
      <div className={getSideBarStyle()}>
        {(tags !== undefined) && <TagListTabs blacklist={['Good Tags','zTranslations']} type='image' tags={tags} visibleCount={false} />}
        {(metadata !== undefined) && <FileMetaData metadata={metadata} transcode={transcodedHash} />}
      </div>
      <div key={'FilePageContentWrapper' + fileHash + isMobile().toString()} className={generateClassName('fileContent')} >
        {(metadata !== undefined) &&
          <FileContent
            hash={fileHash}
            type={metadata.mime}
            setTranscodedHash={setTranscodedHash}
            setTopBarVisible={toggleTopBarVisible}
          />}
      </div>

      <RelatedFilesSideBar visible={relatedVisible} relatedData={relatedDatacart} landscape={landscape} type={props.type} />
    </div>
  </>;
}
