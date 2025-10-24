export default {
  "scenes": [
    {
      "id": "0-es_ingresso-principale",
      "name": "ES_Ingresso principale",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": -0.4291964893717193,
        "pitch": -0.29650358646463815,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": -1.1814703049168056,
          "pitch": -0.08467741651759653,
          "rotation": 0,
          "target": "4-pt_ingresso-centrale"
        },
        {
          "yaw": -0.8670618456326853,
          "pitch": -0.108434596300647,
          "rotation": 0,
          "target": "5-pt_sala-macchine"
        },
        {
          "yaw": 0.48032186106038566,
          "pitch": -0.08907147179216501,
          "rotation": 0,
          "target": "1-es_vasca-di-scarico"
        },
        {
          "yaw": -1.649200311704277,
          "pitch": -0.01709333254349943,
          "rotation": 0,
          "target": "3-es_area-esterna"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "1-es_vasca-di-scarico",
      "name": "ES_Vasca di scarico",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": 1.371330126566967,
        "pitch": -0.017739530814122162,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": 0.8048780684125525,
          "pitch": -0.1422997508131374,
          "rotation": 0,
          "target": "2-es_condotte-forzate"
        },
        {
          "yaw": -2.0609723114906657,
          "pitch": 0.2003572965768754,
          "rotation": 0,
          "target": "0-es_ingresso-principale"
        },
        {
          "yaw": -0.2879745867527408,
          "pitch": -0.11860543638488608,
          "rotation": 0,
          "target": "5-pt_sala-macchine"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "2-es_condotte-forzate",
      "name": "ES_Condotte forzate",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": 1.2114528044064805,
        "pitch": -0.3258029008695047,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": -0.205043259156664,
          "pitch": -0.016151700085794474,
          "rotation": 0,
          "target": "3-es_area-esterna"
        },
        {
          "yaw": -1.5805333449764696,
          "pitch": 0.07343444113473474,
          "rotation": 0,
          "target": "11-pt_gruppo-1"
        },
        {
          "yaw": -2.3017007536534546,
          "pitch": 0.15983915035990748,
          "rotation": 0,
          "target": "1-es_vasca-di-scarico"
        },
        {
          "yaw": -0.40342904545564195,
          "pitch": 0.08695871600825633,
          "rotation": 0,
          "target": "29-pi_trasformatori-ausiliari"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "3-es_area-esterna",
      "name": "ES_Area esterna",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": -0.35578363084846387,
        "pitch": -0.1275755547420907,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": 1.1811416777597117,
          "pitch": -0.07360397637186367,
          "rotation": 0,
          "target": "0-es_ingresso-principale"
        },
        {
          "yaw": 0.46838734903995416,
          "pitch": 0.08075813773036167,
          "rotation": 0,
          "target": "26-pi_interruttori"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "4-pt_ingresso-centrale",
      "name": "PT_Ingresso centrale",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": 2.027452496355558,
        "pitch": 0.11121516464880266,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": 1.3846935140475836,
          "pitch": 0.014116356856849421,
          "rotation": 0,
          "target": "5-pt_sala-macchine"
        },
        {
          "yaw": -0.2330755042963304,
          "pitch": 0.2325299199049109,
          "rotation": 0,
          "target": "22-pi_-corridoio-1"
        },
        {
          "yaw": -1.74451745092186,
          "pitch": 0.1088735193547663,
          "rotation": 0,
          "target": "15-pt_alta-tensione"
        },
        {
          "yaw": 2.901726042781883,
          "pitch": 0.07880886870514558,
          "rotation": 0,
          "target": "0-es_ingresso-principale"
        },
        {
          "yaw": -0.27754861025875854,
          "pitch": -0.45442266714777446,
          "rotation": 0,
          "target": "33-p2_locale-sbarre-2"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "5-pt_sala-macchine",
      "name": "PT_Sala macchine",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": 0.11013734825432842,
        "pitch": -0.010194680771100195,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": -2.996202881486983,
          "pitch": 0.07145577638296885,
          "rotation": 0,
          "target": "4-pt_ingresso-centrale"
        },
        {
          "yaw": -2.4979900047089068,
          "pitch": 0.09835700778875278,
          "rotation": 0,
          "target": "6-pt_locale-controllo"
        },
        {
          "yaw": 2.8513133112146116,
          "pitch": 0.08696814418996013,
          "rotation": 0,
          "target": "7-pt_locale-quadri"
        },
        {
          "yaw": -1.3470938815694797,
          "pitch": 0.014765944402977738,
          "rotation": 0,
          "target": "8-pt_sala-macchine-1"
        },
        {
          "yaw": 1.6581226642949893,
          "pitch": 0.04395574457376483,
          "rotation": 0,
          "target": "9-pt_sala-macchine-2"
        },
        {
          "yaw": 0.19947095712996443,
          "pitch": -0.04752475275456369,
          "rotation": 0,
          "target": "10-pt_sala-macchine-3"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "6-pt_locale-controllo",
      "name": "PT_Locale controllo",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": -2.616801973825609,
        "pitch": 0.28467502584458515,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": 2.0089601847563063,
          "pitch": 0.1522502349441055,
          "rotation": 0,
          "target": "5-pt_sala-macchine"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "7-pt_locale-quadri",
      "name": "PT_Locale quadri",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": 2.888944446674185,
        "pitch": 0.21099857247020992,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": -2.0880669490035615,
          "pitch": 0.13439072319768997,
          "rotation": 0,
          "target": "5-pt_sala-macchine"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "8-pt_sala-macchine-1",
      "name": "PT_Sala macchine 1",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": 1.083106099489214,
        "pitch": 0,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": 0.8341649061375342,
          "pitch": -0.025455294858288013,
          "rotation": 0,
          "target": "11-pt_gruppo-1"
        },
        {
          "yaw": 1.7379294366662235,
          "pitch": 0.0026519886443079344,
          "rotation": 0,
          "target": "12-pt_gruppo-2"
        },
        {
          "yaw": 3.0967920218603027,
          "pitch": 0.24888329887757976,
          "rotation": 0,
          "target": "5-pt_sala-macchine"
        }
      ],
      "infoHotspots": [
        {
          "yaw": -2.0877794034319965,
          "pitch": 0.09609605812488553,
          "title": "Quadro elettrico_Gruppo 2",
          "text": "Text"
        },
        {
          "yaw": -1.2145620165269264,
          "pitch": 0.01852160759449184,
          "title": "Quadro elettrico_Gruppo 1",
          "text": "Text"
        }
      ]
    },
    {
      "id": "9-pt_sala-macchine-2",
      "name": "PT_Sala macchine 2",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": -2.3550672942216533,
        "pitch": 0.17651596607808706,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": -2.928133429707543,
          "pitch": 0.1702027792802987,
          "rotation": 0,
          "target": "13-pt_gruppo-3"
        },
        {
          "yaw": -1.875994589952132,
          "pitch": 0.1015152753859887,
          "rotation": 0,
          "target": "14-pt_gruppo-4"
        },
        {
          "yaw": -1.0436805543654852,
          "pitch": -0.03331175122985108,
          "rotation": 0,
          "target": "0-es_ingresso-principale"
        },
        {
          "yaw": 2.0377851750060794,
          "pitch": 0.06088765992382328,
          "rotation": 0,
          "target": "5-pt_sala-macchine"
        }
      ],
      "infoHotspots": [
        {
          "yaw": 0.8205361186989872,
          "pitch": -0.034823383656862106,
          "title": "Quadro elettrico_Gruppo 3",
          "text": "Text"
        },
        {
          "yaw": 0.0009628884851657915,
          "pitch": -0.033000124242432705,
          "title": "Quadro elettrico_Gruppo 4",
          "text": "Text"
        }
      ]
    },
    {
      "id": "10-pt_sala-macchine-3",
      "name": "PT_Sala macchine 3",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": -2.7991644021728206,
        "pitch": 0.008330096001905929,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": 2.898612429832136,
          "pitch": -0.38655243736728373,
          "rotation": 0,
          "target": "30-p1_vecchi-quadri-1"
        },
        {
          "yaw": -2.291031444322467,
          "pitch": -0.39330610366905283,
          "rotation": 0,
          "target": "31-p1_vecchi-quadri-2"
        },
        {
          "yaw": -2.8850871626944112,
          "pitch": 0.21321029799311475,
          "rotation": 0,
          "target": "5-pt_sala-macchine"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "11-pt_gruppo-1",
      "name": "PT_Gruppo 1",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": -2.585801087632028,
        "pitch": 0.10390296619700834,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": -2.3240564716657346,
          "pitch": 0.13489121937205617,
          "rotation": 0,
          "target": "8-pt_sala-macchine-1"
        }
      ],
    },
    {
      "id": "12-pt_gruppo-2",
      "name": "PT_Gruppo 2",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": 0.7510264736871157,
          "pitch": -0.025171577288846336,
          "rotation": 0,
          "target": "8-pt_sala-macchine-1"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "13-pt_gruppo-3",
      "name": "PT_Gruppo 3",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": -2.4866442591407,
        "pitch": 0.18298686428289201,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": -2.547304589838234,
          "pitch": 0.11041147472875679,
          "rotation": 0,
          "target": "9-pt_sala-macchine-2"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "14-pt_gruppo-4",
      "name": "PT_Gruppo 4",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": -0.2045954429905006,
          "pitch": 0.0023174833641412818,
          "rotation": 0,
          "target": "9-pt_sala-macchine-2"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "15-pt_alta-tensione",
      "name": "PT_Alta tensione",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": 2.620918190208558,
        "pitch": 0.21977364806474142,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": 2.515126843859851,
          "pitch": 0.2270883299150892,
          "rotation": 0,
          "target": "16-pt_alta-tensione-1"
        },
        {
          "yaw": -2.014292086458763,
          "pitch": 0.1403340139997642,
          "rotation": 0,
          "target": "4-pt_ingresso-centrale"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "16-pt_alta-tensione-1",
      "name": "PT_Alta tensione 1",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": 2.5556272223724417,
        "pitch": -0.008319665542382282,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": -2.6873320838540593,
          "pitch": 0.16971342941317857,
          "rotation": 0,
          "target": "19-pt_alta-tensione-4"
        },
        {
          "yaw": -0.6287179061689763,
          "pitch": -0.008418144235692537,
          "rotation": 0,
          "target": "15-pt_alta-tensione"
        },
        {
          "yaw": 2.5192836214144423,
          "pitch": 0.0888982138614196,
          "rotation": 0,
          "target": "17-pt_alta-tensione-2"
        },
        {
          "yaw": 1.9466805888469452,
          "pitch": 0.08412057507607429,
          "rotation": 0,
          "target": "18-pt_alta-tensione-3"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "17-pt_alta-tensione-2",
      "name": "PT_Alta tensione 2",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": 3.060409299172199,
        "pitch": 0.23044671658906601,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": -0.15332940714158205,
          "pitch": 0.055544568374592984,
          "rotation": 0,
          "target": "16-pt_alta-tensione-1"
        },
        {
          "yaw": -2.759658535262801,
          "pitch": 0.20964251751720298,
          "rotation": 0,
          "target": "21-pt_alta-tensione-6"
        },
        {
          "yaw": 0.40452822027934765,
          "pitch": 0.08825572767557688,
          "rotation": 0,
          "target": "18-pt_alta-tensione-3"
        },
        {
          "yaw": 3.005963771188365,
          "pitch": 0.23305909174544936,
          "rotation": 0,
          "target": "20-pt_alta-tensione-5"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "18-pt_alta-tensione-3",
      "name": "PT_Alta tensione 3",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": 2.046198701796662,
        "pitch": 0.030104038218613738,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": 3.03767101416757,
          "pitch": 0.1526505869862973,
          "rotation": 0,
          "target": "17-pt_alta-tensione-2"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "19-pt_alta-tensione-4",
      "name": "PT_Alta tensione 4",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": -2.8360747721802646,
        "pitch": 0.14550777229722556,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": 2.534539716960337,
          "pitch": 0.07799499809231136,
          "rotation": 0,
          "target": "16-pt_alta-tensione-1"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "20-pt_alta-tensione-5",
      "name": "PT_Alta tensione 5",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": 1.2873827777937148,
          "pitch": 0.08244774757022455,
          "rotation": 0,
          "target": "17-pt_alta-tensione-2"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "21-pt_alta-tensione-6",
      "name": "PT_Alta tensione 6",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": -1.3242772420308988,
        "pitch": 0.09565142125878978,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": 1.8096400506852035,
          "pitch": 0.06212498104074271,
          "rotation": 0,
          "target": "17-pt_alta-tensione-2"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "22-pi_-corridoio-1",
      "name": "PI_ Corridoio 1",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": 1.9309541106459598,
        "pitch": 0.016560679263001532,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": 1.1880762452532228,
          "pitch": 0.019133207794030938,
          "rotation": 0,
          "target": "25-pi_gruppo-elettrogeno"
        },
        {
          "yaw": 2.307953422386217,
          "pitch": 0.09552857168315043,
          "rotation": 0,
          "target": "26-pi_interruttori"
        },
        {
          "yaw": 1.5861281850423659,
          "pitch": -0.0065785658026715765,
          "rotation": 0,
          "target": "27-pi_locale-batterie"
        },
        {
          "yaw": -2.906443029964043,
          "pitch": -0.17915112351850837,
          "rotation": 0,
          "target": "4-pt_ingresso-centrale"
        },
        {
          "yaw": -1.3573763557817813,
          "pitch": 0.008950092476672111,
          "rotation": 0,
          "target": "24-pi_corridoio-3"
        },
        {
          "yaw": 1.750607306357427,
          "pitch": -0.02398497521068954,
          "rotation": 0,
          "target": "3-es_area-esterna"
        },
        {
          "yaw": 2.0223625180441873,
          "pitch": 0.02696315238565994,
          "rotation": 0,
          "target": "23-pi_corridoio-2"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "23-pi_corridoio-2",
      "name": "PI_Corridoio 2",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": 1.3230133831282682,
        "pitch": 0.04011425712053196,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": 1.1998817924579104,
          "pitch": 0.028117677600356217,
          "rotation": 0,
          "target": "29-pi_trasformatori-ausiliari"
        },
        {
          "yaw": -1.9051404073446143,
          "pitch": 0.07332925127834855,
          "rotation": 0,
          "target": "22-pi_-corridoio-1"
        },
        {
          "yaw": 1.4954037567394902,
          "pitch": 0.028001236026018006,
          "rotation": 0,
          "target": "28-pi_trasformatori"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "24-pi_corridoio-3",
      "name": "PI_Corridoio 3",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [
        {
          "yaw": 2.294823643985378,
          "pitch": 0.07948324845371246,
          "rotation": 0,
          "target": "22-pi_-corridoio-1"
        },
        {
          "yaw": 0.5320775499817714,
          "pitch": -0.2721974656050836,
          "rotation": 0,
          "target": "1-es_vasca-di-scarico"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "25-pi_gruppo-elettrogeno",
      "name": "PI_Gruppo Elettrogeno",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": 0.38291587849982633,
        "pitch": 0.09883452882155197,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": -0.9450786318232982,
          "pitch": 0.17599075419025922,
          "rotation": 0,
          "target": "22-pi_-corridoio-1"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "26-pi_interruttori",
      "name": "PI_Interruttori",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": 0.3936592954677476,
        "pitch": 0,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": -2.0414051273530767,
          "pitch": 0.07179526555018079,
          "rotation": 0,
          "target": "27-pi_locale-batterie"
        },
        {
          "yaw": 2.8072737126078504,
          "pitch": 0.1266870479276747,
          "rotation": 0,
          "target": "25-pi_gruppo-elettrogeno"
        },
        {
          "yaw": -0.7307706577402335,
          "pitch": 0.07984482531883685,
          "rotation": 0,
          "target": "23-pi_corridoio-2"
        },
        {
          "yaw": -1.7092555257017779,
          "pitch": 0.02011503559949901,
          "rotation": 0,
          "target": "3-es_area-esterna"
        },
        {
          "yaw": 2.281607625550336,
          "pitch": 0.13793895843251036,
          "rotation": 0,
          "target": "22-pi_-corridoio-1"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "27-pi_locale-batterie",
      "name": "PI_Locale batterie",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": 2.7999725890239837,
        "pitch": 0.1621899960148454,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": 1.3162970772342497,
          "pitch": 0.017523699182186547,
          "rotation": 0,
          "target": "22-pi_-corridoio-1"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "28-pi_trasformatori",
      "name": "PI_Trasformatori",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": -2.5554397020651614,
        "pitch": 0.11623410333315931,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": 0.7625394118986577,
          "pitch": 0.006166115858526666,
          "rotation": 0,
          "target": "23-pi_corridoio-2"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "29-pi_trasformatori-ausiliari",
      "name": "PI_Trasformatori ausiliari",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": -1.731196778878143,
        "pitch": 0.13802457094722698,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": -0.7799563542067691,
          "pitch": -0.0012459091723329152,
          "rotation": 0,
          "target": "23-pi_corridoio-2"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "30-p1_vecchi-quadri-1",
      "name": "P1_Vecchi quadri 1",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": -3.0523035785637767,
        "pitch": 0.4229113539089404,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": 1.8998025693849785,
          "pitch": 0.06272067353557631,
          "rotation": 0,
          "target": "31-p1_vecchi-quadri-2"
        },
        {
          "yaw": 3.0128408716832524,
          "pitch": 0.6868777106582158,
          "rotation": 0,
          "target": "5-pt_sala-macchine"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "31-p1_vecchi-quadri-2",
      "name": "P1_Vecchi quadri 2",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": -0.20839565162337514,
        "pitch": 0.1571165168382418,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [
        {
          "yaw": 1.0370524918350164,
          "pitch": -0.023260974205545182,
          "rotation": 0,
          "target": "30-p1_vecchi-quadri-1"
        },
        {
          "yaw": -1.1774410453815882,
          "pitch": 0.3719632740768333,
          "rotation": 0,
          "target": "11-pt_gruppo-1"
        },
        {
          "yaw": -0.4247853855820729,
          "pitch": 0.406536817905522,
          "rotation": 0,
          "target": "12-pt_gruppo-2"
        },
        {
          "yaw": 0.40399591962615666,
          "pitch": 0.5771806093313252,
          "rotation": 0,
          "target": "5-pt_sala-macchine"
        }
      ],
      "infoHotspots": []
    },
    {
      "id": "32-p2_locale-sbarre-1",
      "name": "P2_Locale sbarre 1",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": -0.41414407294860567,
        "pitch": -0.2871002167901935,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [],
      "infoHotspots": []
    },
    {
      "id": "33-p2_locale-sbarre-2",
      "name": "P2_Locale sbarre 2",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": -2.791444229069203,
        "pitch": 0.10386303933591456,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [],
      "infoHotspots": []
    },
    {
      "id": "34-p2_locale-sbarre-3",
      "name": "P2_Locale sbarre 3",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": 2.6286636233091283,
        "pitch": 0.058114975459350404,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [],
      "infoHotspots": []
    },
    {
      "id": "35-p2_locale-sbarre-4",
      "name": "P2_Locale sbarre 4",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": 2.3376073672006132,
        "pitch": 0.20687607120243,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [],
      "infoHotspots": []
    },
    {
      "id": "36-p2_locale-sbarre-5",
      "name": "P2_Locale sbarre 5",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "yaw": 1.6276140870941367,
        "pitch": -0.08311686078717351,
        "fov": 1.2752188746020257
      },
      "linkHotspots": [],
      "infoHotspots": []
    },
    {
      "id": "37-p2_terrazzo",
      "name": "P2_Terrazzo",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [],
      "infoHotspots": []
    },
    {
      "id": "38-p2_carroponte",
      "name": "P2_Carroponte",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [],
      "infoHotspots": []
    },
    {
      "id": "39-p3_partenza-linea-elettrica",
      "name": "P3_Partenza linea elettrica",
      "levels": [
        {
          "tileSize": 256,
          "size": 256,
          "fallbackOnly": true
        },
        {
          "tileSize": 512,
          "size": 512
        },
        {
          "tileSize": 512,
          "size": 1024
        },
        {
          "tileSize": 512,
          "size": 2048
        }
      ],
      "faceSize": 1920,
      "initialViewParameters": {
        "pitch": 0,
        "yaw": 0,
        "fov": 1.5707963267948966
      },
      "linkHotspots": [],
      "infoHotspots": []
    }
  ],
  "name": "Calcinere",
  "settings": {
    "mouseViewMode": "drag",
    "autorotateEnabled": true,
    "fullscreenButton": true,
    "viewControlButtons": true
  }
};
