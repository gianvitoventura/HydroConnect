import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Sparkles } from 'lucide-react';

const StorybookViewer = ({ module, step, onComplete, onBack }) => {
  const [storyContent, setStoryContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const loadStoryContent = () => {
      setLoading(true);
      setError(null);
      
      try {
        // Carica le storie integrate direttamente nel componente
        const stories = getEmbeddedStories();
        const moduleStory = stories[module.id];
        
        if (moduleStory && moduleStory.length > 0) {
          setStoryContent(moduleStory);
        } else {
          throw new Error("Storia non trovata per questo modulo");
        }
      } catch (e) {
        setError("Impossibile caricare la storia. Riprova più tardi.");
        console.error("Errore nel caricamento dello storybook:", e);
      } finally {
        setLoading(false);
      }
    };

    if (module) {
      loadStoryContent();
    }
  }, [module]);

  // Storie integrate direttamente nel componente
  const getEmbeddedStories = () => {
    return {
      'water-cycle': [
        {
          title: "L'inizio del viaggio",
          content: `C'era una volta, tra le vette maestose delle Alpi, una piccola gocciolina d'acqua di nome <strong>Goccy</strong>. 
          
          Era nata da un fiocco di neve scintillante e sognava di esplorare il mondo. Un giorno di primavera, il sole caldo la svegliò con i suoi raggi dorati.

          "È ora di partire per una grande avventura!", pensò Goccy, mentre si scioglieva dolcemente e si univa a migliaia di altre goccioline che aspettavano come lei.

          Insieme formarono un piccolo rivolo che iniziò a scorrere giù per la montagna, cantando una melodia cristallina.`,
          image: "🏔️",
          character: "💧",
          mood: "excited"
        },
        {
          title: "Il ruscello danzante", 
          content: `Il piccolo rivolo crebbe e divenne un ruscello vivace che danzava giù per la montagna. Goccy era emozionata!
          
          Superarono rocce lisce come specchi, saltarono piccole cascate spumeggianti e si fecero strada tra boschi di pini profumati.

          "Guarda quanti amici abbiamo!" esclamò Goccy, vedendo che man mano che scendevano, altri ruscelli si univano a loro, rendendo il loro viaggio sempre più grande e potente.

          Il suono dell'acqua che scorreva era come una musica allegra che riempiva la valle di gioia.`,
          image: "🌊",
          character: "💧",
          mood: "joyful"
        },
        {
          title: "Il grande fiume",
          content: `Il ruscello divenne un torrente, poi un fiume sempre più grande. Goccy non riusciva a credere ai suoi occhi!
          
          Era parte di qualcosa di enorme e maestoso, che scorreva attraverso valli verdi punteggiate di fiori colorati e città animate piene di vita.

          "Sono nel <strong>Po</strong>, il fiume più lungo d'Italia!" realizzò Goccy con orgoglio. "Ho realizzato il mio sogno: sono diventata una grande esploratrice!"

          Attraversò ponti antichi, vide pescatori pazienti e bambini che giocavano sulle rive.`,
          image: "🏞️", 
          character: "💧",
          mood: "proud"
        },
        {
          title: "Il ciclo magico",
          content: `Ma il viaggio di Goccy non finì al mare. Quando arrivò alle acque blu del mare Adriatico, accadde qualcosa di magico!
          
          Il sole la fece evaporare dolcemente e salire verso il cielo, dove divenne parte di una nuvola soffice e bianca.

          "Che meraviglia!" pensò, guardando la terra dall'alto. "Posso vedere tutto il mio viaggio!"

          Poi, come pioggia, tornò sulla terra per iniziare un nuovo viaggio. Aveva scoperto il <strong>ciclo dell'acqua</strong> - un viaggio infinito che non finisce mai!

          <em>"Ogni goccia d'acqua ha una storia da raccontare"</em>, sussurrò Goccy, pronta per la prossima avventura.`,
          image: "☁️",
          character: "💧", 
          mood: "wise"
        }
      ],
      
      'hydro-power': [
        {
          title: "La grande diga",
          content: `Dopo molti viaggi, <strong>Goccia Brillante</strong> e migliaia di suoi amici arrivarono in un luogo speciale: una grande diga!
          
          Era un muro enorme fatto di cemento e acciaio che bloccava il fiume, creando un lago artificiale gigantesco che brillava al sole.

          "Che cos'è questo posto magico?" si chiese Goccia Brillante, guardando con curiosità quella costruzione imponente.

          Una gocciolina più anziana e saggia le spiegò sorridendo: "Questa è una <strong>centrale idroelettrica</strong>, cara Goccia! Qui avviene una delle magie più belle del mondo moderno!"

          Il lago era così grande che sembrava un mare di montagna, calmo e maestoso.`,
          image: "🏗️",
          character: "⚡💧", 
          mood: "curious"
        },
        {
          title: "La discesa veloce",
          content: `Un giorno, Goccia Brillante sentì una forte spinta. Le enormi porte della diga si aprirono con un rumore potente!
          
          "Aaaaahhh!" gridò per l'emozione mentre veniva trascinata in un tunnel buio ma emozionante, insieme a milioni di altre goccioline.

          Andava sempre più giù, sempre più veloce, come sulle montagne russe più pazze del mondo! La forza dell'acqua era incredibile.

          Finalmente si ritrovò a spingere con tutte le sue forze una gigantesca ruota con pale metalliche. "È una <strong>turbina</strong>!" capì Goccia Brillante. "E io la sto facendo girare!"

          Il rumore era assordante ma meraviglioso, come il battito del cuore della Terra.`,
          image: "🌪️",
          character: "⚡💧",
          mood: "thrilled"
        },
        {
          title: "La magia dell'elettricità",
          content: `La turbina era collegata a una macchina speciale chiamata <strong>generatore</strong>, che trasformava il movimento rotatorio in qualcosa di magico.
          
          Goccia Brillante sentì una vibrazione speciale, come un formicolio elettrico che la attraversava, e poi... una luce brillante!

          "La mia energia si sta trasformando in <strong>elettricità</strong>!" esclamò con meraviglia.

          Quella elettricità iniziò subito a viaggiare attraverso cavi lunghi chilometri, portando energia pulita in ogni direzione.

          Era una sensazione incredibile: sapere che la sua forza stava per illuminare case, far funzionare computer e dare energia a un mondo intero!`,
          image: "💡",
          character: "⚡💧",
          mood: "amazed"
        },
        {
          title: "Illuminare il mondo", 
          content: `Grazie a Goccia Brillante e alle sue milioni di amiche goccioline, accaddero cose meravigliose in tutto il paese.
          
          Le luci si accesero nelle case delle famiglie, i treni ad alta velocità sfrecciarono sui binari, gli ospedali poterono curare i malati, e i bambini giocarono con i loro giocattoli elettrici.

          "Sono parte di qualcosa di grande!" realizzò Goccia Brillante con orgoglio. "La mia piccola forza, unita a quella di tante altre gocce, sta aiutando tutto il mondo!"

          E la cosa più bella? Dopo aver dato la sua energia, Goccia Brillante continuò il suo viaggio nel fiume, pronta per nuove avventure.

          <em>"L'energia dell'acqua è un regalo che non finisce mai"</em>, sorrise, sentendosi una vera eroina dell'energia pulita.`,
          image: "🏘️",
          character: "⚡💧",
          mood: "heroic"
        }
      ],
      
      'clean-energy': [
        {
          title: "L'energia speciale",
          content: `Dopo aver creato l'elettricità, <strong>Goccia Verde</strong> fece una scoperta incredibile: non era scomparsa!
          
          Tornò nel fiume, pulita e pura come prima, pronta per un nuovo viaggio. Si sentiva una vera supereroina ecologica!

          "L'energia che ho contribuito a creare è speciale," pensò con orgoglio. "È <strong>energia pulita</strong>!"

          A differenza delle energie che vengono dal carbone o dal petrolio e sporcano l'aria con fumo nero, l'energia idroelettrica usa solo la forza naturale dell'acqua.

          "Non produco inquinamento, non faccio male agli animali, e posso ripetere questo processo all'infinito!" si rese conto Goccia Verde.`,
          image: "🌿", 
          character: "🌱💧",
          mood: "proud"
        },
        {
          title: "Un mondo più pulito",
          content: `Grazie a Goccia Verde e all'ingegno di donne e uomini che avevano costruito le centrali idroelettriche, il mondo stava diventando un posto migliore.
          
          Dove prima c'erano ciminiere che fumavano nero, ora c'era aria fresca e pulita da respirare.

          Gli uccelli cantavano più felici, i fiori crescevano più colorati, e i bambini potevano giocare all'aperto senza preoccuparsi dello smog.

          "Stiamo costruendo un futuro più brillante e più sano per tutti!" esclamò Goccia Verde, vedendo cieli più azzurri e boschi più verdi.

          Anche gli orsi polari erano contenti, perché l'energia pulita aiutava a proteggere il loro ghiaccio dal riscaldamento globale.`,
          image: "🌍",
          character: "🌱💧", 
          mood: "hopeful"
        },
        {
          title: "La differenza di una goccia",
          content: `Un giorno, Goccia Verde incontrò una piccola gocciolina preoccupata che le disse: "Io sono così piccola, come posso fare la differenza?"
          
          Goccia Verde sorrise saggiamente: "Anch'io pensavo di essere troppo piccola per cambiare il mondo. Ma guarda!"

          Le mostrò come ogni volta che si muoveva, contribuiva a un ciclo infinito di <strong>energia rinnovabile</strong> - un regalo prezioso per il pianeta.

          "Insieme a milioni di altre gocce come noi, stiamo alimentando scuole, ospedali, case e fabbriche senza inquinare!"

          La piccola gocciolina capì che anche lei poteva essere parte di questa grande missione per salvare la Terra.

          <em>"Non importa quanto piccoli siamo, insieme possiamo fare grandi cose!"</em>`,
          image: "♻️",
          character: "🌱💧",
          mood: "inspiring"
        },
        {
          title: "La supereroina verde",
          content: `Goccia Verde era felice di essere parte di questa grande avventura ecologica, sapendo che la sua forza aiutava a costruire un mondo più verde e sostenibile.
          
          "Sono una <strong>Supereroina dell'Energia Pulita</strong>!" dichiarò con orgoglio, indossando un mantello immaginario fatto di foglie verdi.

          Il suo superpotere era speciale: poteva creare energia infinita senza mai consumarsi, senza mai inquinare, senza mai fermarsi.

          "E ora, piccolo eco-guerriero," disse rivolgendosi a te, "tocca a te! Puoi aiutare anche tu a proteggere il nostro meraviglioso pianeta!"

          "Usa l'energia con saggezza, rispetta la natura, e ricorda sempre che ogni piccolo gesto conta!"

          <strong>EVVIVA GOCCIA VERDE, LA SUPEREROINA CHE HA SALVATO IL MONDO!</strong> 🌍💚

          <em>"Il futuro del pianeta è nelle nostre mani... ehm, gocce!"</em>`,
          image: "🦸‍♀️",
          character: "🌱💧",
          mood: "triumphant"
        }
      ]
    };
  };

  const currentPage = storyContent[step];
  const isLastPage = step >= storyContent.length - 1;

  const handleNext = () => {
    setIsAnimating(true);
    setTimeout(() => {
      if (!isLastPage) {
        onComplete(step + 1);
      } else {
        onComplete(undefined); // Vai al quiz
      }
      setIsAnimating(false);
    }, 300);
  };

  const handlePrevious = () => {
    setIsAnimating(true);
    setTimeout(() => {
      if (step > 0) {
        onComplete(step - 1);
      } else {
        onBack();
      }
      setIsAnimating(false);
    }, 300);
  };

  const getMoodColor = (mood) => {
    const moodColors = {
      excited: '#3b82f6',
      joyful: '#10b981', 
      proud: '#8b5cf6',
      wise: '#6366f1',
      curious: '#f59e0b',
      thrilled: '#ef4444',
      amazed: '#ec4899',
      heroic: '#059669',
      hopeful: '#0ea5e9',
      inspiring: '#84cc16',
      triumphant: '#dc2626'
    };
    return moodColors[mood] || '#6366f1';
  };

  if (loading) {
    return (
      <div className="storybook-viewer loading">
        <BookOpen className="rotating-icon" size={48} />
        <p>Caricamento della storia magica...</p>
        <div className="loading-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="storybook-viewer error">
        <p>{error}</p>
        <button onClick={onBack} className="storybook-nav-button back">
          <ArrowLeft /> Torna indietro
        </button>
      </div>
    );
  }

  if (storyContent.length === 0) {
    return (
      <div className="storybook-viewer no-content">
        <p>Nessuna storia trovata per questo modulo.</p>
        <button onClick={onBack} className="storybook-nav-button back">
          <ArrowLeft /> Torna indietro
        </button>
      </div>
    );
  }

  return (
    <div className="storybook-viewer">
      <div className="storybook-header">
        <button onClick={handlePrevious} className="storybook-nav-button back">
          <ArrowLeft /> {step === 0 ? 'Indietro' : 'Precedente'}
        </button>
        <h2 className="storybook-title">
          <Sparkles className="title-icon" />
          {module.title}
        </h2>
        <span className="storybook-page-indicator">
          Pagina {step + 1} di {storyContent.length}
        </span>
      </div>
      
      <div className="storybook-progress-bar">
        <div 
          className="progress-fill" 
          style={{ 
            width: `${((step + 1) / storyContent.length) * 100}%`,
            backgroundColor: getMoodColor(currentPage?.mood)
          }}
        ></div>
      </div>

      <div className={`storybook-content ${isAnimating ? 'animating' : ''}`}>
        {currentPage && (
          <div className="story-page">
            <div className="story-visual">
              <div 
                className="story-image"
                style={{ color: getMoodColor(currentPage.mood) }}
              >
                {currentPage.image}
              </div>
              <div className="story-character">{currentPage.character}</div>
            </div>
            
            <div className="story-text">
              <h3 
                className="page-title"
                style={{ color: getMoodColor(currentPage.mood) }}
              >
                {currentPage.title}
              </h3>
              <div 
                className="page-content"
                dangerouslySetInnerHTML={{ __html: currentPage.content }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="storybook-footer">
        <div className="page-dots">
          {storyContent.map((_, index) => (
            <div 
              key={index} 
              className={`page-dot ${index <= step ? 'completed' : ''}`}
              style={{ 
                backgroundColor: index <= step ? getMoodColor(currentPage?.mood) : '#d1d5db'
              }}
            />
          ))}
        </div>
        
        <button 
          onClick={handleNext} 
          className="storybook-nav-button next"
          style={{ backgroundColor: getMoodColor(currentPage?.mood) }}
        >
          {isLastPage ? (
            <>Vai al Quiz <Sparkles /></>
          ) : (
            <>Avanti <ArrowRight /></>
          )}
        </button>
      </div>

      <style jsx>{`
        .storybook-viewer {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border-radius: 1rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          margin: 2rem auto;
          max-width: 900px;
          min-height: 600px;
          display: flex;
          flex-direction: column;
        }

        .storybook-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e0f2fe;
        }

        .storybook-title {
          color: #0369a1;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-grow: 1;
          text-align: center;
        }

        .title-icon {
          color: #fbbf24;
        }

        .storybook-nav-button {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          padding: 0.75rem 1.25rem;
          border: none;
          border-radius: 2rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .storybook-nav-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        .storybook-nav-button.back {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }

        .storybook-nav-button.back:hover {
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
        }

        .storybook-progress-bar {
          width: 100%;
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          margin-bottom: 2rem;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: all 0.5s ease;
        }

        .storybook-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: opacity 0.3s ease;
          min-height: 400px;
        }

        .storybook-content.animating {
          opacity: 0.5;
        }

        .story-page {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
          width: 100%;
          height: 100%;
        }

        .story-visual {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          min-width: 200px;
          padding: 1rem;
        }

        .story-image {
          font-size: 6rem;
          animation: float 3s ease-in-out infinite;
          text-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .story-character {
          font-size: 3rem;
          animation: bounce 2s ease-in-out infinite;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }

        @keyframes bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .story-text {
          flex: 1;
          padding: 1rem;
        }

        .page-title {
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
          font-weight: bold;
          text-align: center;
        }

        .page-content {
          line-height: 1.8;
          color: #374151;
          font-size: 1.2rem;
          text-align: justify;
        }

        .page-content strong {
          color: #1f2937;
          font-weight: bold;
        }

        .page-content em {
          color: #059669;
          font-style: italic;
          font-weight: 500;
        }

        .storybook-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.5rem;
          border-top: 2px solid #e0f2fe;
        }

        .page-dots {
          display: flex;
          gap: 0.5rem;
        }

        .page-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #d1d5db;
          transition: all 0.3s ease;
        }

        .page-dot.completed {
          transform: scale(1.2);
        }

        .storybook-viewer.loading,
        .storybook-viewer.error,
        .storybook-viewer.no-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 1rem;
        }

        .rotating-icon {
          animation: spin 2s linear infinite;
          color: #3b82f6;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .loading-dots {
          display: flex;
          gap: 0.5rem;
        }

        .loading-dots span {
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
          animation: bounce-dots 1.4s ease-in-out infinite both;
        }

        .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
        .loading-dots span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce-dots {
          0%, 80%, 100% {
            transform: scale(0);
          } 40% {
            transform: scale(1);
          }
        }

        @media (max-width: 768px) {
          .storybook-viewer {
            margin: 1rem;
            padding: 1.5rem;
          }

          .story-page {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .story-visual {
            min-width: auto;
          }

          .story-image {
            font-size: 4rem;
          }

          .story-character {
            font-size: 2rem;
          }

          .page-title {
            font-size: 1.4rem;
          }

          .page-content {
            font-size: 1.1rem;
          }

          .storybook-header {
            flex-direction: column;
            gap: 1rem;
          }

          .storybook-title {
            font-size: 1.2rem;
          }

          .storybook-footer {
            flex-direction: column-reverse;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default StorybookViewer;