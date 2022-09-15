import ReactDOM from 'react-dom/client';
import { SearchPage } from './SearchPage/SearchPage';
import { FilePage } from './FilePage/FilePage';
import { SettingsPage } from './SettingsPage/SettingsPage';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Navigate } from 'react-router-dom'
import { MemoNavigation } from './NavBar';
import * as API from './hydrus-backend'

import './index.css'
import { useEffect, useRef, useState } from 'react';

export class GlobalStateObject {
  //Stub of an idea to hold some data between pages
  //Could use this to keep search results etc.

  globalValue: string;

  constructor() {
    this.globalValue = ''
  }

  getGlobalValue() {
    return this.globalValue
  }

  setGlobalValue(value: string) {
    this.globalValue = value
  }
}

function App() {
  const globalState = useRef<GlobalStateObject>(new GlobalStateObject())
  const [token, setToken] = useState<boolean>(false)
  const [settings, setSettings] = useState<boolean>(false)

  const [navigationExpanded, setNavigationExpanded] = useState(false)

  async function sessionKeyRoutine() {
    //If no settings, automatically move to settings page
    if (localStorage.getItem('hydrus-api-key') === null ||
      localStorage.getItem('hydrus-server-address') === null) {
      setToken(true)
      return
    }
    setSettings(true)
    //If session key exist, verify it
    if (sessionStorage.getItem('hydrus-session-key') != null) {
      API.api_verify_access_key().catch(function (error) {
        if (error.response.status === 419) { //Expired Session
          sessionStorage.removeItem('hydrus-session-key') //Just remove it, it will get a new one in next step
        }
      })
    }
    //If verification fails get a new one
    if (sessionStorage.getItem('hydrus-session-key') === null) {
      let response
      try {
        response = await API.api_get_session_key()
      }
      catch (err) {
        //console.log(err)
        setToken(true)
        setSettings(false)
        return
      }

      sessionStorage.setItem("hydrus-session-key", response.data.session_key);
    }
    //If no known services get them
    if (sessionStorage.getItem('hydrus-all-known-tags') === null) {
      API.api_get_services();
    }
    API.api_version()
    setToken(true)
  }

  useEffect(() => {
    //First Load stuff
    //try to add verification of user
    //console.log('Starting HYDRUS-react')
    //setGlobalState(new GlobalStateObject())

    sessionKeyRoutine()

  }, [])

  return <div className="app">
    {(token) && <Router>
      <MemoNavigation expanded={navigationExpanded} setNavigationExpanded={setNavigationExpanded} />
      {((settings) &&
        <Routes>
          <Route key="route-main" path='/' element={<Navigate replace to='/search/tags=&page=1' />} />
          <Route key="route-search" path='/search/:parm' element={<SearchPage type='image' globalState={globalState} setNavigationExpanded={setNavigationExpanded} />} />
          <Route key="route-file" path='/file/:fileHash' element={<FilePage globalState={globalState} setNavigationExpanded={setNavigationExpanded} />} />
          <Route key="route-settings" path='/settings' element={<SettingsPage globalState={globalState} setNavigationExpanded={setNavigationExpanded} />} />
          <Route key="route-comics" path='/comics/:parm' element={<SearchPage type='comic' globalState={globalState} setNavigationExpanded={setNavigationExpanded} />} />
        </Routes>) || <Routes>
          <Route key="route-settings" path='/*' element={<SettingsPage globalState={globalState} setNavigationExpanded={setNavigationExpanded} />} />
        </Routes>}
    </Router>}
  </div>
}

const rootElement = document.getElementById('root')

if (rootElement !== null) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
