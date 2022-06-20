import React, { useEffect, useState } from 'react';
import * as API from './hydrus-backend';
import * as TagTools from './TagTools'
import TagDisplay from './TagDisplay';
import { getRelatedNamespaces, setRelatedNamespaces, getBlacklistedNamespaces, setBlacklistedNamespaces } from './StorageUtils';

//Really crude but get things done, its supposed to just assign localStorage items anyways

export function SettingsPage() {

  const settingsStyle = {
    marginTop: '5%',
    textAlign: 'right',
    fontSize: 'larger',
    gap: '15px',
    display: 'grid',
    gridAutoFlow: 'row',
    gridRowGap: '15px',
    justifyContent: 'center'
  } as React.CSSProperties

  const SettingsBarStyle = {
    background: '#ffffff',
    boxShadow: '0 0 0 0 grey',
    height: '30px',
    width: '33vw',
    border: 'none',
    borderRadius: '5px',
    textAlign: 'center',
    fontSize: 'larger'
  } as React.CSSProperties


  function ApiServerInput() {
    const [apiServerAddress, setApiServerAddress] = useState(getServerAddress());

    function getServerAddress(): string {
      let address = localStorage.getItem('hydrus-server-address');
      if (address) { return address }
      return ''
    }

    function submitKey(event: React.FormEvent) {
      event.preventDefault();
      if (apiServerAddress) { localStorage.setItem('hydrus-server-address', apiServerAddress) }
    }

    function KeyInput() {
      return <form onSubmit={submitKey}>
        <label>
          Input Hydrus Server address:
          <input
            style={SettingsBarStyle}
            type="text"
            value={apiServerAddress}
            onChange={(e) => setApiServerAddress(e.target.value)} />
        </label>
      </form>;
    }
    return <div>{KeyInput()}</div>
  }

  function ApiTestButton() {
    const [message, setMessage] = useState('')

    async function buttonClick() {
      let response = await API.api_verify_access_key()
      console.log(response.data.human_description)
      setMessage(response.data.human_description)
    }


    return <div><button style={TagTools.getTagButtonStyle('')} key='test api button' onClick={() => { buttonClick() }} >Test Api Connection</button>{message}</div>
  }

  function ApiMaxResultsInput() {
    const [apiMaxResults, setApiMaxResults] = useState(getServerAddress());
    function getServerAddress(): string {
      let address = localStorage.getItem('hydrus-max-results');
      if (address) { return address }
      return ''
    }
    function submitKey(event:React.FormEvent) {
      event.preventDefault();
      localStorage.setItem('hydrus-max-results', apiMaxResults)
    }

    function KeyInput() {
      return <form onSubmit={submitKey}>
        <label>
          Input max results for searches :
          <input
            style={SettingsBarStyle}
            type="number"
            min={1}
            placeholder='5000'
            value={apiMaxResults}
            onChange={(e) => setApiMaxResults(e.target.value)} />
        </label>
      </form>;
    }
    return <div>{KeyInput()}</div>
  }

  function ApiKeyInput() {
    const [apiKey, setApiKey] = useState(getApiKey());
    function getApiKey(): string {
      let address = localStorage.getItem('hydrus-api-key');
      if (address) { return address }
      return ''
    }
    function submitKey(event:React.FormEvent) {
      event.preventDefault();
      localStorage.setItem('hydrus-api-key', apiKey)
    }

    function KeyInput() {
      return <form onSubmit={submitKey}>
        <label>
          Input API-key:
          <input
            style={SettingsBarStyle}
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)} />
        </label>
      </form>;
    }
    return <div>{KeyInput()}</div>
  }

  function ComicsNamespaceInput() {
    const [comicNamespace, setComicNamespace] = useState(getComicNamespace());
    function getComicNamespace(): string {
      let namespace = localStorage.getItem('comic-namespace');
      if (namespace) { return namespace }
      return ''
    }

    function submitKey(event: React.FormEvent) {
      event.preventDefault();
      localStorage.setItem('comic-namespace', comicNamespace)
      if (comicNamespace === '') {
        localStorage.removeItem('comic-namespace')
      }
    }

    function KeyInput() {
      return <form onSubmit={submitKey}>
        <label>
          Input comic-title namespace:
          <input
            style={SettingsBarStyle}
            type="text"
            value={comicNamespace}
            placeholder='doujin-title'
            onChange={(e) => setComicNamespace(e.target.value)} />
        </label>
      </form>;
    }
    return <div>{KeyInput()}</div>
  }

  function GroupNamespaceInput() {
    const [groupNamespace, setGroupNamespace] = useState(getGroupNamespace());
    function getGroupNamespace(): string {
      let namespace = localStorage.getItem('group-namespace');
      if (namespace) { return namespace }
      return ''
    }

    function submitKey(event: React.FormEvent) {
      event.preventDefault();
      localStorage.setItem('group-namespace', groupNamespace)
      if (groupNamespace === '') {
        localStorage.removeItem('group-namespace')
      }

    }

    function KeyInput() {
      return <form onSubmit={submitKey}>
        <label>
          Input comic-title namespace:
          <input
            style={SettingsBarStyle}
            type="text"
            value={groupNamespace}
            placeholder='group-title'
            onChange={(e) => setGroupNamespace(e.target.value)} />
        </label>
      </form>;
    }
    return <div>{KeyInput()}</div>
  }

  //const relatedSpaces = ['filename', 'title', 'page', 'group-title', 'doujin-title', 'kemono-title', 'pixiv-title', 'last', 'slast']

  function RelatedGroupsInput() {

    const searchBarSt = {
      background: '#ffffff',
      boxShadow: '0 0 0px 0 black',
      display: 'flex',
      flexFlow: 'rows',
      height: '45px',
      margin: '4px',
      minWidth: '40%',
      maxWidth: '95vw',
      borderRadius: '5px',
      overflow: 'auto hidden',
      flexGrow: '1'
    } as React.CSSProperties

    const formStyle = {
      height: 'inherit',
      flexGrow: '0',
      borderRadius: '5px',
      minWidth: '200px',
      width: '-webkit-fill-available'
    } as React.CSSProperties

    const labelStyle = {
      display: 'block',
      height: 'inherit',
      width: 'inherit'
    } as React.CSSProperties

    const inputStyle = {
      display: 'block',
      height: 'inherit',
      width: '99%',
      border: 'none',
      borderRadius: '5px',
      textAlign: 'left',
      fontSize: '12px',
      padding: '0px 0px 0px 3px',
      margin: '0px',
      outline: 'none'
    } as React.CSSProperties
    const [tag, setTag] = useState('')
    const [spaces, setSpaces] = useState<Array<Array<string>>>([])

    function handleSubmit(event: React.FormEvent):void {
      event.preventDefault()
      let temp = tag.toLowerCase()
      setSpaces(addRelatedTagToSettings(temp))
      setTag('')
    }

    function removeRelatedTagFromSetting(tag: string):void {
      let spaces = getRelatedNamespaces()
      let returnSpaces: Array<Array<string>> = []

      let i = spaces.indexOf(tag);
      let afterRemove = spaces.slice();
      afterRemove.splice(i, 1);
      console.log(afterRemove)
      for (let space of afterRemove) {
        returnSpaces.push([space+':*'])
      }



      setRelatedNamespaces(afterRemove)
      setSpaces(returnSpaces)
    }

    function spacesToTags(spaces: Array<Array<string>>):Array<Array<string>>{
      let tags: Array<Array<string>> = []
      console.log(spaces)
      for (let space of spaces) {
        if (space[0].includes(':*')) {console.log('returning without change');return spaces}
        tags.push([space[0]+':*'])
      }
      console.log(tags)

      return tags
    }


    function addRelatedTagToSettings(tag: string):Array<Array<string>> {
      let spaces = getRelatedNamespaces()
      let returnSpaces: Array<Array<string>> = []
      if (spaces.includes(tag)) {
        
        for (let space of spaces) {
          returnSpaces.push([space])
        }
        return returnSpaces
      }
      spaces.push(tag)
      setRelatedNamespaces(spaces)

      for (let space of spaces) {
        returnSpaces.push([space])
      }

      return returnSpaces
    }

    useEffect(() => {
      let spaces = []
      for (let space of getRelatedNamespaces()){
        spaces.push([space+':*'])
      }
      setSpaces(spaces)
    }, [])

    return <div style={searchBarSt}>
      <TagDisplay key={spaces.toString()} removeTag={removeRelatedTagFromSetting} tags={spacesToTags(spaces)} />
      <form onSubmit={handleSubmit} style={formStyle}>
        <label style={labelStyle}>
          <input style={inputStyle}
            type="text"
            value={tag}
            placeholder="Input tag namespaces that you want to see in related list"
            onChange={(e) => setTag(e.target.value)} />
        </label>
      </form>
    </div>
  }

  function BlacklistedTagsInput() {

    const searchBarSt = {
      background: '#ffffff',
      boxShadow: '0 0 0px 0 black',
      display: 'flex',
      flexFlow: 'rows',
      height: '45px',
      margin: '4px',
      minWidth: '40%',
      maxWidth: '95vw',
      borderRadius: '5px',
      overflow: 'auto hidden',
      flexGrow: '1'
    } as React.CSSProperties

    const formStyle = {
      height: 'inherit',
      flexGrow: '0',
      borderRadius: '5px',
      minWidth: '200px',
      width: '-webkit-fill-available'
    } as React.CSSProperties

    const labelStyle = {
      display: 'block',
      height: 'inherit',
      width: 'inherit'
    } as React.CSSProperties

    const inputStyle = {
      display: 'block',
      height: 'inherit',
      width: '99%',
      border: 'none',
      borderRadius: '5px',
      textAlign: 'left',
      fontSize: '12px',
      padding: '0px 0px 0px 3px',
      margin: '0px',
      outline: 'none'
    } as React.CSSProperties
    const [tag, setTag] = useState('')
    const [spaces, setSpaces] = useState<Array<Array<string>>>([])

    function handleSubmit(event: React.FormEvent) {
      event.preventDefault()
      let temp = tag.toLowerCase()

      setSpaces(addBlacklistedSpaceToSettings(temp))
      setTag('')
    }

    function removeBlacklistedSpaceFromSettings(tag: string):void {
      let spaces = getBlacklistedNamespaces()
      let i = spaces.indexOf(tag);
      let afterRemove = spaces.slice();
      afterRemove.splice(i, 1);
      setBlacklistedNamespaces(afterRemove)
      setSpaces([afterRemove])
    }

    function addBlacklistedSpaceToSettings(tag: string):Array<Array<string>> {
      let spaces = getBlacklistedNamespaces()
      if (spaces.includes(tag)) { return [spaces] }
      spaces.push(tag)
      setBlacklistedNamespaces(spaces)
      return [spaces]
    }

    useEffect(() => {
      let spaces = []
      for (let space of getBlacklistedNamespaces()){
        spaces.push([space+':*'])
      }
      setSpaces(spaces)
    }, [])

    return <div style={searchBarSt}>
      <TagDisplay key={spaces.toString()} removeTag={removeBlacklistedSpaceFromSettings} tags={spaces} />
      <form onSubmit={handleSubmit} style={formStyle}>
        <label style={labelStyle}>
          <input style={inputStyle}
            type="text"
            value={tag}
            placeholder="Input tag namespaces that you want to omit from displaying in browser tag list"
            onChange={(e) => setTag(e.target.value)} />
        </label>
      </form>
    </div>
  }

  return <>
    <div style={settingsStyle}>
      <ApiServerInput />
      <ApiKeyInput />
      <ComicsNamespaceInput />
      <GroupNamespaceInput />
      <ApiMaxResultsInput />
      <ApiTestButton />
      <RelatedGroupsInput />
      <BlacklistedTagsInput />
    </div>
  </>;
}
