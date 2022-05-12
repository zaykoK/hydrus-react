import React, { useEffect, useState } from 'react';
import * as API from './hydrus-backend.js';

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
    const [apiServerAddress,setApiServerAddress] = useState(localStorage.getItem('hydrus-server-address'));
    function submitKey(event){
      event.preventDefault();
      localStorage.setItem('hydrus-server-address',apiServerAddress)
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

  function ApiMaxResultsInput() {
    const [apiMaxResults,setApiMaxResults] = useState(localStorage.getItem('hydrus-max-results'));
    function submitKey(event){
      event.preventDefault();
      localStorage.setItem('hydrus-max-results',apiMaxResults)
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
    const [apiKey,setApiKey] = useState(localStorage.getItem('hydrus-api-key'));
    function submitKey(event){
      event.preventDefault();
      localStorage.setItem('hydrus-api-key',apiKey)
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
    const [comicNamespace,setComicNamespace] = useState(localStorage.getItem('comic-namespace'));
    function submitKey(event){
      event.preventDefault();
      localStorage.setItem('comic-namespace',comicNamespace)
      if (comicNamespace === ''){
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

  return <>
    <div style={settingsStyle}>
    <ApiServerInput />
    <ApiKeyInput />
    <ComicsNamespaceInput />
    <ApiMaxResultsInput />
    </div>
    </>;
}
