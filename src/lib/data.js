// Centralized static data for the EcoRoute app.

export const cities = {
  Tanger:     { label: "Tanger",      demand: 88 },
  Tetouan:    { label: "Tetouan",     demand: 46 },
  Nador:      { label: "Nador",       demand: 52 },
  Oujda:      { label: "Oujda",       demand: 39 },
  Kenitra:    { label: "Kenitra",     demand: 74 },
  Rabat:      { label: "Rabat",       demand: 81 },
  Casablanca: { label: "Casablanca",  demand: 96 },
  Mohammedia: { label: "Mohammedia",  demand: 62 },
  ElJadida:   { label: "El Jadida",   demand: 51 },
  Fes:        { label: "Fes",         demand: 69 },
  Meknes:     { label: "Meknes",      demand: 58 },
  Marrakech:  { label: "Marrakech",   demand: 84 },
  BeniMellal: { label: "Beni Mellal", demand: 42 },
  Agadir:     { label: "Agadir",      demand: 77 },
  Essaouira:  { label: "Essaouira",   demand: 35 },
  Ouarzazate: { label: "Ouarzazate",  demand: 31 },
  Errachidia: { label: "Errachidia",  demand: 29 },
  Laayoune:   { label: "Laayoune",    demand: 44 },
};

// [lat, lng]
export const cityCoords = {
  Tanger:     [35.7595, -5.8137],
  Tetouan:    [35.5785, -5.3684],
  Nador:      [35.1681, -2.9287],
  Oujda:      [34.6814, -1.9293],
  Kenitra:    [34.2610, -6.5802],
  Rabat:      [34.0209, -6.8498],
  Casablanca: [33.5731, -7.5898],
  Mohammedia: [33.6833, -7.3833],
  ElJadida:   [33.2333, -8.5000],
  Fes:        [34.0331, -5.0078],
  Meknes:     [33.8935, -5.5473],
  Marrakech:  [31.6295, -7.9811],
  BeniMellal: [32.3373, -6.3498],
  Agadir:     [30.4278, -9.5981],
  Essaouira:  [31.5085, -9.7697],
  Ouarzazate: [30.9335, -6.9094],
  Errachidia: [31.9314, -4.4280],
  Laayoune:   [27.1536, -13.2033],
};

export const modes = {
  ai: {
    key: "ai",
    label: "IA optimisée",
    tag: "Équilibre coût / temps / CO₂",
    accent: "#818cf8",
  },
  eco: {
    key: "eco",
    label: "Mode éco",
    tag: "Priorité carburant & CO₂",
    accent: "#34d399",
  },
  classic: {
    key: "classic",
    label: "Trajet rapide",
    tag: "Minimise la durée",
    accent: "#22d3ee",
  },
};

export const scenarios = {
  normal: { label: "Conditions normales", risk: "Faible" },
  peak:   { label: "Pic e-commerce",      risk: "Moyen"  },
  rain:   { label: "Pluie + trafic",      risk: "Élevé"  },
};

export const screens = [
  { key: "home",       label: "Accueil",     icon: "Home" },
  { key: "deliveries", label: "Livraisons",  icon: "ClipboardList" },
  { key: "alerts",     label: "Alertes",     icon: "Bell" },
  { key: "co2",        label: "Rapport CO₂", icon: "TrendingDown" },
  { key: "settings",   label: "Paramètres",  icon: "Settings" },
  { key: "about",      label: "À propos",    icon: "Info" },
];

export const deliveryStops = [
  { stop: 1, client: "Client A", city: "Rabat",      window: "08:30 – 10:00", priority: "Haute",   status: "Planifié" },
  { stop: 2, client: "Client B", city: "Mohammedia", window: "10:15 – 11:30", priority: "Moyenne", status: "Optimisé" },
  { stop: 3, client: "Client C", city: "Casablanca", window: "12:00 – 14:00", priority: "Haute",   status: "Confirmé" },
  { stop: 4, client: "Client D", city: "El Jadida",  window: "15:00 – 17:00", priority: "Normale", status: "À vérifier" },
];

export const routeBotFAQs = [
  "Est-ce que je pars maintenant ?",
  "Quel client je dois prioriser ?",
  "Pourquoi cet itinéraire est conseillé ?",
  "Quel est le risque de retard ?",
  "Comment réduire le coût et le CO₂ ?",
];

export const realtimeAlerts = [
  {
    level: "Élevé",
    icon: "ShieldAlert",
    title: "Incident sur livraison Client C",
    text: "Blocage détecté à mi-parcours vers Casablanca. RouteBot a recalculé une nouvelle trajectoire : ETA 13:19, toujours dans la fenêtre 12:00–14:00.",
    accent: "#f87171",
    eta: "ETA recalculée : 13:19 · dans la fenêtre",
  },
  {
    level: "Élevé",
    icon: "AlertCircle",
    title: "Congestion urbaine",
    text: "Risque de ralentissement autour de Casablanca. Déviation recommandée si le retard dépasse 20 min.",
    accent: "#f87171",
  },
  {
    level: "Moyen",
    icon: "Info",
    title: "Fenêtre horaire serrée",
    text: "Le deuxième arrêt nécessite une arrivée avant 11:30. Prioriser cet arrêt.",
    accent: "#fbbf24",
  },
  {
    level: "Faible",
    icon: "CheckCircle2",
    title: "Météo stable",
    text: "Aucun risque météo majeur sur le trajet sélectionné.",
    accent: "#34d399",
  },
];

export const co2Breakdown = [
  { label: "Livraisons urbaines",      value: 38, color: "#6ee7b7" },
  { label: "Axes inter-villes",        value: 42, color: "#818cf8" },
  { label: "Derniers kilomètres",      value: 14, color: "#22d3ee" },
  { label: "Arrêts & ralenti moteur",  value: 6,  color: "#fbbf24" },
];

export const weeklyCO2 = [
  { day: "Lun", value: 412 },
  { day: "Mar", value: 388 },
  { day: "Mer", value: 401 },
  { day: "Jeu", value: 356 },
  { day: "Ven", value: 340 },
  { day: "Sam", value: 298 },
  { day: "Dim", value: 210 },
];

export const team = {
  lead: "El Mehdi Omar Ben El Haj",
  members: [
    "Ossama Ait Abdelhalim",
    "Hajar Ait Saleh",
    "Bilal Laadioui",
    "Saad Daoud",
    "Taybi Zayd",
    "Kaoutar Enndal",
  ],
};
