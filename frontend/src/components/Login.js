
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import AuthContext from '../AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:8001/login', {
        username,
        password,
      });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('userRole', response.data.user_role);
      localStorage.setItem('username', username);

      // Update auth state
      setAuth({
        isAuthenticated: true,
        role: response.data.user_role,
        username: username,
      });

      if (response.data.user_role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Невірні облікові дані');
    }
  };

  return (
    <div className="login-container">
      <h2>Вхід до системи</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label>Ім'я користувача:</label>
          <input
            type="text"
            value={username}
            placeholder="Введіть ім'я користувача"
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Пароль:</label>
          <input
            type="password"
            value={password}
            placeholder="Введіть пароль"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-submit">Увійти</button>
      </form>
      <p className="redirect">
        Не маєте акаунта? <a href="/register">Зареєструватися</a>
      </p>
    </div>
  );
}

export default Login;
