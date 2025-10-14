import React, { useState, useEffect } from 'react';
import MapPage from './pages/MapPage';
import HistoricalDetailPage from './pages/HistoricalDetailPage';
import ModelsPage from './pages/ModelsPage';
import BIMViewerPage from './pages/BIMViewerPage';
import PanoramaApp from './components/virtualtour/PanoramaApp';
import CommunityPage from './pages/CommunityPage';
import KidsPage from './pages/KidsPage';
import './styles/App.css';
import logo from "./styles/logo/HYDROC.png";

function Header({ setCurrentPage, currentPage }) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState('');
  const [popupStyle, setPopupStyle] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Controlla se il display è mobile
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
    setMobileMenuOpen(false); // Chiudi il menu dopo aver cliccato
  };

  const handleMouseEnter = (text, e) => {
    if (isMobile) return; // Non mostrare popup su mobile
    
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
        
        {/* Hamburger menu button - mostrato solo su mobile */}
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
        
        {/* Navigation buttons - nascosti su mobile a meno che il menu non sia aperto */}
        <div className={`nav-links ${isMobile ? 'mobile' : ''} ${mobileMenuOpen ? 'open' : ''}`}>
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
              onClick={() => handleButtonClick('models')}
              onMouseEnter={(e) => handleMouseEnter('Esplora le centrali e naviga i modelli 3D', e)}
              onMouseLeave={handleMouseLeave}
            >
              Tour
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

function HomePage({ setCurrentPage }) {
  const [videoError, setVideoError] = useState(false);

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
          {/* Fallback per browser che non supportano video */}
        </video>
      )}
      <div className="home-content-overlay">
        <h1>Benvenuto</h1>
        <p>
          <span className="clickable-word" onClick={() => setCurrentPage({ page: 'map' })}>Conosci</span> il territorio, <span className="clickable-word" onClick={() => setCurrentPage({ page: 'models' })}>esplora</span> il parco idroelettrico e <span className="clickable-word" onClick={() => setCurrentPage({ page: 'Community-Hub' })}>partecipa</span> alle decisioni per un futuro sostenibile.
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

  const renderPage = () => {
    switch(currentPage.page) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
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
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;        
    }
  };

  return (
    <div className="App">
      <Header setCurrentPage={setCurrentPage} currentPage={currentPage} />
      <main>
        {renderPage()}
      </main>
      <footer>
        <div className="footer-content">
          © 2025 <a href="http://www.drawingtothefuture.polito.it/" target="_blank" rel="noopener noreferrer">drawingTOthefuture</a> 
          {/* All rights reserved. */}
        </div>
      </footer>
    </div>
  );
}

export default App;