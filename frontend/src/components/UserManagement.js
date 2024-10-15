import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../AuthContext';

function UserManagement() {
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isAuthenticated || auth.role !== 'Administrative Personnel') {
      // Redirect to home page if not authorized
      navigate('/');
    }
  }, [auth, navigate]);

  return (
    <div>
      <h2>User Management</h2>
      <p>This page will be used to add new users.</p>
      {/* Future functionality for adding users will go here */}
    </div>
  );
}

export default UserManagement;
