// =========================================================
// EcoRoute — Data constants
// =========================================================

// ---------- Moroccan cities powering the route planner ----------
export const cities = {
  Tanger: { label: "Tanger", demand: 88 },
  Tetouan: { label: "Tetouan", demand: 46 },
  Nador: { label: "Nador", demand: 52 },
  Oujda: { label: "Oujda", demand: 39 },
  Kenitra: { label: "Kenitra", demand: 74 },
  Rabat: { label: "Rabat", demand: 81 },
  Casablanca: { label: "Casablanca", demand: 96 },
  Mohammedia: { label: "Mohammedia", demand: 62 },
  ElJadida: { label: "El Jadida", demand: 51 },
  Fes: { label: "Fes", demand: 69 },
  Meknes: { label: "Meknes", demand: 58 },
  Marrakech: { label: "Marrakech", demand: 84 },
  BeniMellal: { label: "Beni Mellal", demand: 42 },
  Agadir: { label: "Agadir", demand: 77 },
  Essaouira: { label: "Essaouira", demand: 35 },
  Ouarzazate: { label: "Ouarzazate", demand: 31 },
  Errachidia: { label: "Errachidia", demand: 29 },
  Laayoune: { label: "Laayoune", demand: 44 },
};

export const cityCoords = {
  Tanger: [35.7595, -5.8137],
  Tetouan: [35.5785, -5.3684],
  Nador: [35.1681, -2.9287],
  Oujda: [34.6814, -1.9293],
  Kenitra: [34.261, -6.5802],
  Rabat: [34.0209, -6.8498],
  Casablanca: [33.5731, -7.5898],
  Mohammedia: [33.6833, -7.3833],
  ElJadida: [33.2333, -8.5],
  Fes: [34.0331, -5.0078],
  Meknes: [33.8935, -5.5473],
  Marrakech: [31.6295, -7.9811],
  BeniMellal: [32.3373, -6.3498],
  Agadir: [30.4278, -9.5981],
  Essaouira: [31.5085, -9.7697],
  Ouarzazate: [30.9335, -6.9094],
  Errachidia: [31.9314, -4.428],
  Laayoune: [27.1536, -13.2033],
};

// ---------- Route modes ----------
export const modes = {
  ai: {
    key: "ai",
    label: "IA optimisée",
    short: "IA",
    desc: "Compromis intelligent distance / durée / carburant.",
    accent: "#6ee7b7",
    accent2: "#a3e635",
  },
  eco: {
    key: "eco",
    label: "Mode éco",
    short: "Éco",
    desc: "Réduit la consommation et les émissions.",
    accent: "#34d399",
    accent2: "#10b981",
  },
  classic: {
    key: "classic",
    label: "Trajet rapide",
    short: "Rapide",
    desc: "Priorité à la durée totale du trajet.",
    accent: "#38bdf8",
    accent2: "#818cf8",
  },
};

export const scenarios = {
  normal: { label: "Normal", risk: "Faible" },
  peak: { label: "Pic e-commerce", risk: "Moyen" },
  rain: { label: "Pluie + trafic", risk: "Élevé" },
};

// ---------- App navigation (updated with new pages) ----------
export const screens = [
  { key: "overview", label: "Vue d'ensemble" },
  { key: "planner", label: "Planification" },
  { key: "deliveries", label: "Livraisons" },
  { key: "fleet", label: "Flotte" },
  { key: "analytics", label: "Analytique" },
  { key: "alerts", label: "Alertes" },
  { key: "team", label: "Équipe" },
];

// ---------- Deliveries ----------
// Defined further down: derived from fleetVehicles so the timings stay
// consistent with the actual road distance and current Morocco time.

export const routeBotFAQs = [
  "Est-ce que je pars maintenant ?",
  "Quel client je dois prioriser ?",
  "Pourquoi cet itinéraire est conseillé ?",
  "Quel est le risque de retard ?",
  "Comment réduire le coût et le CO₂ ?",
];

