import * as React from "react";
import { NavLink } from "react-router-dom";
import IconHome from './assets/menu-home.svg'
import IconComics from './assets/filetype-picture.svg'
import IconSettings from './assets/menu-settings.svg'
import IconHamburger from './assets/menu-burger.svg'

import "./NavBar.css"
import MobileModeButton from "./MobileModeButton";
import { isMobile } from "./styleUtils";

function Navigation() {
  const [expanded, setExpanded] = React.useState<boolean>(false)

  function returnBarStyle(expanded: boolean): string {
    if (isMobile()) {
      if (expanded) {
        return "navBar mobile expanded"
      }
      return "navBar mobile"
    }
    if (expanded) {
      return "navBar expanded"
    }
    return "navBar"
  }

  function getNavLinkStyle() {
    if (isMobile()) { return "navLink mobile" }
    return "navLink"
  }

  function getNavButtonStyle() {
    if (isMobile()) { return "topBarButton mobile" }
    return "topBarButton"
  }


  return (
    <nav className={returnBarStyle(expanded)}>
      <div className={getNavLinkStyle()} onClick={() => { setExpanded(!expanded)}}>
        <img src={IconHamburger} alt='hamburger' className={getNavButtonStyle()} />
        <span className="navButtonLabel">Menu</span>
      </div>
      <NavLink className={getNavLinkStyle()} to="/">
        <img src={IconHome} alt='home page' className={getNavButtonStyle()} />
        <div className="navButtonLabel">Home</div>
      </NavLink>
      <NavLink className={getNavLinkStyle()} to="/comics/page=1">
        <img src={IconComics} alt='comic page' className={getNavButtonStyle()} />
        <div className="navButtonLabel">Comics</div>
      </NavLink>
      <NavLink className={getNavLinkStyle()} to="/settings">
        <img src={IconSettings} alt='settings page' className={getNavButtonStyle()} />
        <div className="navButtonLabel">Settings</div>
      </NavLink >
      <MobileModeButton />

    </nav >
  );
}

export default Navigation;