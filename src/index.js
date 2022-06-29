import React from 'react';
import ReactDOM from 'react-dom/client';
import { SearchPage } from './SearchPage';
import { FilePage } from './FilePage';
import { SettingsPage } from './SettingsPage';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Navigate } from 'react-router-dom'
import Navigation from './NavBar';
import * as API from './hydrus-backend'
import colors from './stylingVariables';

const elementStyle = {
  background: colors.COLOR3,
  color: 'white',
  margin: '0px',
  position: 'absolute',
  top: '0px',
  bottom: '0px',
  left: '0px',
  right: '0px',
  height: "fit-content",
  minHeight: '100%'
}

//console.log('index')
API.sessionKeyRoutine()

function handleKeyPress(event) {
  console.log('doing something')
  if (event.key === 'r') { console.log('pressed r') }
}


const routerElement = (
  <div id="app" style={elementStyle} tabIndex='0' onKeyPress={handleKeyPress}>
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
)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(routerElement);
