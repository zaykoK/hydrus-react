import { React, useState } from "react";
import { NavLink } from "react-router-dom";
import IconHome from './assets/menu-home.svg'
import IconComics from './assets/filetype-picture.svg'
import IconSettings from './assets/menu-settings.svg'
import IconHamburger from './assets/menu-burger.svg'

//for now lifted from
//https://www.techomoro.com/how-to-create-a-multi-page-website-with-react-in-5-minutes/
//to change later on

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  fontSize: 'larger',
  display: 'flex',
  flexFlow: 'rows'

}

const barStyle = {
  position: 'absolute',
  top: '0px',
  left: '0px',
  background: '#333333',
  display: 'flex',
  flexFlow: 'column',
  gridTemplateColumns: 'auto auto auto',
  justifyItems: 'left',
  borderRadius: '0px 0px 10px 0px',
  boxShadow: '0px 0px 0px 0px black',
  overflow: 'hidden',
  height: '49px',
  width: '49px',
  zIndex: '50'
}

const ButtonStyle = {
  height: '1.5em',
  width: '1.5em',
  background: '#1e1e1e',
  margin: '5px',
  padding: '5px',
  borderRadius: '10px',
  cursor: 'pointer',
  opacity: '0.7'
}

const menuTextStyle = {
  lineHeight: '2.5em',
  padding: '0px 15px 0px 5px'
}

function Navigation() {
  const [expanded, setExpanded] = useState(false)

  function returnBarStyle(expanded) {
    if (expanded) {
      return {
        ...barStyle,
        height: 'auto',
        width: 'auto',
        boxShadow: '0px 0px 7px 0px black',
      }
    }
    return barStyle
  }

  return (
    <div className="navigation" >
      <nav className="navbar navbar-expand navbar-dark bg-dark" >
        <div className="container" style={returnBarStyle(expanded)}>
          <div style={linkStyle}>
            <img src={IconHamburger} style={ButtonStyle} onClick={() => { setExpanded(!expanded) }} />
            <div style={menuTextStyle}>Menu</div>
          </div>
          <NavLink style={linkStyle} className="nav-link" to="/">
            <img src={IconHome} style={ButtonStyle} />
            <div style={menuTextStyle}>Home</div>
          </NavLink>
          <NavLink style={linkStyle} className="nav-link" to="/comics/page=1">
            <img src={IconComics} style={ButtonStyle} />
            <div style={menuTextStyle}>Comics</div>
      </NavLink>
      <NavLink style={linkStyle} className="nav-link" to="/settings">
        <img src={IconSettings} style={ButtonStyle} />
        <div style={menuTextStyle}>Settings</div>
          </NavLink >
        </div >
      </nav >
    </div >
  );
}

export default Navigation;