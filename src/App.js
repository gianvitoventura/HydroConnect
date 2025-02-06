import React, { useState } from 'react';
import MapPage from './pages/MapPage';
import HistoricalDetailPage from './pages/HistoricalDetailPage';
import ModelsPage from './pages/ModelsPage';
import BIMViewerPage from './pages/BIMViewerPage';
import TourPage from './pages/TourPage';
import CommunityPage from './pages/CommunityPage';
import KidsPage from './pages/KidsPage';
import './styles/App.css';
import logo from "./styles/logo/HYDROC.png";

function Header({ setCurrentPage, currentPage }) {
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState('');
  const [popupStyle, setPopupStyle] = useState({});

  const handleButtonClick = (page) => {
    setCurrentPage({ page });
  };

  const handleMouseEnter = (text, e) => {
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

  return (
    <header>
      <nav className="container">
        <span 
          className="logo" 
          onClick={() => setCurrentPage({ page: 'home' })}
        >
          <img src={logo} alt="Overlay" className="overlay-image" />
        </span>
        <div className="nav-buttons">
          <button
            onClick={() => handleButtonClick('map')}
            onMouseEnter={(e) => handleMouseEnter('Explore hydropower park and the surrounding', e)}
            onMouseLeave={handleMouseLeave}
          >
            Map
          </button>
          </div>
        <div className="nav-buttons">
          <button
            onClick={() => handleButtonClick('models')}
            onMouseEnter={(e) => handleMouseEnter('Navigate 3D infrastructure models', e)}
            onMouseLeave={handleMouseLeave}
          >
            Models
          </button>
          </div>
        <div className="nav-buttons">
          <button
            onClick={() => handleButtonClick('Community-Hub')}
            onMouseEnter={(e) => handleMouseEnter('Take part in resilient and sustainable projects', e)}
            onMouseLeave={handleMouseLeave}
          >
            Community-Hub
          </button>
          </div>
          <div className="nav-buttons">
          <button
            onClick={() => handleButtonClick('Kids')}
            onMouseEnter={(e) => handleMouseEnter('Become a little scientist', e)}
            onMouseLeave={handleMouseLeave}
          >
            Kids
          </button>
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

function HomePage() {
  return (
    <div className="home-content">
      <div>
        <h1>Welcome.</h1>
        <p>
          Explore the hydropower park and take part in the activities for sustainable and resilient development
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
        return <HomePage />;
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
        return <TourPage 
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
        return <HomePage />;
        
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
          © 2024 <a href="https://www.siedenergia.it/" target="_blank" rel="noopener noreferrer">SIED</a> and <a href="http://www.drawingtothefuture.polito.it/" target="_blank" rel="noopener noreferrer">drawingTOthefuture</a>. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;