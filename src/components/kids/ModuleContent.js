import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import '../../styles/KidsModules.css';

// Contenuti per ciascun modulo e passo
const moduleContents = {
  'water-cycle': {
    0: {
      title: 'Ciao, sono Goccy, la Goccia Blu!',
      content: `
        <div class="step-content">
          <div class="character-container">
            <div class="character blue-drop">
              <div class="character-face">
                <div class="character-eyes"></div>
                <div class="character-smile"></div>
              </div>
            </div>
          </div>
            <div class="step-text">
              <h2>Sono nata tanto tempo fa e vivo un'avventura incredibile!</h2>
              <h2>La mia storia inizia in alto, sulla cima di una montagna. Lì, ero una piccola parte di un grande manto di neve bianca e soffice che poi si è trasformato in ghiaccio.</h2>
              <h2>Quando la primavera arriva e il sole riscalda la montagna, io e le mie amiche gocce ci sciogliamo e iniziamo il nostro lungo viaggio.</h2>
              <h2>Ti va di scoprire insieme dove andremo?</h2>
            </div>
        </div>
      `
    },
    1: {
      title: 'Dalla montagna al fiume',
      content: `
        <div class="step-content">
          <div class="step-animation">
            <div class="river-animation">
              <div class="character blue-drop flowing">
                <div class="character-face">
                  <div class="character-eyes"></div>
                  <div class="character-smile"></div>
                </div>
              </div>
            </div>
          </div>
            <div class="step-text">
              <h2>Scivolando giù dalla montagna, mi unisco a tante altre gocce e insieme formiamo un piccolo ruscello!</h2>
              <h2>Il ruscello è veloce e allegro, saltella tra le rocce e fa tante curve. Durante il viaggio, incontriamo tanti amici: pesciolini, ranocchi, e persino uccellini che vengono a bere.</h2>
              <h2>Mentre scendiamo a valle, il nostro ruscello diventa sempre più grande e si unisce ad altri ruscelli. Sai cosa succede?</h2>
              <h2>Diventiamo un <strong>fiume</strong>! Il fiume è più largo e profondo del ruscello, e scorre più lentamente. È la nostra autostrada per arrivare fino al nostro obiettivo!</h2>
            </div>
        </div>
      `
    },
    2: {
      title: 'Finalmente al mare!',
      content: `
        <div class="step-content">
          <div class="step-animation">
            <div class="sea-animation">
              <div class="character blue-drop bobbing">
                <div class="character-face">
                  <div class="character-eyes"></div>
                  <div class="character-smile"></div>
                </div>
              </div>
            </div>
          </div>
            <div class="step-text">
              <h2>Dopo il lungo viaggio nel fiume, finalmente arriviamo al <strong>mare</strong>!</h2>
              <h2>Il mare è enorme! È come una grandissima casa dove vivono tantissimi pesci, alghe, e altre creature marine. Qui incontro milioni e milioni di altre gocce come me!</h2>
              <h2>Ma la mia avventura non finisce qui! Sai cosa succede quando il sole scalda l'acqua del mare?</h2>
              <h2>Divento leggerissima e salgo verso il cielo, trasformandomi in vapore. Questo si chiama <strong>evaporazione</strong>. Nel cielo, mi unisco ad altre gocce per formare le nuvole. E quando la nuvola diventa pesante, cadiamo di nuovo sulla terra come pioggia!</h2>
              <h2>Questo ciclo continua per sempre ed è chiamato <strong>ciclo dell'acqua</strong>. Incredibile no???</h2>
            </div>
        </div>
      `
    }
  },
  'hydro-power': {
    0: {
      title: 'Goccy incontra una diga',
      content: `
        <div class="step-content">
          <div class="step-animation">
            <div class="dam-animation">
              <div class="character blue-drop">
                <div class="character-face">
                  <div class="character-eyes"></div>
                  <div class="character-smile"></div>
                </div>
              </div>
            </div>
          </div>
            <div class="step-text">
              <h2>Durante il mio viaggio nel fiume è possibile che io incontri qualcosa di gigantesco: una <strong>diga</strong>!</h2>
              <h2>La diga è come un muro altissimo che blocca il nostro cammino. Ma non preoccuparti, non è un ostacolo cattivo! È stata costruita dagli umani per uno scopo molto importante.</h2>
              <h2>La diga fa accumulare tanta acqua dietro di sé, creando un grande lago artificiale chiamato <strong>bacino</strong>. È come un enorme contenitore pieno d'acqua!</h2>
              <h2>Sai perché gli umani raccolgono tanta acqua qui? Stanno preparandosi a fare qualcosa di magico!</h2>
            </div>
        </div>
      `
    },
    1: {
      title: 'Scivolando verso la centrale idroelettrica',
      content: `
        <div class="step-content">
          <div class="step-animation">
            <div class="turbine-animation">
              <div class="character blue-drop spinning">
                <div class="character-face">
                  <div class="character-eyes spinning"></div>
                  <div class="character-smile"></div>
                </div>
              </div>
            </div>
          </div>
            <div class="step-text">
              <h2>Arriva il momento emozionante! Dalla diga, io e le altre gocce veniamo guidate alla centrale idroelettrica attraverso grandi tubi.</h2>
              <h2>Questi tubi ci portano verso il basso a grande velocità. È come uno scivolo d'acqua gigantesco e velocissimo!</h2>
              <h2>All'improvviso, incontriamo una ruota enorme con tante pale: la <strong>turbina</strong>. Spingiamo con tutta la nostra forza contro le pale e le facciamo girare velocemente.</h2>
              <h2>La turbina ci trasforma in qualcosa di davvero speciale...</h2>
            </div>
        </div>
      `
    },
    2: {
      title: 'Ecco la magia!',
      content: `
        <div class="step-content">
          <div class="character-container">
            <div class="character yellow-drop pulsing">
              <div class="character-face">
                <div class="character-eyes"></div>
                <div class="character-smile"></div>
              </div>
            </div>
          </div>
            <div class="step-text">
              <h2>La nostra velocità viene trasformata in <strong>elettricità</strong>! Non sono più solo una Goccy, ora passo la mia forza ad una goccia altrettanto importante, <strong>una goccia elettrica</strong>!</h2>
              <h2>L'elettricità è una forma di energia che viaggia velocissima attraverso i cavi e arriva in tutte le case.</h2>
              <h2>Questa energia può fare tantissime cose: accendere le luci, far funzionare il frigorifero, la televisione, i computer e tanti altri oggetti che usiamo ogni giorno.</h2>
              <h2>Tutto questo è possibile grazie alla nostra forza! Noi gocce d'acqua abbiamo un super potere: possiamo trasformarci in energia che è utilissima per le persone.</h2>
              <h2>Ma sai qual è la cosa più bella? Dopo essere passata attraverso la turbina, io continuo il mio viaggio nel fiume e posso ricominciare questa fantastica magia!.</h2>
            </div>
        </div>
      `
    }
  },
  'clean-energy': {
    0: {
      title: 'Goccia elettrica scopre l\'energia pulita',
      content: `
        <div class="step-content">
          <div class="character-container">
            <div class="character green-drop">
              <div class="character-face">
                <div class="character-eyes"></div>
                <div class="character-smile"></div>
              </div>
            </div>
          </div>
            <div class="step-text">
              <h2>Ciao! Ora sono <strong>Goccia Verde</strong>! Ti voglio raccontare perché l'energia che creiamo nelle centrali idroelettriche è così speciale!</h2>
              <h2>L'energia idroelettrica è un tipo di <strong>energia pulita</strong> o <strong>energia rinnovabile</strong>. Ma cosa significa?</h2>
              <h2>Significa che non inquina l'aria che respiriamo, non produce fumi o gas dannosi per il nostro pianeta.</h2>
              <h2>E la cosa più bella è che non finiamo mai! L'acqua continua il suo ciclo: dal cielo alla terra, e poi di nuovo al cielo. Per questo si dice che siamo una fonte di energia <strong>rinnovabile</strong>!</h2>
            </div>
        </div>
      `
    },
    1: {
      title: 'Confronto con altre fonti energetiche',
      content: `
        <div class="step-content">
          <div class="step-animation">
            <div class="comparison-animation">
              <div class="energy-type hydro">
                <div class="character green-drop small">
                  <div class="character-face">
                    <div class="character-eyes"></div>
                    <div class="character-smile"></div>
                  </div>
                </div>
                <span>Idroelettrico</span>
              </div>
              <div class="energy-type fossil">
                <div class="smoke-cloud"></div>
                <span>Carbone</span>
              </div>
            </div>
          </div>
            <div class="step-text">
              <h2>Non tutte le fonti di energia sono pulite come noi! Alcune fonti di energia, come il carbone o il petrolio, quando vengono utilizzate producono fumi che inquinano l'aria.</h2>
              <h2>Questi fumi contengono gas che contribuiscono al <strong>cambiamento climatico</strong>, rendendo il nostro pianeta più caldo del normale.</h2>
              <h2>Inoltre, il carbone e il petrolio sono <strong>risorse limitate</strong>: un giorno finiranno! Invece, l'acqua continua a circolare grazie al ciclo dell'acqua, quindi non finisce mai.</h2>
              <h2>Per questo è importante utilizzare fonti di energia rinnovabili come l'energia idroelettrica, ma anche l'energia solare che viene dal sole e l'energia eolica che viene dal vento.</h2>
            </div>
        </div>
      `
    },
    2: {
      title: 'Goccia Verde e il futuro sostenibile',
      content: `
        <div class="step-content">
          <div class="step-animation">
            <div class="future-animation">
              <div class="character green-drop flying">
                <div class="character-face">
                  <div class="character-eyes"></div>
                  <div class="character-smile"></div>
                </div>
              </div>
            </div>
          </div>
            <div class="step-text">
              <h2>Ora che conosci l'importanza dell'energia idroelettrica, puoi aiutare a proteggere il nostro pianeta!</h2>
              <h2>Ogni volta che risparmi energia, per esempio spegnendo le luci quando non servono o non lasciando la TV accesa quando nessuno la guarda, stai facendo del bene al pianeta!</h2>
              <h2>E ricorda: l'acqua è preziosa! Non sprecarla quando ti lavi i denti o fai la doccia.</h2>
              <h2>Insieme possiamo costruire un futuro <strong>sostenibile</strong>, dove tutti gli esseri viventi possono vivere felici e in salute sul nostro bellissimo pianeta Terra!</h2>
              <h2>Ora sei pronto per diventare un <strong>Piccolo Scienziato</strong> e proteggere il nostro ambiente?</h2>
            </div>
        </div>
      `
    }
  }
};

