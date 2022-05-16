import {React, useState }from "react";
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

}

const barStyle = {
  position:'absolute',
  top:'2px',
  left:'2px',
  background: '#333333',
  display: 'flex',
  flexFlow:'column',
  gridTemplateColumns: 'auto auto auto',
  justifyItems: 'left',
  borderRadius:'10px',
  boxShadow: '0px 0px 7px 0px black',
  overflow:'hidden',
  height:'50px'
}

const ButtonStyle = {
  height: '1.5em',
  width: '1.5em',
  background: '#1e1e1e',
  margin: '5px',
  padding: '5px',
  borderRadius:'10px',
  cursor: 'pointer',
  opacity:'0.7'
}

function Navigation() {
  const [expanded,setExpanded] = useState(false)

  function returnBarStyle(expanded){
    if (expanded) {
      return {
        ...barStyle,
        height:'auto'
      }
    }
    return barStyle
  }

  return (
    <div className="navigation" >
      <nav className="navbar navbar-expand navbar-dark bg-dark" >
        <div className="container" style={returnBarStyle(expanded)}>
          <div style={linkStyle}>
            <img src={IconHamburger} style={ButtonStyle} onClick={() => {setExpanded(!expanded)}} />
          </div>
          <NavLink style={linkStyle} className="nav-link" to="/">
          <img src={IconHome} style={ButtonStyle} />
          </NavLink>
          <NavLink style={linkStyle} className="nav-link" to="/comics/page=1">
          <img src={IconComics} style={ButtonStyle} />
          </NavLink>
          <NavLink style={linkStyle} className="nav-link" to="/settings">
          <img src={IconSettings} style={ButtonStyle} />
          </NavLink>
        </div>
      </nav>
    </div>
  );
}

export default Navigation;