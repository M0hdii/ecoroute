import { cities, modes, scenarios, deliveryStops } from "./constants";

export function buildRouteBotAnswer({
  question,
  startCity,
  destinationCity,
  mode,
  scenario,
  metrics,
  hasRoute,
  selectedDelivery,
}) {
  const q = String(question || "").toLowerCase();
  const from = cities[startCity]?.label || startCity;
  const to = cities[destinationCity]?.label || destinationCity;
  const modeLabel = modes[mode]?.label || "IA optimisée";
  const scenarioLabel = scenarios[scenario]?.label || "Normal";
  const riskLabel = metrics?.riskLevel || scenarios[scenario]?.risk || "Faible";

  const routeSummary = metrics
    ? `${from} → ${to}, environ ${metrics.distanceKm} km, ${metrics.estimatedTimeHours} h, ${metrics.fuelLiters} L et ${metrics.estimatedCostMAD} MAD.`
    : `${from} → ${to}. Le calcul détaillé n'est pas encore lancé.`;

  if (q.includes("pars") || q.includes("partir") || q.includes("maintenant")) {
    if (!hasRoute || !metrics) {
      return `Je te conseille de lancer d'abord le calcul de l'itinéraire. Comme ça je peux te répondre avec la distance, le temps, le coût et le risque réel du trajet ${from} → ${to}.`;
    }
    if (scenario === "rain") {
      return `Je ne partirais pas tout de suite sans marge. Le trajet ${routeSummary} est faisable, mais le scénario pluie + trafic augmente le risque. Je prévoirais 15 à 25 minutes de sécurité, surtout si une livraison prioritaire est prévue.`;
    }
    if (scenario === "peak") {
      return `Oui, tu peux partir, mais je garderais une petite marge. En pic e-commerce, le trafic peut changer vite. Pour ce trajet ${routeSummary}, je recommande de partir maintenant et de surveiller les zones urbaines avant l'arrivée.`;
    }
    return `Oui, départ conseillé maintenant. Le trajet ${routeSummary} est stable et le risque est ${riskLabel.toLowerCase()}. Je ferais juste une vérification rapide du carburant et des documents avant départ.`;
  }

  if (q.includes("priori") || q.includes("client") || q.includes("livraison")) {
    const highPriority = deliveryStops.filter((item) => item.priority === "Haute");
    const firstHigh = selectedDelivery || highPriority[0];
    return `Je prioriserais ${firstHigh.client} à ${firstHigh.city}. La raison est simple : priorité ${firstHigh.priority}, fenêtre ${firstHigh.window}, statut ${firstHigh.status}. Ensuite, je garderais l'ordre des arrêts proches pour éviter les kilomètres inutiles.`;
  }

  if (q.includes("pourquoi") || q.includes("itinéraire") || q.includes("route")) {
    if (!metrics) {
      return `Pour l'instant, je ne peux pas vraiment justifier le trajet tant que le calcul n'est pas lancé. Lance l'optimisation, puis je pourrai expliquer le choix avec distance, durée, carburant, coût et CO₂.`;
    }
    return `Cet itinéraire est conseillé parce qu'il garde un bon équilibre entre temps, coût et CO₂. Pour ${routeSummary} En mode ${modeLabel}, je ne cherche pas seulement la route la plus courte : je prends aussi en compte le scénario "${scenarioLabel}" et le risque de retard.`;
  }

  if (q.includes("retard") || q.includes("risque")) {
    if (!metrics) {
      return `Le risque n'est pas encore fiable sans calcul. Lance l'optimisation et je te dirai si le risque vient plutôt du trafic, de la météo ou des fenêtres horaires.`;
    }
    if (riskLabel === "Élevé") {
      return `Le risque de retard est élevé. Je prévoirais une déviation ou une marge de sécurité. Le point sensible est surtout l'entrée en zone urbaine, où le camion peut perdre du temps même si la distance semble correcte.`;
    }
    if (riskLabel === "Moyen") {
      return `Le risque est moyen. Ce n'est pas critique, mais je surveillerais le trafic pendant le trajet. Je recommande de garder au moins 10 à 15 minutes de marge avant la prochaine fenêtre horaire.`;
    }
    return `Le risque est faible. La route est cohérente, les conditions sont stables, et aucune action urgente n'est nécessaire. Je continuerais le trajet prévu.`;
  }

  if (
    q.includes("co2") ||
    q.includes("co₂") ||
    q.includes("coût") ||
    q.includes("cout") ||
    q.includes("carburant") ||
    q.includes("réduire")
  ) {
    if (!metrics) {
      return `Pour réduire le coût et le CO₂, je choisirais le mode éco et j'éviterais les détours. Lance le calcul pour que je puisse estimer les litres, le coût et le CO₂ du trajet choisi.`;
    }
    return `Pour réduire le coût, je garderais le trajet optimisé et j'éviterais les détours non nécessaires. Sur ce trajet, on estime ${metrics.fuelLiters} L, ${metrics.co2Kg} kg de CO₂ et ${metrics.estimatedCostMAD} MAD. Si tu veux réduire encore, le mode éco est le meilleur choix.`;
  }

  return `D'accord. Pour être concret : sur le trajet ${routeSummary} je regarderais surtout trois choses : les fenêtres horaires, le risque trafic/météo, et le coût carburant. Pose-moi une question du type "je pars maintenant ?", "quel client prioriser ?" ou "comment réduire le coût ?" et je te réponds comme un assistant d'exploitation.`;
}
