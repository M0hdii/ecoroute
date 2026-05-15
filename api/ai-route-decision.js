import Groq from "groq-sdk";

const TOMTOM_API_KEY = process.env.TOMTOM_API_KEY;

const cityCoords = {
  Tanger: [-5.8137, 35.7595],
  Tetouan: [-5.3684, 35.5785],
  Nador: [-2.9287, 35.1681],
  Oujda: [-1.9293, 34.6814],
  Kenitra: [-6.5802, 34.261],
  Rabat: [-6.8498, 34.0209],
  Casablanca: [-7.5898, 33.5731],
  Mohammedia: [-7.3833, 33.6833],
  ElJadida: [-8.5, 33.2333],
  Fes: [-5.0078, 34.0331],
  Meknes: [-5.5473, 33.8935],
  Marrakech: [-7.9811, 31.6295],
  BeniMellal: [-6.3498, 32.3373],
  Agadir: [-9.5981, 30.4278],
  Essaouira: [-9.7697, 31.5085],
  Ouarzazate: [-6.9094, 30.9335],
  Errachidia: [-4.428, 31.9314],
  Laayoune: [-13.2033, 27.1536],
};

function weatherLabel(code) {
  if ([0].includes(code)) return "Ciel dégagé";
  if ([1, 2, 3].includes(code)) return "Partiellement nuageux";
  if ([45, 48].includes(code)) return "Brouillard";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "Pluie";
  if ([95, 96, 99].includes(code)) return "Orage";
  return "Conditions variables";
}

async function getTraffic(city) {
  const coords = cityCoords[city];
  if (!coords || !TOMTOM_API_KEY) {
    return {
      risk: "Inconnu",
      congestionPercent: 0,
      message: !coords ? "Coordonnées indisponibles." : "Clé TomTom indisponible.",
      available: false,
    };
  }

  const [lng, lat] = coords;
  const offset = 0.025;
  const probes = [
    [lat, lng],
    [lat + offset, lng],
    [lat - offset, lng],
    [lat, lng + offset],
    [lat, lng - offset],
    [lat + offset, lng + offset],
    [lat - offset, lng - offset],
  ];

  const responses = await Promise.all(
    probes.map(async ([pLat, pLng]) => {
      const url =
        `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json` +
        `?key=${TOMTOM_API_KEY}&point=${pLat},${pLng}&unit=KMPH`;
      try {
        const r = await fetch(url);
        if (!r.ok) return null;
        const data = await r.json();
        return data.flowSegmentData || null;
      } catch {
        return null;
      }
    })
  );

  const segments = responses.filter(Boolean);
  if (!segments.length) {
    return {
      risk: "Inconnu",
      congestionPercent: 0,
      message: "Aucune donnée trafic.",
      available: false,
    };
  }

  segments.sort((a, b) => (b.freeFlowSpeed || 0) - (a.freeFlowSpeed || 0));
  const flow = segments[0];

  if (!flow?.freeFlowSpeed) {
    return {
      risk: "Inconnu",
      congestionPercent: 0,
      message: "Aucune mesure live disponible.",
      available: false,
    };
  }

  const congestionPercent = Math.max(
    0,
    Math.round((1 - flow.currentSpeed / flow.freeFlowSpeed) * 100)
  );
  const lowConfidence = (flow.confidence ?? 1) < 0.5;

  return {
    currentSpeed: flow.currentSpeed,
    freeFlowSpeed: flow.freeFlowSpeed,
    congestionPercent,
    confidence: flow.confidence,
    roadClass: flow.frc,
    risk: lowConfidence
      ? "Inconnu"
      : congestionPercent > 40
        ? "Élevé"
        : congestionPercent > 20
          ? "Moyen"
          : "Faible",
    message: lowConfidence
      ? "Mesure faible confiance"
      : congestionPercent > 40
        ? "Trafic dense détecté"
        : congestionPercent > 20
          ? "Trafic modéré détecté"
          : "Trafic fluide",
    available: !lowConfidence,
  };
}

