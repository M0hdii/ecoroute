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

async function getTraffic(city) {
  const coords = cityCoords[city];

  const [lng, lat] = coords;

  const url =
    `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json` +
    `?key=${TOMTOM_API_KEY}&point=${lat},${lng}`;

  const response = await fetch(url);
  const data = await response.json();

  const flow = data.flowSegmentData;

  if (!flow) {
    return {
      risk: "Inconnu",
      congestionPercent: 0,
      message: "Aucune donnée trafic.",
    };
  }

  const congestionPercent = Math.max(
    0,
    Math.round(
      (1 - flow.currentSpeed / flow.freeFlowSpeed) * 100
    )
  );

  return {
    currentSpeed: flow.currentSpeed,
    freeFlowSpeed: flow.freeFlowSpeed,
    congestionPercent,
    risk:
      congestionPercent > 40
        ? "Élevé"
        : congestionPercent > 20
        ? "Moyen"
        : "Faible",
    message:
      congestionPercent > 40
        ? "Trafic dense détecté"
        : congestionPercent > 20
        ? "Trafic modéré détecté"
        : "Trafic fluide",
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
app.listen(5000, () => {
  console.log("EcoRoute AI backend running on http://localhost:5000");
});