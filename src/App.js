import React, { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import MapPage from './pages/MapPage';
import HistoricalDetailPage from './pages/HistoricalDetailPage';
import ModelsPage from './pages/ModelsPage';
import BIMViewerPage from './pages/BIMViewerPage';
import PanoramaApp from './components/virtualtour/PanoramaApp';
import CommunityPage from './pages/CommunityPage';
import KidsPage from './pages/KidsPage';
import LoginPage from './pages/LoginPage';
import PendingApproval from './components/PendingApproval';
import './styles/App.css';
import logo from "./styles/logo/HYDROC.png";

// Pagine accessibili senza login né approvazione
const PUBLIC_PAGES = ['home', 'login'];

function Header({ setCurrentPage, currentPage, user, isApproved }) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState('');
  const [popupStyle, setPopupStyle] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const handleButtonClick = (page) => {
    setCurrentPage({ page });
    setMobileMenuOpen(false);
  };

  const handleMouseEnter = (text, e) => {
    if (isMobile) return;

    const rect = e.target.getBoundingClientRect();
    setPopupText(text);
    setPopupStyle({
      top: rect.bottom + 10 + 'px',
      left: rect.left + (rect.width / 2) - 50 + 'px',
    });
    setShowPopup(true);
  };

  const handleMouseLeave = () => {
    setShowPopup(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header>
      <nav className="container">
        <span
          className="logo"
          onClick={() => setCurrentPage({ page: 'home' })}
        >
          <img src={logo} alt="Overlay" className="overlay-image" />
        </span>

        {isMobile && (
          <button
            className="hamburger-menu"
            onClick={toggleMobileMenu}
            aria-label="Menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        )}

        <div className={`nav-links ${isMobile ? 'mobile' : ''} ${mobileMenuOpen ? 'open' : ''}`}>
          {/* Mostra le pagine protette solo se l'utente è approvato */}
          {isApproved && (
            <>
              <div className="nav-buttons">
                <button
                  onClick={() => handleButtonClick('map')}
                  onMouseEnter={(e) => handleMouseEnter('Conosci il territorio e il parco idroelettrico', e)}
                  onMouseLeave={handleMouseLeave}
                >
                  Map
                </button>
              </div>
              <div className="nav-buttons">
                <button
                  onClick={() => handleButtonClick('Community-Hub')}
                  onMouseEnter={(e) => handleMouseEnter('Partecipa a progetti per la sostenibilità del territorio', e)}
                  onMouseLeave={handleMouseLeave}
                >
                  Community Hub
                </button>
              </div>
              <div className="nav-buttons">
                <button
                  onClick={() => handleButtonClick('Kids')}
                  onMouseEnter={(e) => handleMouseEnter('Diventa un piccolo ingegnere', e)}
                  onMouseLeave={handleMouseLeave}
                >
                  Kids
                </button>
              </div>
            </>
          )}

          <div className="nav-buttons">
            <button
              onClick={() => handleButtonClick('login')}
              onMouseEnter={(e) => handleMouseEnter(user ? 'Gestisci il tuo account' : 'Accedi o registrati', e)}
              onMouseLeave={handleMouseLeave}
              className={user ? 'logged-in' : ''}
            >
              {user ? 'Logout' : 'Login'}
            </button>
          </div>
        </div>

        {showPopup && (
          <div className="popup" style={popupStyle}>
            {popupText}
          </div>
        )}
      </nav>
    </header>
  );
}

function HomePage({ setCurrentPage, user, isApproved }) {
  const [videoError, setVideoError] = useState(false);

  const renderSubtitle = () => {
    // Caso 1: Utente approvato - link interattivi
    if (user && isApproved) {
      return (
        <>
          <span className="clickable-word" onClick={() => setCurrentPage({ page: 'map' })}>Conosci</span> il territorio,
          esplora il parco idroelettrico e <span className="clickable-word" onClick={() => setCurrentPage({ page: 'Community-Hub' })}>partecipa</span> alle decisioni per un futuro sostenibile.
        </>
      );
    }

    // Caso 2: Utente loggato ma non ancora approvato
    if (user && !isApproved) {
      return (
        <>
          Conosci il territorio, esplora il parco idroelettrico e partecipa alle decisioni per un futuro sostenibile.
          <br /><br />
          <span style={{ fontStyle: 'italic', opacity: 0.9 }}>
            ⏳ Il tuo account è in attesa di approvazione dall'amministratore.
          </span>
        </>
      );
    }

    // Caso 3: Non loggato
    return (
      <>
        Conosci il territorio, esplora il parco idroelettrico e partecipa alle decisioni per un futuro sostenibile.
      </>
    );
  };

  return (
    <div className="home-content">
      {!videoError && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="background-video"
          onError={() => setVideoError(true)}
        >
          <source src={require('./styles/logo/Calcinere.mp4')} type="video/mp4" />
        </video>
      )}
      <div className="home-content-overlay">
        <h1>Resilience Models</h1>
        <p>
          {renderSubtitle()}
        </p>
      </div>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState({
    page: 'home',
    plantId: null,
    viewMode: null
  });
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [approvalChecking, setApprovalChecking] = useState(false);

  // Listener Firebase Auth + check approvazione
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        // Verifica se l'utente è nella collection approvedUsers
        setApprovalChecking(true);
        try {
          const approvedDoc = await getDoc(doc(db, 'approvedUsers', currentUser.uid));
          setIsApproved(approvedDoc.exists());
        } catch (error) {
          console.error('Errore verifica approvazione:', error);
          setIsApproved(false);
        } finally {
          setApprovalChecking(false);
        }
      } else {
        setIsApproved(false);
      }

      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderPage = () => {
    // Loader durante il check iniziale
    if (authLoading || approvalChecking) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 120px)'
        }}>
          <p>Caricamento...</p>
        </div>
      );
    }

    const isPublicPage = PUBLIC_PAGES.includes(currentPage.page);

    // Se la pagina richiede login e l'utente non è autenticato → vai al login
    if (!isPublicPage && !user) {
      return <LoginPage user={user} setCurrentPage={setCurrentPage} />;
    }

    // Se l'utente è loggato ma non approvato e prova ad accedere a pagine protette
    if (!isPublicPage && user && !isApproved) {
      return <PendingApproval user={user} setCurrentPage={setCurrentPage} />;
    }

    switch (currentPage.page) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} user={user} isApproved={isApproved} />;
      case 'map':
        return <MapPage setCurrentPage={setCurrentPage} />;
      case 'historical':
        return <HistoricalDetailPage
          plantId={currentPage.plantId}
          setCurrentPage={setCurrentPage}
        />;
      case 'models':
        return <ModelsPage
          setCurrentPage={setCurrentPage}
          plantId={currentPage.plantId}
        />;
      case '360':
        return <PanoramaApp
          setCurrentPage={setCurrentPage}
          plantId={currentPage.plantId}
        />;
      case 'bim':
        return <BIMViewerPage
          plantId={currentPage.plantId}
          setCurrentPage={setCurrentPage}
        />;
      case 'Community-Hub':
        return <CommunityPage />;
      case 'Kids':
        return <KidsPage />;
      case 'login':
        return <LoginPage user={user} setCurrentPage={setCurrentPage} />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} user={user} isApproved={isApproved} />;
    }
  };

  return (
    <div className="App">
      <Header
        setCurrentPage={setCurrentPage}
        currentPage={currentPage}
        user={user}
        isApproved={isApproved}
      />
      <main>
        {renderPage()}
      </main>
      <footer>
        <div className="footer-content">
          © 2025 <a href="http://www.drawingtothefuture.polito.it/" target="_blank" rel="noopener noreferrer">drawingTOthefuture</a>
        </div>
      </footer>
    </div>
  );
}

export default App;