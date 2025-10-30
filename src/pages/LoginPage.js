// src/pages/LoginPage.js
import React from 'react';
import Auth from '../components/community/Auth';
import '../styles/LoginPage.css';

const LoginPage = ({ user, setCurrentPage }) => {
  const handleClose = () => {
    // Torna alla home dopo login/logout
    setCurrentPage({ page: 'home' });
  };

  return (
    <div className="login-page">
      <div className="login-page-content">
        <Auth user={user} onClose={handleClose} />
      </div>
    </div>
  );
};

export default LoginPage;