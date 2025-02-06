import { saveAs } from 'file-saver';

export const projects = [
  {
    id: 1,
    bacino: "Valle Po",
    name: "Centrale di Calcinere",
    coordinates: [44.6863083119861, 7.240694226694585],
    power: "13060 kW", 
    type: "Ad acqua fluente",
    waterflow: "2,42 mc/s",
    jump: "545,75 m",
    machine: "4 Pelton monogetto ad asse orizzontale",
    modelUrl: "calcinere",
    description: "La Centrale è situata in frazione Calcinere nel comune di Paesana (CN). Il canale derivatore, lungo cairca 10 km in parte a cielo aperto e in parte in galleria, capta le acque di diversi torrenti tra cui il Po ai piedi del Monviso.",
    models: {
      geometry: '/static/media/calcinere.frag',
      properties: '/static/media/calcinere.json'
    }
  },
  {
    id: 2,
    name: "Centrale di Ceres",
    coordinates: [45.32562512811168, 7.35565845872465],
    power: "2633 kW",
    type: "A bacino",
    waterflow: "3,87 mc/s",
    jump: "69,41 m",
    machine: "3 Francis",
    modelUrl: "ceres",
    description: "La centrale di Ceres è un importante impianto idroelettrico che sfrutta le acque del torrente Stura di Valli di Lanzo.",
    models: {
      geometry: '/static/media/ceres.frag',
      properties: '/static/media/ceres.json'
    }
  },
  {
    id: 3,
    name: "Centrale di Faroani",
    coordinates: [44.56412545170485, 7.415638301470339],
    power: "2846 kW",
    type: "A bacino",
    waterflow: "6,36 mc/s",
    jump: "45,65 m",
    machine: "3 di tipo Francis",
    modelUrl: "faroani",
    description: "La Centrale è ubicata in località Forani, Comune di Aisone (CN), ed è posta in destra orografica rispetto al torrente Stura di Demonte.",
    models: {
      geometry: '/static/media/faroani.frag',
      properties: '/static/media/faroani.json'
    }
  },
  {
    id: 4,
    name: "Centrale di Venasca",
    bacino: "Valle Maira",
    coordinates: [44.56412545170485, 7.415638301470339],
    power: "995 kW",
    type: "Ad acqua fluente",
    waterflow: "4,526 mc/s",
    jump: "22,42 m",
    machine: "1 Kaplan ad asse verticale ed 1 Francis ad asse verticale",
    modelUrl: "venasca",
    description: "La Centrale è ubicata in Reg. San Bartolomeo – comune di Venasca (CN) e sfrutta una derivazione d'acqua dal torrente Varaita per mezzo di una traversa fissa in calcestruzzo cementizio, dotata di paratoia dissabbiatrice e scala di rimonta dell'ittiofauna.",
    models: {
      geometry: '/static/media/venasca.frag',
      properties: '/static/media/venasca.json'
    }
  },
  {
    id: 5,
    name: "Centrale di Prali",
    coordinates: [44.93739527532941, 7.231584957178381],
    power: "961 kW",
    type: "Ad acqua fluente",
    waterflow: "8,00 mc/s",
    jump: "122,5 m",
    machine: "1 Pelton ad asse verticale a sei getti",
    modelUrl: "prali",
    description: "La Centrale è ubicata lungo la SP 169 al Km 13+770 – comune di Prali (TO) nei territori di Salza di Pinerolo (l'opera di presa) e di Prali (la Centrale).",
    models: {
      geometry: '/static/media/prali.frag',
      properties: '/static/media/prali.json'
    }
  },
  {
    id: 6,
    name: "Centrale di Meano",
    coordinates: [44.970277176761336, 7.184516854105987],
    power: "2406 kW",
    type: "Ad acqua fluente",
    waterflow: "6,22 mc/s",
    jump: "39,45 m",
    machine: "2 tipo Francis ad asse verticale",
    modelUrl: "meano",
    description: "La centrale idroelettrica è ubicata in località Colombaro nel Comune di Lanzo Torinese (TO). L'opera di presa, in sponda sinistra, deriva le acque dal torrente Stura di Lanzo tramite un argine con paratoie mobili.",
    models: {
      geometry: '/static/media/meano.frag',
      properties: '/static/media/meano.json'
    }
  },
  {
    id: 7,
    name: "Centrale di Donnas",
    coordinates: [45.59447142833289, 7.7766657865582935],
    power: "5493 kW",
    type: "Ad accumulo",
    waterflow: "18,00 mc/s",
    jump: "12,18 m",
    machine: "2 tipo Kaplan biregolanti ad asse verticale",
    modelUrl: "donnas",
    description: "La centrale idroelettrica è ubicata in via Grand Vert, n. 150, – nel Comune di Donnas (AO) e deriva l'acqua dal fiume Dora Baltea tramite un'opera di presa a soglia fissa e paratoie mobili, l'alimentazione del canale di adduzione, lungo circa 1.500 m.",
    models: {
      geometry: '/static/media/donnas.frag',
      properties: '/static/media/donnas.json'
    }
  },
  {
    id: 8,
    name: "Centrale di Magnanins",
    coordinates: [46.54438481939021, 12.865815751840778],
    power: "2974 kW",
    type: "Ad acqua fluente",
    waterflow: "1,91 mc/s",
    jump: "158,8 m",
    machine: "2 Francis ad asse orizzontale",
    modelUrl: "magnanins",
    description: "La centrale, ubicata in località Magnanins – Comune di Rigolato (UD), sfrutta l'acqua del torrente Degano derivata dall'argine a soglia fissa in località Ponte Coperto",
    models: {
      geometry: '/static/media/magnanins.frag',
      properties: '/static/media/magnanins.json'
    }
  },
  {
    id: 9,
    name: "Centrale di San Antonio",
    coordinates: [46.470337331287965, 13.578561622023024],
    power: "749 kW",
    type: "Ad accumulo",
    waterflow: "1,76 mc/s",
    jump: "43,38 m",
    machine: "2 tipo Francis",
    modelUrl: "san antonio",
    description: "L'impianto è situato in località San Antonio – comune di Tarvisio (UD) e devia le acque alla confluenza del Rio Lago e del Rio Bianco.",
    models: {
      geometry: '/static/media/san-antonio.frag',
      properties: '/static/media/san-antonio.json'
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