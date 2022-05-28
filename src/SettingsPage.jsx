import React, { useEffect, useState } from 'react';
import * as API from './hydrus-backend.js';
import * as TagTools from './TagTools'
import TagDisplay from './TagDisplay.jsx';
import { getRelatedNamespaces, setRelatedNamespaces, getBlacklistedNamespaces, setBlacklistedNamespaces } from './StorageUtils.js';

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
  }

  const SettingsBarStyle = {
    background: '#ffffff',
    boxShadow: '0 0 0 0 grey',
    height: '30px',
    width: '33vw',
    border: 'none',
    borderRadius: '5px',
    textAlign: 'center',
    fontSize: 'larger'
  }


  function ApiServerInput() {
    const [apiServerAddress, setApiServerAddress] = useState(localStorage.getItem('hydrus-server-address'));
    function submitKey(event) {
      event.preventDefault();
      localStorage.setItem('hydrus-server-address', apiServerAddress)
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


    return <div><button style={TagTools.getTagButtonStyle()} key='test api button' onClick={() => { buttonClick() }} >Test Api Connection</button>{message}</div>
  }

  function ApiMaxResultsInput() {
    const [apiMaxResults, setApiMaxResults] = useState(localStorage.getItem('hydrus-max-results'));
    function submitKey(event) {
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
    const [apiKey, setApiKey] = useState(localStorage.getItem('hydrus-api-key'));
    function submitKey(event) {
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
    const [comicNamespace, setComicNamespace] = useState(localStorage.getItem('comic-namespace'));
    function submitKey(event) {
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
    const [groupNamespace, setGroupNamespace] = useState(localStorage.getItem('group-namespace'));
    function submitKey(event) {
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
    }

    const formStyle = {
      height: 'inherit',
      flexGrow: '0',
      borderRadius: '5px',
      minWidth: '200px',
      width: '-webkit-fill-available'
    }

    const labelStyle = {
      display: 'block',
      height: 'inherit',
      width: 'inherit'
    }

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
    }
    const [tag, setTag] = useState('')
    const [spaces, setSpaces] = useState([])

    function handleSubmit(event) {
      event.preventDefault()

      setSpaces(addRelatedTagToSettings(tag))
      setTag('')
    }

    function removeRelatedTagFromSetting(tag) {
      console.log(tag)
      let spaces = getRelatedNamespaces()
      let i = spaces.indexOf(tag);
      let afterRemove = spaces.slice();
      afterRemove.splice(i, 1);
      setRelatedNamespaces(afterRemove)
      setSpaces(afterRemove)
    }

    function addRelatedTagToSettings(tag) {
      console.log(tag)
      let spaces = getRelatedNamespaces()
      if (spaces.includes(tag)) { return }
      spaces.push(tag)
      setRelatedNamespaces(spaces)
      return spaces
    }

    useEffect(() => {
      setSpaces(getRelatedNamespaces())
    }, [])


    return <div style={searchBarSt}>
      <TagDisplay key={spaces} removeTag={removeRelatedTagFromSetting} tags={spaces} />
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
    }

    const formStyle = {
      height: 'inherit',
      flexGrow: '0',
      borderRadius: '5px',
      minWidth: '200px',
      width: '-webkit-fill-available'
    }

    const labelStyle = {
      display: 'block',
      height: 'inherit',
      width: 'inherit'
    }

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
    }
    const [tag, setTag] = useState('')
    const [spaces, setSpaces] = useState([])

    function handleSubmit(event) {
      event.preventDefault()

      setSpaces(addBlacklistedSpaceToSettings(tag))
      setTag('')
    }

    function removeBlacklistedSpaceFromSettings(tag) {
      console.log(tag)
      let spaces = getBlacklistedNamespaces()
      let i = spaces.indexOf(tag);
      let afterRemove = spaces.slice();
      afterRemove.splice(i, 1);
      setBlacklistedNamespaces(afterRemove)
      setSpaces(afterRemove)
    }

    function addBlacklistedSpaceToSettings(tag) {
      console.log(tag)
      let spaces = getBlacklistedNamespaces()
      if (spaces.includes(tag)) { return }
      spaces.push(tag)
      setBlacklistedNamespaces(spaces)
      return spaces
    }

    useEffect(() => {
      setSpaces(getBlacklistedNamespaces())
    }, [])


    return <div style={searchBarSt}>
      <TagDisplay key={spaces} removeTag={removeBlacklistedSpaceFromSettings} tags={spaces} />
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
