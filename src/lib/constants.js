// Moroccan cities powering the route planner.
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

// Route-mode metadata (icon keys looked up in components).
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

export const screens = [
  { key: "home", label: "Planification" },
  { key: "deliveries", label: "Livraisons" },
  { key: "alerts", label: "Alertes" },
  { key: "co2", label: "Rapport CO₂" },
  { key: "settings", label: "Équipe" },
];

export const deliveryStops = [
  {
    stop: 1,
    client: "Client A",
    city: "Rabat",
    window: "08:30 – 10:00",
    priority: "Haute",
    status: "Planifié",
  },
  {
    stop: 2,
    client: "Client B",
    city: "Mohammedia",
    window: "10:15 – 11:30",
    priority: "Moyenne",
    status: "Optimisé",
  },
  {
    stop: 3,
    client: "Client C",
    city: "Casablanca",
    window: "12:00 – 14:00",
    priority: "Haute",
    status: "Confirmé",
  },
  {
    stop: 4,
    client: "Client D",
    city: "El Jadida",
    window: "15:00 – 17:00",
    priority: "Normale",
    status: "À vérifier",
  },
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
    title: "Incident sur livraison Client C",
    text: "Blocage détecté à mi-parcours vers Casablanca. RouteBot a recalculé une nouvelle trajectoire : ETA 13:19, toujours dans la fenêtre 12:00–14:00.",
    eta: "ETA recalculée : 13:19 · dans la fenêtre",
  },
  {
    level: "Élevé",
    title: "Congestion urbaine",
    text: "Risque de ralentissement autour de Casablanca. Déviation recommandée si le retard dépasse 20 min.",
  },
  {
    level: "Moyen",
    title: "Fenêtre horaire serrée",
    text: "Le deuxième arrêt nécessite une arrivée avant 11:30. Prioriser cet arrêt.",
  },
  {
    level: "Faible",
    title: "Météo stable",
    text: "Aucun risque météo majeur sur le trajet sélectionné.",
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
