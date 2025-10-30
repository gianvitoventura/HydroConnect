// src/Auth.js
import React, { useState } from 'react';
import { auth } from '../../firebaseConfig';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { createUserProfile } from '../../services/UserService';
import './Auth.css';

const Auth = ({ user, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Login con Email/Password
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let userCredential;
      
      if (isLogin) {
        // LOGIN
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        // REGISTRAZIONE
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      
      // ✅ NUOVO: Crea/aggiorna profilo in Firestore
      await createUserProfile(userCredential.user);
      
      onClose();
    } catch (error) {
      console.error('Errore autenticazione:', error);
      
      // Messaggi di errore in italiano
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('Email già registrata');
          break;
        case 'auth/invalid-email':
          setError('Email non valida');
          break;
        case 'auth/user-not-found':
          setError('Utente non trovato');
          break;
        case 'auth/wrong-password':
          setError('Password errata');
          break;
        case 'auth/weak-password':
          setError('Password troppo debole (minimo 6 caratteri)');
          break;
        default:
          setError('Errore durante l\'autenticazione');
      }
    } finally {
      setLoading(false);
    }
  };

  // Login con Google
  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // ✅ NUOVO: Crea/aggiorna profilo in Firestore
      await createUserProfile(result.user);
      
      onClose();
    } catch (error) {
      console.error('Errore Google login:', error);
      setError('Errore durante il login con Google');
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      onClose();
    } catch (error) {
      console.error('Errore logout:', error);
    }
  };

  // Se l'utente è già loggato
  if (user) {
    return (
      <div className="auth-modal">
        <div className="auth-container">
          <button className="close-btn" onClick={onClose}>×</button>
          
          <div className="user-info">
            <h2>👋 Ciao!</h2>
            <p className="user-email">{user.email}</p>
            <button className="logout-btn" onClick={handleLogout}>
              Esci
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form di login/registrazione
  return (
    <div className="auth-modal">
      <div className="auth-container">
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h2>{isLogin ? '🔓 Accedi' : '📝 Registrati'}</h2>
        <p className="auth-subtitle">
          {isLogin 
            ? 'Accedi per aggiungere progetti' 
            : 'Crea un account per contribuire'}
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleEmailAuth}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
          />

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? 'Caricamento...' : (isLogin ? 'Accedi' : 'Registrati')}
          </button>
        </form>

        <div className="divider">
          <span>oppure</span>
        </div>

        <button 
          className="google-btn" 
          onClick={handleGoogleAuth}
          disabled={loading}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
          Continua con Google
        </button>

        <p className="toggle-mode">
          {isLogin ? 'Non hai un account? ' : 'Hai già un account? '}
          <button 
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="link-btn"
          >
            {isLogin ? 'Registrati' : 'Accedi'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;