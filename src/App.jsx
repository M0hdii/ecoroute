import React, { useState, useEffect } from "react";
import {
  Home, Brain, Leaf, Route, Clock, Fuel, Package, BarChart3,
  Loader2, Send, Bell, Settings, ClipboardList, TrendingDown,
  CalendarDays, CloudSun, TrafficCone, TimerReset, Activity,
  Navigation, Truck, Gauge, ShieldAlert, SlidersHorizontal,
  X, ChevronRight, Zap, ArrowUpRight, Map, CheckCircle2,
  AlertCircle, Info, Wind, Thermometer, ArrowRight, Menu,
  MessageCircle, LayoutDashboard, MapPin, ChevronDown,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ─── DATA ────────────────────────────────────────────────────────────────────

const cities = {
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

const cityCoords = {
  Tanger: [35.7595, -5.8137], Tetouan: [35.5785, -5.3684],
  Nador: [35.1681, -2.9287], Oujda: [34.6814, -1.9293],
  Kenitra: [34.261, -6.5802], Rabat: [34.0209, -6.8498],
  Casablanca: [33.5731, -7.5898], Mohammedia: [33.6833, -7.3833],
  ElJadida: [33.2333, -8.5], Fes: [34.0331, -5.0078],
  Meknes: [33.8935, -5.5473], Marrakech: [31.6295, -7.9811],
  BeniMellal: [32.3373, -6.3498], Agadir: [30.4278, -9.5981],
  Essaouira: [31.5085, -9.7697], Ouarzazate: [30.9335, -6.9094],
  Errachidia: [31.9314, -4.428], Laayoune: [27.1536, -13.2033],
};

const modes = {
  ai: { label: "IA optimisée", icon: Brain, color: "#6366f1", gradient: "from-indigo-500 to-purple-500" },
  eco: { label: "Mode éco", icon: Leaf, color: "#10b981", gradient: "from-emerald-500 to-teal-500" },
  classic: { label: "Rapide", icon: Zap, color: "#3b82f6", gradient: "from-blue-500 to-cyan-500" },
};

const scenarios = {
  normal: { label: "Normal", risk: "Faible" },
  peak: { label: "Pic e-commerce", risk: "Moyen" },
  rain: { label: "Pluie + trafic", risk: "Élevé" },
};

const screens = [
  { key: "home", label: "Tableau de bord", icon: LayoutDashboard },
  { key: "deliveries", label: "Livraisons", icon: Package },
  { key: "alerts", label: "Alertes", icon: Bell },
  { key: "co2", label: "Rapport CO₂", icon: TrendingDown },
  { key: "settings", label: "Paramètres", icon: Settings },
];

const deliveryStops = [
  { stop: 1, client: "Client A", city: "Rabat", window: "08:30 – 10:00", priority: "Haute", status: "Planifié" },
  { stop: 2, client: "Client B", city: "Mohammedia", window: "10:15 – 11:30", priority: "Moyenne", status: "Optimisé" },
  { stop: 3, client: "Client C", city: "Casablanca", window: "12:00 – 14:00", priority: "Haute", status: "Confirmé" },
  { stop: 4, client: "Client D", city: "El Jadida", window: "15:00 – 17:00", priority: "Normale", status: "À vérifier" },
];

const realtimeAlerts = [
  { level: "Élevé", icon: ShieldAlert, title: "Incident livraison Client C", text: "Blocage détecté vers Casablanca. Recalcul automatique en cours.", color: "#ef4444" },
  { level: "Élevé", icon: AlertCircle, title: "Congestion urbaine", text: "Ralentissement autour de Casablanca. Déviation recommandée.", color: "#ef4444" },
  { level: "Moyen", icon: Info, title: "Fenêtre horaire serrée", text: "Arrivée requise avant 11:30 pour le 2ème arrêt.", color: "#f59e0b" },
  { level: "Faible", icon: CheckCircle2, title: "Météo stable", text: "Aucun risque météo sur le trajet.", color: "#10b981" },
];

const routeBotFAQs = [
  "Est-ce que je pars maintenant ?",
  "Quel client prioriser ?",
  "Pourquoi cet itinéraire ?",
  "Quel est le risque de retard ?",
  "Comment réduire le CO₂ ?",
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getCityCoords(cityKey) {
  return cityKey ? cityCoords[cityKey] || null : null;
}

function getCityKeyFromLabel(label) {
  return Object.keys(cities).find(
    (key) => cities[key]?.label === label || key === String(label).replaceAll(" ", "")
  );
}

function getMoroccoTime() {
  return new Intl.DateTimeFormat("fr-MA", {
    timeZone: "Africa/Casablanca", hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date());
}

function riskColor(risk) {
  if (risk === "Élevé") return { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", dot: "bg-red-400" };
  if (risk === "Moyen") return { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", dot: "bg-amber-400" };
  return { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "bg-emerald-400" };
}

function priorityStyle(p) {
  if (p === "Haute") return "text-red-400 bg-red-500/10 border-red-500/20";
  if (p === "Moyenne") return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  return "text-slate-400 bg-slate-500/10 border-slate-500/20";
}

function hasDeliveryIncident(d) { return d?.stop === 3; }



// ─── ROUTEBOT LOGIC ──────────────────────────────────────────────────────────

function buildRouteBotAnswer({ question, startCity, destinationCity, mode, scenario, metrics, hasRoute }) {
  const q = String(question || "").toLowerCase();
  const from = cities[startCity]?.label || startCity;
  const to = cities[destinationCity]?.label || destinationCity;
  const modeLabel = modes[mode]?.label || "IA optimisée";
  const riskLabel = metrics?.riskLevel || scenarios[scenario]?.risk || "Faible";
  const routeSummary = metrics
    ? `${from} → ${to}, ${metrics.distanceKm} km, ${metrics.estimatedTimeHours}h, ${metrics.fuelLiters}L, ${metrics.estimatedCostMAD} MAD.`
    : `${from} → ${to}. Calcul non lancé.`;

  if (q.includes("pars") || q.includes("partir") || q.includes("maintenant")) {
    if (!hasRoute) return `Lance d'abord le calcul pour ${from} → ${to}, je pourrai te conseiller avec les données réelles.`;
    if (scenario === "rain") return `Je recommande d'attendre 15-20 min. Pluie + trafic augmentent le risque. ${routeSummary}`;
    return `Oui, départ conseillé maintenant. Route stable, risque ${riskLabel.toLowerCase()}. ${routeSummary}`;
  }
  if (q.includes("priori") || q.includes("client")) {
    return `Priorité : Client A (Rabat), fenêtre 08:30–10:00, haute priorité. Puis garder l'ordre pour minimiser les km.`;
  }
  if (q.includes("pourquoi") || q.includes("itinéraire") || q.includes("route")) {
    if (!metrics) return `Lance l'optimisation d'abord, je t'expliquerai le choix.`;
    return `Cet itinéraire (${modeLabel}) équilibre temps, coût et CO₂. ${routeSummary}`;
  }
  if (q.includes("retard") || q.includes("risque")) {
    if (!metrics) return `Pas de données fiables sans calcul. Lance l'optimisation.`;
    if (riskLabel === "Élevé") return `Risque élevé. Prévoir déviation ou marge. Zone urbaine = perte de temps potentielle.`;
    return `Risque ${riskLabel.toLowerCase()}. Route cohérente, conditions stables.`;
  }
  if (q.includes("co2") || q.includes("coût") || q.includes("réduire")) {
    if (!metrics) return `Mode éco + éviter les détours. Lance le calcul pour les chiffres précis.`;
    return `Pour réduire : mode éco recommandé. Actuellement ${metrics.fuelLiters}L, ${metrics.co2Kg}kg CO₂, ${metrics.estimatedCostMAD} MAD.`;
  }
  return `Sur le trajet ${routeSummary} Je surveille trafic, météo et fenêtres. Pose une question précise !`;
}

// ─── MAP HELPERS ─────────────────────────────────────────────────────────────

function createCityIcon(type) {
  const cfg = { start: { color: "#10b981", label: "D", size: 26 }, end: { color: "#6366f1", label: "A", size: 26 }, default: { color: "#475569", label: "", size: 14 } };
  const c = cfg[type] || cfg.default;
  return L.divIcon({
    className: "",
    html: `<div style="width:${c.size}px;height:${c.size}px;border-radius:50%;background:${c.color};border:3px solid white;box-shadow:0 4px 12px ${c.color}66;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:white;">${c.label}</div>`,
    iconSize: [c.size, c.size], iconAnchor: [c.size / 2, c.size / 2],
  });
}

function createTruckIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#10b981);border:3px solid white;box-shadow:0 8px 24px rgba(99,102,241,0.4);display:flex;align-items:center;justify-content:center;font-size:20px;">🚚</div>`,
    iconSize: [40, 40], iconAnchor: [20, 20],
  });
}

function FitRoute({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points?.length > 1) map.fitBounds(L.latLngBounds(points), { padding: [50, 50] });
  }, [points, map]);
  return null;
}

function MovingTruck({ points, enabled }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!enabled || !points?.length) return;
    const step = Math.max(1, Math.floor(points.length / 150));
    const id = setInterval(() => setIdx(i => (i + step >= points.length ? 0 : i + step)), 800);
    return () => clearInterval(id);
  }, [enabled, points]);
  if (!enabled || !points?.length) return null;
  const pos = points[Math.min(idx, points.length - 1)];
  return pos ? <Marker position={pos} icon={createTruckIcon()}><Popup>Camion en route</Popup></Marker> : null;
}

