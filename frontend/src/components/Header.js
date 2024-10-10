import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import AuthContext from '../AuthContext';

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
      isAdmin: false,
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
          {auth.isAdmin ? (
            <>
              <li><Link to="/admin">Адмінська сторінка</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/">Головна</Link></li>
            </>
          )}
        </ul>
      </nav>
      <div className="user-info">
        {!auth.isAuthenticated ? (
          <ul className="auth-links">
            <li><Link to="/login">Вхід</Link></li>
            <li><Link to="/register">Реєстрація</Link></li>
          </ul>
        ) : (
          <div className="logged-in-info">
            <span className="username">Привіт, {auth.username}!</span>
            <button onClick={handleLogout} className="logout-button">Вийти</button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
