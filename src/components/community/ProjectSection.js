import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, BarChart3, X, ChevronLeft, ChevronRight, Upload, Loader } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';
import './ProjectSection.css';

// Firebase imports
import { db, storage, auth } from '../../firebaseConfig';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';

// Componente Auth
import Auth from './Auth';

// === DATI PROGETTI PREDEFINITI ===
const PROJECTS = [
  {
    id: 1,
    name: "Adeguamento sentieristica e piste ciclabili",
    shortName: "Adeguamento della sentieristica",
    description: "Il progetto si focalizza sul potenziamento della mobilità lenta e sulla valorizzazione ambientale attraverso la manutenzione e il miglioramento dei sentieri esistenti e la creazione di nuovi percorsi escursionistici e piste ciclabili.",
    image: "/images/design/idee/Percorsi escursionistici.png",
    scores: {
      technical: { reliability: 5, complexity: 4, innovation: 1 },
      economic: { investment: 3, management: 4, avoidedCosts: 2 },
      social: { employment: 3, accessibility: 5, community: 5 },
      environmental: { biodiversity: 3, landscape: 4, co2: 5 }
    },
    isPredefined: true
  },
  {
    id: 2,
    name: "Musealizzazione dell'impianto",
    shortName: "Musealizzazione della centrale",
    description: "Il progetto mira alla musealizzazione di una centrale idroelettrica attraverso il restauro degli spazi interni e la valorizzazione di macchinari storici, creando percorsi espositivi interattivi e multimediali.",
    image: "/images/design/idee/Musealizzazione impianto.png",
    scores: {
      technical: { reliability: 3, complexity: 4, innovation: 3 },
      economic: { investment: 5, management: 5, avoidedCosts: 1 },
      social: { employment: 4, accessibility: 5, community: 4 },
      environmental: { biodiversity: 3, landscape: 3, co2: 3 }
    },
    isPredefined: true
  },
  {
    id: 3,
    name: "Manutenzione e valorizzazione dei bacini",
    shortName: "Valorizzazione del bacino",
    description: "Il progetto mira alla riqualificazione del bacino idrico della centrale attraverso la rimozione dei sedimenti per migliorarne l'efficienza idraulica e la creazione di un'area attrezzata per attività sportive.",
    image: "/images/design/idee/Valorizzazione bacino.png",
    scores: {
      technical: { reliability: 4, complexity: 2, innovation: 3 },
      economic: { investment: 3, management: 4, avoidedCosts: 3 },
      social: { employment: 3, accessibility: 3, community: 4 },
      environmental: { biodiversity: 5, landscape: 4, co2: 4 }
    },
    isPredefined: true
  },
  {
    id: 4,
    name: "Stazioni di co-working",
    shortName: "Co-working",
    description: "Il progetto prevede la creazione di postazioni di co-working in aree attualmente inutilizzate della struttura per rispondere alla crescente domanda di modelli di lavoro flessibili.",
    image: "/images/design/idee/Stazione co-working.png",
    scores: {
      technical: { reliability: 3, complexity: 5, innovation: 4 },
      economic: { investment: 5, management: 3, avoidedCosts: 1 },
      social: { employment: 5, accessibility: 4, community: 4 },
      environmental: { biodiversity: 1, landscape: 3, co2: 3 }
    },
    isPredefined: true
  },
  {
    id: 5,
    name: "Connettività fibra ottica",
    shortName: "Implementazione connettività",
    description: "L'intervento specifico riguarda l'implementazione e l'integrazione della connettività veloce, estendendo la copertura alle frazioni e ai nuclei abitativi che risultano sprovvisti di connessione digitale.",
    image: "/images/design/idee/Connettività zone interne.png",
    scores: {
      technical: { reliability: 4, complexity: 2, innovation: 5 },
      economic: { investment: 2, management: 5, avoidedCosts: 2 },
      social: { employment: 1, accessibility: 4, community: 2 },
      environmental: { biodiversity: 2, landscape: 3, co2: 4 }
    },
    isPredefined: true
  },
  {
    id: 6,
    name: "Elettrificazione mobilità",
    shortName: "Elettrificazione della valle",
    description: "Per incentivare il turismo lento e responsabile, il progetto include l'installazione di stazioni di ricarica per e-bike e altri mezzi di mobilità leggera.",
    image: "/images/design/idee/Elettrificazione mobilità.png",
    scores: {
      technical: { reliability: 4, complexity: 3, innovation: 4 },
      economic: { investment: 4, management: 3, avoidedCosts: 2 },
      social: { employment: 2, accessibility: 4, community: 3 },
      environmental: { biodiversity: 4, landscape: 3, co2: 5 }
    },
    isPredefined: true
  },
  {
    id: 7,
    name: "Rischio idrogeologico",
    shortName: "Interventi di mitigazione del rischio",
    description: "Il progetto mira alla mitigazione del rischio idrogeologico e stabilizzazione dei versanti, integrando sicurezza territoriale e valorizzazione della centrale.",
    image: "/images/design/idee/Mitigazione del rischio idrogeologico.png",
    scores: {
      technical: { reliability: 5, complexity: 1, innovation: 1 },
      economic: { investment: 1, management: 1, avoidedCosts: 5 },
      social: { employment: 2, accessibility: 1, community: 5 },
      environmental: { biodiversity: 4, landscape: 5, co2: 4 }
    },
    isPredefined: true
  },
  {
    id: 8,
    name: "Sistema ecomuseale",
    shortName: "Ecomuseo della Valle Po",
    description: "L'iniziativa prevede l'integrazione del Sistema Ecomuseale del Monviso valorizzando il patrimonio storico delle macchine ad acqua dell'alta Valle Po.",
    image: "/images/design/idee/Ecomuseo della valle.png",
    scores: {
      technical: { reliability: 3, complexity: 3, innovation: 2 },
      economic: { investment: 3, management: 1, avoidedCosts: 1 },
      social: { employment: 4, accessibility: 5, community: 5 },
      environmental: { biodiversity: 2, landscape: 4, co2: 3 }
    },
    isPredefined: true
  }
];

