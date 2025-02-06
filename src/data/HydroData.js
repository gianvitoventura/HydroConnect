import { saveAs } from 'file-saver';

export const hydroplants = [
  {
    id: 1,
    bacino: "Valle Stura di Demonte",
    name: "Forani",
    coordinates: [44.313779850706446, 7.25025320823646],
    power: "2846 kW", 
    type: "Ad acqua fluente",
    waterflow: "6,36 mc/s",
    jump: "45,65 m",
    machine: "3 turbine tipo Francis ad asse verticale",
    anno: "2003",
    canale: "0 m",
    condotta: "3200 m",
    modelUrl: "forani",
    description: "La Centrale è ubicata in località Forani, Comune di Aisone (CN), ed è posta in destra orografica rispetto al torrente Stura di Demonte.",
    models: {
      geometry: '/static/media/forani.frag',
      properties: '/static/media/forani.json'
    }
  },
  {
    id: 2,
    bacino: "Val Varaita",
    name: "Venasca",
    coordinates: [44.56412545170485, 7.415638301470339],
    power: "995 kW",
    type: "Ad acqua fluente",
    waterflow: "4,52 mc/s",
    jump: "22,42 m",
    anno: "1911",
    canale: "1500 m",
    condotta: "90 m",
    machine: "1 turbina Kaplan ad asse verticale ed 1 tipo Francis ad asse verticale",
    modelUrl: "venasca",
    description: "La Centrale è ubicata in Reg. San Bartolomeo – comune di Venasca (CN) e sfrutta una derivazione d'acqua dal torrente Varaita per mezzo di una traversa fissa in calcestruzzo cementizio, dotata di paratoia dissabbiatrice e scala di rimonta dell'ittiofauna.",
    models: {
      geometry: '/static/media/venasca.frag',
      properties: '/static/media/venasca.json'
    }
  },
  {
    id: 3,
    bacino: "Valle Po",
    name: "Calcinere",
    coordinates: [44.6863083119861, 7.240694226694585],
    power: "13060 kW", 
    type: "Ad acqua fluente",
    waterflow: "2,42 mc/s",
    jump: "545,75 m",
    canale: "10500 m",
    condotta: "1250 m",
    anno: "1922",
    machine: "4 Pelton monogetto ad asse orizzontale",
    modelUrl: "calcinere",
    description: "La Centrale è situata in frazione Calcinere nel comune di Paesana (CN). Il canale derivatore, lungo cairca 10 km in parte a cielo aperto e in parte in galleria, capta le acque di diversi torrenti tra cui il Po ai piedi del Monviso.",
    models: {
      geometry: '/static/media/calcinere.frag',
      properties: '/static/media/calcinere.json'
    }
  },
  {
    id: 4,
    bacino: "Valle Germanasca",
    name: "Tre Ponti",
    coordinates: [44.93739527532941, 7.231584957178381],
    power: "961 kW",
    type: "Ad acqua fluente",
    waterflow: "8,00 mc/s",
    jump: "122,5 m",
    machine: "1 Pelton ad asse verticale a sei getti",
    anno: "2012",
    canale: "0 m",
    condotta: "1540 m",
    modelUrl: "prali",
    description: "La Centrale è ubicata lungo la SP 169 al Km 13+770 nei territori di Salza di Pinerolo (l'opera di presa) e del comunte di Prali (la Centrale).",
    models: {
      geometry: '/static/media/prali.frag',
      properties: '/static/media/prali.json'
    }
  },
  {
    id: 5,
    bacino: "Val Chisone",
    name: "Meano",
    coordinates: [44.970277176761336, 7.184516854105987],
    power: "2395 kW",
    type: "A bacino",
    waterflow: "3,87 mc/s",
    jump: "90,5 m",
    machine: "3 turbine tipo Francis ad asse verticale",
    anno: "1946",
    canale: "2150 m",
    condotta: "585 m",
    modelUrl: "meano",
    description: "La Centrale è ubicata nel comune di Pomaretto (TO) mentre l'opera di presa si trova in comune di Perosa Argentina (TO) e deriva l’acqua dal torrente Chisone convogliando le acque sulla destra orografica del torrente.",
    models: {
      geometry: '/static/media/meano.frag',
      properties: '/static/media/meano.json'
    }
  },
  {
    id: 6,
    bacino: "Valle Stura",
    name: "Germagnano",
    coordinates: [45.27016526358903, 7.450369664022715],
    power: "2406 kW",
    type: "Ad acqua fluente",
    waterflow: "6,22 mc/s",
    jump: "39,45 m",
    machine: "2 tipo Francis ad asse verticale",
    anno: "1929",
    canale: "1700 m",
    condotta: "260 m",
    modelUrl: "germagnano",
    description: "La centrale idroelettrica è ubicata in località Colombaro nel Comune di Lanzo Torinese (TO). L'opera di presa, in sponda sinistra, deriva le acque dal torrente Stura di Lanzo tramite un argine con paratoie mobili.",
    models: {
      geometry: '/static/media/germagnano.frag',
      properties: '/static/media/germagnano.json'
    }
  },
  {
    id: 7,
    name: "Ceres",
    coordinates: [45.32562512811168, 7.35565845872465],
    power: "2633 kW",
    type: "A bacino",
    waterflow: "3,87 mc/s",
    jump: "69,41 m",
    machine: "3 Francis",
    anno: "1950",
    canale: "2200 m",
    condotta: "190 m",
    modelUrl: "ceres",
    description: "La centrale di Ceres è un importante impianto idroelettrico che sfrutta le acque del torrente Stura di Valli di Lanzo.",
    models: {
      geometry: '/static/media/ceres.frag',
      properties: '/static/media/ceres.json'
    }
  },
  {
    id: 8,
    name: "Grand Vert",
    coordinates: [45.59341191923658, 7.7746154645734],
    power: "5493 kW",
    type: "A bacino",
    waterflow: "46 mc/s",
    jump: "12,18 m",
    machine: "2 turbine Kaplan biregolanti ad asse verticale",
    anno: "1938",
    canale: "1500 m",
    condotta: "0 m",
    modelUrl: "grandvert",
    description: "La Centrale è ubicata in via Grand Vert,150 – comune di Donnas (AO) e deriva l’acqua dal fiume Dora Baltea tramite opera di presa.",
    models: {
      geometry: '/static/media/grandvert.frag',
      properties: '/static/media/grandvert.json'
    }
  },
  {
    id: 9,
    bacino: "Valle di Champorcher",
    name: "Donnas",
    coordinates: [45.60219022657053, 7.757794621294347],
    power: "969 kW",
    type: "Ad accumulo",
    waterflow: "18 mc/s",
    jump: "5,49 m",
    machine: "1 turbina Kaplan biregolanti ad asse verticale",
    anno: "1932",
    canale: "700 m",
    condotta: "0 m",
    modelUrl: "donnas",
    description: "La centrale idroelettrica è ubicata in sponda sinistra della Dora Baltea e intercetta le acque di scarico della centrale di Bard più a monte di proprietà di terzi.",
    models: {
      geometry: '/static/media/donnas.frag',
      properties: '/static/media/donnas.json'
    }
  },
  {
    id: 13,
    name: "Oliero",
    coordinates: [45.831452764122886, 11.697230954216382],
    power: "1014 kW",
    type: "Ad acqua fluente",
    waterflow: "7,5 mc/s",
    jump: "13,78 m",
    machine: "2 turbine Francis ad asse orizzontale",
    anno: "1928",
    canale: "2000 m",
    condotta: "0 m",
    modelUrl: "oliero",
    description: "La Centrale è ubicata in via Giusti,17 – comune di Campolongo sul Brenta (VI). L’opera di presa della centrale si trova presso le “Grotte di Oliero”, dove viene derivata l’acqua che sgorga dalle grotte stesse.",
    models: {
      geometry: '/static/media/oliero.frag',
      properties: '/static/media/oliero.json'
    }
  },
  {
    id: 14,
    name: "Ponte della Gobba",
    coordinates: [45.66414701708136, 12.256983497387028],
    power: "874 kW",
    type: "Ad acqua fluente",
    waterflow: "37 mc/s",
    jump: "2,41 m",
    machine: "2 turbine Kaplan ad asse orizzontale",
    anno: "1952",
    canale: "0 m",
    condotta: "0 m",
    modelUrl: "gobba",
    description: "La centrale è ubicata in via Alzaia 2 nella zona centrale della città di Treviso ed è costruita direttamente sul fiume Sile senza ricorrere all'uso di condotte forzate",
    models: {
      geometry: '/static/media/gobba.frag',
      properties: '/static/media/gobba.json'
    }
  },
  {
    id: 15,
    name: "Silea",
    coordinates: [45.651764091988575, 12.286976560921445],
    power: "1732 kW",
    type: "Ad acqua fluente",
    waterflow: "46,5 mc/s",
    jump: "3,8 m",
    machine: "2 turbine Kaplan ad asse verticale",
    anno: "1954",
    canale: "0 m",
    condotta: "0 m",
    modelUrl: "silea",
    description: "La Centrale è ubicata in via dei Tappi, 50 – comune di Silea (TV) ed è costruita direttamente sul fiume Sile senza ricorrere a condotte forzate.",
    models: {
      geometry: '/static/media/silea.frag',
      properties: '/static/media/silea.json'
    }
  },
  {
    id: 16,
    name: "Magnanins",
    coordinates: [46.54438481939021, 12.865815751840778],
    power: "2974 kW",
    type: "Ad acqua fluente",
    waterflow: "1,91 mc/s",
    jump: "158,8 m",
    machine: "2 turbine Francis ad asse orizzontale",
    anno: "1950",
    canale: "2000 m",
    condotta: "550 m",
    modelUrl: "magnanins",
    description: "La centrale, ubicata in località Magnanins – Comune di Rigolato (UD), sfrutta l'acqua del torrente Degano derivata dall'argine a soglia fissa in località Ponte Coperto",
    models: {
      geometry: '/static/media/magnanins.frag',
      properties: '/static/media/magnanins.json'
    }
  },
  {
    id: 17,
    name: "San Antonio",
    coordinates: [46.470337331287965, 13.578561622023024],
    power: "749 kW",
    type: "Ad accumulo",
    waterflow: "1,76 mc/s",
    jump: "43,38 m",
    machine: "2 turbine tipo Francis ad asse orizzontale",
    anno: "1949",
    canale: "1100 m",
    condotta: "900 m",
    modelUrl: "sanantonio",
    description: "L'impianto è situato in località San Antonio – comune di Tarvisio (UD) e devia le acque alla confluenza del Rio Lago e del Rio Bianco.",
    models: {
      geometry: '/static/media/sanantonio.frag',
      properties: '/static/media/sanantonio.json'
    }
  }
 ];
 
 const baseModelPath = '/static/media';

