import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/UserProfile.css';

function UserProfile() {
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    username: '',
    role: '',
    is_active: true,
  });
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate('/login');
    } else {
      fetchProfile();
    }
  }, [auth, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('http://localhost:8001/profile', {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      setProfile(response.data);
      setFormData({ username: response.data.username, password: '' });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      alert('Не вдалося завантажити профіль');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        'http://localhost:8001/profile',
        {
          username: formData.username,
          password: formData.password || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      alert('Профіль оновлено успішно');
      setProfile(response.data);
      setIsEditing(false);

      // Update username in auth context and localStorage if it was changed
      if (auth.username !== response.data.username) {
        setAuth({ ...auth, username: response.data.username });
        localStorage.setItem('username', response.data.username);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      if (error.response && error.response.data.detail) {
        alert(`Не вдалося оновити профіль: ${error.response.data.detail}`);
      } else {
        alert('Не вдалося оновити профіль');
      }
    }
  };

  return (
    <div className="profile-container">
      <h2>Мій профіль</h2>
      {isEditing ? (
        <form onSubmit={handleUpdateProfile} className="profile-form">
          <div className="form-group">
            <label>Ім'я користувача:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Новий пароль:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn-submit">Зберегти</button>
          <button
            type="button"
            className="btn-cancel"
            onClick={() => {
              setIsEditing(false);
              setFormData({ username: profile.username, password: '' });
            }}
          >
            Скасувати
          </button>
        </form>
      ) : (
        <div className="profile-info">
          <p>
            <strong>Ім'я користувача:</strong> {profile.username}
          </p>
          <p>
            <strong>Роль:</strong> {profile.role}
          </p>
          <p>
            <strong>Статус:</strong> {profile.is_active ? 'Активний' : 'Неактивний'}
          </p>
          <button
            className="btn-edit"
            onClick={() => setIsEditing(true)}
          >
            Редагувати профіль
          </button>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
