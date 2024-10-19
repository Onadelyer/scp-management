import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import UserManagement from './components/UserManagement'; // Import the new component
import AuthContext from './AuthContext';
import UserProfile from './components/UserProfile';
import './styles/App.css';

function App() {
  const { auth } = useContext(AuthContext);

  return (
    <Router>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Protected route for User Management */}
          {auth.isAuthenticated && auth.role === 'Administrative Personnel' && (
            <Route path="/user-management" element={<UserManagement />} />
          )}
          {auth.isAuthenticated && (
            <Route path="/profile" element={<UserProfile />} />
          )}
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
