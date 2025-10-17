import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Star, Trophy, Target, Lightbulb } from 'lucide-react';

const QuizGame = ({ moduleId, onComplete, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerActive, setTimerActive] = useState(false);

  // Timer per ogni domanda (opzionale, può essere disabilitato)
  useEffect(() => {
    let timer;
    if (timerActive && timeLeft > 0 && selectedOption === null) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && selectedOption === null) {
      // Auto-submit se il tempo finisce
      handleOptionSelect(-1); // -1 significa nessuna risposta
    }
    return () => clearTimeout(timer);
  }, [timeLeft, timerActive, selectedOption]);

  // Database delle domande migliorato
  const quizQuestions = {
    'water-cycle': [
      {
        question: 'Da dove inizia il viaggio di Goccia Blu nella storia?',
        options: [
          'Dal mare Adriatico',
          'Da un fiocco di neve sulle Alpi',
          'Da una nuvola nel cielo',
          'Da un lago di montagna'
        ],
        correctAnswer: 1,
        explanation: 'Goccia Blu inizia il suo viaggio da un fiocco di neve candida sulle vette delle Alpi, che si scioglie con il calore del sole.',
        difficulty: 'easy',
        category: 'story'
      },
      {
        question: 'Qual è il nome del processo per cui l\'acqua del mare diventa vapore?',
        options: [
          'Condensazione',
          'Precipitazione',
          'Evaporazione',
          'Sublimazione'
        ],
        correctAnswer: 2,
        explanation: 'L\'evaporazione è il processo fisico per cui l\'acqua liquida si trasforma in vapore acqueo grazie al calore del sole.',
        difficulty: 'medium',
        category: 'science'
      },
      {
        question: 'Come si chiama il fiume più lungo d\'Italia che attraversa Goccia Blu?',
        options: [
          'Il Tevere',
          'L\'Arno',
          'Il Po',
          'L\'Adige'
        ],
        correctAnswer: 2,
        explanation: 'Il Po è il fiume più lungo d\'Italia con i suoi 652 km, attraversa la Pianura Padana da ovest a est.',
        difficulty: 'medium',
        category: 'geography'
      },
      {
        question: 'Il ciclo dell\'acqua è un processo che...',
        options: [
          'Finisce quando l\'acqua arriva al mare',
          'Si ripete continuamente in natura',
          'Avviene solo in estate',
          'Richiede l\'intervento dell\'uomo'
        ],
        correctAnswer: 1,
        explanation: 'Il ciclo dell\'acqua è un processo continuo e naturale: l\'acqua evapora, forma nuvole, precipita come pioggia e torna ai fiumi e mari.',
        difficulty: 'easy',
        category: 'science'
      },
      {
        question: 'Cosa succede a Goccia Blu quando arriva al mare?',
        options: [
          'Si ferma per sempre',
          'Evapora e diventa parte di una nuvola',
          'Diventa salata',
          'Scompare definitivamente'
        ],
        correctAnswer: 1,
        explanation: 'Quando Goccia Blu arriva al mare, il sole la fa evaporare e lei sale verso il cielo per diventare parte di una nuvola, iniziando un nuovo ciclo.',
        difficulty: 'easy',
        category: 'story'
      }
    ],
    'hydro-power': [
      {
        question: 'Qual è la funzione principale di una diga in una centrale idroelettrica?',
        options: [
          'Fermare completamente l\'acqua',
          'Creare un bacino di accumulo dell\'acqua',
          'Purificare l\'acqua dai batteri',
          'Riscaldare l\'acqua per produrre vapore'
        ],
        correctAnswer: 1,
        explanation: 'La diga crea un grande lago artificiale che accumula acqua. Questo bacino fornisce una riserva d\'acqua e crea il dislivello necessario per generare energia.',
        difficulty: 'medium',
        category: 'technology'
      },
      {
        question: 'Come si chiama la ruota gigante che gira grazie alla forza dell\'acqua?',
        options: [
          'Generatore',
          'Turbina',
          'Dinamo',
          'Rotore'
        ],
        correctAnswer: 1,
        explanation: 'La turbina è la grande ruota con pale metalliche che viene fatta girare dalla forza dell\'acqua. Il suo movimento rotatorio è fondamentale per produrre elettricità.',
        difficulty: 'easy',
        category: 'technology'
      },
      {
        question: 'Cosa trasforma il movimento della turbina in elettricità?',
        options: [
          'La diga',
          'Il generatore',
          'I cavi elettrici',
          'L\'acqua stessa'
        ],
        correctAnswer: 1,
        explanation: 'Il generatore è la macchina collegata alla turbina che trasforma l\'energia meccanica (movimento rotatorio) in energia elettrica attraverso il principio dell\'induzione elettromagnetica.',
        difficulty: 'medium',
        category: 'technology'
      },
      {
        question: 'Dopo aver fatto girare la turbina, cosa succede a Goccia Brillante?',
        options: [
          'Scompare per sempre',
          'Si trasforma in elettricità',
          'Continua il suo viaggio nel fiume',
          'Rimane bloccata nella turbina'
        ],
        correctAnswer: 2,
        explanation: 'Dopo aver ceduto la sua energia cinetica alla turbina, Goccia Brillante continua il suo viaggio nel fiume. L\'acqua non viene "consumata" nel processo di produzione elettrica.',
        difficulty: 'easy',
        category: 'story'
      },
      {
        question: 'L\'elettricità prodotta dalla centrale viene trasportata attraverso...',
        options: [
          'Tubi dell\'acqua',
          'Cavi elettrici',
          'Camion speciali',
          'Onde radio'
        ],
        correctAnswer: 1,
        explanation: 'L\'elettricità viaggia attraverso una rete di cavi elettrici ad alta tensione che portano l\'energia dalle centrali alle città, case e fabbriche.',
        difficulty: 'medium',
        category: 'technology'
      }
    ],
    'clean-energy': [
      {
        question: 'Perché l\'energia idroelettrica è considerata "pulita"?',
        options: [
          'Perché usa acqua cristallina',
          'Perché non produce gas inquinanti',
          'Perché le centrali sono bianche',
          'Perché pulisce l\'acqua'
        ],
        correctAnswer: 1,
        explanation: 'L\'energia idroelettrica è "pulita" perché durante la produzione di elettricità non vengono rilasciati gas serra o sostanze inquinanti nell\'atmosfera, a differenza delle centrali a carbone o petrolio.',
        difficulty: 'easy',
        category: 'environment'
      },
      {
        question: 'Quale di queste NON è una fonte di energia rinnovabile?',
        options: [
          'Energia solare (dal sole)',
          'Energia eolica (dal vento)',
          'Energia dal carbone',
          'Energia idroelettrica (dall\'acqua)'
        ],
        correctAnswer: 2,
        explanation: 'Il carbone è una fonte non rinnovabile perché si è formato in milioni di anni e le riserve sono limitate. Una volta bruciato, non si può rigenerare in tempi umani.',
        difficulty: 'medium',
        category: 'environment'
      },
      {
        question: 'Cosa significa che l\'energia idroelettrica è "rinnovabile"?',
        options: [
          'Che si può comprare di nuovo',
          'Che l\'acqua si rigenera naturalmente',
          'Che costa poco',
          'Che è moderna'
        ],
        correctAnswer: 1,
        explanation: 'L\'energia idroelettrica è rinnovabile perché l\'acqua si rigenera continuamente attraverso il ciclo naturale dell\'acqua: pioggia, fiumi, evaporazione e ancora pioggia.',
        difficulty: 'medium',
        category: 'environment'
      },
      {
        question: 'Come possiamo aiutare il pianeta secondo Goccia Verde?',
        options: [
          'Usando più energia possibile',
          'Risparmiando energia e acqua',
          'Accendendo sempre tutte le luci',
          'Usando solo energia dal carbone'
        ],
        correctAnswer: 1,
        explanation: 'Risparmiare energia e acqua sono azioni concrete che ognuno può fare per proteggere l\'ambiente e ridurre l\'impatto sul pianeta.',
        difficulty: 'easy',
        category: 'action'
      },
      {
        question: 'Qual è il superpotere di Goccia Verde?',
        options: [
          'Volare molto veloce',
          'Creare energia infinita senza inquinare',
          'Diventare invisibile',
          'Parlare con gli animali'
        ],
        correctAnswer: 1,
        explanation: 'Il superpotere di Goccia Verde è la capacità di generare energia pulita in modo continuo, senza mai esaurirsi e senza danneggiare l\'ambiente.',
        difficulty: 'easy',
        category: 'story'
      }
    ]
  };

  // Inizializza le domande quando il componente viene montato
  useEffect(() => {
    if (moduleId && quizQuestions[moduleId]) {
      // Reset lo stato del quiz
      setSelectedOption(null);
      setShowExplanation(false);
      setScore(0);
      setQuizCompleted(false);
      setCurrentQuestionIndex(0);
      setAnsweredQuestions([]);
      
      // Seleziona 4 domande casuali
      const allQuestions = quizQuestions[moduleId];
      const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
      setQuestions(shuffled.slice(0, 4));
      
      // Attiva timer (opzionale)
      // setTimerActive(true);
      setTimeLeft(30);
    }
  }, [moduleId]);

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: '#10b981',
      medium: '#f59e0b', 
      hard: '#ef4444'
    };
    return colors[difficulty] || '#6b7280';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      story: <Star size={16} />,
      science: <Lightbulb size={16} />,
      technology: <Target size={16} />,
      environment: '🌱',
      geography: '🗺️',
      action: '🚀'
    };
    return icons[category] || <Target size={16} />;
  };

  const handleOptionSelect = (optionIndex) => {
    if (selectedOption !== null || quizCompleted) return;
    
    setSelectedOption(optionIndex);
    const currentQuestion = questions[currentQuestionIndex];
    const correct = optionIndex === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    
    // Calcola punti basati su difficoltà e tempo
    let points = 0;
    if (correct) {
      const basePoints = {
        easy: 20,
        medium: 25,
        hard: 30
      };
      points = basePoints[currentQuestion.difficulty] || 25;
      
      // Bonus tempo (se timer attivo)
      if (timerActive && timeLeft > 20) points += 5;
      
      setScore(score + points);
    }
    
    // Salva la risposta
    setAnsweredQuestions([...answeredQuestions, {
      question: currentQuestion.question,
      selectedOption: optionIndex,
      correct: correct,
      points: points
    }]);
    
    setShowExplanation(true);
    setTimerActive(false);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setShowExplanation(false);
      setTimeLeft(30);
      setTimerActive(true);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleCompleteQuiz = () => {
    const finalScore = Math.round((score / (questions.length * 25)) * 100);
    onComplete(moduleId, finalScore);
  };

  const getScoreMessage = () => {
    const percentage = Math.round((score / (questions.length * 25)) * 100);
    if (percentage === 100) return "🎉 Perfetto! Sei un genio dell'energia pulita!";
    if (percentage >= 80) return "⭐ Eccellente! Hai una conoscenza fantastica!";
    if (percentage >= 60) return "👏 Bravo! Stai imparando molto bene!";
    if (percentage >= 40) return "💪 Buon lavoro! Continua a studiare!";
    return "📚 Non mollare! Rileggi le storie e riprova!";
  };

  if (questions.length === 0) {
    return <div className="quiz-loading">Preparazione del quiz personalizzato...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="quiz-container">
      <div className="quiz-navigation">
        <button className="nav-button back" onClick={onBack}>
          <ArrowLeft />
          <span>Torna alla storia</span>
        </button>
        <div className="quiz-progress-info">
          <div className="quiz-progress">
            Domanda {currentQuestionIndex + 1} di {questions.length}
          </div>
          <div className="quiz-progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
        <div className="quiz-score">
          Punti: {score}
        </div>
      </div>
      
      {!quizCompleted ? (
        <div className="quiz-card">
          <div className="question-header">
            <div className="question-meta">
              <span 
                className="difficulty-badge"
                style={{ backgroundColor: getDifficultyColor(currentQuestion.difficulty) }}
              >
                {currentQuestion.difficulty === 'easy' ? 'Facile' : 
                 currentQuestion.difficulty === 'medium' ? 'Medio' : 'Difficile'}
              </span>
              <span className="category-badge">
                {getCategoryIcon(currentQuestion.category)}
                {currentQuestion.category === 'story' ? 'Storia' :
                 currentQuestion.category === 'science' ? 'Scienza' :
                 currentQuestion.category === 'technology' ? 'Tecnologia' :
                 currentQuestion.category === 'environment' ? 'Ambiente' :
                 currentQuestion.category === 'geography' ? 'Geografia' : 'Azione'}
              </span>
            </div>
            
            {timerActive && (
              <div className="timer">
                <div className="timer-circle">
                  <span>{timeLeft}</span>
                </div>
              </div>
            )}
          </div>
          
          <h2 className="quiz-question">{currentQuestion.question}</h2>
          
          <div className="quiz-options">
            {currentQuestion.options.map((option, index) => (
              <button 
                key={index}
                className={`quiz-option ${
                  selectedOption === index ? 
                    (isCorrect ? 'correct' : 'incorrect') : 
                    ''
                } ${
                  selectedOption !== null && index === currentQuestion.correctAnswer ? 
                    'show-correct' : ''
                }`}
                onClick={() => handleOptionSelect(index)}
                disabled={selectedOption !== null}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="option-text">{option}</span>
                {selectedOption === index && (
                  isCorrect ? 
                    <CheckCircle2 className="result-icon correct" /> : 
                    <XCircle className="result-icon incorrect" />
                )}
                {selectedOption !== null && index === currentQuestion.correctAnswer && selectedOption !== index && (
                  <CheckCircle2 className="result-icon show-correct-icon" />
                )}
              </button>
            ))}
          </div>
          
          {showExplanation && (
            <div className={`quiz-explanation ${isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="explanation-header">
                {isCorrect ? (
                  <>
                    <Trophy className="explanation-icon" />
                    <h3>Fantastico! 🎉</h3>
                  </>
                ) : (
                  <>
                    <Lightbulb className="explanation-icon" />
                    <h3>Impariamo insieme! 💡</h3>
                  </>
                )}
              </div>
              <p className="explanation-text">{currentQuestion.explanation}</p>
              {isCorrect && (
                <div className="points-earned">
                  +{answeredQuestions[answeredQuestions.length - 1]?.points || 0} punti guadagnati!
                </div>
              )}
              <button 
                className="quiz-next-button"
                onClick={handleNextQuestion}
              >
                {currentQuestionIndex < questions.length - 1 ? 'Prossima Domanda' : 'Vedi il Risultato'} 
                <ArrowLeft style={{ transform: 'rotate(180deg)' }} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="quiz-result">
          <div className="result-header">
            <Trophy className="result-trophy" />
            <h2>Quiz Completato!</h2>
          </div>
          
          <div className="score-display">
            <div className="score-circle">
              <div className="score-number">{Math.round((score / (questions.length * 25)) * 100)}</div>
            </div>
            <div className="score-details">
              <p>Punti totali: <strong>{score}</strong></p>
              <p>Risposte corrette: <strong>{answeredQuestions.filter(q => q.correct).length}/{questions.length}</strong></p>
            </div>
          </div>
          
          <p className="result-message">{getScoreMessage()}</p>
          
          <div className="questions-review">
            <h3>Riepilogo delle tue risposte:</h3>
            {answeredQuestions.map((answer, index) => (
              <div key={index} className={`review-item ${answer.correct ? 'correct' : 'incorrect'}`}>
                <div className="review-icon">
                  {answer.correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                </div>
                <span>Domanda {index + 1}: {answer.correct ? `+${answer.points} punti` : '0 punti'}</span>
              </div>
            ))}
          </div>
          
          <button 
            className="complete-quiz-button"
            onClick={handleCompleteQuiz}
          >
            <Trophy />
            <span>Ricevi il tuo Badge!</span>
          </button>
        </div>
      )}

      <style jsx>{`
        .quiz-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border-radius: 1rem;
          min-height: 600px;
        }

        .quiz-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .nav-button {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          padding: 0.75rem 1.25rem;
          border: none;
          border-radius: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .nav-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
        }

        .quiz-progress-info {
          flex: 1;
          text-align: center;
        }

        .quiz-progress {
          font-size: 1.1rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .quiz-progress-bar {
          width: 100%;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #1d4ed8);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .quiz-score {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 0.75rem 1.25rem;
          border-radius: 0.75rem;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .quiz-card {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .question-meta {
          display: flex;
          gap: 1rem;
        }

        .difficulty-badge {
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .category-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: #f3f4f6;
          color: #374151;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .timer {
          display: flex;
          align-items: center;
        }

        .timer-circle {
          width: 3rem;
          height: 3rem;
          border: 3px solid #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #ef4444;
          animation: timerPulse 1s infinite;
        }

        @keyframes timerPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .quiz-question {
          font-size: 1.5rem;
          color: #1f2937;
          margin-bottom: 2rem;
          line-height: 1.4;
          text-align: center;
        }

        .quiz-options {
          display: grid;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .quiz-option {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          padding: 1rem 1.5rem;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          width: 100%;
        }

        .quiz-option:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #3b82f6;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        .quiz-option:disabled {
          cursor: not-allowed;
        }

        .quiz-option.correct {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          border-color: #10b981;
          color: #064e3b;
        }

        .quiz-option.incorrect {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          border-color: #ef4444;
          color: #7f1d1d;
        }

        .quiz-option.show-correct {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border-color: #3b82f6;
        }

        .option-letter {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          background: #e5e7eb;
          color: #374151;
          border-radius: 50%;
          font-weight: bold;
          flex-shrink: 0;
        }

        .quiz-option.correct .option-letter {
          background: #10b981;
          color: white;
        }

        .quiz-option.incorrect .option-letter {
          background: #ef4444;
          color: white;
        }

        .option-text {
          flex: 1;
          font-size: 1.1rem;
        }

        .result-icon {
          flex-shrink: 0;
        }

        .result-icon.correct {
          color: #10b981;
        }

        .result-icon.incorrect {
          color: #ef4444;
        }

        .result-icon.show-correct-icon {
          color: #3b82f6;
        }

        .quiz-explanation {
          padding: 1.5rem;
          border-radius: 0.75rem;
          animation: slideInUp 0.5s ease-out;
        }

        .quiz-explanation.correct {
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border: 2px solid #10b981;
        }

        .quiz-explanation.incorrect {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 2px solid #f59e0b;
        }

        .explanation-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .explanation-header h3 {
          margin: 0;
          font-size: 1.25rem;
        }

        .quiz-explanation.correct h3 {
          color: #065f46;
        }

        .quiz-explanation.incorrect h3 {
          color: #92400e;
        }

        .explanation-icon {
          color: inherit;
        }

        .explanation-text {
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 1rem;
          color: #374151;
        }

        .points-earned {
          background: rgba(16, 185, 129, 0.1);
          color: #065f46;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 600;
          text-align: center;
          margin-bottom: 1rem;
        }

        .quiz-next-button {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          padding: 0.75rem 2rem;
          border: none;
          border-radius: 0.75rem;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          transition: all 0.3s ease;
        }

        .quiz-next-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .quiz-result {
          text-align: center;
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .result-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .result-trophy {
          color: #f59e0b;
          width: 3rem;
          height: 3rem;
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .result-header h2 {
          color: #1f2937;
          font-size: 2rem;
          margin: 0;
        }

        .score-display {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .score-circle {
          position: relative;
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 32px rgba(59, 130, 246, 0.4);
        }

        .score-number {
          font-size: 2.5rem;
          font-weight: bold;
          line-height: 1;
        }

        .score-label {
          font-size: 1rem;
          opacity: 0.9;
        }

        .score-details {
          text-align: left;
        }

        .score-details p {
          margin: 0.5rem 0;
          font-size: 1.1rem;
          color: #374151;
        }

        .score-details strong {
          color: #1f2937;
        }

        .result-message {
          font-size: 1.2rem;
          color: #059669;
          font-weight: 600;
          margin-bottom: 2rem;
          padding: 1rem;
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
          border-radius: 0.75rem;
          border: 2px solid #10b981;
        }

        .questions-review {
          margin-bottom: 2rem;
        }

        .questions-review h3 {
          color: #374151;
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }

        .review-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
          margin-bottom: 0.5rem;
          border-radius: 0.5rem;
          font-size: 0.95rem;
        }

        .review-item.correct {
          background: rgba(16, 185, 129, 0.1);
          color: #065f46;
        }

        .review-item.incorrect {
          background: rgba(239, 68, 68, 0.1);
          color: #7f1d1d;
        }

        .review-icon {
          display: flex;
          align-items: center;
        }

        .complete-quiz-button {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 1rem 2rem;
          border: none;
          border-radius: 1rem;
          cursor: pointer;
          font-size: 1.2rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin: 0 auto;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }

        .complete-quiz-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.5);
        }

        .quiz-loading {
          text-align: center;
          padding: 3rem;
          font-size: 1.2rem;
          color: #6b7280;
        }

        @media (max-width: 768px) {
          .quiz-container {
            padding: 1rem;
          }

          .quiz-navigation {
            flex-direction: column;
            gap: 1rem;
          }

          .quiz-card {
            padding: 1.5rem;
          }

          .quiz-question {
            font-size: 1.25rem;
          }

          .score-display {
            flex-direction: column;
            gap: 1rem;
          }

          .question-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .question-meta {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .quiz-option {
            padding: 0.75rem 1rem;
          }

          .option-text {
            font-size: 1rem;
          }

          .quiz-question {
            font-size: 1.1rem;
          }

          .score-circle {
            width: 100px;
            height: 100px;
          }

          .score-number {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default QuizGame;