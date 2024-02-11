import ReactDOM from 'react-dom/client';
import { SearchPage } from './SearchPage/SearchPage';
import { SettingsPage } from './SettingsPage/SettingsPage';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Navigate } from 'react-router-dom';
import { MemoNavigation } from './NavBar';
import * as API from './hydrus-backend'

import './index.css'
import { useEffect, useState } from 'react';
import { assignColorVariables } from './tagColors';
import { AxiosError } from 'axios';
import TagListPage from './TagListPage';
import LocalSessionStorage from './LocalSessionStorage';

import { store } from './ReduxStore';
import { Provider } from 'react-redux';


function App() {
  const [token, setToken] = useState<boolean>(false)
  const [settings, setSettings] = useState<boolean>(false)

  const [navigationExpanded, setNavigationExpanded] = useState(false)

  assignColorVariables()

  async function sessionKeyRoutine() {
    const localSessionStorage = new LocalSessionStorage()
    //If no settings, automatically move to settings page
    if (localStorage.getItem('hydrus-api-key') === null ||
      localStorage.getItem('hydrus-server-address') === null) {
      setToken(true)
      return
    }
    setSettings(true)
    //If session key exist, verify it

    if (localSessionStorage.getApiKey() !== '') {
      API.api_verify_access_key().catch(function (error: AxiosError) {
        if (error.response?.status === 419) { //Expired Session
          console.log('Invalid key')
          localSessionStorage.setApiKey('')
          //sessionStorage.removeItem('hydrus-session-key') //Just remove it, it will get a new one in next step
        }
      })
    }
    //If verification fails get a new one
    if (localSessionStorage.getApiKey() === '') {
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
      localSessionStorage.setApiKey(response.data.session_key)
      //sessionStorage.setItem("hydrus-session-key", response.data.session_key);
    }
    //If no known services get them
    if (sessionStorage.getItem('hydrus-services') === null) {
      API.api_get_services();
    }
    API.api_version()
    setToken(true)
  }

  useEffect(() => {
    sessionKeyRoutine()
  }, [])

  const defaultURLParameters = '/search/tags=&page=1'




  return <Provider store={store}>
    <div className="app">
      {(token) && <Router>
        <MemoNavigation expanded={navigationExpanded} setNavigationExpanded={setNavigationExpanded} />
        {((settings) &&
          <Routes>
            <Route key="route-main" path='/' element={<Navigate replace to={defaultURLParameters} />} />
            <Route key="route-search" path='/test/home/:currentURLParameters' element={<SearchPage type='image' setNavigationExpanded={setNavigationExpanded} />} />
            <Route key="route-search" path='/search/:currentURLParameters' element={<SearchPage type='image' setNavigationExpanded={setNavigationExpanded} />} />
            <Route key="route-settings" path='/settings' element={<SettingsPage setNavigationExpanded={setNavigationExpanded} />} />
            <Route key="route-comics" path='/comics/:currentURLParameters' element={<SearchPage type='comic' setNavigationExpanded={setNavigationExpanded} />} />
            <Route key="route-taglist" path='/tagList/:currentURLParameters' element={<TagListPage />} />
          </Routes>) || <Routes>
            <Route key="route-settings" path='/*' element={<SettingsPage setNavigationExpanded={setNavigationExpanded} />} />
          </Routes>}
      </Router>}
    </div>
  </Provider>
}

const rootElement = document.getElementById('root')

if (rootElement !== null) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(<App />);
}
