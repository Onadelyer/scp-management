import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../AuthContext';
import '../styles/StorageChamberDetails.css';

function StorageChamberDetails() {
  const { id } = useParams();
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [chamber, setChamber] = useState(null);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate('/login');
    } else {
      fetchChamberDetails();
    }
  }, [auth, navigate]);

  const fetchChamberDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8001/storage-chambers/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      setChamber(response.data);
    } catch (error) {
      console.error('Failed to fetch chamber details:', error);
      alert('Не вдалося завантажити деталі камери зберігання');
    }
  };

  if (!chamber) {
    return <div>Завантаження...</div>;
  }

  return (
    <div className="chamber-details">
      <h2>Деталі Камери Зберігання: {chamber.name}</h2>
      <div className="chamber-info">
        <p><strong>Тип:</strong> {chamber.chamber_type}</p>
        <p><strong>Статус зайнятості:</strong> {chamber.occupancy_status}</p>
        <p><strong>Стан:</strong> {chamber.condition}</p>
        <p><strong>Розташування:</strong> {chamber.location}</p>
        <p><strong>Місткість:</strong> {chamber.capacity}</p>
        <p><strong>Спеціальні вимоги:</strong> {chamber.special_requirements || 'Немає'}</p>
      </div>
      <h3>Об'єкти в цій камері:</h3>
      {chamber.objects.length > 0 ? (
        <table className="object-table">
          <thead>
            <tr>
              <th>Ідентифікатор</th>
              <th>Назва</th>
              <th>Класифікація</th>
              <th>Рівень загрози</th>
              <th>Деталі</th>
            </tr>
          </thead>
          <tbody>
            {chamber.objects.map((obj) => (
              <tr key={obj.id}>
                <td>{obj.identifier}</td>
                <td>{obj.name}</td>
                <td>{obj.classification}</td>
                <td>{obj.threat_level}</td>
                <td>
                  {/* Optional: Link to object details if you have such a component */}
                  {/* <Link to={`/objects/${obj.id}`}>Переглянути</Link> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>У цій камері немає об'єктів.</p>
      )}
      <button onClick={() => navigate(-1)}>Повернутися</button>
    </div>
  );
}

export default StorageChamberDetails;
