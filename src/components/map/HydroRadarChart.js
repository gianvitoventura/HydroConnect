import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, ResponsiveContainer } from 'recharts';

const HydroRadarChart = ({ plants = [], COLORS }) => {
  const extractNumber = (value) => {
    if (!value) return 0;
    const valueStr = value.toString();
    
    // Rimuovi la virgola solo per il salto
    if (valueStr.includes('m')) {
      return parseFloat(valueStr.replace(',', '.').replace(/[^\d.]/g, ''));
    }
    // Per gli altri valori, mantieni la virgola
    return parseFloat(valueStr.replace(/[^\d,]/g, ''));
  };

  // Verifica se almeno una centrale ha i dati di canale e condotta
  const hasCanaleData = plants.some(p => p.canale);
  const hasCondottaData = plants.some(p => p.condotta);

  const maxPower = Math.max(...plants.map(p => extractNumber(p.power)));
  const maxJump = Math.max(...plants.map(p => extractNumber(p.jump)));
  const maxFlow = Math.max(...plants.map(p => extractNumber(p.waterflow)));
  const maxCanale = hasCanaleData ? Math.max(...plants.map(p => extractNumber(p.canale))) : 0;
  const maxCondotta = hasCondottaData ? Math.max(...plants.map(p => extractNumber(p.condotta))) : 0;

  // Base parameters that are always present
  const parameters = [
    {
      parameter: "Potenza",
      unit: "kW",
      max: maxPower
    },
    {
      parameter: "Salto",
      unit: "m",
      max: maxJump
    },
    {
      parameter: "Portata",
      unit: "m³/s",
      max: maxFlow
    }
  ];

  // Add optional parameters if data is available
  if (hasCanaleData) {
    parameters.push({
      parameter: "Canale",
      unit: "m",
      max: maxCanale
    });
  }

  if (hasCondottaData) {
    parameters.push({
      parameter: "Condotta",
      unit: "m",
      max: maxCondotta
    });
  }

  const data = parameters.map(param => {
    const baseObj = {
      parameter: param.parameter,
      unit: param.unit
    };

    // Add data for each plant
    plants.forEach(plant => {
      let value = 0;
      switch (param.parameter) {
        case "Potenza":
          value = extractNumber(plant.power);
          break;
        case "Salto":
          value = extractNumber(plant.jump);
          break;
        case "Portata":
          value = extractNumber(plant.waterflow);
          break;
        case "Canale":
          value = extractNumber(plant.canale);
          break;
        case "Condotta":
          value = extractNumber(plant.condotta);
          break;
        default:
          value = 0;
      }
      baseObj[plant.name] = value;
    });

    return baseObj;
  });

  // Normalize data for display (0-100)
  const normalizedData = data.map(item => {
    const maxValue = parameters.find(p => p.parameter === item.parameter).max;
    
    return {
      ...item,
      ...Object.fromEntries(
        Object.entries(item)
          .filter(([key]) => key !== 'parameter' && key !== 'unit')
          .map(([key, value]) => [key, maxValue > 0 ? (value / maxValue) * 100 : 0])
      )
    };
  });

  return (
    <div style={{ 
      width: '100%', 
      height: '400px',
      backgroundColor: 'white',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={normalizedData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid gridType="circle" />
          <PolarAngleAxis 
            dataKey="parameter"
            tick={{ fill: '#4b5563', fontSize: 14 }}
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]}
            tick={{ fill: '#4b5563', fontSize: 12 }}
          />
          
          {plants.map((plant, index) => (
            <Radar
              key={plant.id || plant.name}
              name={plant.name}
              dataKey={plant.name}
              stroke={COLORS[index]}
              fill={COLORS[index]}
              fillOpacity={0.3}
            />
          ))}

          <Tooltip content={({ active, payload }) => {
            if (active && payload && payload.length > 0) {
              const originalData = data.find(d => d.parameter === payload[0].payload.parameter);
              const parameterName = originalData.parameter;

              const values = payload.map(entry => {
                const plant = plants.find(p => p.name === entry.dataKey);
                let originalValue = '';
                
                switch(parameterName) {
                  case 'Potenza':
                    originalValue = plant.power;
                    break;
                  case 'Salto':
                    originalValue = plant.jump;
                    break;
                  case 'Portata':
                    originalValue = plant.waterflow;
                    break;
                  case 'Canale':
                    originalValue = plant.canale;
                    break;
                  case 'Condotta':
                    originalValue = plant.condotta;
                    break;
                }
                
                return {
                  name: entry.dataKey,
                  value: originalValue
                };
              })
              .sort((a, b) => {
                // Estrai i numeri per l'ordinamento
                const aNum = parseFloat(a.value.replace(',', '.').replace(/[^\d.]/g, ''));
                const bNum = parseFloat(b.value.replace(',', '.').replace(/[^\d.]/g, ''));
                return bNum - aNum;
              }); // Ordina i valori dal più grande al più piccolo

              return (
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <p style={{ margin: '0 0 5px', fontWeight: 'bold', color: '#000' }}>
                    {parameterName}
                  </p>
                  {values.map(({name, value}) => (
                    <p key={name} style={{ margin: '2px 0', color: '#000' }}>
                      {name}: {value}
                    </p>
                  ))}
                </div>
              );
            }
            return null;
          }}/>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HydroRadarChart;