const CATEGORIES = {
  technical: { label: 'Tecnico', color: '#20a9cbff' },
  economic: { label: 'Economico', color: '#c2b32aff' },
  social: { label: 'Sociale', color: '#942d2dff' },
  environmental: { label: 'Ambientale', color: '#2d9a60ff' }
};

const getProjectColor = (index) => {
  const colors = [
    '#2563eb', '#d97706', '#059669', '#dc2626', 
    '#bded3aff', '#0891b2', '#ea580c', '#65a30d'
  ];
  return colors[index % colors.length];
};

// === UTILITY: Comprimi immagine ===
const compressImage = (file, maxSizeMB = 2) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const maxDimension = 1920;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height / width) * maxDimension;
            width = maxDimension;
          } else {
            width = (width / height) * maxDimension;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }));
          },
          'image/jpeg',
          0.8
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

// === COMPONENTE MODAL IMMAGINI ===
const ImageModal = ({ isOpen, currentIndex, onClose, onNavigate, allProjects }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate('prev');
      if (e.key === 'ArrowRight') onNavigate('next');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNavigate]);

  if (!isOpen) return null;
  const currentProject = allProjects[currentIndex];

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Chiudi">
          <X size={24} />
        </button>
        <button className="modal-nav-btn modal-nav-prev" onClick={() => onNavigate('prev')} aria-label="Immagine precedente">
          <ChevronLeft size={32} />
        </button>
        <div className="modal-image-container">
          <img src={currentProject.image} alt={currentProject.name} className="modal-image" />
          <div className="modal-image-caption">
            <h3>{currentProject.shortName}</h3>
            <p>{currentProject.description}</p>
          </div>
        </div>
        <button className="modal-nav-btn modal-nav-next" onClick={() => onNavigate('next')} aria-label="Immagine successiva">
          <ChevronRight size={32} />
        </button>
        <div className="modal-dots">
          {allProjects.map((_, index) => (
            <button
              key={index}
              className={`modal-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => onNavigate('goto', index)}
              aria-label={`Vai all'immagine ${index + 1}`}
            />
          ))}
        </div>
        <div className="modal-counter">
          {currentIndex + 1} / {allProjects.length}
        </div>
      </div>
    </div>
  );
};