export const updateHydroData = async (newModel) => {
  const modelIndex = hydroplants.findIndex(plant => 
    plant.name.toLowerCase() === newModel.name.toLowerCase()
  );

  // Salva i file nella cartella corretta
  const baseName = newModel.name.toLowerCase();
  const fragPath = `${baseModelPath}/${baseName}.frag`;
  const jsonPath = `${baseModelPath}/${baseName}.json`;

  try {
    // Salva i file fisicamente
    const fragResponse = await fetch(newModel.geometry);
    const jsonResponse = await fetch(newModel.properties);
    
    const fragBlob = await fragResponse.blob();
    const jsonBlob = await jsonResponse.blob();
    
    saveAs(fragBlob, `${baseName}.frag`);
    saveAs(jsonBlob, `${baseName}.json`);

    // Aggiorna l'array hydroplants
    if (modelIndex !== -1) {
      hydroplants[modelIndex] = {
        ...hydroplants[modelIndex],
        models: {
          geometry: fragPath,
          properties: jsonPath
        }
      };
    } else {
      hydroplants.push({
        id: hydroplants.length + 1,
        name: newModel.name,
        coordinates: [0, 0],
        power: "N/A",
        type: "N/A",
        waterflow: "N/A",
        jump: "N/A",
        machine: "N/A",
        modelUrl: baseName,
        description: "",
        models: {
          geometry: fragPath,
          properties: jsonPath
        }
      });
    }

    // Restituisci i nuovi percorsi
    return {
      geometry: fragPath,
      properties: jsonPath
    };
  } catch (error) {
    console.error('Error saving model files:', error);
    throw error;
  }
};

export const getModelFilesByPlantId = (plantId) => {
  const plant = hydroplants.find(p => p.id === plantId);
  return plant?.models || null;
};