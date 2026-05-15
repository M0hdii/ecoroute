import express from "express";
import cors from "cors";
import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ADD YOUR TOMTOM KEY HERE
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
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code))
    return "Pluie";
  if ([95, 96, 99].includes(code)) return "Orage";
  return "Conditions variables";
}

// TomTom often snaps the city-center coord to a slow local street where
// currentSpeed == freeFlowSpeed, giving a fake "0%" congestion. We sample a
// small grid around the city and keep the segment with the highest free-flow
// speed — that's the highway/main road, where live measurements are real.
async function getTraffic(city) {
  const coords = cityCoords[city];
  if (!coords) {
    return {
      risk: "Inconnu",
      congestionPercent: 0,
      message: "Coordonnées indisponibles.",
      available: false,
    };
  }

  const [lng, lat] = coords;
  // ~3 km offset in degrees (1° lat ≈ 111 km).
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

  // Keep the segment on the largest road (highest freeFlowSpeed). FRC0–FRC2
  // are motorways and primary roads; FRC3+ are local/residential.
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

  // Confidence < 0.5 means TomTom is essentially guessing — flag it.
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

  const [lng, lat] = coords;

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,precipitation,weather_code,wind_speed_10m`;

  const response = await fetch(url);
  const data = await response.json();

  const current = data.current;

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

app.post("/api/realtime-data", async (req, res) => {
  try {
    const { startCity, destinationCity } = req.body;

    const [
      startTraffic,
      destinationTraffic,
      startWeather,
      destinationWeather,
    ] = await Promise.all([
      getTraffic(startCity),
      getTraffic(destinationCity),
      getWeather(startCity),
      getWeather(destinationCity),
    ]);

    res.json({
      traffic: {
        start: startTraffic,
        destination: destinationTraffic,
      },
      weather: {
        start: startWeather,
        destination: destinationWeather,
      },
      timeConstraint: {
        risk:
          destinationTraffic.congestionPercent > 40
            ? "Élevé"
            : "Faible",
        message:
          destinationTraffic.congestionPercent > 40
            ? "Risque de retard élevé."
            : "Fenêtres horaires stables.",
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Realtime data failed",
    });
  }
});

app.post("/api/optimize-route", async (req, res) => {
  try {
    const {
      startCity,
      destinationCity,
      mode,
      scenario,
    } = req.body;

    const start = cityCoords[startCity];
    const end = cityCoords[destinationCity];

    const osrmUrl =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${start[0]},${start[1]};${end[0]},${end[1]}` +
      `?overview=full&geometries=geojson&steps=true`;

    const osrmResponse = await fetch(osrmUrl);
    const osrmData = await osrmResponse.json();

    const realRoute = osrmData.routes[0];

    const distanceKm = Math.round(realRoute.distance / 1000);

    const estimatedTimeHours = Number(
      (realRoute.duration / 3600).toFixed(2)
    );

    const fuelLiters = Math.round(distanceKm * 0.09);

    const co2Kg = Math.round(distanceKm * 0.24);

    const estimatedCostMAD = Math.round(distanceKm * 3.6);

    const realtime = await fetch("http://localhost:5000/api/realtime-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startCity,
        destinationCity,
      }),
    });

    const realtimeData = await realtime.json();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "Tu es EcoRoute AI. Réponds toujours en français. Retourne uniquement du JSON valide.",
        },
        {
          role: "user",
          content: `
Ville départ: ${startCity}
Destination: ${destinationCity}
Mode: ${mode}
Scénario: ${scenario}

Distance: ${distanceKm} km
Temps: ${estimatedTimeHours} h

Temps réel:
${JSON.stringify(realtimeData)}

Retourne uniquement:
{
  "route": ["${startCity}", "${destinationCity}"],
  "distanceKm": ${distanceKm},
  "estimatedTimeHours": ${estimatedTimeHours},
  "fuelLiters": ${fuelLiters},
  "co2Kg": ${co2Kg},
  "estimatedCostMAD": ${estimatedCostMAD},
  "riskLevel": "Faible",
  "aiAdvice": [
    "Conseil trafic",
    "Conseil météo",
    "Conseil contraintes horaires"
  ]
}
`,
        },
      ],
    });

    const text = completion.choices[0].message.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const aiData = JSON.parse(text);

    res.json({
      ...aiData,
      realtimeData,
      geometry: realRoute.geometry,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Optimization failed",
    });
  }
});

