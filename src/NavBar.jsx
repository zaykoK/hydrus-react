import React from "react";
import { NavLink } from "react-router-dom";

//for now lifted from
//https://www.techomoro.com/how-to-create-a-multi-page-website-with-react-in-5-minutes/
//to change later on

const linkStyle = {
  color: 'white',
  textDecoration: 'none',
  fontSize: 'larger'
}

const barStyle = {
  background: '#333333',
  display: 'grid',
  gridTemplateColumns: 'auto auto auto',
  justifyItems: 'center'
}

function Navigation() {
  return (
    <div className="navigation" >
      <nav className="navbar navbar-expand navbar-dark bg-dark" >
        <div className="container" style={barStyle}>
          <NavLink style={linkStyle} className="nav-link" to="/">
            Home
          </NavLink>
          <NavLink style={linkStyle} className="nav-link" to="/comics/page=1">
            Comics
          </NavLink>
          <NavLink style={linkStyle} className="nav-link" to="/settings">
            Settings
          </NavLink>
        </div>
      </nav>
    </div>
  );
}

export default Navigation;