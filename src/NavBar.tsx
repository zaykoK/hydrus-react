import * as React from "react";
import { NavLink } from "react-router-dom";
// @ts-ignore
import IconHome from './assets/menu-home.svg'
// @ts-ignore
import IconComics from './assets/filetype-picture.svg'
// @ts-ignore
import IconSettings from './assets/menu-settings.svg'
// @ts-ignore
import IconHamburger from './assets/menu-burger.svg'

import "./NavBar.css"

//for now lifted from
//https://www.techomoro.com/how-to-create-a-multi-page-website-with-react-in-5-minutes/
//to change later on


function Navigation() {
  const [expanded, setExpanded] = React.useState(false)

  function returnBarStyle(expanded:boolean):string {
    if (expanded) {
      return "navBar expanded"
    }
    return "navBar"
  }

  return (
    <div className="navigation" >
      <nav>
        <div className={returnBarStyle(expanded)}>
          <div className="navLink">
            <img src={IconHamburger} className="navButton" onClick={() => { setExpanded(!expanded) }} />
            <div className="navButtonLabel">Menu</div>
          </div>
          <NavLink className="navLink" to="/">
            <img src={IconHome} className="navButton" />
            <div className="navButtonLabel">Home</div>
          </NavLink>
          <NavLink className="navLink" to="/comics/page=1">
            <img src={IconComics} className="navButton" />
            <div className="navButtonLabel">Comics</div>
      </NavLink>
      <NavLink className="navLink" to="/settings">
        <img src={IconSettings} className="navButton" />
        <div className="navButtonLabel">Settings</div>
          </NavLink >
        </div >
      </nav >
    </div >
  );
}

export default Navigation;