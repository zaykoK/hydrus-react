import ReactDOM from 'react-dom/client';
import { SearchPage } from './SearchPage/SearchPage';
import { FilePage } from './FilePage/FilePage';
import { SettingsPage } from './SettingsPage/SettingsPage';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Navigate } from 'react-router-dom'
import Navigation from './NavBar';
import * as API from './hydrus-backend'

import './index.css'
import { useEffect, useState } from 'react';

API.sessionKeyRoutine()

export class GlobalStateObject {
  //Stub of an idea to hold some data between pages
  //Could use this to keep search results etc.

  constructor() {
    this.globalValue = ''
  }
  
  getGlobalValue() {
    return this.globalValue
  }

  setGlobalValue(value) {
    this.globalValue = value
  }
}


function App() {
  const [globalState,setGlobalState] = useState(new GlobalStateObject())



  useEffect(() => {
    //First Load stuff
    //try to add verification of user
    //console.log('Starting HYDRUS-react')
    //setGlobalState(new GlobalStateObject())
  },[])

  return <div className="app" tabIndex='0'>
    <Router>
      <Navigation />
      <Routes>
        <Route key="route-main" path='/' element={<Navigate replace to='/search/tags=&page=1' />} />
        <Route key="route-search" path='/search/:parm' element={<SearchPage type='image' globalState={globalState} />}  />
        <Route key="route-file" path='/file/:fileHash' element={<FilePage globalState={globalState} />}  />
        <Route key="route-settings" path='/settings' element={<SettingsPage globalState={globalState} />} />
        <Route key="route-comics" path='/comics/:parm' element={<SearchPage type='comic' globalState={globalState} />}  />
      </Routes>
    </Router>
  </div>
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
