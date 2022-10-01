import ApiTestButton from './ButtonAPITest';
import BlacklistedTagsInput from './formBlacklistedTags';
import RelatedGroupsInput from './formRelatedTags';

import { GlobalStateObject } from '../index.js';

import IconHamburger from '../assets/menu-burger.svg'

import './SettingsPage.css'

import { getAPIKey, getComicNamespace, getGroupNamespace, getMaxResults, getServerAddress, setAPIKey, setComicNamespace, setGroupNamespace, setMaxResults, setServerAddress, exportSettings, getTranscodeFileDomain, setTranscodeFileDomain, getTranscodeFileNamespace, setTranscodeFileNamespace, getTranscodeEnabled, setTranscodeEnabled } from '../StorageUtils'
import SettingInputSingle from './SettingsInputSingle';
import { isLandscapeMode, isMobile } from '../styleUtils';
import { useState } from 'react';


interface SettingsPageProps {
  globalState: any;
  setNavigationExpanded: Function;
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

function getSettingsPageStyle() {
  let style = "settingsPage"
  if (isMobile()) { style += ' mobile' }
  return style
}


export function SettingsPage(props: SettingsPageProps) {
  //console.log(props.globalState?.getGlobalValue())
  //props.globalState?.setGlobalValue('settings')

  return <>
    <div className={generateClassName('topBar topBarSettings')}>
      <img src={IconHamburger} alt='related switch' className='topBarButton' onClick={() => { props.setNavigationExpanded(true) }} />
    </div>
    <div className={getSettingsPageStyle()}>
      <SettingInputSingle initialValue={getServerAddress} type="text" label="Input Hydrus Server address:" setFunction={setServerAddress} />
      <SettingInputSingle initialValue={getAPIKey} type="password" label="Input API-key:" setFunction={setAPIKey} />
      <SettingInputSingle initialValue={getComicNamespace} type="text" label="Input comic-title namespace:" setFunction={setComicNamespace} />
      <SettingInputSingle initialValue={getGroupNamespace} type="text" label="Input grouping namespace:" setFunction={setGroupNamespace} />
      <SettingInputSingle initialValue={getMaxResults} type="number" label="Input max results for searches :" setFunction={setMaxResults} />
      <ApiTestButton />
      <RelatedGroupsInput />
      <BlacklistedTagsInput />
      <TranscodeSettings />


      <a href={exportSettings()} download='hydrus-react-settings.json' >Export Settings</a>
      <input type='file' />
    </div>
  </>;
}


export function TranscodeSettings() {
  const [enabled,setEnabled] = useState(getTranscodeEnabled())
  function switchEnabledTranscoding() {
    setTranscodeEnabled(!enabled)
    setEnabled(!enabled)
  }
  function getTranscodeButtonStyle(enabled:boolean):string {
    let style = 'transcodeEnabledButton tagEntry blob'
    if (enabled) {style += ' enabled'}
    return style
  }

  return <>
    <button className={getTranscodeButtonStyle(enabled)} onClick={switchEnabledTranscoding} >Enable transcoded image support</button>
    <SettingInputSingle initialValue={getTranscodeFileDomain} type="text" label="Transcode file domain" setFunction={setTranscodeFileDomain} disabled={!enabled} />
    <SettingInputSingle initialValue={getTranscodeFileNamespace} type="text" label="Transcode file namespace" setFunction={setTranscodeFileNamespace} disabled={!enabled} />
  </>


}



