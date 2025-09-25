export const TourData = {
    3: {
        tourPoints: [
            {
                category: 'Centrale di produzione',
                title: "Esterno",
                description: "L'ingresso principale della centrale di Calcinere, caratterizzato da un portale in stile neoclassico, è stato realizzato nel 1921 in occasione dell'inaugurazione dell'impianto. La struttura in muratura, decorata con elementi architettonici tipici dell'epoca, rappresenta un esempio di architettura industriale di inizio Novecento, che coniuga stile e funzionalità.",
                media: [
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Ingresso principale.jpg",
                        is360: true, // Flag per identificare immagini panoramiche a 360°
                        initialView: {
                            yaw: 0,
                            pitch: 0,
                            hfov: 110
                        }
                    },
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Vasca di scarico.jpg",
                        is360: true,
                    },
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Condotte forzate.jpg",
                        is360: true,
                        initialView: {
                            yaw: 0.2,
                            pitch: 0,
                            hfov: 100
                        }
                    },
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Area esterna.jpg",
                        is360: true,
                    },
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Terrazzo.jpg",
                        is360: true,
                    },
                ]
            },
            {
                category: 'Centrale di produzione',
                title: "Piano terra",
                description: "L'ingresso principale della centrale di Calcinere, caratterizzato da un portale in stile neoclassico, è stato realizzato nel 1921 in occasione dell'inaugurazione dell'impianto. La struttura in muratura, decorata con elementi architettonici tipici dell'epoca, rappresenta un esempio di architettura industriale di inizio Novecento, che coniuga stile e funzionalità.",
                media: [
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Ingresso centrale.jpg",
                        is360: true,
                    },
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Sala macchine.jpg",
                        is360: true,
                        initialView: {
                            yaw: -0.1,
                            pitch: 0.1,
                            hfov: 110
                        },
                    infoPoints: [
                        {
                          yaw: 0.5,
                          pitch: 0.1,
                          title: "Turbina Francis",
                          description: "Questa turbina Francis ha una potenza di 10MW e opera con un salto idraulico di 100m."
                        },
                        {
                          yaw: -0.8,
                          pitch: 0.2,
                          title: "Generatore",
                          description: "Generatore sincrono trifase con potenza nominale di 12MVA."
                        }
                    ]
                    },
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Gruppo 1.jpg",
                    },
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Gruppo 2.jpg",
                    },
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Gruppo 3.jpg",
                    },
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Gruppo 4.jpg",
                    },
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Locale quadri.jpg",
                    },
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Locale controllo.jpg",
                        is360: true,
                        initialView: {
                            yaw: 0,
                            pitch: 0,
                            hfov: 100
                        }
                    },
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Sala interruttori.jpg",
                    },
                ]
            },
            {
                category: 'Centrale di produzione',
                title: "Piano interrato",
                description: "Il piano interrato della centrale ospita i componenti idraulici essenziali per il funzionamento delle turbine. Qui si trovano le tubazioni che convogliano l'acqua dalle condotte forzate alle turbine, i sistemi di controllo del flusso idrico e le apparecchiature ausiliarie. Questo spazio rappresenta il cuore tecnico dell'impianto, dove l'energia potenziale dell'acqua viene trasformata in energia meccanica.",
                media: [
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Piano interrato.jpg",
                        is360: true,
                        initialView: {
                            yaw: 0,
                            pitch: 0,
                            hfov: 110
                        }
                    },
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Interruttori.jpg",
                    },
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Gruppo elettrogeno.jpg",
                    },
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Trasformatori.jpg",
                    },
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Locale batterie.jpg",
                    },
                ]
            },
            {
                category: 'Centrale di produzione',
                title: "Piano superiore",
                description: "Il piano superiore della centrale ospita i quadri elettrici di comando e controllo. Originariamente qui si trovava la sala comandi con apparecchiature elettromeccaniche, oggi sostituite da sistemi digitali moderni. Da questo livello si ha una visione panoramica della sala macchine sottostante, permettendo di apprezzare l'imponenza dell'impianto produttivo.",
                media: [
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Locale alta tensione.jpg",
                        is360: true,
                        initialView: {
                            yaw: 0,
                            pitch: 0,
                            hfov: 100
                        }
                    },
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Locale sbarre.jpg",
                    },
                ]
            },
            {
                category: 'Opere di presa',
                title: "Opera di presa sul Po",
                description: "L'opera di presa sul fiume Po rappresenta il punto di inizio del sistema idraulico della centrale. Costruita nel 1921, questa struttura è progettata per captare l'acqua dal fiume e convogliarla attraverso un canale di derivazione fino alla vasca di carico. Include griglie per filtrare detriti e un sistema di paratoie per regolare la portata dell'acqua.",
                media: [
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Opera di presa Po.jpg",
                        is360: true,
                        initialView: {
                            yaw: 0,
                            pitch: 0,
                            hfov: 110
                        }
                    },
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Canale derivazione.jpg",
                    },
                    {
                        type: "video",
                        url: "/images/tour/calcinere/Opera di presa in funzione.mp4",
                    },
                ]
            },
            {
                category: 'Vasca di carico',
                title: "Vasca di carico",
                description: "La vasca di carico, situata a monte della centrale, rappresenta il punto di raccolta dell'acqua proveniente dai canali di derivazione. Da qui partono le condotte forzate che, con un dislivello di circa 270 metri, convogliano l'acqua alle turbine della centrale. Questo sistema garantisce la pressione necessaria per il funzionamento ottimale delle turbine Pelton.",
                media: [
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Vasca di carico panoramica.jpg",
                        is360: true,
                        initialView: {
                            yaw: 0,
                            pitch: 0,
                            hfov: 100
                        }
                    },
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Apparecchiature.jpg",
                    },
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Pozzo piezometrico.jpg",
                    },
                ]
            },
            {
                category: 'Sottostazione elettrica',
                title: "Sottostazione elettrica",
                description: "La sottostazione elettrica di Sanfront è caratterizzata da un design moderno e funzionale, che integra le apparecchiature di trasformazione e distribuzione dell'energia elettrica alla rete nazionale. Questa struttura è collegata alla centrale di Calcinere tramite una linea di trasmissione elettrica ad alta tensione.",
                media: [
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Vasca di carico panoramica.jpg",
                        is360: true,
                        initialView: {
                            yaw: 0,
                            pitch: 0,
                            hfov: 100
                        }
                    },
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Apparecchiature.jpg",
                    },
                    {
                        type: "image",
                        url: "/images/tour/calcinere/Pozzo piezometrico.jpg",
                    },
                ]
            },
        ],
        extraInfo: {
            operationalData: "La centrale di Calcinere, con una potenza installata di 16,5 MW, produce annualmente circa 52 GWh di energia elettrica rinnovabile, equivalente al fabbisogno di circa 19.000 famiglie. Il salto idraulico è di 270 metri, con una portata media di 7 m³/s.",
            tourDescription: "Il tour virtuale permette di esplorare i principali ambienti della centrale idroelettrica, dalle opere di presa fino alla sala macchine, offrendo una panoramica completa del processo di produzione dell'energia idroelettrica.",
            tourInstructions: "Le immagini a 360° possono essere esplorate cliccando sull'immagine e trascinando il mouse per guardare in ogni direzione. È possibile anche utilizzare la rotellina del mouse per ingrandire o rimpicciolire la vista."
        }
    }
    // Altre centrali verranno aggiunte qui...
};