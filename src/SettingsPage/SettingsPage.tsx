import ApiTestButton from './ButtonAPITest';
import BlacklistedTagsInput from './formBlacklistedTags';
import RelatedGroupsInput from './formRelatedTags';

import IconHamburger from '../assets/menu-burger.svg'

import './SettingsPage.css'

import { getAPIKey, getComicNamespace, getGroupNamespace, getMaxResults, getServerAddress, setAPIKey, setComicNamespace, setGroupNamespace, setMaxResults, setServerAddress, exportSettings, getTranscodeFileDomain, setTranscodeFileDomain, getTranscodeFileNamespace, setTranscodeFileNamespace, getTranscodeEnabled, setTranscodeEnabled, setBlacklistedNamespaces, setRelatedNamespaces, setExperimentalHydrusAPI,getExperimentalHydrusAPI } from '../StorageUtils'
import SettingInputSingle from './SettingsInputSingle';
import { isLandscapeMode, isMobile } from '../styleUtils';
import { useState } from 'react';


interface SettingsPageProps {
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

type HRSettings = {
  "comic-namespace": string;
  "group-namespace": string;
  "hydrus-api-key": string;
  "hydrus-max-results": string;
  "hydrus-server-address": string;
  "mobile-mode": string;
  "blacklisted-namespaces": string;
  "related-namespaces": string;
  'transcoded-enabled': string,
  'transcoded-file-options': string
}

function loadSettingsFromFile(settings: HRSettings) {
  setServerAddress(settings['hydrus-server-address'])
  setAPIKey(settings['hydrus-api-key'])
  setGroupNamespace(settings['group-namespace'])
  setComicNamespace(settings['comic-namespace'])
  setMaxResults(settings['hydrus-max-results'])
  console.log(JSON.parse(settings['blacklisted-namespaces']))
  setBlacklistedNamespaces(JSON.parse(settings['blacklisted-namespaces']))
  setRelatedNamespaces(JSON.parse(settings['related-namespaces']))
  let transcodeEnabled = settings['transcoded-enabled'] === "true"
  setTranscodeEnabled(transcodeEnabled)
  let transcodeSettings: { fileServiceName: string, namespace: string } = JSON.parse(settings['transcoded-file-options'])
  console.log(transcodeSettings)
  setTranscodeFileDomain(transcodeSettings.fileServiceName)
  setTranscodeFileNamespace(transcodeSettings.namespace)

  // Easiest way to reload settins display
  window.location.reload()
}

function handleFileImport(uploadedFiles: FileList | null) {
  const fileReader = new FileReader();
  fileReader.onloadend = () => {
    try {
      let result = fileReader.result || ''
      let object: HRSettings = JSON.parse(result.toString())
      console.log(object)
      loadSettingsFromFile(object)

    }
    catch (e) {
      console.warn(e)
    }
  }
  if (uploadedFiles !== null && uploadedFiles?.length > 0) {
    console.log(uploadedFiles[0])
    if (uploadedFiles[0].type !== 'application/json') {
      console.warn('Wrong file type')
      return
    }
    fileReader.readAsText(uploadedFiles[0])
  }

}


export function SettingsPage(props: SettingsPageProps) {
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

      <div className='settingsImportExport'>
        <a className='exportButton' href={exportSettings()} download='hydrus-react-settings.json' >Export Settings</a>
        <label className='exportButton'>
          <input type='file' style={{display:'none'}} accept='application/json' onChange={(e) => { handleFileImport(e.target.files);e.target.value = '' }} />
          Import Settings
        </label>
      </div>


    </div>
  </>;
}


export function TranscodeSettings() {
  const [enabled, setEnabled] = useState(getTranscodeEnabled())
  const [experimentalEnabled,setExperimental] = useState(getExperimentalHydrusAPI())
  function switchEnabledTranscoding() {
    setTranscodeEnabled(!enabled)
    setEnabled(!enabled)
  }

  //Quick and dirty experimental funciton

  function switchEnabledExperimental() {
    setExperimentalHydrusAPI(!experimentalEnabled)
    setExperimental(!experimentalEnabled)
  }

  function getTranscodeButtonStyle(enabled: boolean): string {
    let style = 'transcodeEnabledButton tagEntry blob'
    if (enabled) { style += ' enabled' }
    return style
  }

  return <>
    <button className={getTranscodeButtonStyle(experimentalEnabled)} onClick={switchEnabledExperimental} >Enable Experimental Hydrus API</button>
    <button className={getTranscodeButtonStyle(enabled)} onClick={switchEnabledTranscoding} >Enable transcoded image support</button>
    <SettingInputSingle initialValue={getTranscodeFileDomain} type="text" label="Transcode file domain" setFunction={setTranscodeFileDomain} disabled={!enabled} />
    <SettingInputSingle initialValue={getTranscodeFileNamespace} type="text" label="Transcode file namespace" setFunction={setTranscodeFileNamespace} disabled={!enabled} />
  </>


}



