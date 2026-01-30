import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="header">
      <div className="logo">
        <div className="logo-icon">
          <div className="eye-container">
            <div className="eye-white">
              <div className="eye-iris">
                <div className="iris-line"></div>
                <div className="iris-line"></div>
                <div className="iris-line"></div>
                <div className="iris-line"></div>
                <div className="iris-line"></div>
                <div className="iris-line"></div>
              </div>
            </div>
          </div>
        </div>
        <span>IRIS</span>
      </div>
      <nav className="nav">
        <Link to="/" className="nav-link">
          Dashboard
        </Link>
        <Link to="/gallery" className="nav-link">
          Gallery
        </Link>
        <Link to="/analytics" className="nav-link">
          Analytics
        </Link>
        <a href="#" className="nav-link">
          Settings
        </a>
        <div className="user-profile">JD</div>
      </nav>
    </header>
  );
}

export default Header;
