import { cities, cityCoords, deliveryStops } from "./data";

export function getCityCoords(cityKey) {
  if (!cityKey) return null;
  return cityCoords[cityKey] || null;
}

export function getCityLabel(cityKey) {
  if (!cityKey) return "";
  return cities[cityKey]?.label || cityKey;
}

export function getCityKeyFromLabel(label) {
  if (!label) return null;
  return (
    Object.keys(cities).find(
      (k) =>
        cities[k]?.label === label ||
        k === String(label).replaceAll(" ", "")
    ) || null
  );
}

export function getDeliveryStartCityKey(delivery) {
  if (!delivery) return "Kenitra";
  const previous = deliveryStops.find((s) => s.stop === delivery.stop - 1);
  if (!previous) return "Kenitra";
  return getCityKeyFromLabel(previous.city) || "Kenitra";
}

export function getDeliveryDestinationCityKey(delivery) {
  if (!delivery) return "Casablanca";
  return getCityKeyFromLabel(delivery.city) || "Casablanca";
}

export function hasDeliveryIncident(delivery) {
  return delivery?.stop === 3;
}

export function getDeliveryIncidentText(delivery) {
  if (!hasDeliveryIncident(delivery)) return "";
  return "Incident détecté à mi-parcours : RouteBot recalcule la trajectoire depuis la position actuelle du camion.";
}

export function getDeliveryEtaUpdate(delivery) {
  if (!hasDeliveryIncident(delivery)) return null;
  return {
    oldEta: "13:05",
    newEta: "13:19",
    delayMinutes: 14,
    windowEnd: "14:00",
    marginMinutes: 41,
    status: "Dans la fenêtre",
    reason: "déviation automatique après incident",
  };
}

