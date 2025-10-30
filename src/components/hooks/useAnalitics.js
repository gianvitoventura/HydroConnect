// src/hooks/useAnalytics.js
import { useState, useEffect } from 'react';
import { db, auth } from '../../firebaseConfig';
import { 
  collection, 
  query,
  where,
  onSnapshot,
  getCountFromServer,
  Timestamp
} from 'firebase/firestore';

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    // Community Metrics
    totalUsers: 0,
    totalProjects: 0,
    totalVotes: 0,
    totalCustomProjects: 0,
    sumOfRatings: 0, // <-- AGGIUNTO: Somma totale dei punteggi
    activeUsers30Days: 0,
    
    // Kids Metrics
    hydrokidsCompletions: 0,
    hydrokidsStarted: 0,
    averageScore: 0,
    totalKidsPoints: 0, // <-- AGGIUNTO IL NUOVO CAMPO
    
    // General
    loading: true,
    error: null
  });

  useEffect(() => {
    let unsubscribeProjects;
    let unsubscribeVotes;
    let unsubscribeHydrokids;

    const fetchAnalytics = async () => {
      try {
        // 1. Conta Progetti Custom
        unsubscribeProjects = onSnapshot(
          query(collection(db, 'projects')),
          (snapshot) => {
            setAnalytics(prev => ({
              ...prev,
              totalProjects: snapshot.size,
              totalCustomProjects: snapshot.size
            }));
          }
        );

        // 2. Conta Voti Totali e Somma dei Punteggi (MODIFICATO)
        unsubscribeVotes = onSnapshot(
          collection(db, 'votes'),
          (snapshot) => {
            let sum = 0; // Inizializza la somma
            
            // Cicla su tutti i voti per sommare i punteggi
            snapshot.forEach(doc => {
              const data = doc.data();
              // Assumendo che il campo si chiami 'rating' e sia un numero
              if (typeof data.rating === 'number') {
                sum += data.rating;
              }
            });
            
            setAnalytics(prev => ({
              ...prev,
              totalVotes: snapshot.size, // Conteggio totale dei documenti (voti)
              sumOfRatings: sum // <-- Salviamo la somma di tutti i punteggi (1-5)
            }));
          }
        );

        // 3. Conta Completamenti Hydrokids (se collection esiste)
        try {
          unsubscribeHydrokids = onSnapshot(
            collection(db, 'hydrokids_progress'),
            (snapshot) => {
              let completions = 0;
              let totalScores = 0; // Per calcolare la media dei completati
              let started = 0;
              let grandTotalPoints = 0; // Per il totale complessivo
              
              snapshot.forEach(doc => {
                const data = doc.data();
                
                // Conta chi ha iniziato (almeno 1 lezione)
                if (data.completedLessons > 0) {
                  started++;
                }
                
                // Conta chi ha completato tutto
                if (data.completed) {
                  completions++;
                  if (data.score) totalScores += data.score;
                }
                
                // Calcola il totale di tutti i punti accumulati (per la metrica globale)
                if (data.score) {
                    grandTotalPoints += data.score;
                }
              });

              setAnalytics(prev => ({
                ...prev,
                hydrokidsCompletions: completions,
                hydrokidsStarted: started,
                averageScore: completions > 0 ? Math.round(totalScores / completions) : 0,
                totalKidsPoints: grandTotalPoints // <-- SALVATO IL TOTALE COMPLESSIVO
              }));
            }
          );
        } catch (error) {
          console.log('Hydrokids collection not found, skipping');
        }

        // 4. Conta Utenti Registrati (approssimazione dai progetti)
        // Nota: Firebase Auth non espone facilmente il count degli utenti
        // Usiamo una stima basata sui creatori di progetti
        const projectsSnapshot = await getCountFromServer(collection(db, 'projects'));
        const votesSnapshot = await getCountFromServer(collection(db, 'votes'));
        
        // Stima: utenti unici = progetti + (voti / 3)
        const estimatedUsers = projectsSnapshot.data().count + Math.floor(votesSnapshot.data().count / 3);
        
        setAnalytics(prev => ({
          ...prev,
          totalUsers: estimatedUsers,
          loading: false
        }));

      } catch (error) {
        console.error('Error fetching analytics:', error);
        setAnalytics(prev => ({
          ...prev,
          error: error.message,
          loading: false
        }));
      }
    };

    fetchAnalytics();

    // Cleanup
    return () => {
      if (unsubscribeProjects) unsubscribeProjects();
      if (unsubscribeVotes) unsubscribeVotes();
      if (unsubscribeHydrokids) unsubscribeHydrokids();
    };
  }, []);

  return analytics;
};

// Hook specifico per metriche Community
export const useCommunityMetrics = () => {
  const analytics = useAnalytics();
  const [previousMonth, setPreviousMonth] = useState({
    users: 0,
    projects: 0
  });

  useEffect(() => {
    // Carica dati del mese precedente da localStorage
    const saved = localStorage.getItem('vallepo_previous_month');
    if (saved) {
      setPreviousMonth(JSON.parse(saved));
    }

    // Salva dati correnti per il prossimo mese (ogni 30 giorni)
    const lastSave = localStorage.getItem('vallepo_last_save');
    const now = Date.now();
    
    if (!lastSave || now - parseInt(lastSave) > 30 * 24 * 60 * 60 * 1000) {
      localStorage.setItem('vallepo_previous_month', JSON.stringify({
        users: analytics.totalUsers,
        projects: analytics.totalProjects
      }));
      localStorage.setItem('vallepo_last_save', now.toString());
    }
  }, [analytics]);

  // Calcola trend percentuali
  const usersTrend = previousMonth.users > 0 
    ? Math.round(((analytics.totalUsers - previousMonth.users) / previousMonth.users) * 100)
    : 0;

  const projectsTrend = previousMonth.projects > 0
    ? Math.round(((analytics.totalProjects - previousMonth.projects) / previousMonth.projects) * 100)
    : 0;

  // 🔧 FIX: Calcola coinvolgimento sui progetti TOTALI (inclusi i predefiniti)
  const totalProjectsWithDefaults = analytics.totalProjects + 8;
  const engagement = totalProjectsWithDefaults > 0
    ? Math.round((analytics.totalVotes / totalProjectsWithDefaults) * 10)
    : 0;

  return {
    totalUsers: analytics.totalUsers,
    totalProjects: totalProjectsWithDefaults, // +8 progetti predefiniti
    customProjects: analytics.totalCustomProjects,
    totalVotes: analytics.totalVotes,
    sumOfRatings: analytics.sumOfRatings, // <-- ESPONE IL NUOVO CAMPO
    engagement: Math.min(engagement, 100), // Max 100%
    usersTrend,
    projectsTrend,
    loading: analytics.loading,
    error: analytics.error
  };
};

// Hook specifico per metriche Kids
export const useKidsMetrics = () => {
  const analytics = useAnalytics();

  // Calcola tasso di completamento
  const completionRate = analytics.hydrokidsStarted > 0
    ? Math.round((analytics.hydrokidsCompletions / analytics.hydrokidsStarted) * 100)
    : 0;

  return {
    totalAttempts: analytics.hydrokidsStarted,
    completions: analytics.hydrokidsCompletions,
    completionRate,
    averageScore: analytics.averageScore,
    totalKidsPoints: analytics.totalKidsPoints,
    loading: analytics.loading,
    error: analytics.error
  };
};

export default useAnalytics;