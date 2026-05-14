import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      startCity,
      destinationCity,
      waypoints = [],
      mode = "ai",
      scenarioKey = "normal",
    } = req.body || {};

    if (!startCity || !destinationCity) {
      return res.status(400).json({
        error: "startCity and destinationCity are required.",
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(200).json({
        source: "fallback",
        recommendedMode: mode,
        optimizedStopOrder: waypoints,
        riskLevel: scenarioKey === "normal" ? "Faible" : "Moyen",
        reason:
          "GROQ_API_KEY est absente sur Vercel. EcoRoute utilise le calcul local.",
        advice: [
          "Ajoutez GROQ_API_KEY dans les variables d’environnement Vercel.",
          "Redéployez le projet après l’ajout de la clé.",
        ],
      });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 700,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
Tu es RouteBot, une IA d'aide à la décision logistique pour EcoRoute.
Tu dois choisir le meilleur ordre des arrêts et le mode d'optimisation.
Ne génère pas de coordonnées ni de géométrie routière.
Réponds uniquement en JSON valide.
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
            expectedOutput: {
              recommendedMode: "ai | eco | classic",
              optimizedStopOrder: waypoints,
              riskLevel: "Faible | Moyen | Élevé",
              reason: "explication courte en français",
              advice: ["conseil 1", "conseil 2"],
            },
          }),
        },
      ],
    });

    const content = completion.choices?.[0]?.message?.content || "{}";
    const ai = JSON.parse(content);

    const inputStops = new Set(waypoints);
    const cleanedOrder = Array.isArray(ai.optimizedStopOrder)
      ? ai.optimizedStopOrder.filter((city) => inputStops.has(city))
      : waypoints;

    const finalOrder =
      cleanedOrder.length === waypoints.length ? cleanedOrder : waypoints;

    return res.status(200).json({
      source: "groq",
      recommendedMode: ["ai", "eco", "classic"].includes(ai.recommendedMode)
        ? ai.recommendedMode
        : mode,
      optimizedStopOrder: finalOrder,
      riskLevel: ["Faible", "Moyen", "Élevé"].includes(ai.riskLevel)
        ? ai.riskLevel
        : scenarioKey === "normal"
          ? "Faible"
          : "Moyen",
      reason:
        typeof ai.reason === "string"
          ? ai.reason
          : "L’IA recommande cet itinéraire pour améliorer l’efficacité logistique.",
      advice: Array.isArray(ai.advice)
        ? ai.advice.slice(0, 4)
        : ["Vérifier le trafic avant le départ."],
    });
  } catch (error) {
    console.error("AI route decision error:", error);

    return res.status(500).json({
      error: "AI route decision failed.",
      detail: error.message,
    });
  }
}