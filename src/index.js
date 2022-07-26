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

function App() {
  const [globalState,setGlobalState] = useState({})

  useEffect(() => {
    //First Load stuff
    //try to add verification of user
    //console.log('Starting HYDRUS-react')
  },[])

  return <div className="app" tabIndex='0'>
    <Router>
      <Navigation />
      <Routes>
        <Route key="route-main" path='/' element={<Navigate replace to='/search/tags=&page=1' />} />
        <Route key="route-search" path='/search/:parm' element={<SearchPage type='image' />} />
        <Route key="route-file" path='/file/:fileHash' element={<FilePage />} />
        <Route key="route-settings" path='/settings' element={<SettingsPage />} />
        <Route key="route-comics" path='/comics/:parm' element={<SearchPage type='comic' />} />
      </Routes>
    </Router>
  </div>
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