export function getMoroccoTimeString() {
  return new Intl.DateTimeFormat("fr-MA", {
    timeZone: "Africa/Casablanca",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

export function riskBadge(risk) {
  if (risk === "Élevé" || risk === "High")
    return {
      color: "#f87171",
      bg: "rgba(248,113,113,0.12)",
      border: "rgba(248,113,113,0.32)",
      label: "Élevé",
    };
  if (risk === "Moyen" || risk === "Medium")
    return {
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.12)",
      border: "rgba(251,191,36,0.32)",
      label: "Moyen",
    };
  return {
    color: "#34d399",
    bg: "rgba(52,211,153,0.12)",
    border: "rgba(52,211,153,0.32)",
    label: "Faible",
  };
}

export function priorityBadge(priority) {
  if (priority === "Haute")
    return { color: "#f87171", bg: "rgba(248,113,113,0.12)" };
  if (priority === "Moyenne")
    return { color: "#fbbf24", bg: "rgba(251,191,36,0.12)" };
  return { color: "#94a3b8", bg: "rgba(148,163,184,0.10)" };
}

function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

/**
 * Simulate a route optimization purely client-side so the app works
 * without the backend (server.js is still there for the real Groq/OSRM path).
 */
export function computeRouteMetrics({ startCity, destinationCity, mode, scenarioKey }) {
  const from = getCityCoords(startCity);
  const to = getCityCoords(destinationCity);
  if (!from || !to) return null;

  const baseRoad = Math.max(35, Math.round(haversineKm(from, to) * 1.28));

  const distanceKm =
    mode === "classic"
      ? Math.round(baseRoad * 0.96)
      : mode === "eco"
      ? Math.round(baseRoad * 1.04)
      : baseRoad;

  const avgSpeed = mode === "classic" ? 96 : mode === "eco" ? 76 : 86;
  const scenarioDelay =
    scenarioKey === "rain" ? 0.28 : scenarioKey === "peak" ? 0.16 : 0;

  const estimatedTimeHours = Number(
    ((distanceKm / avgSpeed) * (1 + scenarioDelay)).toFixed(2)
  );

  const fuelRate = mode === "classic" ? 0.135 : mode === "eco" ? 0.092 : 0.112;
  const fuelLiters = Math.round(distanceKm * fuelRate);
  const co2Kg = Math.round(fuelLiters * 2.45);

  const costRate = mode === "classic" ? 3.45 : mode === "eco" ? 2.75 : 3.1;
  const estimatedCostMAD = Math.round(distanceKm * costRate);

  const riskLevel =
    scenarioKey === "rain"
      ? "Élevé"
      : scenarioKey === "peak"
      ? "Moyen"
      : "Faible";

  return {
    distanceKm,
    estimatedTimeHours,
    fuelLiters,
    co2Kg,
    estimatedCostMAD,
    riskLevel,
  };
}

/**
 * Heuristic scenario detection from the (startCity, destinationCity) pair.
 */
export function detectScenarioKey(startCity, destinationCity) {
  if (!startCity || !destinationCity) return "normal";
  const key = `${startCity}-${destinationCity}`.toLowerCase();
  if (key.includes("casablanca") || key.includes("mohammedia")) return "traffic";
  if (key.includes("tanger") || key.includes("tetouan")) return "weather";
  if (key.includes("marrakech") || key.includes("agadir")) return "incident";
  return "normal";
}

export function scenarioDescription(detectedKey) {
  switch (detectedKey) {
    case "incident":
      return {
        title: "Incident détecté",
        description:
          "L'IA détecte un incident actif via les alertes temps réel et adapte la trajectoire.",
        accent: "#f87171",
      };
    case "traffic":
      return {
        title: "Congestion urbaine",
        description:
          "L'IA détecte une circulation chargée et évite les zones lentes.",
        accent: "#fbbf24",
      };
    case "weather":
      return {
        title: "Météo défavorable",
        description:
          "L'IA détecte un risque météo et ajuste la recommandation de trajet.",
        accent: "#22d3ee",
      };
    default:
      return {
        title: "Conditions normales",
        description:
          "L'IA analyse les données temps réel et ne détecte aucun risque majeur.",
        accent: "#6ee7b7",
      };
  }
}

export function formatNumber(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("fr-FR").format(n);
}

export function buildRouteBotAnswer({
  question,
  startCity,
  destinationCity,
  mode,
  scenarioKey,
  metrics,
  hasRoute,
  selectedDelivery,
}) {
  const q = String(question || "").toLowerCase();
  const fromLabel = getCityLabel(startCity) || "—";
  const toLabel = getCityLabel(destinationCity) || "—";

  if (!hasRoute) {
    return `Je n'ai pas encore de trajet calculé. Sélectionnez un départ et une destination, puis lancez le calcul — je pourrai ensuite vous répondre précisément avec les données du trajet.`;
  }

  const modeLabel =
    mode === "classic" ? "rapide" : mode === "eco" ? "éco" : "IA";
  const scenarioLabel =
    scenarioKey === "traffic"
      ? "congestion urbaine"
      : scenarioKey === "weather"
      ? "risque météo"
      : scenarioKey === "incident"
      ? "incident actif"
      : "conditions normales";

  if (q.includes("pars") || q.includes("part") || q.includes("maintenant")) {
    if (scenarioKey === "incident")
      return `Je ne partirais pas tout de suite pour ${toLabel} : un incident est en cours sur le trajet. J'attendrais quelques minutes que RouteBot valide la déviation. Les métriques actuelles : ${metrics.estimatedTimeHours} h, ${metrics.distanceKm} km, risque ${metrics.riskLevel.toLowerCase()}.`;
    if (scenarioKey === "traffic")
      return `Oui, vous pouvez partir — mais partez rapidement. ${fromLabel} → ${toLabel} traverse une zone chargée et la durée estimée est ${metrics.estimatedTimeHours} h en mode ${modeLabel}. Je vérifierais le carburant avant de démarrer.`;
    return `Oui, c'est un bon moment pour partir. ${fromLabel} → ${toLabel} est stable : ${metrics.estimatedTimeHours} h de trajet, ${metrics.distanceKm} km, coût estimé ${metrics.estimatedCostMAD} MAD.`;
  }

  if (q.includes("priorit") || q.includes("client")) {
    if (selectedDelivery)
      return `La livraison sélectionnée (arrêt ${selectedDelivery.stop} · ${selectedDelivery.client} à ${selectedDelivery.city}) est prioritaire : fenêtre ${selectedDelivery.window}, priorité ${selectedDelivery.priority.toLowerCase()}. Je garderais une marge de sécurité de 15 min avant la fenêtre.`;
    return `Sur la feuille de route du jour, Client C (Casablanca, fenêtre 12:00–14:00) est le plus exposé. Prioriser cet arrêt limite le risque de pénalité.`;
  }

  if (q.includes("itinéraire") || q.includes("itineraire") || q.includes("conseil")) {
    return `L'itinéraire ${fromLabel} → ${toLabel} en mode ${modeLabel} est recommandé car il équilibre durée (${metrics.estimatedTimeHours} h) et consommation (${metrics.fuelLiters} L). Contexte actuel : ${scenarioLabel}.`;
  }

  if (q.includes("retard") || q.includes("risque")) {
    return `Le risque de retard est ${metrics.riskLevel.toLowerCase()}. Le facteur principal est : ${scenarioLabel}. Je surveillerais les 30 premières minutes du trajet.`;
  }

  if (q.includes("co") || q.includes("carbur") || q.includes("coût") || q.includes("cout")) {
    return `Pour réduire le coût et le CO₂, passez en mode éco : vous gagnez ~15 % de carburant. Sur ce trajet, l'éco ramènerait la consommation autour de ${Math.round(
      metrics.fuelLiters * 0.82
    )} L et le coût proche de ${Math.round(
      metrics.estimatedCostMAD * 0.88
    )} MAD, au prix de ~15 min en plus.`;
  }

  return `Voici ce que je lis pour ${fromLabel} → ${toLabel} en mode ${modeLabel} : ${metrics.distanceKm} km, ${metrics.estimatedTimeHours} h, ${metrics.fuelLiters} L, ${metrics.co2Kg} kg CO₂, coût ${metrics.estimatedCostMAD} MAD, risque ${metrics.riskLevel.toLowerCase()}. Dites-moi si vous voulez que je compare un autre scénario.`;
}