async function getWeather(city) {
  const coords = cityCoords[city];
  if (!coords) {
    return { risk: "Inconnu", condition: "Indisponible", available: false };
  }

  const [lng, lat] = coords;
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,precipitation,weather_code,wind_speed_10m`;

  const response = await fetch(url);
  const data = await response.json();
  const current = data.current || {};

  return {
    temperature: current.temperature_2m,
    wind: current.wind_speed_10m,
    rain: current.precipitation,
    condition: weatherLabel(current.weather_code),
    risk:
      current.precipitation > 1 || current.wind_speed_10m > 35
        ? "Moyen"
        : "Faible",
  };
}

async function safeGetTraffic(city) {
  try {
    return await getTraffic(city);
  } catch {
    return { risk: "Inconnu", congestionPercent: 0, message: "Trafic indisponible.", available: false };
  }
}

async function safeGetWeather(city) {
  try {
    return await getWeather(city);
  } catch {
    return { risk: "Inconnu", condition: "Indisponible" };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({
      ok: true,
      message: "EcoRoute AI route decision API is running. Use POST to test AI.",
    });
  }

  try {
    const {
      startCity,
      destinationCity,
      waypoints = [],
      mode = "ai",
      scenarioKey = "normal",
      availableModes = ["ai", "eco", "classic"],
    } = req.body || {};

    if (!startCity || !destinationCity) {
      return res.status(400).json({
        error: "startCity and destinationCity are required.",
      });
    }

    const stops = [startCity, ...waypoints, destinationCity].filter(Boolean);
    const [trafficSignals, weatherSignals] = await Promise.all([
      Promise.all(stops.map((c) => safeGetTraffic(c))),
      Promise.all(stops.map((c) => safeGetWeather(c))),
    ]);

    const liveContext = stops.map((city, i) => ({
      city,
      traffic: trafficSignals[i],
      weather: weatherSignals[i],
    }));

    if (!process.env.GROQ_API_KEY) {
      return res.status(200).json({
        source: "fallback",
        recommendedMode: mode,
        optimizedStopOrder: waypoints,
        riskLevel: scenarioKey === "normal" ? "Faible" : "Moyen",
        reason:
          "GROQ_API_KEY est absente sur Vercel. EcoRoute utilise le calcul local.",
        advice: [
          "Ajoutez GROQ_API_KEY dans Vercel.",
          "Redéployez le projet après avoir ajouté la clé.",
        ],
        liveContext,
      });
    }

    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 700,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
Tu es RouteBot, une couche IA de décision logistique pour EcoRoute au Maroc.
Tu reçois des données temps réel (trafic TomTom, météo Open-Meteo) pour chaque arrêt.
Tu dois :
1. Choisir l'ordre des arrêts (waypoints) qui réduit le mieux les détours et les zones congestionnées.
2. Choisir le mode le plus adapté en t'appuyant sur les signaux temps réel :
   - "classic" (trajet rapide) si le trafic est fluide partout et qu'il faut gagner du temps.
   - "eco" (économie / CO₂) si le trafic et la météo sont stables et que la priorité est la consommation.
   - "ai" (équilibré) en cas de signaux mixtes ou incertains.
3. Si le mode actuel est déjà le plus pertinent, recommande-le. Si un autre mode est nettement meilleur, recommande-le et explique pourquoi.
4. Ne force jamais "eco" par défaut : la décision doit être justifiée par les données fournies.
5. Tu ne génères pas de coordonnées ni de géométrie : le tracé est calculé par OSRM ensuite.
Réponds uniquement en JSON valide, sans markdown.
          `,
        },
        {
          role: "user",
          content: JSON.stringify({
            startCity,
            destinationCity,
            waypoints,
            currentMode: mode,
            scenarioKey,
            availableModes,
            liveContext,
            modeDefinitions: {
              ai: "Équilibré : compromis distance / durée / carburant.",
              eco: "Économie de carburant et CO₂. Durée légèrement plus longue.",
              classic: "Trajet le plus rapide. Consommation plus élevée.",
            },
            instructions: {
              recommendedMode:
                "Choisir entre ai, eco, classic en fonction de liveContext et currentMode.",
              optimizedStopOrder:
                "Retourner uniquement les mêmes arrêts fournis, réordonnés si nécessaire. Ne jamais ajouter de ville.",
              riskLevel:
                "Choisir entre Faible, Moyen, Élevé en fonction du trafic et de la météo.",
              reason:
                "Expliquer brièvement en français pourquoi ce mode et cet ordre sont recommandés, en citant un signal concret (trafic %, pluie, vent...).",
              advice: "Liste de 2 à 4 conseils courts et concrets en français.",
            },
            outputShape: {
              recommendedMode: "ai",
              optimizedStopOrder: waypoints,
              riskLevel: "Faible",
              reason: "string",
              advice: ["string"],
            },
          }),
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content || "{}";

    let ai;
    try {
      ai = JSON.parse(content);
    } catch {
      ai = {};
    }

    const inputStops = new Set(waypoints);
    const cleanedOrder = Array.isArray(ai.optimizedStopOrder)
      ? ai.optimizedStopOrder.filter((city) => inputStops.has(city))
      : waypoints;

    const finalOrder =
      cleanedOrder.length === waypoints.length ? cleanedOrder : waypoints;

    const validModes = new Set(availableModes);
    const finalMode = validModes.has(ai.recommendedMode)
      ? ai.recommendedMode
      : mode;

    const validRisks = new Set(["Faible", "Moyen", "Élevé"]);
    const finalRisk = validRisks.has(ai.riskLevel)
      ? ai.riskLevel
      : scenarioKey === "normal"
        ? "Faible"
        : "Moyen";

    return res.status(200).json({
      source: "groq",
      recommendedMode: finalMode,
      optimizedStopOrder: finalOrder,
      riskLevel: finalRisk,
      reason:
        typeof ai.reason === "string"
          ? ai.reason
          : "L’IA recommande cet ordre pour réduire les détours et améliorer l’efficacité.",
      advice: Array.isArray(ai.advice)
        ? ai.advice.slice(0, 4).map(String)
        : ["Vérifier le trafic avant le départ.", "Surveiller l’ETA pendant la tournée."],
      liveContext,
    });
  } catch (error) {
    console.error("AI route decision error:", error);

    return res.status(200).json({
      source: "fallback",
      recommendedMode: req.body?.mode || "ai",
      optimizedStopOrder: req.body?.waypoints || [],
      riskLevel: req.body?.scenarioKey === "normal" ? "Faible" : "Moyen",
      reason:
        "La décision IA Groq est indisponible pour le moment. EcoRoute utilise le calcul local.",
      advice: [
        "Vérifiez GROQ_API_KEY dans Vercel.",
        "Consultez les logs Vercel pour voir l’erreur exacte.",
      ],
      liveContext: [],
    });
  }
}
