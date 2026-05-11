import { cities, cityCoords, deliveryStops } from "./constants";

export function getCityCoords(cityKey) {
  if (!cityKey) return null;
  return cityCoords[cityKey] || null;
}

export function getCityKeyFromLabel(label) {
  return Object.keys(cities).find(
    (key) =>
      cities[key]?.label === label || key === String(label).replaceAll(" ", "")
  );
}

export function getDeliveryStartCityKey(delivery) {
  if (!delivery) return "Kenitra";
  const previousStop = deliveryStops.find(
    (item) => item.stop === delivery.stop - 1
  );
  if (!previousStop) return "Kenitra";
  return getCityKeyFromLabel(previousStop.city) || "Kenitra";
}

export function getDeliveryDestinationCityKey(delivery) {
  if (!delivery) return "Casablanca";
  return getCityKeyFromLabel(delivery.city) || "Casablanca";
}

export function getDeliveryProgress(delivery) {
  if (!delivery) return 0.5;
  const progressByStop = { 1: 0.72, 2: 0.58, 3: 0.46, 4: 0.34 };
  return progressByStop[delivery.stop] ?? 0.5;
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

export function getDeliveryEtaLabel(delivery) {
  const eta = getDeliveryEtaUpdate(delivery);
  if (!eta) return "";
  return `${eta.oldEta} → ${eta.newEta} · ${eta.status}`;
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
  if (risk === "Élevé" || risk === "High") {
    return {
      color: "#fb7185",
      bg: "rgba(251,113,133,0.14)",
      border: "rgba(251,113,133,0.35)",
      label: "Élevé",
    };
  }
  if (risk === "Moyen" || risk === "Medium") {
    return {
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.14)",
      border: "rgba(251,191,36,0.35)",
      label: "Moyen",
    };
  }
  return {
    color: "#34d399",
    bg: "rgba(52,211,153,0.14)",
    border: "rgba(52,211,153,0.35)",
    label: "Faible",
  };
}

export function priorityBadge(priority) {
  if (priority === "Haute")
    return { color: "#fb7185", bg: "rgba(251,113,133,0.12)" };
  if (priority === "Moyenne")
    return { color: "#fbbf24", bg: "rgba(251,191,36,0.12)" };
  return { color: "#94a3b8", bg: "rgba(148,163,184,0.10)" };
}

export function detectScenario(startCity, destinationCity) {
  if (!startCity || !destinationCity) return "normal";
  const routeKey = `${startCity}-${destinationCity}`.toLowerCase();
  if (routeKey.includes("casablanca") || routeKey.includes("mohammedia"))
    return "traffic";
  if (routeKey.includes("tanger") || routeKey.includes("tetouan"))
    return "weather";
  if (routeKey.includes("marrakech") || routeKey.includes("agadir"))
    return "incident";
  return "normal";
}

export function scenarioLabel(detected) {
  return detected === "incident"
    ? "Incident détecté"
    : detected === "traffic"
      ? "Congestion urbaine"
      : detected === "weather"
        ? "Météo défavorable"
        : "Conditions normales";
}

export function scenarioDescription(detected) {
  return detected === "incident"
    ? "L’IA détecte un incident actif via les alertes temps réel et adapte la trajectoire."
    : detected === "traffic"
      ? "L’IA détecte une circulation chargée et évite les zones lentes."
      : detected === "weather"
        ? "L’IA détecte un risque météo et ajuste la recommandation de trajet."
        : "L’IA analyse les données temps réel et ne détecte aucun risque majeur.";
}
