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
export function computeMetrics({
  startCity,
  destinationCity,
  waypoints = [],
  mode,
  scenarioKey,
}) {
  const orderedCities = [startCity, ...(waypoints || []), destinationCity].filter(Boolean);
  if (orderedCities.length < 2) return null;

  const orderedCoords = orderedCities.map((city) => getCityCoords(city));
  if (orderedCoords.some((coords) => !coords)) return null;

  const totalAirDistance = orderedCoords.reduce((sum, coords, index) => {
    if (index === 0) return sum;
    return sum + haversineKm(orderedCoords[index - 1], coords);
  }, 0);

  const baseRoadDistance = Math.max(35, Math.round(totalAirDistance * 1.28));

  // Distance variation by mode is small for a truck — drivers can't take real
  // shortcuts because the rig won't fit.
  const distance =
    mode === "classic"
      ? Math.round(baseRoadDistance * 0.98)
      : mode === "eco"
        ? Math.round(baseRoadDistance * 1.03)
        : baseRoadDistance;

  // Cruising speed of a loaded medium-duty truck on Moroccan roads (km/h).
  // Capped well below car speeds because of governors, hills, and traffic.
  const averageSpeed = mode === "classic" ? 82 : mode === "eco" ? 68 : 75;

  const scenarioDelay =
    scenarioKey === "rain" || scenarioKey === "weather"
      ? 0.28
      : scenarioKey === "peak" || scenarioKey === "traffic"
        ? 0.16
        : scenarioKey === "incident"
          ? 0.12
          : 0;

  // Loading / unloading at each waypoint (~25–30 min per stop for a truck).
  const stopHandlingHours = Math.max(0, waypoints.length) * 0.45;
  const baseTime = distance / averageSpeed;
  const estimatedTime = (baseTime * (1 + scenarioDelay) + stopHandlingHours).toFixed(1);

  // Diesel consumption rates for a ~12-tonne loaded truck (L/km).
  // Eco mode = lower cruise, AI = balanced, Classic = harder push.
  const fuelRate = mode === "classic" ? 0.36 : mode === "eco" ? 0.26 : 0.30;
  const fuelLiters = Math.round(distance * fuelRate);

  // 2.68 kg CO₂ per liter of diesel (ADEME / EPA reference factors).
  const co2Kg = Math.round(fuelLiters * 2.68);

  // Per-km cost: diesel ~13 MAD/L + driver/maintenance/wear ≈ 5.5–6.5 MAD/km
  // depending on intensity.
  const costRate = mode === "classic" ? 6.4 : mode === "eco" ? 5.5 : 5.9;
  const stopServiceCost = Math.max(0, waypoints.length) * 80;

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
    estimatedCostMAD: Math.round(distance * costRate + stopServiceCost),
    riskLevel,
  };
}

/**
 * Hypothetical savings vs. a "classic / rapide" baseline — used for the CO₂ report page.
 */
export function computeSavings(metrics) {
  if (!metrics) return null;
  const baselineFuel = Math.round(metrics.distanceKm * 0.36);
  const baselineCo2 = Math.round(baselineFuel * 2.68);
  const baselineCost = Math.round(metrics.distanceKm * 6.4);

  return {
    fuelSaved: Math.max(0, baselineFuel - metrics.fuelLiters),
    co2Saved: Math.max(0, baselineCo2 - metrics.co2Kg),
    costSaved: Math.max(0, baselineCost - metrics.estimatedCostMAD),
    baselineFuel,
    baselineCo2,
    baselineCost,
  };
}
