import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../AuthContext';
import axios from 'axios';
import '../styles/UserManagement.css';

function UserManagement() {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'Security Personnel',
  });
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated || auth.role !== 'Administrative Personnel') {
      // Redirect to home page if not authorized
      navigate('/');
    } else {
      fetchUsers();
    }
  }, [auth, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8001/users', {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      alert('Не вдалося завантажити список користувачів');
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectUser = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleAddUserChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:8001/users',
        {
          username: newUser.username,
          password: newUser.password,
          role: newUser.role,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      alert('Користувача успішно додано');
      setShowAddUserForm(false);
      setNewUser({ username: '', password: '', role: 'Security Personnel' });
      fetchUsers();
    } catch (error) {
      console.error('Failed to add user:', error);
      alert('Не вдалося додати користувача');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Ви впевнені, що хочете видалити цього користувача?')) {
      try {
        await axios.delete(`http://localhost:8001/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
        alert('Користувача успішно видалено');
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Не вдалося видалити користувача');
      }
    }
  };

  const handleDeactivateUser = async (userId) => {
    try {
      await axios.post(
        `http://localhost:8001/users/${userId}/deactivate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      alert('Користувача деактивовано');
      fetchUsers();
    } catch (error) {
      console.error('Failed to deactivate user:', error);
      alert('Не вдалося деактивувати користувача');
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await axios.post(
        `http://localhost:8001/users/${userId}/activate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      alert('Користувача активовано');
      fetchUsers();
    } catch (error) {
      console.error('Failed to activate user:', error);
      alert('Не вдалося активувати користувача');
    }
  };

  // Bulk action handlers
  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      alert('Оберіть користувачів для видалення');
      return;
    }
    if (window.confirm('Ви впевнені, що хочете видалити обраних користувачів?')) {
      try {
        await Promise.all(
          selectedUsers.map((userId) =>
            axios.delete(`http://localhost:8001/users/${userId}`, {
              headers: {
                Authorization: `Bearer ${auth.token}`,
              },
            })
          )
        );
        alert('Користувачів успішно видалено');
        setSelectedUsers([]);
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete users:', error);
        alert('Не вдалося видалити користувачів');
      }
    }
  };

  // Render the component
  return (
    <div>
      <h2>Керування користувачами</h2>
      <div className="user-management">
        <div className="user-actions">
          <button onClick={() => setShowAddUserForm(!showAddUserForm)}>
            {showAddUserForm ? 'Сховати форму' : 'Додати нового користувача'}
          </button>
          {selectedUsers.length > 0 && (
            <button onClick={handleBulkDelete}>Видалити обраних користувачів</button>
          )}
          <input
            type="text"
            placeholder="Пошук користувачів"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        {showAddUserForm && (
          <div className="add-user-form">
            <h3>Додати нового користувача</h3>
            <form onSubmit={handleAddUserSubmit}>
              <div>
                <label>Ім'я користувача:</label>
                <input
                  type="text"
                  name="username"
                  value={newUser.username}
                  onChange={handleAddUserChange}
                  required
                />
              </div>
              <div>
                <label>Пароль:</label>
                <input
                  type="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleAddUserChange}
                  required
                />
              </div>
              <div>
                <label>Роль:</label>
                <select
                  name="role"
                  value={newUser.role}
                  onChange={handleAddUserChange}
                  required
                >
                  <option value="Security Personnel">Охоронний персонал</option>
                  <option value="Mobile Task Forces">Мобільні оперативні групи</option>
                  <option value="Administrative Personnel">Адміністративний персонал</option>
                </select>
              </div>
              <button type="submit">Створити користувача</button>
            </form>
          </div>
        )}

        <table className="user-table">
          <thead>
            <tr>
              <th></th>
              <th>Ім'я користувача</th>
              <th>Роль</th>
              <th>Статус</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => handleSelectUser(user.id)}
                  />
                </td>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>{user.is_active ? 'Активний' : 'Неактивний'}</td>
                <td>
                  <button onClick={() => handleDeleteUser(user.id)}>Видалити</button>
                  {user.is_active ? (
                    <button onClick={() => handleDeactivateUser(user.id)}>Деактивувати</button>
                  ) : (
                    <button onClick={() => handleActivateUser(user.id)}>Активувати</button>
                  )}
                  {/* Add edit functionality here */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;
