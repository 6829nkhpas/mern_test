import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return null;
  }

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          MERN Agent Manager
        </Link>
        <ul className="navbar-nav">
          <li>
            <Link to="/" className={`nav-link ${isActive('/')}`}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/agents" className={`nav-link ${isActive('/agents')}`}>
              Agents
            </Link>
          </li>
          <li>
            <Link to="/lists" className={`nav-link ${isActive('/lists')}`}>
              Lists
            </Link>
          </li>
          <li>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;