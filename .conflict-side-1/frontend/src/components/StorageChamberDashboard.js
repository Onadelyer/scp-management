import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import AuthContext from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/StorageChamberDashboard.css';

function StorageChamberDashboard() {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [chambers, setChambers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChambers, setFilteredChambers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChamber, setNewChamber] = useState({
    name: '',
    chamber_type: '',
    occupancy_status: 'Vacant',
    condition: 'Operational',
    location: '',
    capacity: 1,
    special_requirements: '',
  });
  const [editChamberId, setEditChamberId] = useState(null);
  const [editChamberData, setEditChamberData] = useState({});

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate('/login');
    } else {
      fetchChambers();
    }
  }, [auth, navigate]);

  const fetchChambers = async () => {
    try {
      const response = await axios.get('http://localhost:8001/storage-chambers', {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      setChambers(response.data);
      setFilteredChambers(response.data);
    } catch (error) {
      console.error('Failed to fetch storage chambers:', error);
      alert('Не вдалося завантажити список камер зберігання');
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    const query = e.target.value.toLowerCase();
    const filtered = chambers.filter(
      (chamber) =>
        chamber.name.toLowerCase().includes(query) ||
        chamber.chamber_type.toLowerCase().includes(query) ||
        chamber.location.toLowerCase().includes(query)
    );
    setFilteredChambers(filtered);
  };

  // Add Storage Chamber
  const handleAddChange = (e) => {
    setNewChamber({ ...newChamber, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:8001/storage-chambers',
        newChamber,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      alert('Камеру зберігання успішно додано');
      setShowAddForm(false);
      setNewChamber({
        name: '',
        chamber_type: '',
        occupancy_status: 'Vacant',
        condition: 'Operational',
        location: '',
        capacity: 1,
        special_requirements: '',
      });
      fetchChambers();
    } catch (error) {
      console.error('Failed to add storage chamber:', error);
      alert('Не вдалося додати камеру зберігання');
    }
  };

  // Edit Storage Chamber
  const handleEditClick = (chamber) => {
    setEditChamberId(chamber.id);
    setEditChamberData(chamber);
  };

  const handleEditChange = (e) => {
    setEditChamberData({ ...editChamberData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:8001/storage-chambers/${editChamberId}`,
        editChamberData,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      alert('Камеру зберігання успішно оновлено');
      setEditChamberId(null);
      setEditChamberData({});
      fetchChambers();
    } catch (error) {
      console.error('Failed to update storage chamber:', error);
      alert('Не вдалося оновити камеру зберігання');
    }
  };

  // Delete Storage Chamber
  const handleDeleteChamber = async (chamberId) => {
    if (window.confirm('Ви впевнені, що хочете видалити цю камеру зберігання?')) {
      try {
        await axios.delete(`http://localhost:8001/storage-chambers/${chamberId}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
        alert('Камеру зберігання успішно видалено');
        fetchChambers();
      } catch (error) {
        console.error('Failed to delete storage chamber:', error);
        alert('Не вдалося видалити камеру зберігання');
      }
    }
  };

  // Render
  return (
    <div className="chamber-dashboard">
      <h2>Камери зберігання</h2>
      <div className="chamber-actions">
        {auth.role === 'Administrative Personnel' && (
          <button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Сховати форму' : 'Додати нову камеру'}
          </button>
        )}
        <input
          type="text"
          placeholder="Пошук камер"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {showAddForm && auth.role === 'Administrative Personnel' && (
        <div className="add-chamber-form">
          <h3>Додати нову камеру зберігання</h3>
          <form onSubmit={handleAddSubmit}>
            {/* Add form fields for newChamber */}
            <div>
              <label>Назва:</label>
              <input
                type="text"
                name="name"
                value={newChamber.name}
                onChange={handleAddChange}
                required
              />
            </div>
            <div>
              <label>Тип камери:</label>
              <input
                type="text"
                name="chamber_type"
                value={newChamber.chamber_type}
                onChange={handleAddChange}
                required
              />
            </div>
            <div>
              <label>Розташування:</label>
              <input
                type="text"
                name="location"
                value={newChamber.location}
                onChange={handleAddChange}
                required
              />
            </div>
            <div>
              <label>Місткість:</label>
              <input
                type="number"
                name="capacity"
                value={newChamber.capacity}
                onChange={handleAddChange}
                required
              />
            </div>
            <div>
              <label>Спеціальні вимоги:</label>
              <input
                type="text"
                name="special_requirements"
                value={newChamber.special_requirements}
                onChange={handleAddChange}
              />
            </div>
            <button type="submit">Додати камеру</button>
          </form>
        </div>
      )}

      <table className="chamber-table">
        <thead>
          <tr>
            <th>Назва</th>
            <th>Тип</th>
            <th>Статус зайнятості</th>
            <th>Стан</th>
            <th>Розташування</th>
            <th>Місткість</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {filteredChambers.map((chamber) => (
            <tr key={chamber.id}>
              {editChamberId === chamber.id ? (
                <>
                  <td>
                    <input
                      type="text"
                      name="name"
                      value={editChamberData.name}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="chamber_type"
                      value={editChamberData.chamber_type}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <select
                      name="occupancy_status"
                      value={editChamberData.occupancy_status}
                      onChange={handleEditChange}
                    >
                      <option value="Occupied">Зайнята</option>
                      <option value="Partially Occupied">Частково зайнята</option>
                      <option value="Vacant">Вільна</option>
                    </select>
                  </td>
                  <td>
                    <select
                      name="condition"
                      value={editChamberData.condition}
                      onChange={handleEditChange}
                    >
                      <option value="Operational">Робочий стан</option>
                      <option value="Under Maintenance">Підтримка</option>
                      <option value="Needs Repair">Потребує ремонту</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      name="location"
                      value={editChamberData.location}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="capacity"
                      value={editChamberData.capacity}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <button onClick={handleEditSubmit}>Зберегти</button>
                    <button onClick={() => setEditChamberId(null)}>Скасувати</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{chamber.name}</td>
                  <td>{chamber.chamber_type}</td>
                  <td>{chamber.occupancy_status}</td>
                  <td>{chamber.condition}</td>
                  <td>{chamber.location}</td>
                  <td>{chamber.capacity}</td>
                  <td>
                    {auth.role === 'Administrative Personnel' && (
                      <>
                        <button onClick={() => handleEditClick(chamber)}>Редагувати</button>
                        <button onClick={() => handleDeleteChamber(chamber.id)}>Видалити</button>
                      </>
                    )}
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StorageChamberDashboard;
