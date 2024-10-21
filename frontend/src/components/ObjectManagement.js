import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import AuthContext from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/ObjectManagement.css';

function ObjectManagement() {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [objects, setObjects] = useState([]);
  const [chambers, setChambers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredObjects, setFilteredObjects] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newObject, setNewObject] = useState({
    identifier: '',
    name: '',
    description: '',
    classification: '',
    threat_level: '',
    special_containment_procedures: '',
    storage_chamber_id: null,
  });
  const [editObjectId, setEditObjectId] = useState(null);
  const [editObjectData, setEditObjectData] = useState({});

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate('/login');
    } else {
      fetchObjects();
      fetchChambers();
    }
  }, [auth, navigate]);

  const fetchObjects = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8001/objects',
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      setObjects(response.data);
      setFilteredObjects(response.data);
    } catch (error) {
      console.error('Failed to fetch objects:', error);
      alert('Не вдалося завантажити список об\'єктів');
    }
  };

  const fetchChambers = async () => {
    try {
      const response = await axios.get('http://localhost:8001/storage-chambers', {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      setChambers(response.data);
    } catch (error) {
      console.error('Failed to fetch storage chambers:', error);
      alert('Не вдалося завантажити список камер зберігання');
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    const query = e.target.value.toLowerCase();
    const filtered = objects.filter(
      (obj) =>
        obj.name.toLowerCase().includes(query) ||
        obj.identifier.toLowerCase().includes(query) ||
        obj.classification.toLowerCase().includes(query)
    );
    setFilteredObjects(filtered);
  };

  // Add Object
  const handleAddChange = (e) => {
    setNewObject({ ...newObject, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        'http://localhost:8001/objects',
        newObject,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      alert('Об\'єкт успішно додано');
      setShowAddForm(false);
      setNewObject({
        identifier: '',
        name: '',
        description: '',
        classification: '',
        threat_level: '',
        special_containment_procedures: '',
        storage_chamber_id: null,
      });
      fetchObjects();
    } catch (error) {
      console.error('Failed to add object:', error);
      alert('Не вдалося додати об\'єкт');
    }
  };

  // Edit Object
  const handleEditClick = (obj) => {
    setEditObjectId(obj.id);
    setEditObjectData(obj);
  };

  const handleEditChange = (e) => {
    setEditObjectData({ ...editObjectData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:8001/objects/${editObjectId}`,
        editObjectData,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      alert('Об\'єкт успішно оновлено');
      setEditObjectId(null);
      setEditObjectData({});
      fetchObjects();
    } catch (error) {
      console.error('Failed to update object:', error);
      alert('Не вдалося оновити об\'єкт');
    }
  };

  // Delete Object
  const handleDeleteObject = async (objectId) => {
    if (window.confirm('Ви впевнені, що хочете видалити цей об\'єкт?')) {
      try {
        await axios.delete(`http://localhost:8001/objects/${objectId}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
        alert('Об\'єкт успішно видалено');
        fetchObjects();
      } catch (error) {
        console.error('Failed to delete object:', error);
        alert('Не вдалося видалити об\'єкт');
      }
    }
  };

  // Render
  return (
    <div className="object-management">
      <h2>Об'єкти</h2>
      <div className="object-actions">
        {auth.role === 'Administrative Personnel' && (
          <button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Сховати форму' : 'Додати новий об\'єкт'}
          </button>
        )}
        <input
          type="text"
          placeholder="Пошук об'єктів"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {showAddForm && auth.role === 'Administrative Personnel' && (
        <div className="add-object-form">
          <h3>Додати новий об'єкт</h3>
          <form onSubmit={handleAddSubmit}>
            <div>
              <label>Ідентифікатор:</label>
              <input
                type="text"
                name="identifier"
                value={newObject.identifier}
                onChange={handleAddChange}
                required
              />
            </div>
            <div>
              <label>Назва:</label>
              <input
                type="text"
                name="name"
                value={newObject.name}
                onChange={handleAddChange}
                required
              />
            </div>
            <div>
              <label>Опис:</label>
              <textarea
                name="description"
                value={newObject.description}
                onChange={handleAddChange}
              />
            </div>
            <div>
              <label>Класифікація:</label>
              <input
                type="text"
                name="classification"
                value={newObject.classification}
                onChange={handleAddChange}
                required
              />
            </div>
            <div>
              <label>Рівень загрози:</label>
              <input
                type="text"
                name="threat_level"
                value={newObject.threat_level}
                onChange={handleAddChange}
                required
              />
            </div>
            <div>
              <label>Спеціальні процедури утримання:</label>
              <textarea
                name="special_containment_procedures"
                value={newObject.special_containment_procedures}
                onChange={handleAddChange}
              />
            </div>
            <div>
              <label>Камера зберігання:</label>
              <select
                name="storage_chamber_id"
                value={newObject.storage_chamber_id || ''}
                onChange={handleAddChange}
              >
                <option value="">Не призначено</option>
                {chambers.map((chamber) => (
                  <option key={chamber.id} value={chamber.id}>
                    {chamber.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit">Додати об'єкт</button>
          </form>
        </div>
      )}

      <table className="object-table">
        <thead>
          <tr>
            <th>Ідентифікатор</th>
            <th>Назва</th>
            <th>Класифікація</th>
            <th>Рівень загрози</th>
            <th>Камера зберігання</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {filteredObjects.map((obj) => (
            <tr key={obj.id}>
              {editObjectId === obj.id ? (
                <>
                  <td>{obj.identifier}</td>
                  <td>
                    <input
                      type="text"
                      name="name"
                      value={editObjectData.name}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="classification"
                      value={editObjectData.classification}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="threat_level"
                      value={editObjectData.threat_level}
                      onChange={handleEditChange}
                    />
                  </td>
                  <td>
                    <select
                      name="storage_chamber_id"
                      value={editObjectData.storage_chamber_id || ''}
                      onChange={handleEditChange}
                    >
                      <option value="">Не призначено</option>
                      {chambers.map((chamber) => (
                        <option key={chamber.id} value={chamber.id}>
                          {chamber.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button onClick={handleEditSubmit}>Зберегти</button>
                    <button onClick={() => setEditObjectId(null)}>Скасувати</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{obj.identifier}</td>
                  <td>{obj.name}</td>
                  <td>{obj.classification}</td>
                  <td>{obj.threat_level}</td>
                  <td>{obj.storage_chamber ? obj.storage_chamber.name : 'Не призначено'}</td>
                  <td>
                    {auth.role === 'Administrative Personnel' && (
                      <>
                        <button onClick={() => handleEditClick(obj)}>Редагувати</button>
                        <button onClick={() => handleDeleteObject(obj.id)}>Видалити</button>
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

export default ObjectManagement;