const ModuleContent = ({ module, step, onComplete, onBack }) => {
  if (!module || step === undefined) return <div>Caricamento...</div>;
  
  const content = moduleContents[module.id]?.[step];
  if (!content) return <div>Contenuto non trovato</div>;
  
  // Funzione per gestire la navigazione al passo precedente
  const handlePreviousStep = () => {
    // Qui impostiamo direttamente lo stato dello step precedente
    onComplete(step - 1);
  };
  
  // Funzione per gestire la navigazione al passo successivo
  const handleNextStep = () => {
    onComplete();
  };
  
  return (
    <div className="module-content-container">
      <div className="module-navigation">
        <button className="nav-button back" onClick={onBack}>
          <ArrowLeft />
          <span>Torna alla pagina principale</span>
        </button>
        <div className="module-progress-dots">
          {Array(module.steps).fill(0).map((_, i) => (
            <div 
              key={i} 
              className={`progress-dot ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`}
            ></div>
          ))}
        </div>
      </div>
      
      <div className="module-content-card">
        <h2 className="module-step-title">{content.title}</h2>
        
        <div className="module-step-content" dangerouslySetInnerHTML={{ __html: content.content }}></div>
        
        <div className="module-navigation-buttons">
          {step > 0 && (
            <button 
              className="step-button prev"
              onClick={handlePreviousStep}
            >
              <ArrowLeft />
              <span>Precedente</span>
            </button>
          )}
          
          <button 
            className="step-button next"
            onClick={handleNextStep}
          >
            <span>{step < module.steps - 1 ? 'Continua' : 'Vai al Quiz'}</span>
            <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleContent;