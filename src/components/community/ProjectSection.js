import React, { useState, useEffect } from 'react';
import { Star, TrendingUp, BarChart3 } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from 'recharts';
import './ProjectSection.css';

// === DATI PROGETTI ===
const PROJECTS = [
  {
    id: 1,
    name: "Adeguamento sentieristica e piste ciclabili",
    shortName: "Adeguamento della sentieristica",
    description: "Il progetto si focalizza sul potenziamento della mobilità lenta e sulla valorizzazione ambientale attraverso la manutenzione e il miglioramento dei sentieri esistenti e la creazione di nuovi percorsi escursionistici e piste ciclabili. L'obiettivo è collegare i principali punti di interesse, creare aree panoramiche attrezzate e migliorare la fruizione del territorio circostante per residenti e turisti.",
    image: "/images/design/idee/Percorsi escursionistici.png",
    scores: {
      technical: { reliability: 5, complexity: 4, innovation: 1 },
      economic: { investment: 3, management: 4, avoidedCosts: 2 },
      social: { employment: 3, accessibility: 5, community: 5 },
      environmental: { biodiversity: 3, landscape: 4, co2: 5 }
    }
  },
  {
    id: 2,
    name: "Musealizzazione dell'impianto",
    shortName: "Musealizzazione della centrale",
    description: "Il progetto mira alla musealizzazione di una centrale idroelettrica attraverso il restauro degli spazi interni e la valorizzazione di macchinari storici, creando percorsi espositivi interattivi e multimediali che illustrano la produzione energetica. L'iniziativa include anche lo sviluppo di programmi educativi e laboratori pratici su sostenibilità ed energia rinnovabile, integrando infine la centrale nei percorsi culturali e turistici della valle per aumentarne il valore e la promozione.",
    image: "/images/design/idee/Musealizzazione impianto.png",
    scores: {
      technical: { reliability: 3, complexity: 4, innovation: 3 },
      economic: { investment: 5, management: 5, avoidedCosts: 1 },
      social: { employment: 4, accessibility: 5, community: 4 },
      environmental: { biodiversity: 3, landscape: 3, co2: 3 }
    }
  },
  {
    id: 3,
    name: "Manutenzione e valorizzazione dei bacini",
    shortName: "Valorizzazione del bacino",
    description: "Il progetto mira alla riqualificazione del bacino idrico della centrale attraverso la rimozione dei sedimenti per migliorarne l'efficienza idraulica. Contestualmente, si prevede la creazione di un'area attrezzata per il pubblico, con servizi come il noleggio di canoe e kayak, trasformando lo specchio d'acqua in un polo per le attività sportive e ricreative outdoor in armonia con l'ambiente naturale.",
    image: "/images/design/idee/Valorizzazione bacino.png",
    scores: {
      technical: { reliability: 4, complexity: 2, innovation: 3 },
      economic: { investment: 3, management: 4, avoidedCosts: 3 },
      social: { employment: 3, accessibility: 3, community: 4 },
      environmental: { biodiversity: 5, landscape: 4, co2: 4 }
    }
  },
  {
    id: 4,
    name: "Stazioni di co-working",
    shortName: "Co-working",
    description: "Il progetto prevede la creazione di postazioni di co-working in aree attualmente inutilizzate della struttura per rispondere alla crescente domanda di modelli di lavoro flessibili. Offrendo infrastrutture adeguate a professionisti e nomadi digitali in un contesto montano di pregio ambientale, l'iniziativa punta a colmare il divario tra aree urbane e interne. Queste soluzioni non solo possono contrastare lo spopolamento montano, ma anche stabilire una rete di collaborazione tra la centrale, aziende locali, startup e professionisti, promuovendo l'innovazione e lo sviluppo territoriale.",
    image: "/images/design/idee/Stazione co-working.png",
    scores: {
      technical: { reliability: 3, complexity: 5, innovation: 4 },
      economic: { investment: 5, management: 3, avoidedCosts: 1 },
      social: { employment: 5, accessibility: 4, community: 4 },
      environmental: { biodiversity: 1, landscape: 3, co2: 3 }
    }
  },
  {
    id: 5,
    name: "Connettività fibra ottica",
    shortName: "Implementazione connettività",
    description: "Al fine di sostenere scuole, imprese e l'intera comunità locale, il progetto riconosce l'importanza vitale di ammodernare le infrastrutture pubbliche. L'intervento specifico riguarda l'implementazione e l'integrazione della connettività veloce, estendendo la copertura (banda larga o fibra) alle frazioni e ai nuclei abitativi che attualmente risultano sprovvisti di una connessione digitale rapida e affidabile. Questo sforzo è cruciale per ridurre il divario digitale e garantire che l'intera comunità possa accedere ai servizi essenziali, supportando l'istruzione a distanza, l'innovazione delle attività economiche e la qualità della vita complessiva.",
    image: "/images/design/idee/Connettività zone interne.png",
    scores: {
      technical: { reliability: 4, complexity: 2, innovation: 5 },
      economic: { investment: 2, management: 5, avoidedCosts: 2 },
      social: { employment: 1, accessibility: 4, community: 2 },
      environmental: { biodiversity: 2, landscape: 3, co2: 4 }
    }
  },
  {
    id: 6,
    name: "Elettrificazione mobilità",
    shortName: "Elettrificazione della valle",
    description: "Per incentivare il turismo lento e responsabile e promuovere l'uso di veicoli a zero emissioni, il progetto include l'installazione di stazioni di ricarica per e-bike e altri mezzi di mobilità leggera. Queste stazioni saranno posizionate strategicamente nei centri abitati e nelle vicinanze degli impianti della centrale, offrendo un servizio essenziale per l'uso delle bici elettriche e generando benefici ambientali e nuove opportunità socio-economiche.",
    image: "/images/design/idee/Elettrificazione mobilità.png",
    scores: {
      technical: { reliability: 4, complexity: 3, innovation: 4 },
      economic: { investment: 4, management: 3, avoidedCosts: 2 },
      social: { employment: 2, accessibility: 4, community: 3 },
      environmental: { biodiversity: 4, landscape: 3, co2: 5 }
    }
  },
  {
    id: 7,
    name: "Rischio idrogeologico",
    shortName: "Interventi di mitigazione del rischio",
    description: "Il progetto mira alla rigenerazione di una centrale idroelettrica trasformandola in un polo multifunzionale che unisce valorizzazione storica e culturale (musealizzazione, restauro macchinari e percorsi didattici su sostenibilità), sviluppo sociale e innovazione (creazione di postazioni di co-working per professionisti e nomadi digitali) e sicurezza territoriale (mitigazione del rischio idrogeologico e stabilizzazione dei versanti), integrando l'impianto nei percorsi della valle.",
    image: "/images/design/idee/Mitigazione del rischio idrogeologico.png",
    scores: {
      technical: { reliability: 5, complexity: 1, innovation: 1 },
      economic: { investment: 1, management: 1, avoidedCosts: 5 },
      social: { employment: 2, accessibility: 1, community: 5 },
      environmental: { biodiversity: 4, landscape: 5, co2: 4 }
    }
  },
  {
    id: 8,
    name: "Sistema ecomuseale",
    shortName: "Ecomuseo della Valle Po",
    description: "L'iniziativa, nata dalla collaborazione con attori e associazioni locali, prevede l'integrazione del Sistema Ecomuseale del Monviso nel progetto complessivo. L'obiettivo è valorizzare il patrimonio storico delle macchine ad acqua dell'alta Valle Po (mulini, fucine, piccole centrali) attraverso la raccolta e la digitalizzazione di materiale storico-documentale. Questo materiale sarà utilizzato per creare un ecomuseo virtuale, allestire pannelli informativi sul territorio e sviluppare un filo conduttore per nuove forme di turismo storico-culturale e visite didattiche, consolidando al contempo una rete strategica tra le comunità.",
    image: "/images/design/idee/Ecomuseo della valle.png",
    scores: {
      technical: { reliability: 3, complexity: 3, innovation: 2 },
      economic: { investment: 3, management: 1, avoidedCosts: 1 },
      social: { employment: 4, accessibility: 5, community: 5 },
      environmental: { biodiversity: 2, landscape: 4, co2: 3 }
    }
  }
];

const CATEGORIES = {
  technical: { label: 'Tecnico', color: '#20a9cbff' },
  economic: { label: 'Economico', color: '#c2b32aff' },
  social: { label: 'Sociale', color: '#942d2dff' },
  environmental: { label: 'Ambientale', color: '#2d9a60ff' }
};

// Palette colori per il radar chart
const getProjectColor = (index) => {
  const colors = [
    '#2563eb', '#d97706', '#059669', '#dc2626', 
    '#bded3aff', '#0891b2', '#ea580c', '#65a30d'
  ];
  return colors[index % colors.length];
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
  const [showChart, setShowChart] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState([1, 2, 3]);
  
  useEffect(() => {
    const savedVotes = localStorage.getItem('vallepo_votes');
    if (savedVotes) setVotes(JSON.parse(savedVotes));
  }, []);
  
  const handleVote = (projectId, rating) => {
    const newVotes = { ...votes, [projectId]: rating };
    setVotes(newVotes);
    localStorage.setItem('vallepo_votes', JSON.stringify(newVotes));
  };
  
  // === GESTIONE SLIDER CON BLOCCO SEMPLICE ===
  const handleWeightChange = (category, newValue) => {
    const currentValue = weights[category];
    const difference = newValue - currentValue;
    
    // Se stiamo DIMINUENDO, sempre permesso
    if (difference <= 0) {
      setWeights({...weights, [category]: newValue});
      return;
    }
    
    // Se stiamo AUMENTANDO, verifica se c'è spazio disponibile
    const currentTotal = Object.values(weights).reduce((a, b) => a + b, 0);
    const spaceAvailable = 100 - currentTotal;
    
    if (difference <= spaceAvailable) {
      // C'è abbastanza spazio, permetti il cambiamento
      setWeights({...weights, [category]: newValue});
    } else {
      // Non c'è abbastanza spazio, blocca al massimo possibile
      const maxPossible = currentValue + spaceAvailable;
      setWeights({...weights, [category]: maxPossible});
    }
  };
  
  const calculateScore = (project) => {
    let total = 0;
    Object.keys(CATEGORIES).forEach(cat => {
      const catScores = Object.values(project.scores[cat]);
      const avg = catScores.reduce((a, b) => a + b, 0) / catScores.length;
      total += avg * (weights[cat] / 100);
    });
    return total.toFixed(1);
  };
  
  // === SELEZIONE ILLIMITATA PROGETTI ===
  const toggleProjectSelection = (projectId) => {
    if (selectedProjects.includes(projectId)) {
      setSelectedProjects(selectedProjects.filter(id => id !== projectId));
    } else {
      // Nessun limite, aggiungi sempre
      setSelectedProjects([...selectedProjects, projectId]);
    }
  };
  
  const radarData = () => {
  // Definizione di tutti gli indicatori con le loro etichette
  const indicators = [
    // TECNICI (3)
    { key: 'reliability', label: 'Affidabilità', category: 'technical', categoryLabel: 'Tecnico' },
    { key: 'complexity', label: 'Complessità', category: 'technical', categoryLabel: 'Tecnico' },
    { key: 'innovation', label: 'Innovazione', category: 'technical', categoryLabel: 'Tecnico' },
    
    // ECONOMICI (3)
    { key: 'investment', label: 'Investimento', category: 'economic', categoryLabel: 'Economico' },
    { key: 'management', label: 'Gestione', category: 'economic', categoryLabel: 'Economico' },
    { key: 'avoidedCosts', label: 'Costi evitati', category: 'economic', categoryLabel: 'Economico' },
    
    // SOCIALI (3)
    { key: 'employment', label: 'Occupazione', category: 'social', categoryLabel: 'Sociale' },
    { key: 'accessibility', label: 'Accessibilità', category: 'social', categoryLabel: 'Sociale' },
    { key: 'community', label: 'Comunità', category: 'social', categoryLabel: 'Sociale' },
    
    // AMBIENTALI (3)
    { key: 'biodiversity', label: 'Biodiversità', category: 'environmental', categoryLabel: 'Ambientale' },
    { key: 'landscape', label: 'Paesaggio', category: 'environmental', categoryLabel: 'Ambientale' },
    { key: 'co2', label: 'CO2', category: 'environmental', categoryLabel: 'Ambientale' }
  ];
  
  const data = [];
  
  // Per ogni indicatore, crea un punto del radar
  indicators.forEach(indicator => {
    const point = { 
      // Label completo: "Categoria - Indicatore"
      category: `${indicator.categoryLabel} - ${indicator.label}`
    };
    
    // Per ogni progetto selezionato, prendi il valore specifico dell'indicatore
    selectedProjects.forEach(pid => {
      const proj = PROJECTS.find(p => p.id === pid);
      if (proj) {
        // Accedi direttamente al valore dell'indicatore (es: project.scores.technical.reliability)
        const value = proj.scores[indicator.category][indicator.key];
        point[proj.shortName] = value;
      }
    });
    
    data.push(point);
  });
  
  return data;
};
  
  const sortedProjects = [...PROJECTS].sort((a, b) => 
    calculateScore(b) - calculateScore(a)
  );
  
  return (
    <div className="projects-section">
      <div className="projects-header">
        <h2>Proposte progettuali</h2>
        <p className="projects-subtitle">
          Valuta i progetti e confronta le diverse proposte per la valorizzazione della centrale e del territorio
        </p>
      </div>

      {/* Controlli Pesi */}
      <div className="weights-control">
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
      </div>

      {/* Pulsante Grafico */}
      <div className="chart-toggle">
        <button 
          className="toggle-chart-btn"
          onClick={() => setShowChart(!showChart)}
        >
          <BarChart3 size={20} />
          {showChart ? 'Nascondi' : 'Mostra'} Grafico Comparativo
        </button>
      </div>

      {/* Grafico Radar */}
      {showChart && (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData()}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 12 }} />
              <PolarRadiusAxis domain={[0, 5]} tick={{ fill: '#94a3b8' }} />
              {selectedProjects.map((pid, idx) => {
                const proj = PROJECTS.find(p => p.id === pid);
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

      {/* Griglia Progetti 2x4 */}
      <div className="projects-grid">
        {sortedProjects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            rank={index + 1}
            score={calculateScore(project)}
            vote={votes[project.id]}
            onVote={(rating) => handleVote(project.id, rating)}
            isSelected={selectedProjects.includes(project.id)}
            onSelect={() => toggleProjectSelection(project.id)}
          />
        ))}
      </div>

      {/* Legenda
      <div className="projects-legend">
        <p>💡 <strong>Suggerimento:</strong> Clicca sulle card per selezionarle. Puoi confrontare tutti i progetti che vuoi nel grafico radar!</p>
      </div> */}
    </div>
  );
};

// === COMPONENTE CARD PROGETTO ===
const ProjectCard = ({ project, rank, score, vote, onVote, isSelected, onSelect }) => {
  const [showVoting, setShowVoting] = useState(false);
  
  return (
    <div 
      className={`project-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      {/* Badge Posizione */}
      <div className="rank-badge">#{rank}</div>
      
      {/* Indicatore Selezione */}
      {isSelected && <div className="selected-indicator">✓ Selezionato</div>}
      
      {/* Immagine */}
      <div className="project-image">
        <img src={project.image} alt={project.name} />
        <div className="score-badge">
          <TrendingUp size={14} />
          <span>{score}</span>
        </div>
      </div>
      
      {/* Contenuto */}
      <div className="project-content">
        <h4>{project.shortName}</h4>
        <p className="project-description">{project.description}</p>
        
        {/* Sistema Votazione */}
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