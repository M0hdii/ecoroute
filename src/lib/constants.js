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
export const deliveryStops = [
  {
    stop: 1,
    client: "Tournée TRK-201",
    city: "Casablanca",
    window: "ETA 13:19",
    priority: "Haute",
    status: "En route",
    vehicleId: "TRK-201",
  },
  {
    stop: 2,
    client: "Incident TRK-202",
    city: "Casablanca",
    window: "ETA 13:19",
    priority: "Haute",
    status: "Incident · en route",
    vehicleId: "TRK-202",
    incident: true,
  },
  {
    stop: 3,
    client: "Préparation TRK-203",
    city: "Marrakech",
    window: "ETA 16:40",
    priority: "Moyenne",
    status: "Chargement",
    vehicleId: "TRK-203",
  },
  {
    stop: 4,
    client: "Dépôt Agadir",
    city: "Agadir",
    window: "En attente",
    priority: "Normale",
    status: "Au dépôt",
    vehicleId: "TRK-204",
  },
];

export const routeBotFAQs = [
  "Est-ce que je pars maintenant ?",
  "Quel client je dois prioriser ?",
  "Pourquoi cet itinéraire est conseillé ?",
  "Quel est le risque de retard ?",
  "Comment réduire le coût et le CO₂ ?",
];

// ---------- Realtime alerts ----------
export const realtimeAlerts = [
  {
    level: "Élevé",
    title: "Incident sur livraison Client C",
    text: "Blocage détecté à mi-parcours vers Casablanca. L'IA a recalculé une nouvelle trajectoire : ETA 13:19, toujours dans la fenêtre 12:00–14:00.",
    eta: "ETA recalculée : 13:19 · dans la fenêtre",
    time: "il y a 2 min",
    location: "N1 · Casablanca",
  },
  {
    level: "Élevé",
    title: "Congestion urbaine",
    text: "Risque de ralentissement autour de Casablanca. Déviation recommandée si le retard dépasse 20 min.",
    time: "il y a 14 min",
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
export const fleetVehicles = [
  {
    id: "TRK-201",
    driver: "A. Benali",
    status: "en_route",
    from: "Rabat",
    to: "Casablanca",
    progress: 0.62,
    load: 78,
    fuel: 64,
    temp: 22,
    eta: "13:19",
    kmToday: 142,
  },
  {
    id: "TRK-202",
    driver: "Y. Chraibi",
    status: "en_route",
    from: "Mohammedia",
    to: "Casablanca",
    progress: 0.41,
    load: 54,
    fuel: 81,
    temp: 19,
    eta: "13:19",
    kmToday: 88,
    incident: true,
    incidentText: "Incident détecté : recalcul IA en cours",
  },
  {
    id: "TRK-203",
    driver: "M. El Idrissi",
    status: "loading",
    from: "Casablanca",
    to: "Marrakech",
    progress: 0,
    load: 92,
    fuel: 95,
    temp: 24,
    eta: "16:40",
    kmToday: 0,
  },
  {
    id: "TRK-204",
    driver: "S. Amrani",
    status: "idle",
    from: "Agadir",
    to: "Ouarzazate",
    progress: 0,
    load: 0,
    fuel: 73,
    temp: 27,
    eta: "—",
    kmToday: 173,
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
export const weekHistory = [
  { day: "Lun", co2: 412, cost: 1840, deliveries: 14, km: 523 },
  { day: "Mar", co2: 398, cost: 1720, deliveries: 16, km: 498 },
  { day: "Mer", co2: 445, cost: 1920, deliveries: 18, km: 576 },
  { day: "Jeu", co2: 376, cost: 1650, deliveries: 15, km: 462 },
  { day: "Ven", co2: 512, cost: 2180, deliveries: 22, km: 648 },
  { day: "Sam", co2: 284, cost: 1280, deliveries: 11, km: 362 },
  { day: "Dim", co2: 195, cost: 890, deliveries: 7, km: 248 },
];

// ---------- NEW: Breakdown by mode for donut chart ----------
export const modeUsage = [
  { label: "IA optimisée", value: 58, color: "#c9a96a" },
  { label: "Mode éco", value: 27, color: "#6fa775" },
  { label: "Trajet rapide", value: 15, color: "#6a9fb5" },
];