app.post("/api/assistant", async (req, res) => {
  try {
    const {
      question,
      startCityLabel,
      destinationCityLabel,
      modeLabel,
      scenarioLabel,
      metrics,
      realtime,
      liveTime,
      currentAdvice,
      deliveryStops,
      selectedDelivery,
      routeAvailable,
    } = req.body;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.45,
      messages: [
        {
          role: "system",
          content: `
You are EcoRoute AI, a Moroccan logistics operations assistant.

Your style:
- Answer in French.
- Sound human, practical, and calm, like a logistics dispatcher talking to a driver or operations manager.
- Do NOT sound like a school report.
- Do NOT use generic labels like "Décision / Raison / Action opérationnelle" unless the user asks for a formal report.
- Do NOT mention Groq or the AI provider.
- Be specific to the current route, traffic, weather, time, metrics, and deliveries.
- If the route is not calculated yet, tell the user naturally to calculate the route first.
- Keep the answer short: 2 to 4 short paragraphs maximum.
- Give clear next steps.

How to answer:
1) Start with a direct recommendation in natural language.
2) Explain why using the available data.
3) Add one practical warning or next action.
4) Mention numbers only when useful.

Avoid this style:
"Décision : ... Raison : ... Action opérationnelle : ..."

Prefer this style:
"Oui, vous pouvez partir maintenant. Le trafic est fluide vers Casablanca et la météo ne montre pas de risque important. Avec une durée estimée de 1,79 h, la tournée reste confortable.

Je garderais quand même une petite marge avant le Client C, car c’est une livraison prioritaire. Vérifiez le carburant avant le départ et gardez l’ordre actuel des arrêts."
          `,
        },
        {
          role: "user",
          content: `
Question utilisateur:
${question}

Contexte actuel EcoRoute:
- Route calculée: ${routeAvailable ? "Oui" : "Non"}
- Départ: ${startCityLabel}
- Destination: ${destinationCityLabel}
- Mode choisi: ${modeLabel}
- Scénario: ${scenarioLabel}
- Heure locale: ${liveTime}

Métriques du trajet:
${JSON.stringify(metrics, null, 2)}

Données temps réel:
${JSON.stringify(realtime, null, 2)}

Décisions déjà affichées:
${JSON.stringify(currentAdvice, null, 2)}

Livraisons prévues:
${JSON.stringify(deliveryStops, null, 2)}

Livraison sélectionnée:
${JSON.stringify(selectedDelivery, null, 2)}

Réponds de manière humaine, concrète et contextualisée.
          `,
        },
      ],
    });

    res.json({
      answer: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("ASSISTANT ERROR:", error);
    res.status(500).json({ error: "Assistant failed" });
  }
});

// Helpers that never throw — Groq still gets useful context if a provider is down.
async function safeGetTraffic(city) {
  try {
    return await getTraffic(city);
  } catch {
    return { risk: "Inconnu", congestionPercent: 0, message: "Trafic indisponible." };
  }
}
async function safeGetWeather(city) {
  try {
    return await getWeather(city);
  } catch {
    return { risk: "Inconnu", condition: "Indisponible" };
  }
}

// AI route decision layer: Groq chooses the best stop order and mode.
// OSRM / RealMap still draws the real road geometry afterwards.
app.post("/api/ai-route-decision", async (req, res) => {
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

    // If no API key is configured, return a deterministic fallback so the app still works.
    if (!process.env.GROQ_API_KEY) {
      return res.json({
        source: "fallback",
        recommendedMode: mode,
        optimizedStopOrder: waypoints,
        riskLevel: scenarioKey === "normal" ? "Faible" : "Moyen",
        reason:
          "Clé GROQ_API_KEY absente : EcoRoute utilise l’ordre choisi localement.",
        advice: [
          "Ajoutez GROQ_API_KEY pour activer la décision IA réelle.",
          "Le tracé routier reste calculé par le moteur cartographique.",
        ],
      });
    }

    // Pull live traffic + weather for every stop so Groq decides on real data,
    // not on a static scenario string.
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

    const systemPrompt = `
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
`;

    const userPrompt = {
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
        riskLevel: "Choisir entre Faible, Moyen, Élevé en fonction du trafic et de la météo.",
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
    };

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 700,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(userPrompt) },
      ],
    });

    const content = completion.choices?.[0]?.message?.content || "{}";
    let ai = JSON.parse(content);

    const inputStops = new Set(waypoints);
    const cleanedOrder = Array.isArray(ai.optimizedStopOrder)
      ? ai.optimizedStopOrder.filter((city) => inputStops.has(city))
      : waypoints;

    // Safety: if AI dropped stops, keep the original order.
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

    return res.json({
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
    return res.status(500).json({
      error: "AI route decision failed.",
      detail: error.message,
    });
  }
});


app.listen(5000, () => {
  console.log("EcoRoute AI backend running on http://localhost:5000");
});