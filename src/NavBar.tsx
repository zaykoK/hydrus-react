import * as React from "react";
import { NavLink } from "react-router-dom";
import IconHome from './assets/menu-home.svg'
import IconComics from './assets/filetype-picture.svg'
import IconSettings from './assets/menu-settings.svg'

import "./NavBar.css"
import { isMobile } from "./styleUtils";

type NavigationProps = {
  expanded: boolean;
  setNavigationExpanded: Function;
}

function Navigation(props: NavigationProps) {
  const [expanded, setExpanded] = React.useState<boolean>(false)

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
      <NavLink key={'navLink-home'} className={getNavLinkStyle()} to="/">
        <img src={IconHome} alt='home page' className={getNavButtonStyle()} />
        <div className="navButtonLabel">Home</div>
      </NavLink>
      <NavLink key={'navLink-comics'} className={getNavLinkStyle()} to="/search/page=1&type=comic">
        <img src={IconComics} alt='comic page' className={getNavButtonStyle()} />
        <div className="navButtonLabel">Comics</div>
      </NavLink>
      <NavLink key={'navLink-tagList'} className={getNavLinkStyle()} to="/tagList/namespace=creator">
        <img src={IconComics} alt='tag list' className={getNavButtonStyle()} />
        <div className="navButtonLabel">Tag List</div>
      </NavLink>
      <NavLink key={'navLink-settings'} className={getNavLinkStyle()} to="/settings">
        <img src={IconSettings} alt='settings page' className={getNavButtonStyle()} />
        <div className="navButtonLabel">Settings</div>
      </NavLink>
      <div className={getFullScreenDarkenerStyle(expanded)} onClick={() => { props.setNavigationExpanded(!expanded) }} ></div>
    </nav>
  </>
  );
}

export const MemoNavigation = React.memo(Navigation);