export const natureAreas = [
  {
    id: 1,
    name: "Monviso",
    type: "Parco Naturale",
    coordinates: [44.6704632169754, 7.090031573795473],
    elevation: "3.841 m s.l.m.",
    area: "8.727 ettari",
    description: "Il Monviso è la montagna più alta delle Alpi Cozie. Dal 2013 è patrimonio UNESCO come riserva della biosfera transfrontaliera con la Francia. Dal 2016 fa parte del Parco Naturale del Monviso sul settore italiano, mentre su quello francese insiste il parco naturale del Queyras.",
    features: ["Flora alpina", "Fauna protetta", "Ghiacciai", "Sentieri escursionistici"],
    protection: ["UNESCO", "Parco Naturale"],
    yearDesignation: 2013,
    url: "https://www.parcomonviso.eu/"
  },
  {
    id: 2,
    name: "Sorgente del Po",
    type: "Area Protetta",
    coordinates: [44.700439490550586, 7.09241542981489],
    elevation: "2.020 m s.l.m.",
    area: "50 ettari",
    description: "Pian del Re, ai piedi del Monviso, è il luogo dove nasce il Po, il fiume più lungo d'Italia. L'area è caratterizzata da torbiere e zone umide di alto valore naturalistico.",
    features: ["Sorgente", "Zone umide", "Flora endemica", "Habitat protetti"],
    protection: ["Area Protetta Regionale"],
    yearDesignation: 1990
  },
  {
    id: 3,
    name: "Monte Bracco",
    type: "SIC",
    coordinates: [44.681591183422945, 7.3390387514056385],
    elevation: "1.305 m s.l.m.",
    area: "1.732 ettari",
    description: "Il Monte Bracco è un massiccio montuoso che si erge isolato sulla pianura. È noto per la sua importante biodiversità e per il patrimonio geologico e mineralogico.",
    features: ["Rocce metamorfiche", "Flora xerofila", "Siti di arrampicata", "Sentieri naturalistici"],
    protection: ["Sito di Interesse Comunitario"],
    yearDesignation: 2000
  },
  {
    id: 4,
    name: "Bosco dell'Alevè",
    type: "Riserva Naturale",
    coordinates: [44.616667, 7.133333],
    elevation: "2.100 m s.l.m.",
    area: "825 ettari",
    description: "Il più esteso bosco di pino cembro delle Alpi occidentali. Rappresenta un habitat unico per la sua biodiversità e il suo valore paesaggistico.",
    features: ["Pino cembro", "Fauna alpina", "Habitat protetti"],
    protection: ["Riserva Naturale Speciale"],
    yearDesignation: 1980
  },
  {
    id: 5,
    name: "Grotte di Rio Martino",
    type: "Monumento Naturale",
    coordinates: [44.700833, 7.190278],
    elevation: "1.530 m s.l.m.",
    area: "10 ettari",
    description: "Complesso sistema di grotte carsiche con importanti formazioni geologiche e habitat per specie rare di chirotteri.",
    features: ["Grotte carsiche", "Chirotteri", "Formazioni geologiche"],
    protection: ["Monumento Naturale"],
    yearDesignation: 1995
  }
];

// Funzione helper per ottenere i dettagli di un'area naturale
export const getNatureAreaById = (areaId) => {
  return natureAreas.find(area => area.id === areaId);
};