import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post('http://localhost:8001/register', {
        username,
        password,
      });
      alert('Реєстрація успішна! Будь ласка, увійдіть.');
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Реєстрація не вдалася');
    }
  };

  return (
    <div className="register-container">
      <h2>Реєстрація нового користувача</h2>
      <form onSubmit={handleSubmit} className="register-form">
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
        <button type="submit" className="btn-submit">Зареєструватися</button>
      </form>
      <p className="redirect">
        Вже маєте акаунт? <a href="/login">Увійти</a>
      </p>
    </div>
  );
}

export default Register;
