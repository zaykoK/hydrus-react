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
import MobileModeButton from "./MobileModeButton";
import { isMobile } from "./styleUtils";

function Navigation() {
  const [expanded, setExpanded] = React.useState(false)

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
      <div className={getNavLinkStyle()}>
        <img src={IconHamburger} className={getNavButtonStyle()} onClick={() => { setExpanded(!expanded) }} />
        <span className="navButtonLabel">Menu</span>
      </div>
      <NavLink className={getNavLinkStyle()} to="/">
        <img src={IconHome} className={getNavButtonStyle()} />
        <div className="navButtonLabel">Home</div>
      </NavLink>
      <NavLink className={getNavLinkStyle()} to="/comics/page=1">
        <img src={IconComics} className={getNavButtonStyle()} />
        <div className="navButtonLabel">Comics</div>
      </NavLink>
      <NavLink className={getNavLinkStyle()} to="/settings">
        <img src={IconSettings} className={getNavButtonStyle()} />
        <div className="navButtonLabel">Settings</div>
      </NavLink >
      <MobileModeButton />

    </nav >
  );
}

export default Navigation;