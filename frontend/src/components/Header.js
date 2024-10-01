import React from 'react';
import '../styles/Header.css';

function Header() {
  return (
    <header className="header">
      <h1>Секретний Фонд</h1>
      <nav>
        <ul>
          <li><a href="#about">Про нас</a></li>
          <li><a href="#services">Наші послуги</a></li>
          <li><a href="#contact">Контакти</a></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