// ─── MAP COMPONENT ───────────────────────────────────────────────────────────

function RouteMap({ fromCity, toCity, hasRoute, routeMode = "ai" }) {
  const [routePoints, setRoutePoints] = useState([]);
  const [follow, setFollow] = useState(false);
  const fromCoords = getCityCoords(fromCity);
  const toCoords = getCityCoords(toCity);
  const canShow = Boolean(hasRoute && fromCoords && toCoords);

  const routeColor = routeMode === "eco" ? "#10b981" : routeMode === "classic" ? "#3b82f6" : "#6366f1";

  useEffect(() => {
    if (!canShow) { setRoutePoints([]); return; }
    const ctrl = new AbortController();
    (async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${fromCoords[1]},${fromCoords[0]};${toCoords[1]},${toCoords[0]}?overview=full&geometries=geojson`;
        const res = await fetch(url, { signal: ctrl.signal });
        const data = await res.json();
        if (data.routes?.[0]?.geometry?.coordinates) {
          setRoutePoints(data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]));
        }
      } catch { setRoutePoints([fromCoords, toCoords]); }
    })();
    return () => ctrl.abort();
  }, [fromCity, toCity, hasRoute, canShow]);

  return (
    <div className="relative w-full h-full min-h-[400px]">
      {/* Map overlay controls */}
      <div className="absolute top-3 left-3 right-3 z-[600] flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto glass rounded-xl px-3 py-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-xs font-bold text-slate-200">{cities[fromCity]?.label || "Départ"}</span>
          <ArrowRight size={12} className="text-slate-500" />
          <div className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
          <span className="text-xs font-bold text-slate-200">{cities[toCity]?.label || "Destination"}</span>
        </div>
        {canShow && routePoints.length > 0 && (
          <button
            onClick={() => setFollow(v => !v)}
            className={`pointer-events-auto rounded-xl px-3 py-2 text-xs font-bold transition-all ${follow ? "bg-gradient-to-r from-indigo-500 to-emerald-500 text-white shadow-lg" : "glass text-slate-300 hover:text-white"}`}
          >
            🚚 {follow ? "Suivi actif" : "Suivre"}
          </button>
        )}
      </div>

      <MapContainer
        className="eco-map"
        center={fromCoords || [31.8, -7.2]}
        zoom={canShow ? 8 : 6}
        minZoom={5}
        scrollWheelZoom
        style={{ width: "100%", height: "100%", minHeight: 400, borderRadius: "0 0 16px 16px" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {fromCoords && <Marker position={fromCoords} icon={createCityIcon("start")}><Popup><b>Départ:</b> {cities[fromCity]?.label}</Popup></Marker>}
        {toCoords && <Marker position={toCoords} icon={createCityIcon("end")}><Popup><b>Arrivée:</b> {cities[toCity]?.label}</Popup></Marker>}
        {canShow && routePoints.length > 1 && (
          <>
            <Polyline positions={routePoints} pathOptions={{ color: "white", weight: 10, opacity: 0.1 }} />
            <Polyline positions={routePoints} pathOptions={{ color: routeColor, weight: 5, opacity: 0.7 }} />
            <Polyline positions={routePoints} className="eco-route-pulse" pathOptions={{ color: routeColor, weight: 3, opacity: 1, dashArray: "12 16" }} />
            <FitRoute points={routePoints} />
            <MovingTruck points={routePoints} enabled={follow} />
          </>
        )}
      </MapContainer>
    </div>
  );
}



// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────

function MetricCard({ icon: Icon, label, value, suffix, color = "#6366f1" }) {
  return (
    <div className="glass-light rounded-2xl p-4 flex flex-col gap-2 hover:border-indigo-500/20 transition-all group">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={14} color={color} />
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-white tracking-tight">{value}</span>
        <span className="text-xs font-semibold text-slate-500">{suffix}</span>
      </div>
    </div>
  );
}

function SignalRow({ icon: Icon, label, value, badge, badgeType }) {
  const colors = riskColor(badgeType || "Faible");
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{label}</div>
        <div className="text-sm font-semibold text-slate-200 truncate">{value}</div>
      </div>
      {badge && (
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${colors.text} ${colors.bg} ${colors.border}`}>
          {badge}
        </span>
      )}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export function App() {
  const [screen, setScreen] = useState("home");
  const [startCity, setStartCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [mode, setMode] = useState("ai");
  const [scenario, setScenario] = useState("normal");
  const [loading, setLoading] = useState(false);
  const [hasRoute, setHasRoute] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [liveTime, setLiveTime] = useState(getMoroccoTime());
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Salut ! Je suis RouteBot. Pose-moi une question sur ton trajet, tes livraisons ou tes coûts." },
  ]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setLiveTime(getMoroccoTime()), 30000);
    return () => clearInterval(id);
  }, []);

  // Detect scenario based on cities
  const detectedScenario = (() => {
    if (!startCity || !destinationCity) return "normal";
    const key = `${startCity}-${destinationCity}`.toLowerCase();
    if (key.includes("casablanca") || key.includes("mohammedia")) return "peak";
    if (key.includes("tanger") || key.includes("tetouan")) return "rain";
    return "normal";
  })();

  function simulateOptimize() {
    if (!startCity || !destinationCity || startCity === destinationCity) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setHasRoute(true);
      const from = getCityCoords(startCity);
      const to = getCityCoords(destinationCity);
      const R = 6371;
      const dLat = ((to[0] - from[0]) * Math.PI) / 180;
      const dLon = ((to[1] - from[1]) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) ** 2 + Math.cos((from[0] * Math.PI) / 180) * Math.cos((to[0] * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
      const dist = Math.max(35, Math.round(2 * R * Math.asin(Math.sqrt(a)) * 1.28));
      const speed = mode === "classic" ? 96 : mode === "eco" ? 76 : 86;
      const delay = detectedScenario === "rain" ? 0.28 : detectedScenario === "peak" ? 0.16 : 0;
      const time = ((dist / speed) * (1 + delay)).toFixed(1);
      const fuelRate = mode === "classic" ? 0.135 : mode === "eco" ? 0.092 : 0.112;
      const fuel = Math.round(dist * fuelRate);
      const costRate = mode === "classic" ? 3.45 : mode === "eco" ? 2.75 : 3.1;
      setMetrics({
        distanceKm: dist,
        estimatedTimeHours: time,
        fuelLiters: fuel,
        co2Kg: Math.round(fuel * 2.45),
        estimatedCostMAD: Math.round(dist * costRate),
        riskLevel: detectedScenario === "rain" ? "Élevé" : detectedScenario === "peak" ? "Moyen" : "Faible",
      });
    }, 600);
  }

  function askBot(q) {
    if (!q.trim()) return;
    setChatInput("");
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setTimeout(() => {
      const answer = buildRouteBotAnswer({ question: q, startCity, destinationCity, mode, scenario: detectedScenario, metrics, hasRoute });
      setMessages(prev => [...prev, { role: "ai", text: answer }]);
    }, 400);
  }

  const risk = riskColor(metrics?.riskLevel || "Faible");

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-['Inter',sans-serif]">

      {/* ─── SIDEBAR ─── */}
      <aside className={`${sidebarOpen ? "w-[240px]" : "w-[72px]"} shrink-0 bg-gradient-to-b from-slate-900/80 to-[#020617] border-r border-white/5 flex flex-col transition-all duration-300 overflow-hidden`}>
        {/* Logo */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
              <Leaf size={20} className="text-white" />
            </div>
            {sidebarOpen && (
              <div className="animate-fade-in">
                <div className="text-base font-black text-white tracking-tight">EcoRoute</div>
                <div className="text-[10px] font-semibold text-emerald-400/80">Logistics AI</div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {screens.map(({ key, label, icon: Icon }) => {
            const active = screen === key;
            return (
              <button
                key={key}
                onClick={() => setScreen(key)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${active ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 shadow-lg shadow-indigo-500/5" : "text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent"}`}
              >
                <Icon size={18} />
                {sidebarOpen && <span>{label}</span>}
                {key === "alerts" && sidebarOpen && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">4</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-white/5 space-y-2">
          <button
            onClick={() => setChatOpen(v => !v)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-all
              ${chatOpen ? "bg-gradient-to-r from-indigo-500/20 to-emerald-500/10 border border-indigo-500/30 text-indigo-200" : "bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200"}`}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center shrink-0">
              <MessageCircle size={14} className="text-white" />
            </div>
            {sidebarOpen && (
              <div className="text-left">
                <div className="text-xs font-bold text-slate-200">RouteBot</div>
                <div className="text-[10px] text-slate-500">Assistant IA</div>
              </div>
            )}
          </button>

          {sidebarOpen && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-dot shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <div>
                <div className="text-[10px] text-slate-500 font-semibold">Heure Maroc</div>
                <div className="text-sm font-black text-emerald-400">{liveTime}</div>
              </div>
            </div>
          )}
        </div>
      </aside>



      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 shrink-0 border-b border-white/5 flex items-center justify-between px-6 glass">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(v => !v)} className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <Menu size={16} />
            </button>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight">
                {screens.find(s => s.key === screen)?.label || "EcoRoute"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
              <Truck size={14} className="text-slate-500" />
              <span className="text-xs font-semibold text-slate-400">4 véhicules actifs</span>
            </div>
            <button
              onClick={() => setScreen("alerts")}
              className="relative w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">4</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-5">

          {/* ═══ HOME ═══ */}
          {screen === "home" && (
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-5 h-full animate-fade-in">
              {/* Left Panel */}
              <div className="flex flex-col gap-4 overflow-auto">
                {/* Route Config Card */}
                <div className="glass-light rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                      <Navigation size={14} className="text-indigo-400" />
                    </div>
                    <span className="text-sm font-bold text-slate-200">Planifier un trajet</span>
                  </div>

                  {/* City selects */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Départ</label>
                      <select
                        value={startCity}
                        onChange={e => { setStartCity(e.target.value); setHasRoute(false); setMetrics(null); }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-200 outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                      >
                        <option value="">Choisir...</option>
                        {Object.entries(cities).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Destination</label>
                      <select
                        value={destinationCity}
                        onChange={e => { setDestinationCity(e.target.value); setHasRoute(false); setMetrics(null); }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-200 outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                      >
                        <option value="">Choisir...</option>
                        {Object.entries(cities).map(([k, c]) => <option key={k} value={k} disabled={k === startCity}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Mode Selection */}
                  <div className="mb-4">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Mode d'optimisation</label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(modes).map(([key, m]) => {
                        const Icon = m.icon;
                        const active = mode === key;
                        return (
                          <button
                            key={key}
                            onClick={() => { setMode(key); if (hasRoute) simulateOptimize(); }}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-[11px] font-bold transition-all
                              ${active ? `bg-gradient-to-b from-${key === "ai" ? "indigo" : key === "eco" ? "emerald" : "blue"}-500/20 to-transparent border border-${key === "ai" ? "indigo" : key === "eco" ? "emerald" : "blue"}-500/30 text-white shadow-lg` : "bg-white/3 border border-white/5 text-slate-500 hover:text-slate-300"}`}
                            style={active ? { borderColor: `${m.color}44`, background: `${m.color}15` } : {}}
                          >
                            <Icon size={16} style={{ color: active ? m.color : undefined }} />
                            <span>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* AI Scenario detection */}
                  {startCity && destinationCity && (
                    <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-indigo-500/8 to-emerald-500/5 border border-indigo-500/15">
                      <div className="flex items-center gap-2 mb-1">
                        <Brain size={14} className="text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-300">
                          {detectedScenario === "peak" ? "Congestion détectée" : detectedScenario === "rain" ? "Météo défavorable" : "Conditions normales"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {detectedScenario === "peak" ? "Trafic dense prévu, le calcul intégrera des déviations." : detectedScenario === "rain" ? "Pluie prévue, temps de trajet ajusté." : "Pas de risque particulier détecté."}
                      </p>
                    </div>
                  )}

                  {/* Calculate button */}
                  <button
                    onClick={simulateOptimize}
                    disabled={loading || !startCity || !destinationCity || startCity === destinationCity}
                    className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-500 to-emerald-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Calcul...</> : <><Zap size={16} /> Calculer l'itinéraire</>}
                  </button>
                </div>

                {/* Live Signals */}
                <div className="glass-light rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity size={14} className="text-indigo-400" />
                    <span className="text-sm font-bold text-slate-200">Signaux temps réel</span>
                    <div className={`ml-auto w-2 h-2 rounded-full ${hasRoute ? "bg-emerald-400 animate-pulse-dot" : "bg-slate-600"}`} />
                  </div>
                  {!hasRoute ? (
                    <p className="text-xs text-slate-500 text-center py-6">Calculez un trajet pour voir les données live.</p>
                  ) : (
                    <>
                      <SignalRow icon={TrafficCone} label="Trafic" value={detectedScenario === "rain" ? "Dense — déviation conseillée" : "Circulation fluide"} badge={scenarios[detectedScenario].risk} badgeType={scenarios[detectedScenario].risk} />
                      <SignalRow icon={CloudSun} label="Météo" value={detectedScenario === "rain" ? "Pluie — 14°C" : "Dégagé — 22°C"} />
                      <SignalRow icon={TimerReset} label="Départ" value={`${liveTime} — Conseillé dans 15 min`} />
                    </>
                  )}
                </div>

                {/* AI Advice */}
                {hasRoute && (
                  <div className="glass-light rounded-2xl p-5 border-indigo-500/10 animate-slide-up">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain size={14} className="text-indigo-400" />
                      <span className="text-sm font-bold text-indigo-300">Recommandations IA</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        `Risque ${(metrics?.riskLevel || "Faible").toLowerCase()} — ${detectedScenario === "rain" ? "prévoir marge de sécurité" : "pas de déviation nécessaire"}.`,
                        `Mode ${modes[mode].label} sélectionné — équilibre optimal.`,
                        "Fenêtres de livraison évaluées, priorité haute respectée.",
                      ].map((t, i) => (
                        <div key={i} className="flex gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                          <p className="text-xs text-slate-400 leading-relaxed">{t}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Panel — Map + Metrics */}
              <div className="flex flex-col gap-4">
                {/* KPI Row */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <MetricCard icon={Package} label="Livraisons" value="4" suffix="arrêts" color="#6366f1" />
                  <MetricCard icon={Truck} label="Flotte" value="4" suffix="camions" color="#3b82f6" />
                  <MetricCard icon={TrendingDown} label="Économies" value="620" suffix="MAD" color="#10b981" />
                  <MetricCard icon={Fuel} label="Carburant" value="18" suffix="L éco." color="#f59e0b" />
                  <MetricCard icon={Leaf} label="CO₂ évité" value="540" suffix="kg" color="#10b981" />
                </div>

                {/* Map Card */}
                <div className="flex-1 glass-light rounded-2xl overflow-hidden flex flex-col min-h-[420px]">
                  <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Map size={14} className="text-slate-500" />
                      <span className="text-xs font-bold text-slate-400">Carte itinéraire</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {metrics && (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${risk.text} ${risk.bg} ${risk.border}`}>
                          Risque {metrics.riskLevel}
                        </span>
                      )}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
                        <div className={`w-1.5 h-1.5 rounded-full ${hasRoute ? "bg-emerald-400" : "bg-slate-600"}`} />
                        {hasRoute ? "Actif" : "Attente"}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
                    <RouteMap fromCity={hasRoute ? startCity : startCity} toCity={hasRoute ? destinationCity : destinationCity} hasRoute={hasRoute} routeMode={mode} />
                  </div>
                  {/* Metrics band */}
                  {metrics && (
                    <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                      <div className="grid grid-cols-5 gap-3">
                        {[
                          { icon: Route, label: "Distance", value: metrics.distanceKm, suffix: "km", color: "#3b82f6" },
                          { icon: Clock, label: "Durée", value: metrics.estimatedTimeHours, suffix: "h", color: "#f59e0b" },
                          { icon: Fuel, label: "Carburant", value: metrics.fuelLiters, suffix: "L", color: "#ef4444" },
                          { icon: Leaf, label: "CO₂", value: metrics.co2Kg, suffix: "kg", color: "#10b981" },
                          { icon: BarChart3, label: "Coût", value: metrics.estimatedCostMAD, suffix: "MAD", color: "#6366f1" },
                        ].map(({ icon: I, label, value, suffix, color }) => (
                          <div key={label} className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <I size={12} style={{ color }} />
                            </div>
                            <div className="text-base font-black text-white">{value}<span className="text-[10px] font-semibold text-slate-500 ml-0.5">{suffix}</span></div>
                            <div className="text-[9px] font-bold text-slate-500 uppercase">{label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}



          {/* ═══ DELIVERIES ═══ */}
          {screen === "deliveries" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-in">
              {/* Delivery List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-bold text-slate-300">{deliveryStops.length} livraisons planifiées</h2>
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full">Aujourd'hui</span>
                </div>
                {deliveryStops.map(d => {
                  const active = selectedDelivery?.stop === d.stop;
                  const incident = hasDeliveryIncident(d);
                  return (
                    <button
                      key={d.stop}
                      onClick={() => setSelectedDelivery(d)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all
                        ${active ? "glass border-indigo-500/30 shadow-lg shadow-indigo-500/10" : "glass-light hover:bg-white/[0.04]"}`}
                    >
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-base font-black text-white shrink-0 shadow-lg shadow-amber-500/20">
                        {d.stop}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-white">{d.client}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${priorityStyle(d.priority)}`}>{d.priority}</span>
                          {incident && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400">Incident</span>}
                        </div>
                        <div className="text-xs text-slate-500">{d.city} · {d.window}</div>
                      </div>
                      <ChevronRight size={16} className="text-slate-600" />
                    </button>
                  );
                })}
              </div>

              {/* Delivery Detail + Map */}
              <div className="flex flex-col gap-4">
                {selectedDelivery ? (
                  <>
                    <div className="glass-light rounded-2xl p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg font-black text-white">
                          {selectedDelivery.stop}
                        </div>
                        <div>
                          <div className="text-base font-bold text-white">{selectedDelivery.client}</div>
                          <div className="text-xs text-slate-500">Kenitra → {selectedDelivery.city}</div>
                        </div>
                        <span className={`ml-auto text-[10px] font-bold px-2 py-1 rounded-full border ${priorityStyle(selectedDelivery.priority)}`}>
                          {selectedDelivery.priority}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white/5">
                          <div className="text-slate-500 font-semibold mb-1">Fenêtre</div>
                          <div className="text-slate-200 font-bold">{selectedDelivery.window}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5">
                          <div className="text-slate-500 font-semibold mb-1">Statut</div>
                          <div className="text-slate-200 font-bold">{selectedDelivery.status}</div>
                        </div>
                      </div>
                      {hasDeliveryIncident(selectedDelivery) && (
                        <div className="mt-4 p-3 rounded-xl bg-red-500/8 border border-red-500/15">
                          <div className="flex items-center gap-2 mb-1">
                            <ShieldAlert size={14} className="text-red-400" />
                            <span className="text-xs font-bold text-red-300">Incident — Recalcul IA</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">Blocage à mi-parcours. Nouvelle trajectoire calculée, ETA 13:19 (dans la fenêtre).</p>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 glass-light rounded-2xl overflow-hidden min-h-[300px]">
                      <RouteMap
                        fromCity="Kenitra"
                        toCity={getCityKeyFromLabel(selectedDelivery.city) || "Casablanca"}
                        hasRoute={true}
                        routeMode={mode}
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex-1 glass-light rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <Package size={40} className="text-slate-600 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">Sélectionnez une livraison</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══ ALERTS ═══ */}
          {screen === "alerts" && (
            <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-slate-300">Alertes opérationnelles</h2>
                <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-full">{realtimeAlerts.length} alertes</span>
              </div>
              {realtimeAlerts.map((a, i) => {
                const Icon = a.icon;
                return (
                  <div key={i} className="glass-light rounded-2xl p-4 flex gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${a.color}15` }}>
                      <Icon size={18} style={{ color: a.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: a.color }}>{a.level}</span>
                        <span className="text-sm font-bold text-white">{a.title}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{a.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ═══ CO2 REPORT ═══ */}
          {screen === "co2" && (
            <div className="max-w-3xl mx-auto animate-fade-in">
              <div className="glass-light rounded-2xl p-6 mb-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Leaf size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">Rapport environnemental</h2>
                    <p className="text-xs text-slate-500">Impact CO₂ de vos opérations ce mois</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-500/8 border border-emerald-500/15 text-center">
                    <div className="text-3xl font-black text-emerald-400">540</div>
                    <div className="text-xs font-bold text-slate-500 mt-1">kg CO₂ évités</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-500/8 border border-blue-500/15 text-center">
                    <div className="text-3xl font-black text-blue-400">18</div>
                    <div className="text-xs font-bold text-slate-500 mt-1">litres économisés</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-indigo-500/8 border border-indigo-500/15 text-center">
                    <div className="text-3xl font-black text-indigo-400">12%</div>
                    <div className="text-xs font-bold text-slate-500 mt-1">amélioration vs mois dernier</div>
                  </div>
                </div>
              </div>
              <div className="glass-light rounded-2xl p-6">
                <h3 className="text-sm font-bold text-slate-300 mb-4">Historique des optimisations</h3>
                <div className="space-y-3">
                  {["Lundi — Kenitra → Casablanca", "Mardi — Rabat → Marrakech", "Mercredi — Tanger → Fes", "Jeudi — Casablanca → Agadir"].map((label, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5">
                      <span className="text-xs font-semibold text-slate-300">{label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-emerald-400">-{12 + i * 4}kg CO₂</span>
                        <CheckCircle2 size={14} className="text-emerald-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ SETTINGS ═══ */}
          {screen === "settings" && (
            <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
              <div className="glass-light rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-5">
                  <Settings size={16} className="text-indigo-400" />
                  <span className="text-sm font-bold text-slate-200">Préférences</span>
                </div>
                {[
                  { label: "Objectif", options: ["Équilibre coût/temps/CO₂", "Plus rapide", "Moins de CO₂", "Moins cher"] },
                  { label: "Véhicule", options: ["Fourgon diesel", "Électrique", "Camion léger", "Moto"] },
                  { label: "Priorité", options: ["Taux de service", "Coût total", "CO₂ évité", "Temps"] },
                ].map(({ label, options }) => (
                  <div key={label} className="mb-4">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-200 outline-none focus:border-indigo-500/40 transition-all">
                      {options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="glass-light rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-5">
                  <Gauge size={16} className="text-indigo-400" />
                  <span className="text-sm font-bold text-slate-200">Impact des paramètres</span>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: Brain, title: "Recommandations IA", desc: "Ajustement des conseils selon vos préférences.", color: "#6366f1" },
                    { icon: Fuel, title: "Coûts estimés", desc: "Calcul basé sur votre véhicule et mode.", color: "#f59e0b" },
                    { icon: Route, title: "Déviations", desc: "Recalcul intelligent selon le risque.", color: "#10b981" },
                  ].map(item => {
                    const I = item.icon;
                    return (
                      <div key={item.title} className="p-4 rounded-xl bg-white/3 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                          <I size={14} style={{ color: item.color }} />
                          <span className="text-xs font-bold text-slate-200">{item.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>



      {/* ─── CHAT PANEL ─── */}
      {chatOpen && (
        <div className="fixed bottom-5 left-[260px] w-[380px] h-[520px] rounded-2xl overflow-hidden glass border-indigo-500/20 shadow-2xl shadow-black/50 flex flex-col z-[1000] animate-slide-up">
          {/* Chat Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-500/15 to-emerald-500/8 border-b border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center shadow-lg">
              <Brain size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-white">RouteBot</div>
              <div className="text-[10px] text-slate-500">Assistant logistique IA</div>
            </div>
            <button onClick={() => setChatOpen(false)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`max-w-[85%] ${msg.role === "user" ? "ml-auto" : ""}`}>
                <div className={`px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line
                  ${msg.role === "user"
                    ? "bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-semibold rounded-2xl rounded-br-sm"
                    : "bg-white/5 border border-white/8 text-slate-300 rounded-2xl rounded-bl-sm"}`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {messages.length <= 1 && (
              <div className="space-y-2 mt-2">
                <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Questions fréquentes</div>
                {routeBotFAQs.map(faq => (
                  <button
                    key={faq}
                    onClick={() => askBot(faq)}
                    className="w-full text-left px-3 py-2 rounded-xl bg-indigo-500/8 border border-indigo-500/15 text-[11px] font-semibold text-indigo-300 hover:bg-indigo-500/15 transition-colors"
                  >
                    {faq}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/5 flex gap-2">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && askBot(chatInput)}
              placeholder="Demander à RouteBot..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500/40 transition-all placeholder:text-slate-600"
            />
            <button
              onClick={() => askBot(chatInput)}
              className="w-9 h-9 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
