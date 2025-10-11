import React, { useState, useRef } from 'react';
import { Download, Camera, Share2 } from 'lucide-react';
import '../../styles/KidsModules.css';

const BadgeCertificate = ({ badge, moduleId, onContinue }) => {
  const [studentName, setStudentName] = useState('');
  const [nameEntered, setNameEntered] = useState(false);
  const certificateRef = useRef(null);
  
  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (studentName.trim()) {
      setNameEntered(true);
    }
  };
  
  const handlePrint = () => {
    const certificateContent = certificateRef.current;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Il Tuo Badge - ${badge.name}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              color: #333;
              margin: 0;
              padding: 20px;
            }
            .certificate-container {
              border: 10px solid #6366f1;
              border-radius: 10px;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
              text-align: center;
              background: #fff;
            }
            .certificate-header {
              margin-bottom: 20px;
            }
            .certificate-title {
              font-size: 32px;
              color: #4f46e5;
              margin-bottom: 10px;
            }
            .certificate-subtitle {
              font-size: 18px;
              color: #6b7280;
            }
            .certificate-badge {
              margin: 20px 0;
              font-size: 100px;
              color: #eab308;
            }
            .certificate-name {
              font-size: 28px;
              font-weight: bold;
              margin: 20px 0;
              color: #1f2937;
              border-bottom: 2px solid #6366f1;
              display: inline-block;
              padding-bottom: 5px;
            }
            .certificate-text {
              font-size: 18px;
              line-height: 1.6;
              margin: 20px 0;
            }
            .certificate-date {
              font-size: 16px;
              color: #6b7280;
              margin-top: 30px;
            }
            .certificate-footer {
              margin-top: 30px;
              font-size: 14px;
              color: #9ca3af;
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            ${certificateContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };
  
  const handleScreenshot = () => {
    // In una implementazione reale, qui utilizzeremmo una libreria come html2canvas
    // per catturare uno screenshot del certificato
    alert('Funzionalità di screenshot non implementata in questa demo. Usa la funzione di stampa per salvare il certificato.');
  };
  
  const handleShare = () => {
    // In una implementazione reale, qui implementeremmo la condivisione
    // usando l'API Web Share se disponibile
    if (navigator.share) {
      navigator.share({
        title: `Badge ${badge.name}`,
        text: `Ho ottenuto il badge ${badge.name} nell'app educativa SIED!`,
      }).catch(console.error);
    } else {
      alert('La funzionalità di condivisione non è supportata dal tuo browser.');
    }
  };
  
  const getBadgeEmoji = () => {
    switch(moduleId) {
      case 'water-cycle': return '💧';
      case 'hydro-power': return '⚡';
      case 'clean-energy': return '🌿';
      default: return '🏆';
    }
  };
  
  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  
  return (
    <div className="badge-certificate-container">
      {!nameEntered ? (
        <div className="name-form-container">
          <h2>Congratulazioni!</h2>
          <p>Hai guadagnato il badge <strong>{badge.name}</strong>!</p>
          <p>Inserisci il tuo nome per creare il tuo certificato:</p>
          
          <form onSubmit={handleNameSubmit} className="name-form">
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Il tuo nome"
              className="name-input"
              required
            />
            <button type="submit" className="name-submit">
              Crea il mio certificato
            </button>
          </form>
        </div>
      ) : (
        <>
          <div className="certificate" ref={certificateRef}>
            <div className="certificate-header">
              <h1 className="certificate-title">Certificato di Merito</h1>
              <p className="certificate-subtitle">SIED - Educazione sull'Energia Idroelettrica</p>
            </div>
            
            <div className="certificate-badge">
              {getBadgeEmoji()}
            </div>
            
            <div className="certificate-content">
              <p className="certificate-text">
                Questo certifica che
              </p>
              <div className="certificate-name">
                {studentName}
              </div>
              <p className="certificate-text">
                ha completato con successo il modulo<br />
                <strong>"{badge.name}"</strong><br />
                e ha dimostrato conoscenza e comprensione dell'argomento.
              </p>
              <p className="certificate-description">
                {badge.description}
              </p>
            </div>
            
            <div className="certificate-date">
              Data: {getCurrentDate()}
            </div>
            
            <div className="certificate-footer">
              SIED - Imparare l'energia idroelettrica divertendosi
            </div>
          </div>
          
          <div className="certificate-actions">
            <button className="action-button print" onClick={handlePrint}>
              <Download />
              <span>Scarica</span>
            </button>
            <button className="action-button screenshot" onClick={handleScreenshot}>
              <Camera />
              <span>Screenshot</span>
            </button>
            <button className="action-button share" onClick={handleShare}>
              <Share2 />
              <span>Condividi</span>
            </button>
            <button className="action-button continue" onClick={onContinue}>
              <span>Continua ad esplorare</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BadgeCertificate;