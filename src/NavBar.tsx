import * as React from "react";
import { NavLink } from "react-router-dom";
import IconHome from './assets/menu-home.svg'
import IconComics from './assets/filetype-picture.svg'
import IconSettings from './assets/menu-settings.svg'
import IconHamburger from './assets/menu-burger.svg'

import "./NavBar.css"
import MobileModeButton from "./MobileModeButton";
import { isLandscapeMode, isMobile } from "./styleUtils";

type NavigationProps = {
  expanded: boolean;
  setNavigationExpanded: Function;
}

function Navigation(props: NavigationProps) {
  const [expanded, setExpanded] = React.useState<boolean>(false)

  function returnBarStyle(): string {
    let style = 'navBarBut'
    if (isMobile()) {
      style += ' mobile'
      if (isLandscapeMode()) {
        style += ' landscape'
      }
    }
    return style
  }

  React.useEffect(() => {
    if (expanded !== props.expanded) {
      setExpanded(props.expanded);
    }
  }, [props.expanded])

  function returnExpandedBarStyle(expanded: boolean): string {
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

  function getFullScreenDarkenerStyle(expanded: boolean): string {
    let style = 'navFullscreen'
    if (expanded) { style += ' expanded' }
    return style
  }

  //What I need
  //1. a nice button I can put somewhere
  //2. Always open slider on the left

  return (<>
    <nav className={returnExpandedBarStyle(expanded)}>
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
      <div className={getFullScreenDarkenerStyle(expanded)} onClick={() => { props.setNavigationExpanded(!expanded) }} ></div>
    </nav>
  </>
  );
}

export default Navigation;