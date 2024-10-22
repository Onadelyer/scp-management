import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import AuthContext from '../AuthContext';
import { NavLink } from 'react-router-dom';

function Header() {
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data from local storage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');

    // Update auth state
    setAuth({
      isAuthenticated: false,
      role: null,
      username: null,
    });

    navigate('/'); // Redirect to home page
  };

  return (
    <header className="header">
      <h1 className="logo">
        <Link to="/" className="logo-link">
          Секретний Фонд
        </Link>
      </h1>
      <nav className="nav-links">
        <ul className="nav-menu">
          {/* Common navigation items */}
          <li>
            <Link to="/">Головна</Link>
          </li>
          {/* Navigation items based on role */}
          {auth.isAuthenticated && (
            <>
              <li>
                <NavLink to="/storage-chambers" activeClassName="active-link">Камери зберігання</NavLink>
              </li>
              <li>
                <Link to="/objects">Об'єкти</Link>
              </li>
              {auth.role === 'Administrative Personnel' && (
                <li>
                  <Link to="/user-management">Керування користувачами</Link>
                </li>
              )}
            </>
          )}
        </ul>
      </nav>
      <div className="user-info">
        {!auth.isAuthenticated ? (
          <ul className="auth-links">
            <li>
              <Link to="/login">Вхід</Link>
            </li>
            <li>
              <Link to="/register">Реєстрація</Link>
            </li>
          </ul>
        ) : (
          <div className="logged-in-info">
            <span className="username">Привіт, {auth.username}!</span>
            <Link to="/profile" className="profile-link">
              Мій профіль
            </Link>
            <button onClick={handleLogout} className="logout-button">
              Вийти
            </button>
          </div>
        )}
      </div>

    </header>
  );
}

export default Header;