// === COMPONENTE MODAL AGGIUNTA PROGETTO ===
const AddProjectModal = ({ isOpen, onClose, onSave, user }) => {
  const [formData, setFormData] = useState({
    shortName: '',
    description: '',
    image: null,
    scores: {
      technical: { reliability: 3, complexity: 3, innovation: 3 },
      economic: { investment: 3, management: 3, avoidedCosts: 3 },
      social: { employment: 3, accessibility: 3, community: 3 },
      environmental: { biodiversity: 3, landscape: 3, co2: 3 }
    }
  });

  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleScoreChange = (category, subcategory, value) => {
    setFormData(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [category]: {
          ...prev.scores[category],
          [subcategory]: parseInt(value)
        }
      }
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'immagine è troppo grande. Massimo 5MB.');
        return;
      }

      try {
        setUploading(true);
        const compressedFile = await compressImage(file);
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, image: compressedFile }));
          setImagePreview(reader.result);
          setUploading(false);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Errore compressione:', error);
        alert('Errore nel caricamento dell\'immagine');
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.shortName || !formData.description || !formData.image) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    if (!user) {
      alert('Devi essere loggato per creare un progetto');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // 1. Upload immagine su Firebase Storage
      const timestamp = Date.now();
      const imageRef = ref(storage, `projects/${timestamp}_${formData.image.name}`);
      
      await uploadBytes(imageRef, formData.image);
      setUploadProgress(75);

      // 2. Ottieni URL pubblico
      const imageUrl = await getDownloadURL(imageRef);
      setUploadProgress(90);

      // 3. Salva progetto su Firestore
      const newProject = {
        name: formData.shortName,
        shortName: formData.shortName,
        description: formData.description,
        image: imageUrl,
        scores: formData.scores,
        isPredefined: false,
        createdBy: user.uid,
        createdByEmail: user.email,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'projects'), newProject);
      setUploadProgress(100);

      newProject.id = docRef.id;
      onSave(newProject);
      
      // Reset form
      setFormData({
        shortName: '',
        description: '',
        image: null,
        scores: {
          technical: { reliability: 3, complexity: 3, innovation: 3 },
          economic: { investment: 3, management: 3, avoidedCosts: 3 },
          social: { employment: 3, accessibility: 3, community: 3 },
          environmental: { biodiversity: 3, landscape: 3, co2: 3 }
        }
      });
      setImagePreview('');
      setUploading(false);
      setUploadProgress(0);
      
    } catch (error) {
      console.error('Errore salvataggio progetto:', error);
      alert('Errore nel salvataggio del progetto. Riprova.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (!isOpen) return null;

  const scoreLabels = {
    technical: ['Affidabilità', 'Complessità', 'Innovazione'],
    economic: ['Investimento', 'Gestione', 'Costi Evitati'],
    social: ['Occupazione', 'Accessibilità', 'Comunità'],
    environmental: ['Biodiversità', 'Paesaggio', 'CO2']
  };

  const scoreDescriptions = {
    technical: {
      reliability: 'Quanto è affidabile e sicura la tecnologia utilizzata?',
      complexity: 'Quanto è complessa la realizzazione e gestione del progetto?',
      innovation: 'Quanto è innovativo e all\'avanguardia il progetto?'
    },
    economic: {
      investment: 'Quanto investimento economico iniziale richiede?',
      management: 'Quanto costa la gestione e manutenzione nel tempo?',
      avoidedCosts: 'Quanti costi futuri permette di evitare o risparmiare?'
    },
    social: {
      employment: 'Quanti posti di lavoro crea o mantiene?',
      accessibility: 'Quanto migliora l\'accessibilità per la comunità?',
      community: 'Quanto beneficio porta alla comunità locale?'
    },
    environmental: {
      biodiversity: 'Quanto impatto positivo ha sulla biodiversità?',
      landscape: 'Quanto valorizza o protegge il paesaggio?',
      co2: 'Quanto riduce le emissioni di CO2 e l\'impatto ambientale?'
    }
  };

  return (
    <div className="add-project-modal-overlay" onClick={onClose}>
      <div className="add-project-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-project-header">
          <h2>Aggiungi Nuovo Progetto</h2>
          <button onClick={onClose} className="modal-close-btn" aria-label="Chiudi">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-project-form">
          <div className="form-section">
            <h3>Informazioni Base</h3>
            
            <div className="form-group">
              <label>Nome Progetto *</label>
              <input
                type="text"
                value={formData.shortName}
                onChange={(e) => handleInputChange('shortName', e.target.value)}
                placeholder="Es: Adeguamento della sentieristica"
                disabled={uploading}
                required
              />
            </div>

            <div className="form-group">
              <label>Descrizione *</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Inserisci una descrizione dettagliata del progetto..."
                rows={4}
                disabled={uploading}
                required
              />
            </div>

            <div className="form-group">
              <label>Immagine * (max 5MB)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="file-input"
                disabled={uploading}
              />
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Valutazioni (1-5)</h3>
            <p className="section-description">Valuta ogni aspetto del progetto da 1 (minimo) a 5 (massimo)</p>
            
            {Object.keys(CATEGORIES).map((category) => (
              <div key={category} className="score-category">
                <h4 style={{ color: CATEGORIES[category].color }}>
                  {CATEGORIES[category].label}
                </h4>
                <div className="score-grid">
                  {Object.keys(formData.scores[category]).map((subcategory, subIdx) => (
                    <div key={subcategory} className="score-item">
                      <label>{scoreLabels[category][subIdx]}</label>
                      <p className="score-description">{scoreDescriptions[category][subcategory]}</p>
                      <div className="score-input-group">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          value={formData.scores[category][subcategory]}
                          onChange={(e) => handleScoreChange(category, subcategory, e.target.value)}
                          style={{ accentColor: CATEGORIES[category].color }}
                          disabled={uploading}
                        />
                        <span className="score-value">
                          {formData.scores[category][subcategory]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {uploading && (
            <div className="upload-progress">
              <Loader className="spinner" size={20} />
              <span>Caricamento in corso... {uploadProgress}%</span>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel" disabled={uploading}>
              Annulla
            </button>
            <button type="submit" className="btn-save" disabled={uploading}>
              {uploading ? 'Salvataggio...' : 'Salva Progetto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// === COMPONENTE PRINCIPALE ===
const ProjectsSection = () => {
  const [weights, setWeights] = useState({
    technical: 25,
    economic: 25,
    social: 25,
    environmental: 25
  });
  
  const [votes, setVotes] = useState({});
  const [allVotes, setAllVotes] = useState([]);
  const [showChart, setShowChart] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([1, 2, 3]);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [customProjects, setCustomProjects] = useState([]);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(navigator.onLine);
  
  // NUOVI STATI PER AUTH
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  
  const allProjects = [...PROJECTS, ...customProjects];

  // Monitora stato connessione
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Monitora stato autenticazione
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      console.log('User state:', currentUser ? currentUser.email : 'Not logged in');
    });
    return () => unsubscribe();
  }, []);

  // Carica progetti custom da Firestore (real-time)
  useEffect(() => {
    if (!online) {
      const savedCustomProjects = localStorage.getItem('vallepo_custom_projects');
      if (savedCustomProjects) setCustomProjects(JSON.parse(savedCustomProjects));
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projects = [];
      snapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() });
      });
      setCustomProjects(projects);
      
      localStorage.setItem('vallepo_custom_projects', JSON.stringify(projects));
      setLoading(false);
    }, (error) => {
      console.error('Errore caricamento progetti:', error);
      const savedCustomProjects = localStorage.getItem('vallepo_custom_projects');
      if (savedCustomProjects) setCustomProjects(JSON.parse(savedCustomProjects));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [online]);

  // Carica voti da localStorage (voti locali dell'utente)
  useEffect(() => {
    const savedVotes = localStorage.getItem('vallepo_votes');
    if (savedVotes) setVotes(JSON.parse(savedVotes));
  }, []);

  // Carica TUTTI i voti da Firestore (real-time)
  useEffect(() => {
    if (!online) return;

    const unsubscribe = onSnapshot(collection(db, 'votes'), (snapshot) => {
      const votesData = [];
      snapshot.forEach((doc) => {
        votesData.push({ id: doc.id, ...doc.data() });
      });
      setAllVotes(votesData);
    }, (error) => {
      console.error('Errore caricamento voti:', error);
    });

    return () => unsubscribe();
  }, [online]);

  // Salva voto
  const handleVote = async (projectId, rating) => {
    const newVotes = { ...votes, [projectId]: rating };
    setVotes(newVotes);
    localStorage.setItem('vallepo_votes', JSON.stringify(newVotes));

    if (online) {
      try {
        await addDoc(collection(db, 'votes'), {
          projectId: projectId,
          rating: rating,
          timestamp: serverTimestamp()
        });
      } catch (error) {
        console.error('Errore salvataggio voto:', error);
      }
    }
  };

  // Calcola media voti globale
  const getAverageVote = (projectId) => {
    const projectVotes = allVotes.filter(v => v.projectId === projectId);
    if (projectVotes.length === 0) return null;
    
    const sum = projectVotes.reduce((acc, v) => acc + v.rating, 0);
    return sum / projectVotes.length;
  };

  // Gestione click "Aggiungi Progetto"
  const handleAddProjectClick = () => {
    if (!user) {
      setShowAuth(true);
    } else {
      setShowAddProjectModal(true);
    }
  };

  const handleAddProject = (newProject) => {
    setShowAddProjectModal(false);
  };
  
  const openImageModal = (projectId) => {
    const index = allProjects.findIndex(p => p.id === projectId);
    setCurrentImageIndex(index);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = () => {
    setModalOpen(false);
    document.body.style.overflow = '';
  };

  const navigateImage = (direction, targetIndex) => {
    if (direction === 'goto') {
      setCurrentImageIndex(targetIndex);
    } else if (direction === 'prev') {
      setCurrentImageIndex((prev) => (prev === 0 ? allProjects.length - 1 : prev - 1));
    } else if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev === allProjects.length - 1 ? 0 : prev + 1));
    }
  };
  
  const handleWeightChange = (category, newValue) => {
    const currentValue = weights[category];
    const difference = newValue - currentValue;
    
    if (difference <= 0) {
      setWeights({...weights, [category]: newValue});
      return;
    }
    
    const currentTotal = Object.values(weights).reduce((a, b) => a + b, 0);
    const spaceAvailable = 100 - currentTotal;
    
    if (difference <= spaceAvailable) {
      setWeights({...weights, [category]: newValue});
    } else {
      setWeights({...weights, [category]: currentValue + spaceAvailable});
    }
  };
  
  const calculateScore = (project) => {
    let totalScore = 0;
    
    Object.keys(CATEGORIES).forEach(category => {
      const categoryScores = project.scores[category];
      const avgScore = Object.values(categoryScores).reduce((a, b) => a + b, 0) / 
                      Object.values(categoryScores).length;
      totalScore += (avgScore * weights[category]) / 100;
    });
    
    return totalScore.toFixed(2);
  };
  
  const sortedProjects = [...allProjects].sort((a, b) => {
    const voteA = getAverageVote(a.id) || 0;
    const voteB = getAverageVote(b.id) || 0;
    
    if (voteA !== 0 && voteB !== 0) {
      return voteB - voteA;
    }
    if (voteA !== 0 && voteB === 0) {
      return -1;
    }
    if (voteA === 0 && voteB !== 0) {
      return 1;
    }
    return calculateScore(b) - calculateScore(a);
  });
  
  const toggleProjectSelection = (projectId) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    } else {
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };
  
  const radarData = () => {
    const dataPoints = [];
    const categories = Object.keys(CATEGORIES);
    
    const parameterNames = {
      technical: { reliability: 'Affidabilità', complexity: 'Complessità', innovation: 'Innovazione' },
      economic: { investment: 'Investimento', management: 'Gestione', avoidedCosts: 'Costi Evitati' },
      social: { employment: 'Occupazione', accessibility: 'Accessibilità', community: 'Comunità' },
      environmental: { biodiversity: 'Biodiversità', landscape: 'Paesaggio', co2: 'CO2' }
    };
    
    categories.forEach(cat => {
      const params = Object.keys(parameterNames[cat]);
      params.forEach(param => {
        const dataPoint = { category: parameterNames[cat][param] };
        selectedProjects.forEach(pid => {
          const proj = allProjects.find(p => p.id === pid);
          if (proj) {
            dataPoint[proj.shortName] = proj.scores[cat][param];
          }
        });
        dataPoints.push(dataPoint);
      });
    });
    
    return dataPoints;
  };

  if (loading) {
    return (
      <div className="projects-section">
        <div className="loading-container">
          <Loader className="spinner" size={40} />
          <p>Caricamento progetti...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="projects-section">
      {!online && (
        <div className="offline-banner">
          ⚠️ Sei offline. I dati sono salvati localmente e verranno sincronizzati quando tornerai online.
        </div>
      )}

      <div className="projects-header">
        <h2>Proposte progettuali</h2>
        <p className="projects-subtitle">
          Valuta i progetti e confronta le diverse proposte per la valorizzazione della centrale e del territorio
        </p>
      </div>

      {/* <div className="weights-control">
        <h3>Regola le tue priorità</h3>
        <div className="weights-grid">
          {Object.keys(CATEGORIES).map(cat => (
            <div key={cat} className="weight-item">
              <div className="weight-header">
                <span className="weight-label">{CATEGORIES[cat].label}</span>
                <span className="weight-value" style={{ color: CATEGORIES[cat].color }}>
                  {weights[cat]}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={weights[cat]}
                onChange={(e) => handleWeightChange(cat, parseInt(e.target.value))}
                className="weight-slider"
                style={{ accentColor: CATEGORIES[cat].color }}
              />
            </div>
          ))}
        </div>
      </div> */}

      <div className="chart-toggle">
        <button 
          className="toggle-chart-btn"
          onClick={() => setShowChart(!showChart)}
        >
          <BarChart3 size={20} />
          {showChart ? 'Nascondi' : 'Mostra'} Grafico Comparativo
        </button>
        
        <button 
          className="add-project-btn"
          onClick={handleAddProjectClick}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {user ? 'Aggiungi Progetto' : '🔐 Accedi per co-progettare'}
        </button>
      </div>

      {showChart && (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData()}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 5]} tick={{ fill: '#94a3b8' }} />
              {selectedProjects.map((pid, idx) => {
                const proj = allProjects.find(p => p.id === pid);
                const color = getProjectColor(idx);
                return proj ? (
                  <Radar
                    key={pid}
                    name={proj.shortName}
                    dataKey={proj.shortName}
                    stroke={color}
                    fill={color}
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                ) : null;
              })}
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="projects-grid">
        {sortedProjects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            rank={index + 1}
            score={calculateScore(project)}
            averageVote={getAverageVote(project.id)}
            totalVotes={allVotes.filter(v => v.projectId === project.id).length}
            vote={votes[project.id]}
            onVote={(rating) => handleVote(project.id, rating)}
            isSelected={selectedProjects.includes(project.id)}
            onSelect={() => toggleProjectSelection(project.id)}
            onImageClick={() => openImageModal(project.id)}
          />
        ))}
      </div>

      <div className="interaction-legend">
        <div className="legend-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <span>Clicca sull'<strong>immagine</strong> per ingrandirla</span>
        </div>
        <div className="legend-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>Clicca sul <strong>testo</strong> per selezionare il progetto</span>
        </div>
      </div>

      {/* Modal Autenticazione */}
      {showAuth && (
        <Auth 
          user={user} 
          onClose={() => setShowAuth(false)} 
        />
      )}

      <AddProjectModal
        isOpen={showAddProjectModal}
        onClose={() => setShowAddProjectModal(false)}
        onSave={handleAddProject}
        user={user}
      />

      <ImageModal
        isOpen={modalOpen}
        currentIndex={currentImageIndex}
        onClose={closeImageModal}
        onNavigate={navigateImage}
        allProjects={allProjects}
      />
    </div>
  );
};

// === COMPONENTE CARD PROGETTO ===
const ProjectCard = ({ project, rank, score, averageVote, totalVotes, vote, onVote, isSelected, onSelect, onImageClick }) => {
  const [showVoting, setShowVoting] = useState(false);
  
  return (
    <div className={`project-card ${isSelected ? 'selected' : ''}`}>
      <div className="rank-badge">#{rank}</div>
      {isSelected && <div className="selected-indicator">✓ Selezionato</div>}
      
      <div className="project-image" onClick={(e) => { e.stopPropagation(); onImageClick(); }}>
        <img src={project.image} alt={project.name} />
        
        <div className="image-zoom-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
        </div>
        
        <div className="image-zoom-hint">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
          </svg>
          <span>Clicca per ingrandire</span>
        </div>
        
        <div className="score-badge">
          {averageVote ? (
            <>
              <Star size={14} fill="#d97706" stroke="#d97706" />
              <span>{averageVote.toFixed(1)}</span>
              <span className="vote-count">({totalVotes})</span>
            </>
          ) : (
            <>
              <Star size={14} fill="none" stroke="#94a3b8" />
              <span>N/A</span>
            </>
          )}
        </div>
      </div>
      
      <div className="project-content" onClick={onSelect}>
        <h4>{project.shortName}</h4>
        <p className="project-description">{project.description}</p>
        
        <div className="voting-section">
          <button 
            className="vote-toggle"
            onClick={(e) => {
              e.stopPropagation();
              setShowVoting(!showVoting);
            }}
          >
            <Star size={16} fill={vote ? '#d97706' : 'none'} stroke={vote ? '#d97706' : '#94a3b8'} />
            {vote ? `${vote}/5` : 'Vota'}
          </button>
          
          {showVoting && (
            <div className="stars-container" onClick={(e) => e.stopPropagation()}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={(e) => {
                    e.stopPropagation();
                    onVote(star);
                    setShowVoting(false);
                  }}
                  className="star-btn"
                >
                  <Star
                    size={18}
                    fill={vote >= star ? '#d97706' : 'none'}
                    stroke={vote >= star ? '#d97706' : '#cbd5e1'}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsSection;