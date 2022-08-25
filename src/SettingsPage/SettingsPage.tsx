import ApiTestButton from './ButtonAPITest';
import BlacklistedTagsInput from './formBlacklistedTags';
import RelatedGroupsInput from './formRelatedTags';

import { GlobalStateObject } from '../index.js';

import './SettingsPage.css'

import { getAPIKey, getComicNamespace, getGroupNamespace, getMaxResults, getServerAddress, setAPIKey, setComicNamespace, setGroupNamespace, setMaxResults, setServerAddress, exportSettings } from '../StorageUtils'
import SettingInputSingle from './SettingsInputSingle';


interface SettingsPageProps {
  globalState:any;
}

export function SettingsPage(props:SettingsPageProps) {
  //console.log(props.globalState?.getGlobalValue())
  //props.globalState?.setGlobalValue('settings')

  return <>
    <div className="settingsPage">
      <SettingInputSingle initialValue={getServerAddress} type="text" label="Input Hydrus Server address:" setFunction={setServerAddress} />
      <SettingInputSingle initialValue={getAPIKey} type="password" label="Input API-key:" setFunction={setAPIKey} />
      <SettingInputSingle initialValue={getComicNamespace} type="text" label="Input comic-title namespace:" setFunction={setComicNamespace} />
      <SettingInputSingle initialValue={getGroupNamespace} type="text" label="Input grouping namespace:" setFunction={setGroupNamespace} />
      <SettingInputSingle initialValue={getMaxResults} type="number" label="Input max results for searches :" setFunction={setMaxResults} />
      <ApiTestButton />
      <RelatedGroupsInput />
      <BlacklistedTagsInput />
      <a href={exportSettings()} download='hydrus-react-settings.json' >Export Settings</a>
      <input type='file' />
    </div>
  </>;
}
