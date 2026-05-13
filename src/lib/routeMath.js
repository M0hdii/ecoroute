import { getCityCoords } from "./helpers";

export function haversineKm(a, b) {
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
 * Simulate route-level metrics.
 * Keeps parity with the previous prototype but extracted from the UI layer.
 */
export function computeMetrics({ startCity, destinationCity, mode, scenarioKey }) {
  const from = getCityCoords(startCity);
  const to = getCityCoords(destinationCity);
  if (!from || !to) return null;

  const baseRoadDistance = Math.max(35, Math.round(haversineKm(from, to) * 1.28));

  const distance =
    mode === "classic"
      ? Math.round(baseRoadDistance * 0.96)
      : mode === "eco"
        ? Math.round(baseRoadDistance * 1.04)
        : baseRoadDistance;

  const averageSpeed = mode === "classic" ? 96 : mode === "eco" ? 76 : 86;

  const scenarioDelay =
    scenarioKey === "rain" || scenarioKey === "weather"
      ? 0.28
      : scenarioKey === "peak" || scenarioKey === "traffic"
        ? 0.16
        : scenarioKey === "incident"
          ? 0.12
          : 0;

  const baseTime = distance / averageSpeed;
  const estimatedTime = (baseTime * (1 + scenarioDelay)).toFixed(1);

  const fuelRate = mode === "classic" ? 0.135 : mode === "eco" ? 0.092 : 0.112;
  const fuelLiters = Math.round(distance * fuelRate);
  const co2Kg = Math.round(fuelLiters * 2.45);

  const costRate = mode === "classic" ? 3.45 : mode === "eco" ? 2.75 : 3.1;

  const riskLevel =
    scenarioKey === "rain" || scenarioKey === "weather" || scenarioKey === "incident"
      ? "Élevé"
      : scenarioKey === "peak" || scenarioKey === "traffic"
        ? "Moyen"
        : "Faible";

  return {
    distanceKm: distance,
    estimatedTimeHours: estimatedTime,
    fuelLiters,
    co2Kg,
    estimatedCostMAD: Math.round(distance * costRate),
    riskLevel,
  };
}

/**
 * Hypothetical savings vs. a "classic / rapide" baseline — used for the CO₂ report page.
 */
export function computeSavings(metrics) {
  if (!metrics) return null;
  const baselineFuel = Math.round(metrics.distanceKm * 0.135);
  const baselineCo2 = Math.round(baselineFuel * 2.45);
  const baselineCost = Math.round(metrics.distanceKm * 3.45);

  return {
    fuelSaved: Math.max(0, baselineFuel - metrics.fuelLiters),
    co2Saved: Math.max(0, baselineCo2 - metrics.co2Kg),
    costSaved: Math.max(0, baselineCost - metrics.estimatedCostMAD),
    baselineFuel,
    baselineCo2,
    baselineCost,
  };
}
