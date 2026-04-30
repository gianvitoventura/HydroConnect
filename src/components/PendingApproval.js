import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const PendingApproval = ({ user, setCurrentPage }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentPage({ page: 'home' });
    } catch (error) {
      console.error('Errore logout:', error);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>⏳</div>
        <h1 style={styles.title}>Account in attesa di approvazione</h1>
        <p style={styles.message}>
          Il tuo account è stato registrato correttamente, ma deve essere
          approvato dall'amministratore prima di poter accedere a tutte le
          funzionalità della piattaforma.
        </p>

        <div style={styles.userInfo}>
          <span style={styles.label}>Account:</span>
          <span style={styles.email}>{user?.email}</span>
        </div>

        <p style={styles.hint}>
          Riceverai una conferma quando il tuo account sarà attivato.
          Per ulteriori informazioni contatta il team di progetto.
        </p>

        <div style={styles.buttons}>
          <button
            style={styles.primaryButton}
            onClick={() => setCurrentPage({ page: 'home' })}
          >
            Torna alla Home
          </button>
          <button
            style={styles.secondaryButton}
            onClick={handleLogout}
          >
            Esci
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: 'calc(100vh - 200px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '48px 36px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
  },
  icon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '26px',
    fontWeight: '700',
    margin: '0 0 16px 0',
    color: '#1e3a8a',
  },
  message: {
    fontSize: '15px',
    color: '#4b5563',
    lineHeight: '1.6',
    margin: '0 0 24px 0',
  },
  userInfo: {
    background: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '8px',
    padding: '12px 16px',
    margin: '0 0 24px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: '12px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600',
  },
  email: {
    fontSize: '15px',
    color: '#1e3a8a',
    fontWeight: '500',
    wordBreak: 'break-all',
  },
  hint: {
    fontSize: '13px',
    color: '#6b7280',
    fontStyle: 'italic',
    margin: '0 0 28px 0',
    lineHeight: '1.5',
  },
  buttons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  primaryButton: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #0891b2 100%)',
    color: 'white',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  secondaryButton: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: '2px solid #e5e7eb',
    background: 'white',
    color: '#4b5563',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};

export default PendingApproval;