// ---------- Realtime alerts ----------
// Defined further down so the incident alert tracks the dynamically computed
// ETA of TRK-202 instead of a hard-coded value that drifted out of sync.

export const teamMembers = [
  { name: "El Mehdi Omar Ben El Haj", role: "Lead Developer", lead: true },
  { name: "Ossama Ait Abdelhalim", role: "Team Member" },
  { name: "Hajar Ait Saleh", role: "Team Member" },
  { name: "Bilal Laadioui", role: "Team Member" },
  { name: "Saad Daoud", role: "Team Member" },
  { name: "Taybi Zayd", role: "Team Member" },
  { name: "Kaoutar Enndal", role: "Team Member" },
];

// ---------- NEW: Fleet ----------
// Truck timing is derived from real road distance + a reasonable cruising
// speed so the demo's startedAt / ETA / arrivalWindow always make sense
// (not "left at 08:30, arrives 13:19" for a 1h trip). Anchored on the actual
// current Morocco time, so trucks always appear mid-trip regardless of when
// the dashboard is viewed.

function _haversineKm(a, b) {
  if (!a || !b) return 0;
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

const TRUCK_AVG_KMPH = 78;
const ROAD_FACTOR = 1.28;

function _pad2(n) {
  return String(n).padStart(2, "0");
}
function _minutesToHHMM(min) {
  const wrapped = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(wrapped / 60);
  const m = Math.round(wrapped % 60);
  return `${_pad2(h)}:${_pad2(m)}`;
}
function _realMoroccoMin() {
  const fmt = new Intl.DateTimeFormat("fr-MA", {
    timeZone: "Africa/Casablanca",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const [h, m] = fmt.format(new Date()).split(":").map(Number);
  return h * 60 + m;
}
// Reference "now" for the demo. Real Morocco time during work hours;
// otherwise we simulate mid-afternoon so the dashboard never shows trips
// that started at 03:30 or finished at 04:50.
function _referenceMoroccoMin() {
  const real = _realMoroccoMin();
  if (real >= 7 * 60 && real < 20 * 60) return real;
  return 14 * 60 + 30;
}

function _computeFleetTiming(v) {
  const from = cityCoords[v.from];
  const to = v.to && v.to !== "—" ? cityCoords[v.to] : null;
  const distanceKm = from && to ? Math.round(_haversineKm(from, to) * ROAD_FACTOR) : 0;
  const drivingMin = distanceKm > 0 ? Math.round((distanceKm / TRUCK_AVG_KMPH) * 60) : 0;
  const refMin = _referenceMoroccoMin();
  const incidentDelay = v.incident ? 12 : 0;
  const totalMin = drivingMin + incidentDelay;

  if (v.status === "en_route" && drivingMin > 0) {
    const target = Math.min(0.95, Math.max(0.05, v.targetProgress ?? 0.5));
    const elapsedMin = Math.round(totalMin * target);
    const startedMin = refMin - elapsedMin;
    const etaMin = refMin + (totalMin - elapsedMin);
    const etaOriginalMin = etaMin - incidentDelay;
    return {
      distanceKm,
      eta: _minutesToHHMM(etaMin),
      etaOriginal: incidentDelay ? _minutesToHHMM(etaOriginalMin) : null,
      incidentDelayMin: incidentDelay || null,
      startedAt: _minutesToHHMM(startedMin),
      arrivalWindow: `${_minutesToHHMM(etaMin - 60)}–${_minutesToHHMM(etaMin + 30)}`,
      progress: target,
      kmToday: Math.round(distanceKm * target) + (v.kmTodayBase || 0),
    };
  }

  if (v.status === "loading") {
    const loadingElapsed = v.loadingElapsedMin ?? 25;
    const loadingRemaining = v.loadingRemainingMin ?? 35;
    const departureMin = refMin + loadingRemaining;
    const etaMin = departureMin + drivingMin;
    return {
      distanceKm,
      eta: _minutesToHHMM(etaMin),
      etaOriginal: null,
      incidentDelayMin: null,
      startedAt: _minutesToHHMM(refMin - loadingElapsed),
      arrivalWindow: `${_minutesToHHMM(etaMin - 60)}–${_minutesToHHMM(etaMin + 30)}`,
      progress: 0,
      kmToday: v.kmTodayBase || 0,
      scheduledDeparture: _minutesToHHMM(departureMin),
    };
  }

  // idle / no destination
  return {
    distanceKm,
    eta: "—",
    etaOriginal: null,
    incidentDelayMin: null,
    startedAt: null,
    arrivalWindow: null,
    progress: 0,
    kmToday: v.kmTodayBase || 0,
  };
}

const _fleetBase = [
  {
    id: "TRK-201",
    driver: "A. Benali",
    status: "en_route",
    from: "Rabat",
    to: "Casablanca",
    load: 78,
    fuel: 64,
    temp: 22,
    targetProgress: 0.55,
    kmTodayBase: 55,
    client: "Tournée TRK-201",
    priority: "Haute",
  },
  {
    id: "TRK-202",
    driver: "Y. Chraibi",
    status: "en_route",
    // Longer corridor so the AI reroute around the incident is clearly visible.
    from: "Fes",
    to: "Rabat",
    load: 54,
    fuel: 81,
    temp: 19,
    // Truck stays well before the incident zone (~52% of route) so the
    // red blocked branch and green AI reroute are both visible on the map.
    targetProgress: 0.32,
    kmTodayBase: 32,
    incident: true,
    incidentText: "Incident détecté : recalcul IA en cours",
    client: "Incident TRK-202",
    priority: "Haute",
  },
  {
    id: "TRK-203",
    driver: "M. El Idrissi",
    status: "loading",
    from: "Casablanca",
    to: "Marrakech",
    load: 92,
    fuel: 95,
    temp: 24,
    loadingElapsedMin: 20,
    loadingRemainingMin: 40,
    kmTodayBase: 0,
    client: "Préparation TRK-203",
    priority: "Moyenne",
  },
  {
    id: "TRK-204",
    driver: "S. Amrani",
    status: "idle",
    from: "Agadir",
    to: "Ouarzazate",
    load: 0,
    fuel: 73,
    temp: 27,
    kmTodayBase: 173,
    client: "Dépôt Agadir",
    priority: "Normale",
  },
];

export const fleetVehicles = _fleetBase.map((v) => ({
  ...v,
  ..._computeFleetTiming(v),
}));

// ---------- Deliveries (derived from fleet so timings stay consistent) ----------
export const deliveryStops = fleetVehicles.map((v, i) => {
  const isIdle = v.status === "idle";
  const statusLabel = v.incident
    ? "Incident · en route"
    : v.status === "en_route"
      ? "En route"
      : v.status === "loading"
        ? "Chargement"
        : "Au dépôt";
  return {
    stop: i + 1,
    client: v.client,
    city: v.to && v.to !== "—" ? v.to : v.from,
    window: isIdle ? "En attente" : `ETA ${v.eta} · Fenêtre ${v.arrivalWindow}`,
    startedAt: v.startedAt,
    arrivalWindow: v.arrivalWindow,
    priority: v.priority,
    status: statusLabel,
    vehicleId: v.id,
    incident: v.incident || false,
  };
});

const _trk202 = fleetVehicles.find((v) => v.id === "TRK-202");

// ---------- Realtime alerts (after fleet so TRK-202 ETA is live) ----------
export const realtimeAlerts = [
  {
    level: "Élevé",
    title: "Incident sur livraison Client C",
    text: _trk202
      ? `Blocage détecté à mi-parcours vers ${_trk202.to}. L'IA a recalculé une nouvelle trajectoire : ETA ${_trk202.etaOriginal} → ${_trk202.eta} (+${_trk202.incidentDelayMin} min), toujours dans la fenêtre ${_trk202.arrivalWindow}.`
      : "Blocage détecté à mi-parcours. L'IA a recalculé une nouvelle trajectoire.",
    eta: _trk202
      ? `ETA ${_trk202.etaOriginal} → ${_trk202.eta} (+${_trk202.incidentDelayMin} min) · fenêtre ${_trk202.arrivalWindow}`
      : "ETA recalculée",
    time: "il y a 2 min",
    location: _trk202 ? `N1 · ${_trk202.to}` : "N1",
  },
  {
    level: "Élevé",
    title: "Congestion urbaine",
    text: "Risque de ralentissement autour de Casablanca. Déviation recommandée si le retard dépasse 20 min.",
    time: "il y a 29 min",
    location: "Casablanca centre",
  },
  {
    level: "Moyen",
    title: "Fenêtre horaire serrée",
    text: "Le deuxième arrêt nécessite une arrivée avant 11:30. Prioriser cet arrêt.",
    time: "il y a 28 min",
    location: "Mohammedia",
  },
  {
    level: "Faible",
    title: "Météo stable",
    text: "Aucun risque météo majeur sur le trajet sélectionné.",
    time: "il y a 1 h",
    location: "Corridor atlantique",
  },
];

// ---------- NEW: Activity timeline ----------
export const activityLog = [
  {
    type: "route",
    title: "Trajet optimisé",
    text: "Rabat → Casablanca recalculé par l'IA (-18% carburant).",
    time: "08:42",
    accent: "eco",
  },
  {
    type: "alert",
    title: "Incident détecté",
    text: "Blocage sur la N1, recalcul automatique pour TRK-201.",
    time: "09:15",
    accent: "clay",
  },
  {
    type: "delivery",
    title: "Livraison confirmée",
    text: "Client A reçu dans la fenêtre 08:30–10:00.",
    time: "09:47",
    accent: "sand",
  },
  {
    type: "fleet",
    title: "Chargement complet",
    text: "TRK-203 chargé à 92% · départ prévu 10:00.",
    time: "10:02",
    accent: "teal",
  },
  {
    type: "route",
    title: "RouteBot sollicité",
    text: "3 questions traitées sur les priorités clients.",
    time: "10:18",
    accent: "eco",
  },
];

// ---------- NEW: Weather widget data ----------
export const weatherSnapshot = [
  { city: "Casablanca", temp: 22, cond: "clear", wind: 14 },
  { city: "Rabat", temp: 21, cond: "clear", wind: 12 },
  { city: "Tanger", temp: 19, cond: "cloud", wind: 22 },
  { city: "Marrakech", temp: 27, cond: "clear", wind: 8 },
  { city: "Fes", temp: 20, cond: "rain", wind: 18 },
];

// ---------- NEW: 7-day history for analytics charts ----------
// Numbers tuned to a small truck fleet (~4 vehicles): each delivery day
// runs ~250–650 km of road, burning 100–250 L of diesel which produces
// 270–680 kg of CO₂. Cost reflects diesel + driver + maintenance per km.
export const weekHistory = [
  { day: "Lun", co2: 1180, cost: 4720, deliveries: 14, km: 523 },
  { day: "Mar", co2: 1062, cost: 4310, deliveries: 16, km: 498 },
  { day: "Mer", co2: 1295, cost: 5120, deliveries: 18, km: 576 },
  { day: "Jeu", co2: 974,  cost: 4080, deliveries: 15, km: 462 },
  { day: "Ven", co2: 1480, cost: 5840, deliveries: 22, km: 648 },
  { day: "Sam", co2: 762,  cost: 3140, deliveries: 11, km: 362 },
  { day: "Dim", co2: 510,  cost: 2080, deliveries: 7,  km: 248 },
];

// ---------- NEW: Breakdown by mode for donut chart ----------
export const modeUsage = [
  { label: "IA optimisée", value: 58, color: "#c9a96a" },
  { label: "Mode éco", value: 27, color: "#6fa775" },
  { label: "Trajet rapide", value: 15, color: "#6a9fb5" },
];
