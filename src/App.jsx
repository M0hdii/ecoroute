import React, { useState, useEffect } from "react";
import {
  Home,
  Brain,
  Leaf,
  Route,
  Clock,
  Fuel,
  Package,
  BarChart3,
  Loader2,
  Send,
  Bell,
  Settings,
  ClipboardList,
  TrendingDown,
  CalendarDays,
  CloudSun,
  TrafficCone,
  TimerReset,
  Activity,
  Navigation,
  Truck,
  Gauge,
  ShieldAlert,
  SlidersHorizontal,
  X,
  ChevronRight,
  Zap,
  ArrowUpRight,
  Map,
  CheckCircle2,
  AlertCircle,
  Info,
  Wind,
  Thermometer,
  ArrowRight,
} from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

function getCityCoords(cityKey) {
  return cityCoords[cityKey] || cityCoords.Casablanca;
}

function getCityKeyFromLabel(label) {
  return Object.keys(cities).find(
    (key) => cities[key]?.label === label || key === String(label).replaceAll(" ", "")
  );
}


function getDeliveryStartCityKey(delivery) {
  if (!delivery) return "Kenitra";

  const previousStop = deliveryStops.find((item) => item.stop === delivery.stop - 1);

  if (!previousStop) {
    return "Kenitra";
  }

  return getCityKeyFromLabel(previousStop.city) || "Kenitra";
}

function getDeliveryDestinationCityKey(delivery) {
  if (!delivery) return "Casablanca";
  return getCityKeyFromLabel(delivery.city) || "Casablanca";
}


function getDeliveryProgress(delivery) {
  if (!delivery) return 0.5;

  const progressByStop = {
    1: 0.72,
    2: 0.58,
    3: 0.46,
    4: 0.34,
  };

  return progressByStop[delivery.stop] ?? 0.5;
}


function hasDeliveryIncident(delivery) {
  return delivery?.stop === 3;
}

function getDeliveryIncidentText(delivery) {
  if (!hasDeliveryIncident(delivery)) return "";
  return "Incident détecté à mi-parcours : RouteBot recalcule la trajectoire depuis la position actuelle du camion.";
}


function getDeliveryEtaUpdate(delivery) {
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

function getDeliveryEtaLabel(delivery) {
  const eta = getDeliveryEtaUpdate(delivery);
  if (!eta) return "";

  return `${eta.oldEta} → ${eta.newEta} · ${eta.status}`;
}

const modes = {
  ai: { label: "IA optimisée", icon: Brain, color: "#818CF8", bg: "rgba(129,140,248,0.12)", border: "rgba(129,140,248,0.28)" },
  eco: { label: "Mode éco", icon: Leaf, color: "#34D399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.28)" },
  classic: { label: "Trajet rapide", icon: Route, color: "#60A5FA", bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.28)" },
};

const scenarios = {
  normal: { label: "Normal", risk: "Faible" },
  peak: { label: "Pic e-commerce", risk: "Moyen" },
  rain: { label: "Pluie + trafic", risk: "Élevé" },
};

const screens = [
  { key: "home", label: "Accueil", icon: Home },
  { key: "deliveries", label: "Livraisons", icon: ClipboardList },
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


const routeBotFAQs = [
  "Est-ce que je pars maintenant ?",
  "Quel client je dois prioriser ?",
  "Pourquoi cet itinéraire est conseillé ?",
  "Quel est le risque de retard ?",
  "Comment réduire le coût et le CO₂ ?",
];

const realtimeAlerts = [
  {
    level: "Élevé",
    icon: ShieldAlert,
    title: "Incident sur livraison Client C",
    text: "Blocage détecté à mi-parcours vers Casablanca. RouteBot a recalculé une nouvelle trajectoire : ETA 13:19, toujours dans la fenêtre 12:00–14:00.",
    color: "#F87171",
    bg: "rgba(248,113,113,0.10)",
    border: "rgba(248,113,113,0.24)",
    eta: "ETA recalculée : 13:19 · dans la fenêtre",
  },
  { level: "Élevé", icon: AlertCircle, title: "Congestion urbaine", text: "Risque de ralentissement autour de Casablanca. Déviation recommandée si le retard dépasse 20 min.", color: "#F87171", bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.20)" },
  { level: "Moyen", icon: Info, title: "Fenêtre horaire serrée", text: "Le deuxième arrêt nécessite une arrivée avant 11:30. Prioriser cet arrêt.", color: "#FBBF24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.20)" },
  { level: "Faible", icon: CheckCircle2, title: "Météo stable", text: "Aucun risque météo majeur sur le trajet sélectionné.", color: "#34D399", bg: "rgba(52,211,153,0.08)", border: "rgba(52,211,153,0.20)" },
];

function getMoroccoTimeString() {
  return new Intl.DateTimeFormat("fr-MA", {
    timeZone: "Africa/Casablanca",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

function riskBadge(risk) {
  if (risk === "Élevé" || risk === "High") return { color: "#F87171", bg: "rgba(248,113,113,0.14)", label: "Élevé" };
  if (risk === "Moyen" || risk === "Medium") return { color: "#FBBF24", bg: "rgba(251,191,36,0.14)", label: "Moyen" };
  return { color: "#34D399", bg: "rgba(52,211,153,0.14)", label: "Faible" };
}

function priorityBadge(priority) {
  if (priority === "Haute") return { color: "#F87171", bg: "rgba(248,113,113,0.12)" };
  if (priority === "Moyenne") return { color: "#FBBF24", bg: "rgba(251,191,36,0.12)" };
  return { color: "#94A3B8", bg: "rgba(148,163,184,0.10)" };
}

function MapPlaceholder({ fromCity, toCity, hasRoute }) {
  const points = [
    { x: 72, y: 12, city: "Tanger" },
    { x: 76, y: 16, city: "Tetouan" },
    { x: 93, y: 18, city: "Nador" },
    { x: 98, y: 28, city: "Oujda" },
    { x: 52, y: 26, city: "Kenitra" },
    { x: 50, y: 32, city: "Rabat" },
    { x: 48, y: 42, city: "Casablanca" },
    { x: 51, y: 39, city: "Mohammedia" },
    { x: 42, y: 50, city: "ElJadida" },
    { x: 68, y: 27, city: "Fes" },
    { x: 60, y: 31, city: "Meknes" },
    { x: 50, y: 62, city: "Marrakech" },
    { x: 58, y: 48, city: "BeniMellal" },
    { x: 35, y: 76, city: "Agadir" },
    { x: 30, y: 64, city: "Essaouira" },
    { x: 56, y: 72, city: "Ouarzazate" },
    { x: 72, y: 60, city: "Errachidia" },
    { x: 22, y: 90, city: "Laayoune" },
  ];

  const from = points.find(p => p.city === fromCity);
  const to = points.find(p => p.city === toCity);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "linear-gradient(145deg, #0A1628 0%, #0D1F3C 50%, #071020 100%)", overflow: "hidden", borderRadius: 16 }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 30% 20%, rgba(129,140,248,0.06) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(52,211,153,0.04) 0%, transparent 40%)" }} />

      <svg viewBox="0 0 120 110" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
        {hasRoute && from && to && (
          <>
            <path
              d={`M ${from.x} ${from.y} Q ${(from.x + to.x) / 2 + 8} ${(from.y + to.y) / 2 - 6} ${to.x} ${to.y}`}
              fill="none"
              stroke="rgba(129,140,248,0.25)"
              strokeWidth="1.8"
              strokeDasharray="3,2"
            />
            <path
              d={`M ${from.x} ${from.y} Q ${(from.x + to.x) / 2 + 8} ${(from.y + to.y) / 2 - 6} ${to.x} ${to.y}`}
              fill="none"
              stroke="#818CF8"
              strokeWidth="1.2"
            />
            <g style={{ animation: "truck-map-move 3.8s ease-in-out infinite" }}>
              <circle
                cx={(from.x + to.x) / 2 + 4}
                cy={(from.y + to.y) / 2 - 3}
                r="3.2"
                fill="#6EE7B7"
                stroke="#F8FAFC"
                strokeWidth="0.9"
              />
              <text
                x={(from.x + to.x) / 2 + 4}
                y={(from.y + to.y) / 2 - 1.9}
                textAnchor="middle"
                fontSize="4"
                fill="#080E1C"
              >
                🚚
              </text>
            </g>
          </>
        )}

        {points.map((p) => {
          const isFrom = p.city === fromCity;
          const isTo = p.city === toCity;
          const active = isFrom || isTo;
          return (
            <g key={p.city}>
              {active && (
                <circle cx={p.x} cy={p.y} r={active ? 4 : 2.5} fill={isFrom ? "rgba(52,211,153,0.2)" : "rgba(129,140,248,0.2)"} />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r={active ? 2.2 : 1.4}
                fill={isFrom ? "#34D399" : isTo ? "#818CF8" : "rgba(148,163,184,0.5)"}
              />
            </g>
          );
        })}
      </svg>

      <div style={{ position: "absolute", bottom: 12, left: 12, right: 12, display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(8,14,28,0.85)", border: "1px solid rgba(52,211,153,0.28)", borderRadius: 8, padding: "6px 10px" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34D399", boxShadow: "0 0 8px #34D399" }} />
          <span style={{ fontSize: 11, color: "#34D399", fontWeight: 700 }}>{cities[fromCity]?.label || fromCity}</span>
        </div>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(52,211,153,0.4), rgba(129,140,248,0.4))", position: "relative" }}>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 16, height: 16, background: "rgba(8,14,28,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Truck size={8} color="#94A3B8" />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(8,14,28,0.85)", border: "1px solid rgba(129,140,248,0.28)", borderRadius: 8, padding: "6px 10px" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#818CF8", boxShadow: "0 0 8px #818CF8" }} />
          <span style={{ fontSize: 11, color: "#818CF8", fontWeight: 700 }}>{cities[toCity]?.label || toCity}</span>
        </div>
      </div>

      <div style={{ position: "absolute", top: 12, right: 12, display: "flex", flexDirection: "column", gap: 4 }}>
        {["+", "–"].map((label) => (
          <div key={label} style={{ width: 28, height: 28, background: "rgba(8,14,28,0.85)", border: "1px solid rgba(148,163,184,0.15)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{label}</div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, suffix, color = "#818CF8", change }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</span>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={13} color={color} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.5px" }}>{value}</span>
        <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{suffix}</span>
      </div>
      {change && <div style={{ fontSize: 11, color: "#34D399", fontWeight: 600 }}>{change}</div>}
    </div>
  );
}

function LiveSignalRow({ icon: Icon, label, value, badge, badgeColor }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={15} color="#64748B" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600, marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, color: "#CBD5E1", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
      </div>
      {badge && (
        <span style={{ fontSize: 11, fontWeight: 700, color: badgeColor || "#94A3B8", background: `${badgeColor || "#94A3B8"}18`, border: `1px solid ${badgeColor || "#94A3B8"}30`, borderRadius: 999, padding: "3px 8px", whiteSpace: "nowrap" }}>
          {badge}
        </span>
      )}
    </div>
  );
}


function TechnicalMetricsBand({ metrics }) {
  if (!metrics) return null;

  const items = [
    { icon: Route, label: "Distance", value: metrics.distanceKm, suffix: "km", color: "#60A5FA" },
    { icon: Clock, label: "Durée", value: metrics.estimatedTimeHours, suffix: "h", color: "#FBBF24" },
    { icon: Fuel, label: "Carburant", value: metrics.fuelLiters, suffix: "L", color: "#F59E0B" },
    { icon: Leaf, label: "CO₂", value: metrics.co2Kg, suffix: "kg", color: "#34D399" },
    { icon: Package, label: "Coût", value: metrics.estimatedCostMAD, suffix: "MAD", color: "#22D3EE" },
  ];

  return (
    <div style={{
      width: "100%",
      background: "linear-gradient(135deg, rgba(8,14,28,0.62), rgba(15,23,42,0.42))",
      borderTop: "1px solid rgba(255,255,255,0.08)",
      padding: "12px 14px 14px",
      backdropFilter: "blur(14px) saturate(1.2)",
      animation: "slide-up 0.25s ease",
    }}>
      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        marginBottom: 7,
        padding: "5px 9px",
        borderRadius: 999,
        background: "linear-gradient(135deg, rgba(129,140,248,0.22), rgba(110,231,183,0.12))",
        border: "1px solid rgba(199,210,254,0.24)",
        color: "#E0E7FF",
        fontSize: 9,
        fontWeight: 900,
        textTransform: "uppercase",
        letterSpacing: 1,
      }}>
        <span style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "#6EE7B7",
          boxShadow: "0 0 14px rgba(110,231,183,0.85)",
        }} />
        Résultat technique du trajet optimisé
      </div>

      <div className="ecoroute-technical-grid" style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
        gap: 10,
      }}>
        {items.map(({ icon: Icon, label, value, suffix, color }) => (
          <div key={label} style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.035))",
            border: "1px solid rgba(255,255,255,0.13)",
            borderRadius: 12,
            padding: "8px 10px",
            minHeight: 56,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}>
              <span style={{
                fontSize: 10,
                color: "#CBD5E1",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 0.7,
              }}>{label}</span>
              <div style={{
                width: 24,
                height: 24,
                borderRadius: 8,
                background: `linear-gradient(135deg, ${color}26, rgba(255,255,255,0.04))`,
                border: `1px solid ${color}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Icon size={14} color={color} />
              </div>
            </div>

            <div style={{
              display: "flex",
              alignItems: "baseline",
              gap: 5,
            }}>
              <strong style={{
                fontSize: 18,
                lineHeight: 1,
                color: "#FFFFFF",
                fontWeight: 950,
                textShadow: "0 6px 18px rgba(0,0,0,0.22)",
                letterSpacing: "-0.5px",
              }}>{value}</strong>
              <span style={{
                fontSize: 10,
                color: "#94A3B8",
                fontWeight: 800,
              }}>{suffix}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardIndicatorsBand({ metrics }) {
  const items = [
    { icon: Package, label: "Livraisons planifiées", value: "4", suffix: "arrêts", color: "#818CF8" },
    { icon: Truck, label: "Camions actifs", value: "1", suffix: "véhicule", color: "#60A5FA" },
    { icon: Leaf, label: "CO₂ évité ce mois", value: metrics ? Math.max(126, Math.round(metrics.co2Kg * 3.8)) : "540", suffix: "kg", color: "#34D399" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
      {items.map((s) => <StatCard key={s.label} {...s} />)}
    </div>
  );
}


function SectionPillTitle({ children, color = "#6EE7B7" }) {
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      width: "fit-content",
      marginBottom: 10,
      padding: "6px 11px",
      borderRadius: 999,
      background: "linear-gradient(135deg, rgba(129,140,248,0.16), rgba(110,231,183,0.10))",
      border: "1px solid rgba(129,140,248,0.28)",
      color: "#C7D2FE",
      fontSize: 10,
      fontWeight: 900,
      textTransform: "uppercase",
      letterSpacing: 1,
      boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
    }}>
      <span style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 14px ${color}aa`,
        flexShrink: 0,
      }} />
      {children}
    </div>
  );
}


function createLeafletCityIcon(type = "default") {
  const config = {
    start: { color: "#34D399", size: 28, label: "D" },
    end: { color: "#818CF8", size: 28, label: "A" },
    tracked: { color: "#FBBF24", size: 32, label: "L" },
    default: { color: "#64748B", size: 15, label: "" },
  };

  const item = config[type] || config.default;

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:${item.size}px;
        height:${item.size}px;
        border-radius:10px 10px 10px 2px;
        transform:rotate(-45deg);
        background:${item.color};
        border:2px solid rgba(255,255,255,0.96);
        box-shadow:0 14px 32px rgba(0,0,0,0.38), 0 0 0 7px ${item.color}22;
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <span style="
          transform:rotate(45deg);
          font-size:9px;
          font-weight:900;
          color:#04111f;
          font-family:Inter,Arial,sans-serif;
        ">${item.label}</span>
      </div>
    `,
    iconSize: [item.size, item.size],
    iconAnchor: [item.size / 2, item.size / 2],
  });
}

function createLeafletTruckIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:42px;
        height:42px;
        border-radius:16px;
        background:linear-gradient(135deg,#818CF8,#6EE7B7);
        border:3px solid rgba(255,255,255,0.96);
        box-shadow:0 18px 40px rgba(129,140,248,0.35), 0 0 0 9px rgba(129,140,248,0.13);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:22px;
      ">
        🚚
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}


function createIncidentIcon() {
  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:38px;
        height:38px;
        border-radius:14px;
        background:linear-gradient(135deg,#F87171,#FBBF24);
        border:3px solid rgba(255,255,255,0.96);
        box-shadow:0 18px 42px rgba(248,113,113,0.38), 0 0 0 9px rgba(248,113,113,0.12);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:20px;
      ">
        ⚠️
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

function FitRealRoute({ routePoints }) {
  const map = useMap();

  useEffect(() => {
    if (!routePoints || routePoints.length < 2) return;
    const bounds = L.latLngBounds(routePoints);
    map.fitBounds(bounds, { padding: [45, 45] });
  }, [routePoints, map]);

  return null;
}

function MovingLeafletTruck({ routePoints, enabled = true, startProgress = 0, showStatic = false }) {
  const [index, setIndex] = useState(0);

  function progressToIndex(points, progress) {
    if (!points || points.length < 2) return 0;
    const safeProgress = Math.min(0.95, Math.max(0.05, progress || 0));
    return Math.min(points.length - 1, Math.max(0, Math.floor((points.length - 1) * safeProgress)));
  }

  useEffect(() => {
    setIndex(progressToIndex(routePoints, startProgress));
  }, [routePoints, startProgress]);

  useEffect(() => {
    if (!enabled || !routePoints || routePoints.length < 2) return;

    const step = Math.max(1, Math.floor(routePoints.length / 180));

    const id = setInterval(() => {
      setIndex((current) => {
        const next = current + step >= routePoints.length ? 0 : current + step;
        const point = routePoints[next];

        // Do not auto-pan the map here.
        // This keeps the map draggable while the truck is being tracked.
        return next;
      });
    }, 700);

    return () => clearInterval(id);
  }, [enabled, routePoints]);

  if ((!enabled && !showStatic) || !routePoints || routePoints.length < 2) return null;

  const safeIndex = Math.min(index, routePoints.length - 1);
  const safePosition = routePoints[safeIndex];

  if (!safePosition) return null;

  return (
    <Marker position={safePosition} icon={createLeafletTruckIcon()}>
      <Popup>
        <strong>{enabled ? "Camion en mouvement" : "Position actuelle simulée"}</strong>
        <br />
        {enabled
          ? "Suivi visuel actif. Vous pouvez toujours déplacer la carte."
          : "Le camion est déjà en route sur cette livraison."}
      </Popup>
    </Marker>
  );
}

function RealMap({ fromCity, toCity, hasRoute, metrics, selectedLabel, showFollowButton = true, truckStartProgress = 0, showStaticTruck = false, autoFollow = false, routeMode = "ai", incidentReroute = false, incidentLabel = "Incident détecté" }) {
  const [routePoints, setRoutePoints] = useState([]);
  const [followVehicle, setFollowVehicle] = useState(autoFollow);

  const fromCoords = getCityCoords(fromCity);
  const toCoords = getCityCoords(toCity);

  const routeVisual =
    routeMode === "eco"
      ? { main: "#34D399", glow: "#6EE7B7", dash: "8 14", label: "Mode éco" }
      : routeMode === "classic"
        ? { main: "#60A5FA", glow: "#93C5FD", dash: "18 10", label: "Trajet rapide" }
        : { main: "#818CF8", glow: "#6EE7B7", dash: "14 18", label: "IA optimisée" };


  useEffect(() => {
    setFollowVehicle(Boolean(autoFollow));
  }, [fromCity, toCity, hasRoute, autoFollow]);


  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function loadRoadRoute() {
      if (!hasRoute || !fromCoords || !toCoords) {
        setRoutePoints([]);
        return;
      }

      // Clear old route immediately so rapid delivery clicks do not reuse stale geometry.
      setRoutePoints([]);

      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${fromCoords[1]},${fromCoords[0]};${toCoords[1]},${toCoords[0]}?overview=full&geometries=geojson`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();

        if (cancelled) return;

        if (!res.ok || !data.routes?.[0]?.geometry?.coordinates?.length) {
          throw new Error("OSRM route unavailable");
        }

        const points = data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);

        if (!cancelled) {
          setRoutePoints(points);
        }
      } catch (err) {
        if (cancelled || err?.name === "AbortError") return;

        // Fallback keeps the map usable even without internet/OSRM.
        // Keep the fallback close to the inland corridor instead of pushing it toward the sea.
        const midLat = (fromCoords[0] + toCoords[0]) / 2;
        const midLng = (fromCoords[1] + toCoords[1]) / 2;

        setRoutePoints([
          fromCoords,
          [midLat - 0.04, midLng + 0.04],
          toCoords,
        ]);
      }
    }

    const timer = window.setTimeout(loadRoadRoute, 120);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [fromCity, toCity, hasRoute, routeMode]);

  const incidentIndex =
    incidentReroute && routePoints.length > 4
      ? Math.max(1, Math.floor(routePoints.length * 0.52))
      : -1;

  const routeBeforeIncident =
    incidentIndex > 0 ? routePoints.slice(0, incidentIndex + 1) : routePoints;

  const recalculatedRoute =
    incidentIndex > 0 ? routePoints.slice(incidentIndex) : routePoints;

  const blockedOldRoute =
    incidentIndex > 0
      ? routePoints.slice(incidentIndex).map(([lat, lng], index, segment) => {
          if (index === 0) return [lat, lng];

          const progress = index / Math.max(1, segment.length - 1);
          const wave = Math.sin(progress * Math.PI);

          // Old blocked branch starts from the incident point.
          // Keep offset tiny so it stays near the road and does not drift into the sea.
          return [lat + wave * 0.008, lng + wave * 0.006];
        })
      : [];

  const incidentPoint =
    incidentIndex > 0 ? routePoints[incidentIndex] : null;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", minHeight: 420 }}>
      <div className="ecoroute-map-topbar" style={{
        position: "absolute",
        top: 12,
        left: 14,
        right: 14,
        zIndex: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        pointerEvents: "none",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 11px",
          borderRadius: 12,
          background: "rgba(8,14,28,0.82)",
          border: "1px solid rgba(255,255,255,0.10)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.28)",
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34D399", boxShadow: "0 0 10px #34D399" }} />
          <div>
            <div style={{ fontSize: 9, color: "#64748B", fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.8 }}>Départ</div>
            <div style={{ fontSize: 12, color: "#E2E8F0", fontWeight: 800 }}>{cities[fromCity]?.label || fromCity}</div>
          </div>
          <ArrowRight size={14} color="#64748B" />
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#818CF8", boxShadow: "0 0 10px #818CF8" }} />
          <div>
            <div style={{ fontSize: 9, color: "#64748B", fontWeight: 900, textTransform: "uppercase", letterSpacing: 0.8 }}>Arrivée</div>
            <div style={{ fontSize: 12, color: "#E2E8F0", fontWeight: 800 }}>{selectedLabel || cities[toCity]?.label || toCity}</div>
          </div>
        </div>

        {hasRoute && routePoints.length > 0 && (
          <div style={{
            pointerEvents: "auto",
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 11px",
            borderRadius: 12,
            background: "rgba(8,14,28,0.82)",
            border: `1px solid ${routeVisual.main}55`,
            color: routeVisual.glow,
            fontSize: 12,
            fontWeight: 900,
            boxShadow: "0 12px 30px rgba(0,0,0,0.28)",
            backdropFilter: "blur(10px)",
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: routeVisual.main,
              boxShadow: `0 0 12px ${routeVisual.main}`,
            }} />
            {routeVisual.label}
          </div>
        )}

        {incidentReroute && hasRoute && routePoints.length > 0 && (
          <div style={{
            pointerEvents: "auto",
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 11px",
            borderRadius: 12,
            background: "rgba(127,29,29,0.84)",
            border: "1px solid rgba(248,113,113,0.35)",
            color: "#FECACA",
            fontSize: 12,
            fontWeight: 900,
            boxShadow: "0 12px 30px rgba(0,0,0,0.28)",
            backdropFilter: "blur(10px)",
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#F87171",
              boxShadow: "0 0 12px rgba(248,113,113,0.85)",
            }} />
            Incident + recalcul IA · ETA 13:19 OK
          </div>
        )}

        {showFollowButton && hasRoute && routePoints.length > 0 && (
          <button
            type="button"
            onClick={() => setFollowVehicle((prev) => !prev)}
            style={{
              pointerEvents: "auto",
              border: "1px solid rgba(129,140,248,0.28)",
              background: followVehicle
                ? "linear-gradient(135deg, rgba(129,140,248,0.95), rgba(110,231,183,0.9))"
                : "rgba(8,14,28,0.82)",
              color: followVehicle ? "#080E1C" : "#CBD5E1",
              borderRadius: 12,
              padding: "9px 12px",
              fontSize: 12,
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 12px 30px rgba(0,0,0,0.28)",
              backdropFilter: "blur(10px)",
            }}
          >
            🚚 {followVehicle ? "Suivi actif" : "Suivre camion"}
          </button>
        )}
      </div>

      <MapContainer
        className="ecoroute-real-map"
        center={fromCoords || [31.8, -7.2]}
        zoom={hasRoute ? 8 : 6}
        minZoom={5}
        maxBounds={[
          [20.5, -17.5],
          [37.5, -0.5],
        ]}
        maxBoundsViscosity={1.0}
        scrollWheelZoom
        style={{ width: "100%", height: "100%", minHeight: 420, background: "#031525" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={fromCoords} icon={createLeafletCityIcon("start")}>
          <Popup>
            <strong>Départ</strong>
            <br />
            {cities[fromCity]?.label || fromCity}
          </Popup>
        </Marker>

        <Marker position={toCoords} icon={createLeafletCityIcon(selectedLabel ? "tracked" : "end")}>
          <Popup>
            <strong>{selectedLabel ? "Livraison suivie" : "Destination"}</strong>
            <br />
            {selectedLabel || cities[toCity]?.label || toCity}
          </Popup>
        </Marker>

        {routePoints.length > 0 && (
          <>
            {incidentReroute && blockedOldRoute.length > 1 ? (
              <>
                <Polyline
                  positions={routeBeforeIncident}
                  pathOptions={{
                    color: "#ffffff",
                    weight: 12,
                    opacity: 0.12,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
                <Polyline
                  positions={routeBeforeIncident}
                  pathOptions={{
                    color: "#A5B4FC",
                    weight: 5,
                    opacity: 0.65,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />

                <Polyline
                  positions={blockedOldRoute}
                  pathOptions={{
                    color: "#7F1D1D",
                    weight: 11,
                    opacity: 0.18,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
                <Polyline
                  positions={blockedOldRoute}
                  pathOptions={{
                    color: "#F87171",
                    weight: 5,
                    opacity: 0.92,
                    dashArray: "8 10",
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />

                <Polyline
                  positions={recalculatedRoute}
                  pathOptions={{
                    color: "#ffffff",
                    weight: 14,
                    opacity: 0.14,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
                <Polyline
                  positions={recalculatedRoute}
                  pathOptions={{
                    color: "#34D399",
                    weight: 8,
                    opacity: 0.68,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
                <Polyline
                  positions={recalculatedRoute}
                  className="ecoroute-route-pulse"
                  pathOptions={{
                    color: "#6EE7B7",
                    weight: 5,
                    opacity: 1,
                    dashArray: "18 12",
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />

                {incidentPoint && (
                  <Marker position={incidentPoint} icon={createIncidentIcon()}>
                    <Popup>
                      <strong>Incident détecté à mi-parcours</strong>
                      <br />
                      {incidentLabel}
                      <br />
                      La nouvelle trajectoire repart depuis ce point.
                    </Popup>
                  </Marker>
                )}
              </>
            ) : (
              <>
                <Polyline
                  positions={routePoints}
                  pathOptions={{
                    color: "#ffffff",
                    weight: 14,
                    opacity: 0.13,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
                <Polyline
                  positions={routePoints}
                  pathOptions={{
                    color: routeVisual.main,
                    weight: 7,
                    opacity: 0.35,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
                <Polyline
                  positions={routePoints}
                  className="ecoroute-route-pulse"
                  pathOptions={{
                    color: routeVisual.glow,
                    weight: 4,
                    opacity: 1,
                    dashArray: routeVisual.dash,
                    lineCap: "round",
                    lineJoin: "round",
                  }}
                />
              </>
            )}

            <FitRealRoute routePoints={routePoints} />
            <MovingLeafletTruck
              routePoints={routePoints}
              enabled={hasRoute && followVehicle}
              startProgress={truckStartProgress}
              showStatic={hasRoute && showStaticTruck}
            />
          </>
        )}
      </MapContainer>

    </div>
  );
}


function buildRouteBotAnswer({ question, startCity, destinationCity, mode, scenario, metrics, hasRoute, selectedDelivery }) {
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
      return `Pour l'instant, je ne peux pas vraiment justifier le trajet tant que le calcul n'est pas lancé. Clique sur “Calculer l'itinéraire optimal”, puis je pourrai expliquer le choix avec distance, durée, carburant, coût et CO₂.`;
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

  if (q.includes("co2") || q.includes("co₂") || q.includes("coût") || q.includes("cout") || q.includes("carburant") || q.includes("réduire")) {
    if (!metrics) {
      return `Pour réduire le coût et le CO₂, je choisirais le mode éco et j'éviterais les détours. Lance le calcul pour que je puisse estimer les litres, le coût et le CO₂ du trajet choisi.`;
    }

    return `Pour réduire le coût, je garderais le trajet optimisé et j'éviterais les détours non nécessaires. Sur ce trajet, on estime ${metrics.fuelLiters} L, ${metrics.co2Kg} kg de CO₂ et ${metrics.estimatedCostMAD} MAD. Si tu veux réduire encore, le mode éco est le meilleur choix.`;
  }

  return `D'accord. Pour être concret : sur le trajet ${routeSummary} je regarderais surtout trois choses : les fenêtres horaires, le risque trafic/météo, et le coût carburant. Pose-moi une question du type “je pars maintenant ?”, “quel client prioriser ?” ou “comment réduire le coût ?” et je te réponds comme un assistant d'exploitation.`;
}

export function App() {
  const [activeScreen, setActiveScreen] = useState("home");
  const [startCity, setStartCity] = useState("Kenitra");
  const [destinationCity, setDestinationCity] = useState("Casablanca");
  const [optimizedStartCity, setOptimizedStartCity] = useState("Kenitra");
  const [optimizedDestinationCity, setOptimizedDestinationCity] = useState("Casablanca");
  const [mode, setMode] = useState("ai");
  const [scenario, setScenario] = useState("normal");
  const [loading, setLoading] = useState(false);
  const [hasRoute, setHasRoute] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [liveTime, setLiveTime] = useState(getMoroccoTimeString());
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [alertsPopupOpen, setAlertsPopupOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Salut, je suis RouteBot. Je vais t'aider comme un assistant d'exploitation : départ, priorité client, risque de retard, coût, carburant et CO₂. Choisis une question fréquente ou écris-moi directement.",
    },
  ]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [deliveryClickLocked, setDeliveryClickLocked] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setLiveTime(getMoroccoTimeString()), 30000);
    return () => clearInterval(id);
  }, []);

  function simulateOptimize(nextMode = mode, nextScenario = scenario) {
    if (startCity === destinationCity) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setOptimizedStartCity(startCity);
      setOptimizedDestinationCity(destinationCity);
      setHasRoute(true);

      const from = getCityCoords(startCity);
      const to = getCityCoords(destinationCity);

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

      // Road distance estimate: realistic enough for demo and stable for same cities.
      const baseRoadDistance = Math.max(35, Math.round(haversineKm(from, to) * 1.28));

      // Logic:
      // - Trajet rapide: slightly shorter/faster, but consumes more fuel.
      // - Mode éco: slightly longer/slower, but saves fuel, CO₂ and money.
      // - IA optimisée: balanced compromise.
      const distance =
        nextMode === "classic"
          ? Math.round(baseRoadDistance * 0.96)
          : nextMode === "eco"
            ? Math.round(baseRoadDistance * 1.04)
            : baseRoadDistance;

      const averageSpeed =
        nextMode === "classic"
          ? 96
          : nextMode === "eco"
            ? 76
            : 86;

      const scenarioDelay =
        nextScenario === "rain"
          ? 0.28
          : nextScenario === "peak"
            ? 0.16
            : 0;

      const baseTime = distance / averageSpeed;
      const estimatedTime = (baseTime * (1 + scenarioDelay)).toFixed(1);

      const fuelRate =
        nextMode === "classic"
          ? 0.135
          : nextMode === "eco"
            ? 0.092
            : 0.112;

      const fuelLiters = Math.round(distance * fuelRate);
      const co2Kg = Math.round(fuelLiters * 2.45);

      const costRate =
        nextMode === "classic"
          ? 3.45
          : nextMode === "eco"
            ? 2.75
            : 3.1;

      setMetrics({
        distanceKm: distance,
        estimatedTimeHours: estimatedTime,
        fuelLiters,
        co2Kg,
        estimatedCostMAD: Math.round(distance * costRate),
        riskLevel: nextScenario === "rain" ? "Élevé" : nextScenario === "peak" ? "Moyen" : "Faible",
      });
    }, 700);
  }


  function handleModeChange(nextMode) {
    setMode(nextMode);

    if (startCity === destinationCity) return;

    // Recalculate immediately when the user changes mode.
    simulateOptimize(nextMode, scenario);
  }


  function askRouteBot(question) {
    const q = String(question || "").trim();
    if (!q) return;

    setAssistantInput("");
    setMessages((prev) => [...prev, { role: "user", text: q }]);

    window.setTimeout(() => {
      const answer = buildRouteBotAnswer({
        question: q,
        startCity,
        destinationCity,
        mode,
        scenario,
        metrics,
        hasRoute,
        selectedDelivery,
      });

      setMessages((prev) => [...prev, { role: "ai", text: answer }]);
    }, 550);
  }

  function sendMessage() {
    askRouteBot(assistantInput);
  }


  function handleSelectDelivery(delivery) {
    if (deliveryClickLocked) return;

    setDeliveryClickLocked(true);
    setSelectedDelivery(delivery);

    window.setTimeout(() => {
      setDeliveryClickLocked(false);
    }, 350);
  }

  const activeMode = modes[mode];
  const risk = riskBadge(metrics?.riskLevel || "Faible");

  return (
    <div className="ecoroute-root" style={{ display: "flex", height: "100vh", background: "#080E1C", fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif", color: "#E2E8F0", overflow: "hidden" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.2); border-radius: 999px; }
        select { appearance: none; -webkit-appearance: none; }
        select {
          color: #E2E8F0;
          background-color: rgba(255,255,255,0.04);
        }

        select option {
          color: #0F172A;
          background: #FFFFFF;
          font-weight: 700;
        }

        select:focus {
          border-color: rgba(129,140,248,0.45) !important;
          box-shadow: 0 0 0 3px rgba(129,140,248,0.12);
        }

        button { font-family: inherit; cursor: pointer; }
        input { font-family: inherit; }
        @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slide-up { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes truck-move { 0%,100% { transform: translateX(0); } 50% { transform: translateX(6px); } }
        @keyframes brandGlow {
          0%, 100% {
            box-shadow: 0 8px 24px rgba(129,140,248,0.30), 0 0 0 0 rgba(110,231,183,0.0);
            transform: translateY(0);
          }
          50% {
            box-shadow: 0 12px 34px rgba(110,231,183,0.34), 0 0 0 6px rgba(110,231,183,0.08);
            transform: translateY(-1px);
          }
        }

        @keyframes sloganShine {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes sloganDot {
          0%, 100% { opacity: 0.45; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.15); }
        }


        .ecoroute-real-map .leaflet-tile {
          filter: grayscale(0.18) invert(0.82) brightness(0.90) contrast(1.08) hue-rotate(155deg) saturate(1.12);
        }

        .ecoroute-real-map .leaflet-control-attribution {
          background: rgba(2, 6, 23, 0.78) !important;
          color: #94a3b8 !important;
          border-radius: 12px 0 0 0;
          font-size: 10px;
        }

        .ecoroute-real-map .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 14px 32px rgba(0,0,0,0.33) !important;
        }

        .ecoroute-real-map .leaflet-control-zoom a {
          background: rgba(15, 23, 42, 0.94) !important;
          color: #e2e8f0 !important;
          border-color: rgba(148,163,184,0.18) !important;
        }

        .ecoroute-real-map .leaflet-popup-content-wrapper,
        .ecoroute-real-map .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.97);
          color: #f8fafc;
          border: 1px solid rgba(129,140,248,0.24);
          box-shadow: 0 18px 45px rgba(0,0,0,0.48);
        }

        .ecoroute-real-map.leaflet-container {
          background: #102235 !important;
        }

        .ecoroute-route-pulse {
          animation: ecorouteRoutePulse 1.9s linear infinite;
        }

        @keyframes ecorouteRoutePulse {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -42; }
        }

        @keyframes truck-map-move { 0%,100% { transform: translate(-5px, -2px); opacity: 0.9; } 50% { transform: translate(5px, 2px); opacity: 1; } }
        .ecoroute-root {}
        .ecoroute-sidebar {}
        .ecoroute-brand {}
        .ecoroute-nav {}
        .ecoroute-main {}
        .ecoroute-header {}
        .ecoroute-content {}
        .ecoroute-home-grid {}
        .ecoroute-left-panel {}
        .ecoroute-right-panel {}
        .ecoroute-dashboard-grid {}
        .ecoroute-map-card {}
        .ecoroute-map-wrap {}
        .ecoroute-technical-grid {}
        .ecoroute-deliveries-grid {}
        .ecoroute-alert-popup {}
        .ecoroute-settings-grid {}

        @media (max-width: 1100px) {
          .ecoroute-home-grid { grid-template-columns: 340px 1fr !important; }
          .ecoroute-dashboard-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
          .ecoroute-technical-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; }
        }

        @media (max-width: 860px) {
          .ecoroute-root {
            flex-direction: column !important;
            height: auto !important;
            min-height: 100vh !important;
            overflow: auto !important;
          }

          .ecoroute-sidebar {
            width: 100% !important;
            max-width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.06) !important;
            padding: 12px !important;
            overflow: visible !important;
          }

          .ecoroute-brand {
            padding: 0 4px 12px !important;
            margin-bottom: 10px !important;
          }

          .ecoroute-nav {
            flex: none !important;
            flex-direction: row !important;
            overflow-x: auto !important;
            gap: 8px !important;
            margin-bottom: 12px !important;
            padding-bottom: 2px !important;
          }

          .ecoroute-nav button {
            min-width: max-content !important;
            padding: 9px 11px !important;
            white-space: nowrap !important;
          }

          .ecoroute-sidebar-status {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
            border-top: none !important;
            padding-top: 0 !important;
          }

          .ecoroute-routebot-button {
            min-height: 58px !important;
            margin-bottom: 10px !important;
          }

          .ecoroute-team-shortcut-mobile-fix {
            margin-top: 0 !important;
          }

          .ecoroute-sidebar-status > div { min-height: 58px !important; }

          .ecoroute-main {
            overflow: visible !important;
            min-width: 0 !important;
          }

          .ecoroute-header {
            height: auto !important;
            min-height: 58px !important;
            padding: 12px 14px !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }

          .ecoroute-content {
            padding: 12px !important;
            overflow: visible !important;
          }

          .ecoroute-home-grid {
            grid-template-columns: 1fr !important;
            height: auto !important;
          }

          .ecoroute-left-panel,
          .ecoroute-right-panel { overflow: visible !important; }

          .ecoroute-dashboard-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .ecoroute-map-card { min-height: 560px !important; }
          .ecoroute-map-wrap { min-height: 430px !important; }
          .ecoroute-real-map,
          .ecoroute-real-map.leaflet-container { min-height: 430px !important; }

          .ecoroute-technical-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          .ecoroute-deliveries-grid {
            grid-template-columns: 1fr !important;
            height: auto !important;
          }

          .ecoroute-alert-popup {
            left: 12px !important;
            right: 12px !important;
            top: 72px !important;
            width: auto !important;
            max-height: calc(100vh - 92px) !important;
          }

          .ecoroute-settings-grid { grid-template-columns: 1fr !important; }
          .ecoroute-team-members-grid { grid-template-columns: 1fr !important; }
        }

        @media (max-width: 520px) {
          .ecoroute-header h1 { font-size: 16px !important; }
          .ecoroute-brand { gap: 9px !important; }

          .ecoroute-dashboard-grid,
          .ecoroute-technical-grid { grid-template-columns: 1fr !important; }

          .ecoroute-map-card { min-height: 530px !important; }
          .ecoroute-map-wrap { min-height: 390px !important; }
          .ecoroute-real-map,
          .ecoroute-real-map.leaflet-container { min-height: 390px !important; }

          .ecoroute-sidebar-status { grid-template-columns: 1fr !important; }
          .ecoroute-route-select-grid { grid-template-columns: 1fr !important; }
          .ecoroute-mode-grid { grid-template-columns: 1fr !important; }

          .ecoroute-map-topbar {
            align-items: flex-start !important;
            gap: 8px !important;
          }

          .ecoroute-map-topbar > div:first-child {
            max-width: 100% !important;
            overflow-x: auto !important;
          }
        }

      `}</style>

      {/* SIDEBAR */}
      <aside className="ecoroute-sidebar" style={{ width: 220, flexShrink: 0, background: "linear-gradient(180deg, #0C1526 0%, #080E1C 100%)", borderRight: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", padding: "20px 12px", overflow: "hidden" }}>
        {/* Brand */}
        <div className="ecoroute-brand" style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          padding: "0 8px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          marginBottom: 16,
          position: "relative",
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 13,
            background: "linear-gradient(135deg, #818CF8 0%, #6EE7B7 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "brandGlow 3.2s ease-in-out infinite",
            position: "relative",
            overflow: "hidden",
            flexShrink: 0,
          }}>
            <div style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.42), transparent 34%)",
              opacity: 0.8,
            }} />
            <Navigation size={19} color="#080E1C" style={{ position: "relative", zIndex: 1 }} />
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 15,
              fontWeight: 950,
              color: "#F8FAFC",
              letterSpacing: "-0.35px",
              lineHeight: 1,
              textShadow: "0 8px 24px rgba(0,0,0,0.35)",
            }}>
              EcoRoute
            </div>

            <div style={{
              marginTop: 5,
              display: "flex",
              alignItems: "center",
              gap: 6,
              minWidth: 0,
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#6EE7B7",
                boxShadow: "0 0 12px rgba(110,231,183,0.9)",
                animation: "sloganDot 1.8s ease-in-out infinite",
                flexShrink: 0,
              }} />

              <div style={{
                fontSize: 10.5,
                fontWeight: 850,
                letterSpacing: 0.25,
                lineHeight: 1.25,
                background: "linear-gradient(90deg, #94A3B8, #E0E7FF, #6EE7B7, #94A3B8)",
                backgroundSize: "220% 220%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                animation: "sloganShine 4.5s ease-in-out infinite",
              }}>
                Trace ta route.<br />
                Livre mieux.
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="ecoroute-nav" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, marginBottom: 18 }}>
          {screens.map(({ key, label, icon: Icon }) => {
            const active = activeScreen === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setActiveScreen(key);
                  setAlertsPopupOpen(false);
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10,
                  background: active ? "rgba(129,140,248,0.12)" : "transparent",
                  border: active ? "1px solid rgba(129,140,248,0.22)" : "1px solid transparent",
                  color: active ? "#A5B4FC" : "#475569",
                  fontWeight: active ? 700 : 500, fontSize: 13, transition: "all 0.15s", textAlign: "left",
                }}
              >
                <Icon size={15} />
                {label}
                {key === "alerts" && <span style={{ marginLeft: "auto", width: 16, height: 16, borderRadius: "50%", background: "#F87171", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>4</span>}
              </button>
            );
          })}
        </nav>

        {/* Creative team shortcut */}
        <button
          type="button"
          onClick={() => {
            setActiveScreen("team");
            setAlertsPopupOpen(false);
          }}
          style={{
            width: "100%",
            border: activeScreen === "team"
              ? "1px solid rgba(110,231,183,0.34)"
              : "1px solid rgba(255,255,255,0.08)",
            background: activeScreen === "team"
              ? "linear-gradient(135deg, rgba(110,231,183,0.16), rgba(129,140,248,0.10))"
              : "linear-gradient(135deg, rgba(255,255,255,0.045), rgba(15,23,42,0.28))",
            borderRadius: 16,
            padding: 12,
            marginBottom: 12,
            textAlign: "left",
            position: "relative",
            overflow: "hidden",
            boxShadow: activeScreen === "team"
              ? "0 18px 44px rgba(110,231,183,0.12)"
              : "none",
          }}
        >
          <div style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 20% 20%, rgba(110,231,183,0.18), transparent 34%), radial-gradient(circle at 90% 70%, rgba(129,140,248,0.16), transparent 28%)",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              marginBottom: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, #6EE7B7, #818CF8)",
                  color: "#080E1C",
                  boxShadow: "0 12px 30px rgba(110,231,183,0.18)",
                }}>
                  <CheckCircle2 size={16} />
                </div>

                <div>
                  <div style={{
                    color: "#F8FAFC",
                    fontSize: 12,
                    fontWeight: 950,
                    lineHeight: 1.1,
                  }}>
                    Équipe projet
                  </div>
                  <div style={{
                    color: "#64748B",
                    fontSize: 10,
                    fontWeight: 750,
                    marginTop: 2,
                  }}>
                    Les personnes derrière EcoRoute
                  </div>
                </div>
              </div>

              <ArrowUpRight size={14} color={activeScreen === "team" ? "#6EE7B7" : "#64748B"} />
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                {["EM", "OA", "HA", "BL"].map((initials, i) => (
                  <div
                    key={initials}
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      marginLeft: i === 0 ? 0 : -7,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: i === 0
                        ? "linear-gradient(135deg, #818CF8, #6EE7B7)"
                        : "rgba(15,23,42,0.95)",
                      border: "1px solid rgba(255,255,255,0.16)",
                      color: i === 0 ? "#080E1C" : "#C7D2FE",
                      fontSize: 8,
                      fontWeight: 950,
                      boxShadow: "0 8px 20px rgba(0,0,0,0.22)",
                    }}
                  >
                    {initials}
                  </div>
                ))}
              </div>

              <span style={{
                color: "#94A3B8",
                fontSize: 10,
                fontWeight: 850,
              }}>
                7 membres
              </span>
            </div>
          </div>
        </button>

        {/* RouteBot sidebar button */}
        <button
          className="ecoroute-routebot-button"
          type="button"
          onClick={() => {
            setAssistantOpen((v) => !v);
            setAlertsPopupOpen(false);
          }}
          style={{
            width: "100%",
            minHeight: 68,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            marginTop: 0,
            marginBottom: 10,
            borderRadius: 14,
            border: assistantOpen
              ? "1px solid rgba(129,140,248,0.42)"
              : "1px solid rgba(129,140,248,0.20)",
            background: assistantOpen
              ? "linear-gradient(135deg, rgba(129,140,248,0.18), rgba(110,231,183,0.10))"
              : "rgba(129,140,248,0.08)",
            color: assistantOpen ? "#C7D2FE" : "#A5B4FC",
            fontWeight: 850,
            fontSize: 13,
            cursor: "pointer",
            boxShadow: assistantOpen
              ? "0 12px 30px rgba(129,140,248,0.16)"
              : "none",
          }}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #818CF8, #6EE7B7)",
            color: "#080E1C",
            flexShrink: 0,
          }}>
            <Brain size={18} />
          </div>

          <div style={{ textAlign: "left", minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ color: "#F1F5F9", fontSize: 13, fontWeight: 900, lineHeight: 1.1 }}>RouteBot</div>
            <div style={{ color: "#64748B", fontSize: 10, fontWeight: 700, lineHeight: 1.2, marginTop: 2 }}>
              Assistant IA
            </div>
          </div>

          <span style={{
            marginLeft: "auto",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: assistantOpen ? "#34D399" : "#64748B",
            boxShadow: assistantOpen ? "0 0 12px rgba(52,211,153,0.85)" : "none",
            flexShrink: 0,
          }} />
        </button>

        {/* Bottom status */}
        <div className="ecoroute-sidebar-status" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 16, paddingBottom: 6, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ minHeight: 68, display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.16)", borderRadius: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34D399", animation: "pulse-dot 2s ease infinite", boxShadow: "0 0 12px rgba(52,211,153,0.7)" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 10, color: "#475569", fontWeight: 700, lineHeight: 1.2 }}>Temps Maroc</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: "#34D399", letterSpacing: "-0.3px", lineHeight: 1.15, marginTop: 2 }}>{liveTime}</div>
            </div>
          </div>
          <div style={{ minHeight: 68, display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.025)", flexShrink: 0 }}>
              <Truck size={15} color="#475569" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ fontSize: 10, color: "#475569", fontWeight: 700, lineHeight: 1.2 }}>Flotte active</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#94A3B8", lineHeight: 1.15, marginTop: 2 }}>4 véhicules</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="ecoroute-main" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Header bar */}
        <header className="ecoroute-header" style={{ height: 60, borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0, background: "rgba(8,14,28,0.80)", backdropFilter: "blur(12px)", position: "relative", zIndex: 2000 }}>
          <div>
            <div style={{ fontSize: 11, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Command Center</div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.4px", lineHeight: 1.1 }}>
              {activeScreen === "team" ? "Équipe" : screens.find(s => s.key === activeScreen)?.label}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

            <div style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setAlertsPopupOpen((v) => !v)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: alertsPopupOpen ? "rgba(248,113,113,0.16)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${alertsPopupOpen ? "rgba(248,113,113,0.35)" : "rgba(255,255,255,0.08)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: alertsPopupOpen ? "#F87171" : "#64748B",
                  position: "relative",
                }}
              >
                <Bell size={16} />
                <span style={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  width: 17,
                  height: 17,
                  borderRadius: "50%",
                  background: "#F87171",
                  color: "#FFFFFF",
                  fontSize: 9,
                  fontWeight: 900,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 18px rgba(248,113,113,0.35)",
                }}>
                  4
                </span>
              </button>

              {alertsPopupOpen && (
                <>
                <div
                  onClick={() => setAlertsPopupOpen(false)}
                  style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(2,6,23,0.18)",
                    backdropFilter: "blur(1px)",
                    zIndex: 99998,
                  }}
                />
                <div
                  className="ecoroute-alert-popup"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                  position: "fixed",
                  right: 24,
                  top: 70,
                  width: 390,
                  maxHeight: "calc(100vh - 96px)",
                  overflowY: "auto",
                  overflowX: "hidden",
                  borderRadius: 18,
                  background: "rgba(12,21,38,0.98)",
                  border: "1px solid rgba(248,113,113,0.22)",
                  boxShadow: "0 30px 100px rgba(0,0,0,0.68), 0 0 0 1px rgba(248,113,113,0.08)",
                  backdropFilter: "blur(18px)",
                  zIndex: 99999,
                  padding: 12,
                  animation: "slide-up 0.18s ease",
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}>
                    <div>
                      <div style={{ fontSize: 13, color: "#F8FAFC", fontWeight: 900 }}>
                        Alertes opérationnelles
                      </div>
                      <div style={{ fontSize: 10, color: "#64748B", fontWeight: 700 }}>
                        Incident, trafic, fenêtres horaires
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAlertsPopupOpen(false)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 9,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.04)",
                        color: "#94A3B8",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {realtimeAlerts.slice(0, 4).map((a, i) => {
                      const Icon = a.icon;
                      return (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            gap: 10,
                            padding: 11,
                            borderRadius: 13,
                            background: a.bg,
                            border: `1px solid ${a.border}`,
                          }}
                        >
                          <div style={{
                            width: 34,
                            height: 34,
                            borderRadius: 11,
                            background: `${a.color}18`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            <Icon size={16} color={a.color} />
                          </div>

                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                              <span style={{
                                fontSize: 10,
                                color: a.color,
                                fontWeight: 900,
                                textTransform: "uppercase",
                                letterSpacing: 0.7,
                              }}>
                                {a.level}
                              </span>
                              <span style={{ color: "#F1F5F9", fontSize: 12, fontWeight: 900 }}>
                                {a.title}
                              </span>
                            </div>

                            <p style={{ color: "#94A3B8", fontSize: 11, lineHeight: 1.45 }}>
                              {a.text}
                            </p>

                            {a.eta && (
                              <div style={{
                                marginTop: 8,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "5px 8px",
                                borderRadius: 999,
                                background: "rgba(251,191,36,0.10)",
                                border: "1px solid rgba(251,191,36,0.22)",
                                color: "#FDE68A",
                                fontSize: 10,
                                fontWeight: 900,
                              }}>
                                <Clock size={11} />
                                {a.eta}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveScreen("alerts");
                      setAlertsPopupOpen(false);
                    }}
                    style={{
                      marginTop: 10,
                      width: "100%",
                      border: "1px solid rgba(129,140,248,0.24)",
                      background: "rgba(129,140,248,0.10)",
                      color: "#C7D2FE",
                      borderRadius: 12,
                      padding: "9px 12px",
                      fontSize: 12,
                      fontWeight: 900,
                    }}
                  >
                    Voir toutes les alertes
                  </button>
                </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="ecoroute-content" style={{ flex: 1, overflow: "auto", padding: 20 }}>

          {/* HOME SCREEN */}
          {activeScreen === "home" && (
            <div className="ecoroute-home-grid" style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 16, height: "100%" }}>
              {/* Left panel */}
              <div className="ecoroute-left-panel" style={{ display: "flex", flexDirection: "column", gap: 14, overflow: "auto" }}>
                {/* Route config */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <SlidersHorizontal size={15} color="#818CF8" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#CBD5E1" }}>Plan de tournée</span>
                    </div>
                    <span style={{ fontSize: 10, color: "#475569", fontWeight: 600, background: "rgba(255,255,255,0.04)", padding: "3px 8px", borderRadius: 6 }}>Config. rapide</span>
                  </div>

                  <div className="ecoroute-route-select-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                    {[
                      { label: "Départ", value: startCity, setter: setStartCity },
                      { label: "Destination", value: destinationCity, setter: setDestinationCity },
                    ].map((item) => (
                      <div key={item.label}>
                        <label style={{ display: "block", fontSize: 10, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5 }}>{item.label}</label>
                        <div style={{ position: "relative" }}>
                          <select
                            value={item.value}
                            onChange={(e) => {
                              item.setter(e.target.value);
                              setHasRoute(false);
                              setMetrics(null);
                            }}
                            style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "#E2E8F0", borderRadius: 9, padding: "8px 28px 8px 10px", fontSize: 12, fontWeight: 600, outline: "none" }}
                          >
                            {Object.entries(cities).map(([k, c]) => <option key={k} value={k} style={{ color: "#0F172A", background: "#FFFFFF" }}>{c.label}</option>)}
                          </select>
                          <ChevronRight size={12} color="#475569" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%) rotate(90deg)", pointerEvents: "none" }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", fontSize: 10, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>Mode d'optimisation</label>
                    <div className="ecoroute-mode-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                      {Object.entries(modes).map(([key, m]) => {
                        const Icon = m.icon;
                        const active = mode === key;
                        return (
                          <button
                            key={key}
                            onClick={() => handleModeChange(key)}
                            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, padding: "10px 6px", borderRadius: 10, background: active ? m.bg : "rgba(255,255,255,0.03)", border: `1px solid ${active ? m.border : "rgba(255,255,255,0.06)"}`, color: active ? m.color : "#475569", fontSize: 10, fontWeight: 700, transition: "all 0.15s" }}
                          >
                            <Icon size={15} />
                            <span>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 10, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 5 }}>Scénario opérationnel</label>
                    <div style={{ position: "relative" }}>
                      <select
                        value={scenario}
                        onChange={(e) => {
                          const nextScenario = e.target.value;
                          setScenario(nextScenario);

                          if (hasRoute && startCity !== destinationCity) {
                            simulateOptimize(mode, nextScenario);
                          } else {
                            setHasRoute(false);
                            setMetrics(null);
                          }
                        }}
                        style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "#E2E8F0", borderRadius: 9, padding: "8px 28px 8px 10px", fontSize: 12, fontWeight: 600, outline: "none" }}
                      >
                        {Object.entries(scenarios).map(([k, s]) => <option key={k} value={k} style={{ color: "#0F172A", background: "#FFFFFF" }}>{s.label}</option>)}
                      </select>
                      <ChevronRight size={12} color="#475569" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%) rotate(90deg)", pointerEvents: "none" }} />
                    </div>
                  </div>

                  <button
                    onClick={simulateOptimize}
                    disabled={loading || startCity === destinationCity}
                    style={{ width: "100%", padding: "12px 16px", borderRadius: 11, border: 0, background: loading ? "rgba(129,140,248,0.3)" : "linear-gradient(135deg, #818CF8, #6EE7B7)", color: "#080E1C", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: loading ? "none" : "0 8px 24px rgba(129,140,248,0.28)" }}
                  >
                    {loading ? (
                      <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Calcul en cours...</>
                    ) : (
                      <><Zap size={15} /> Calculer l'itinéraire optimal</>
                    )}
                  </button>
                </div>

                {/* Live signals */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <Activity size={14} color="#818CF8" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#CBD5E1" }}>Signaux temps réel</span>
                    <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: hasRoute ? "#34D399" : "#475569", animation: hasRoute ? "pulse-dot 2s infinite" : "none" }} />
                  </div>
                  {!hasRoute ? (
                    <p style={{ fontSize: 12, color: "#334155", textAlign: "center", padding: "16px 0" }}>Lancez l'optimisation pour charger les données.</p>
                  ) : (
                    <>
                      <LiveSignalRow icon={TrafficCone} label="Trafic" value={scenario === "rain" ? "Trafic dense — déviation conseillée" : scenario === "peak" ? "Trafic modéré" : "Circulation fluide"} badge={scenarios[scenario].risk} badgeColor={risk.color} />
                      <LiveSignalRow icon={CloudSun} label="Météo destination" value={scenario === "rain" ? "Pluie — 14°C · Vent 28 km/h" : "Dégagé — 22°C · Vent 12 km/h"} />
                      <LiveSignalRow icon={TimerReset} label="Horaire" value={liveTime + " — Départ conseillé dans 15 min"} />
                    </>
                  )}
                </div>

                {/* AI advice */}
                <div style={{ background: "rgba(129,140,248,0.06)", border: "1px solid rgba(129,140,248,0.16)", borderRadius: 16, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <Brain size={14} color="#818CF8" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#A5B4FC" }}>Décisions IA</span>
                  </div>
                  {[
                    hasRoute ? `Trafic ${scenarios[scenario].risk.toLowerCase()} : ${scenario === "rain" ? "prévoir une déviation ou marge de sécurité." : "aucune déviation urgente."}` : "Lancez l'optimisation pour analyser le trafic réel.",
                    hasRoute ? `Météo ${scenario === "rain" ? "dégradée" : "stable"} — impact sur la durée estimée pris en compte.` : "La météo sera intégrée pour estimer le risque de retard.",
                    hasRoute ? "Fenêtres de livraison évaluées selon l'heure actuelle — priorité aux arrêts haute urgence." : "Les fenêtres de livraison seront évaluées.",
                  ].map((text, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: i < 2 ? 10 : 0 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#818CF8", marginTop: 5, flexShrink: 0 }} />
                      <p style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.55 }}>{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: map + metrics */}
              <div className="ecoroute-right-panel" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Metrics band */}
                <div style={{ animation: "slide-up 0.3s ease" }}>
                  <SectionPillTitle color="#6EE7B7">
                    Indicateurs du tableau de bord
                  </SectionPillTitle>

                  <div className="ecoroute-dashboard-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
                    <StatCard icon={Package} label="Livraisons planifiées" value="4" suffix="arrêts" color="#818CF8" />
                    <StatCard icon={Truck} label="Camions actifs" value="4" suffix="camions" color="#60A5FA" />
                    <StatCard icon={TrendingDown} label="Argent économisé" value="620" suffix="MAD" color="#6EE7B7" />
                    <StatCard icon={Fuel} label="Carburant économisé" value="18" suffix="L" color="#FBBF24" />
                    <StatCard icon={Leaf} label="CO₂ évité ce mois" value="540" suffix="kg" color="#34D399" />
                  </div>
                </div>

                {/* Map card */}
                <div className="ecoroute-map-card" style={{ flex: 1, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Map size={14} color="#475569" />
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>Carte itinéraire</span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {metrics && (
                        <span style={{ fontSize: 11, fontWeight: 700, color: risk.color, background: risk.bg, border: `1px solid ${risk.color}30`, borderRadius: 6, padding: "3px 8px" }}>
                          Risque {risk.label}
                        </span>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#475569", fontWeight: 600 }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: hasRoute ? "#34D399" : "#334155" }} />
                        {hasRoute ? "Trajet actif" : "En attente"}
                      </div>
                    </div>
                  </div>
                  <div className="ecoroute-map-wrap" style={{ flex: 1, position: "relative", minHeight: 0 }}>
                    <RealMap
                      fromCity={hasRoute ? optimizedStartCity : startCity}
                      toCity={hasRoute ? optimizedDestinationCity : destinationCity}
                      hasRoute={hasRoute}
                      showFollowButton
                      routeMode={mode}
                    />
                  </div>
                  {metrics && <TechnicalMetricsBand metrics={metrics} />}
                </div>

                {/* KPI row if no metrics */}

              </div>
            </div>
          )}

          {/* DELIVERIES SCREEN */}
          {activeScreen === "deliveries" && (
            <div className="ecoroute-deliveries-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, height: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
                  Arrêts planifiés — {deliveryStops.length} livraisons
                  {deliveryClickLocked && <span style={{ color: "#818CF8", marginLeft: 8 }}>chargement...</span>}
                </div>
                {deliveryStops.map((d) => {
                  const p = priorityBadge(d.priority);
                  const active = selectedDelivery?.stop === d.stop;
                  return (
                    <button
                      key={d.stop}
                      onClick={() => handleSelectDelivery(d)}
                      disabled={deliveryClickLocked}
                      style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, borderRadius: 14, background: active ? "rgba(129,140,248,0.10)" : "rgba(255,255,255,0.03)", border: `1px solid ${active ? "rgba(129,140,248,0.28)" : "rgba(255,255,255,0.07)"}`, textAlign: "left", width: "100%", transition: "all 0.15s", opacity: deliveryClickLocked && !active ? 0.55 : 1, pointerEvents: deliveryClickLocked ? "none" : "auto" }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #FBBF24, #FDE68A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#080E1C", flexShrink: 0 }}>
                        {d.stop}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0" }}>{d.client}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: p.color, background: p.bg, borderRadius: 5, padding: "2px 6px" }}>{d.priority}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#475569" }}>
                          Kenitra → {d.city} · {hasDeliveryIncident(d) ? "recalcul IA actif" : "position simulée"} · {d.window}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        <span style={{
                          fontSize: 11,
                          color: hasDeliveryIncident(d) ? "#F87171" : "#64748B",
                          fontWeight: 700,
                          background: hasDeliveryIncident(d) ? "rgba(248,113,113,0.12)" : "transparent",
                          border: hasDeliveryIncident(d) ? "1px solid rgba(248,113,113,0.22)" : "none",
                          borderRadius: 6,
                          padding: hasDeliveryIncident(d) ? "3px 7px" : 0,
                        }}>
                          {hasDeliveryIncident(d) ? "Incident" : d.status}
                        </span>
                        <ChevronRight size={14} color="#334155" />
                      </div>
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {selectedDelivery ? (
                  <>
                    <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.20)", borderRadius: 14, padding: 16 }}>
                      <div style={{ fontSize: 11, color: "#FBBF24", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Livraison suivie</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#FEF3C7", marginBottom: 6 }}>#{selectedDelivery.stop} · {selectedDelivery.client}</div>
                      <div style={{ fontSize: 12, color: "#94A3B8" }}>
                        Départ : Kenitra
                      </div>
                      <div style={{ fontSize: 12, color: "#94A3B8" }}>
                        Suivi automatique : camion en mouvement vers {selectedDelivery.city}
                      </div>
                      <div style={{ fontSize: 12, color: "#94A3B8" }}>
                        Arrivée : {selectedDelivery.city}
                      </div>
                      <div style={{ fontSize: 12, color: "#94A3B8" }}>Fenêtre : {selectedDelivery.window}</div>
                      <div style={{ fontSize: 12, color: "#94A3B8" }}>Priorité : {selectedDelivery.priority}</div>

                      {hasDeliveryIncident(selectedDelivery) && (
                        <div style={{
                          marginTop: 8,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 7,
                          padding: "6px 9px",
                          borderRadius: 999,
                          background: "rgba(251,191,36,0.10)",
                          border: "1px solid rgba(251,191,36,0.22)",
                          color: "#FDE68A",
                          fontSize: 11,
                          fontWeight: 900,
                        }}>
                          <Clock size={12} />
                          ETA recalculée : {getDeliveryEtaLabel(selectedDelivery)}
                        </div>
                      )}

                      {hasDeliveryIncident(selectedDelivery) && (
                        <div style={{
                          marginTop: 12,
                          borderRadius: 12,
                          padding: "11px 12px",
                          background: "linear-gradient(135deg, rgba(248,113,113,0.12), rgba(52,211,153,0.08))",
                          border: "1px solid rgba(248,113,113,0.24)",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <ShieldAlert size={14} color="#F87171" />
                            <span style={{ fontSize: 12, color: "#FECACA", fontWeight: 900 }}>
                              Incident détecté · Recalcul IA
                            </span>
                          </div>
                          <p style={{ fontSize: 12, color: "#CBD5E1", lineHeight: 1.5 }}>
                            Incident détecté à mi-parcours : l'ancien trajet continue en rouge, puis RouteBot recalcule une nouvelle trajectoire verte depuis ce point.
                          </p>

                          <div style={{
                            marginTop: 9,
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 8,
                          }}>
                            <div style={{
                              borderRadius: 10,
                              padding: "8px 9px",
                              background: "rgba(255,255,255,0.045)",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }}>
                              <div style={{ fontSize: 9, color: "#64748B", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.7 }}>
                                ETA initiale
                              </div>
                              <div style={{ fontSize: 14, color: "#CBD5E1", fontWeight: 900, marginTop: 3 }}>
                                {getDeliveryEtaUpdate(selectedDelivery)?.oldEta}
                              </div>
                            </div>

                            <div style={{
                              borderRadius: 10,
                              padding: "8px 9px",
                              background: "rgba(52,211,153,0.08)",
                              border: "1px solid rgba(52,211,153,0.18)",
                            }}>
                              <div style={{ fontSize: 9, color: "#64748B", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.7 }}>
                                ETA recalculée
                              </div>
                              <div style={{ fontSize: 14, color: "#BBF7D0", fontWeight: 900, marginTop: 3 }}>
                                {getDeliveryEtaUpdate(selectedDelivery)?.newEta}
                                <span style={{ fontSize: 10, color: "#FBBF24", marginLeft: 5 }}>
                                  +{getDeliveryEtaUpdate(selectedDelivery)?.delayMinutes} min
                                </span>
                              </div>
                            </div>
                          </div>

                          <div style={{
                            marginTop: 8,
                            borderRadius: 10,
                            padding: "8px 9px",
                            background: "rgba(52,211,153,0.07)",
                            border: "1px solid rgba(52,211,153,0.18)",
                            color: "#BBF7D0",
                            fontSize: 11,
                            fontWeight: 850,
                            lineHeight: 1.45,
                          }}>
                            Livraison toujours dans la fenêtre 12:00 – 14:00.
                            Marge restante : {getDeliveryEtaUpdate(selectedDelivery)?.marginMinutes} min avant 14:00.
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDelivery(null);
                          setDeliveryClickLocked(false);
                        }}
                        style={{
                          marginTop: 12,
                          width: "100%",
                          border: "1px solid rgba(251,191,36,0.28)",
                          background: "rgba(251,191,36,0.10)",
                          color: "#FEF3C7",
                          borderRadius: 10,
                          padding: "9px 12px",
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        Arrêter le suivi
                      </button>
                    </div>
                    <div style={{ flex: 1, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", minHeight: 420 }}>
                      <RealMap
                        key={`delivery-map-${selectedDelivery.stop}`}
                        fromCity="Kenitra"
                        toCity={getDeliveryDestinationCityKey(selectedDelivery)}
                        hasRoute
                        selectedLabel={`${selectedDelivery.client} · ${selectedDelivery.city}`}
                        showFollowButton={false}
                        truckStartProgress={getDeliveryProgress(selectedDelivery)}
                        showStaticTruck
                        autoFollow
                        routeMode="ai"
                        incidentReroute={hasDeliveryIncident(selectedDelivery)}
                        incidentLabel={getDeliveryIncidentText(selectedDelivery)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 16 }}>
                      <div style={{ fontSize: 11, color: "#64748B", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Carte de suivi livraison</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: "#CBD5E1", marginBottom: 6 }}>Sélectionnez une livraison</div>
                      <div style={{ fontSize: 12, color: "#64748B" }}>La mini-carte lance automatiquement le suivi du camion dès que vous choisissez une livraison.</div>
                    </div>

                    <div style={{ flex: 1, borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)", minHeight: 420 }}>
                      <RealMap
                        fromCity="Kenitra"
                        toCity="Casablanca"
                        hasRoute={false}
                        showFollowButton={false}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ALERTS SCREEN */}
          {activeScreen === "alerts" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>Alertes actives — 3 signaux</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {realtimeAlerts.map((a, i) => {
                    const Icon = a.icon;
                    return (
                      <div key={i} style={{ background: a.bg, border: `1px solid ${a.border}`, borderRadius: 14, padding: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                          <Icon size={16} color={a.color} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: a.color }}>{a.title}</span>
                          <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, color: a.color, background: `${a.color}18`, border: `1px solid ${a.color}30`, borderRadius: 6, padding: "2px 7px" }}>{a.level}</span>
                        </div>
                        <p style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.55 }}>{a.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <ShieldAlert size={16} color="#818CF8" />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#CBD5E1" }}>Déviation automatique</span>
                </div>
                <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.6, marginBottom: 16 }}>
                  Si la congestion dépasse le seuil défini, RouteBot propose une déviation basée sur la durée réelle et l'impact CO₂.
                </p>
                <button onClick={simulateOptimize} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", borderRadius: 10, border: 0, background: "rgba(129,140,248,0.12)", border: "1px solid rgba(129,140,248,0.22)", color: "#A5B4FC", fontWeight: 700, fontSize: 12 }}>
                  <Route size={14} /> Recalculer le trajet actif
                </button>
              </div>
            </div>
          )}

          {/* CO2 SCREEN */}
          {activeScreen === "co2" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>Bilan CO₂ évité</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
                  {[["7 jours", "126 kg", "#34D399"], ["30 jours", "540 kg", "#818CF8"], ["90 jours", "1 680 kg", "#F59E0B"]].map(([period, saved, color]) => (
                    <div key={period} style={{ background: `${color}0A`, border: `1px solid ${color}22`, borderRadius: 14, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                      <CalendarDays size={18} color={color} />
                      <div style={{ fontSize: 12, fontWeight: 700, color: color }}>{period}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: "#F1F5F9", letterSpacing: "-0.5px" }}>{saved}</div>
                      <div style={{ fontSize: 10, color: "#475569", fontWeight: 600 }}>CO₂ évités</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.14)", borderRadius: 14, padding: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <Leaf size={14} color="#34D399" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#6EE7B7" }}>Analyse environnementale</span>
                  </div>
                  {[["Consommation réduite", "8% à 14%"], ["Meilleur mode", "Mode éco"], ["Levier principal", "Consolidation"]].map(([label, val]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(52,211,153,0.10)" }}>
                      <span style={{ fontSize: 12, color: "#475569", fontWeight: 600 }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: "#6EE7B7" }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#CBD5E1", marginBottom: 16 }}>Économies par mode</div>
                {Object.entries(modes).map(([key, m]) => {
                  const pct = key === "eco" ? 88 : key === "ai" ? 72 : 45;
                  return (
                    <div key={key} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}>{m.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: m.color }}>{pct}%</span>
                      </div>
                      <div style={{ height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 999 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: m.color, borderRadius: 999, boxShadow: `0 0 12px ${m.color}60` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TEAM SCREEN */}
          {activeScreen === "team" && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 16,
              maxWidth: 980,
              margin: "0 auto",
              width: "100%",
              animation: "slide-up 0.25s ease",
            }}>
              <div style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 22,
                padding: 26,
                background: "linear-gradient(135deg, rgba(129,140,248,0.16), rgba(110,231,183,0.08), rgba(15,23,42,0.72))",
                border: "1px solid rgba(255,255,255,0.09)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.05)",
              }}>
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "radial-gradient(circle at 18% 20%, rgba(129,140,248,0.20), transparent 34%), radial-gradient(circle at 85% 70%, rgba(110,231,183,0.14), transparent 30%)",
                  pointerEvents: "none",
                }} />

                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 11px",
                    borderRadius: 999,
                    background: "rgba(110,231,183,0.09)",
                    border: "1px solid rgba(110,231,183,0.22)",
                    color: "#BBF7D0",
                    fontSize: 10,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 14,
                  }}>
                    <span style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#6EE7B7",
                      boxShadow: "0 0 14px rgba(110,231,183,0.85)",
                    }} />
                    EcoRoute AI
                  </div>

                  <h2 style={{
                    fontSize: 28,
                    fontWeight: 950,
                    color: "#F8FAFC",
                    letterSpacing: "-0.8px",
                    marginBottom: 8,
                  }}>
                    Équipe projet
                  </h2>

                  <p style={{
                    maxWidth: 720,
                    color: "#94A3B8",
                    fontSize: 13,
                    lineHeight: 1.7,
                    fontWeight: 600,
                  }}>
                    Projet développé par El Mehdi Omar Ben El Haj, avec la contribution de l'équipe pour les tests,
                    les retours et l'amélioration du scénario logistique.
                  </p>
                </div>
              </div>

              <div className="ecoroute-deliveries-grid" style={{
                display: "grid",
                gridTemplateColumns: "1.05fr 1.6fr",
                gap: 16,
              }}>
                <div style={{
                  borderRadius: 18,
                  padding: 20,
                  background: "linear-gradient(180deg, rgba(129,140,248,0.10), rgba(255,255,255,0.025))",
                  border: "1px solid rgba(129,140,248,0.18)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                }}>
                  <div style={{
                    width: 50,
                    height: 50,
                    borderRadius: 17,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(135deg, #818CF8, #6EE7B7)",
                    color: "#080E1C",
                    marginBottom: 16,
                    boxShadow: "0 18px 44px rgba(129,140,248,0.26)",
                  }}>
                    <Navigation size={23} />
                  </div>

                  <div style={{
                    fontSize: 11,
                    color: "#64748B",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: 0.9,
                    marginBottom: 6,
                  }}>
                    Développeur principal
                  </div>

                  <div style={{
                    color: "#F8FAFC",
                    fontSize: 19,
                    fontWeight: 950,
                    lineHeight: 1.2,
                    marginBottom: 8,
                  }}>
                    El Mehdi Omar Ben El Haj
                  </div>

                  <p style={{
                    color: "#94A3B8",
                    fontSize: 12,
                    lineHeight: 1.65,
                    fontWeight: 600,
                  }}>
                    Responsable du développement, de l'intégration des fonctionnalités, de l'interface et de la logique principale de l'application.
                  </p>
                </div>

                <div style={{
                  borderRadius: 18,
                  padding: 20,
                  background: "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 16,
                  }}>
                    <div>
                      <div style={{ fontSize: 15, color: "#F8FAFC", fontWeight: 900 }}>
                        Contributeurs
                      </div>
                      <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginTop: 3 }}>
                        Tests, retours et soutien au projet
                      </div>
                    </div>

                    <span style={{
                      color: "#C7D2FE",
                      fontSize: 10,
                      fontWeight: 900,
                      padding: "5px 9px",
                      borderRadius: 999,
                      background: "rgba(129,140,248,0.10)",
                      border: "1px solid rgba(129,140,248,0.20)",
                      whiteSpace: "nowrap",
                    }}>
                      6 membres
                    </span>
                  </div>

                  <div className="ecoroute-team-members-grid" style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 10,
                  }}>
                    {[
                      "Ossama Ait Abdelhalim",
                      "Hajar Ait Saleh",
                      "Bilal Laadioui",
                      "Saad Daoud",
                      "Taybi Zayd",
                      "Kaoutar Enndal",
                    ].map((name) => (
                      <div
                        key={name}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "11px 12px",
                          borderRadius: 14,
                          background: "rgba(15,23,42,0.48)",
                          border: "1px solid rgba(255,255,255,0.075)",
                        }}
                      >
                        <div style={{
                          width: 34,
                          height: 34,
                          borderRadius: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "linear-gradient(135deg, rgba(129,140,248,0.22), rgba(110,231,183,0.14))",
                          color: "#C7D2FE",
                          fontSize: 11,
                          fontWeight: 950,
                          flexShrink: 0,
                        }}>
                          {name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                        </div>

                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            color: "#CBD5E1",
                            fontSize: 12,
                            fontWeight: 850,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}>
                            {name}
                          </div>
                          <div style={{ color: "#64748B", fontSize: 10, fontWeight: 700, marginTop: 2 }}>
                            Contribution & retours
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS SCREEN */}
          {activeScreen === "settings" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
                  <Settings size={15} color="#818CF8" />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#CBD5E1" }}>Préférences livreur</span>
                </div>
                {[
                  { label: "Préférence", options: ["Équilibre coût / temps / CO₂", "Livraison la plus rapide", "Réduction maximale du CO₂", "Minimiser le risque de retard"] },
                  { label: "Type de véhicule", options: ["Fourgon diesel", "Véhicule électrique", "Camion léger", "Moto de livraison"] },
                  { label: "Priorité principale", options: ["Taux de service", "Coût total", "CO₂ évité", "Temps de livraison"] },
                ].map(({ label, options }) => (
                  <div key={label} style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontSize: 10, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>{label}</label>
                    <div style={{ position: "relative" }}>
                      <select style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "#E2E8F0", borderRadius: 9, padding: "9px 28px 9px 12px", fontSize: 12, fontWeight: 600, outline: "none" }}>
                        {options.map(o => <option key={o} style={{ color: "#0F172A", background: "#FFFFFF" }}>{o}</option>)}
                      </select>
                      <ChevronRight size={12} color="#475569" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%) rotate(90deg)", pointerEvents: "none" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 18,
                padding: 20,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 18,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: 11,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(129,140,248,0.12)",
                      border: "1px solid rgba(129,140,248,0.25)",
                    }}>
                      <Gauge size={16} color="#818CF8" />
                    </div>

                    <div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: "#F8FAFC", lineHeight: 1.1 }}>
                        Impact des paramètres
                      </div>
                      <div style={{ fontSize: 11, color: "#64748B", fontWeight: 700, marginTop: 3 }}>
                        Effet direct sur RouteBot et les calculs opérationnels
                      </div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: 10,
                    fontWeight: 900,
                    color: "#6EE7B7",
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    padding: "5px 9px",
                    borderRadius: 999,
                    background: "rgba(110,231,183,0.08)",
                    border: "1px solid rgba(110,231,183,0.20)",
                    whiteSpace: "nowrap",
                  }}>
                    Simulation active
                  </span>
                </div>

                <div className="ecoroute-settings-grid" style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: 12,
                }}>
                  {[
                    {
                      icon: Brain,
                      title: "Recommandations IA",
                      text: "Les préférences ajustent les conseils, les priorités et les décisions RouteBot.",
                      color: "#818CF8",
                    },
                    {
                      icon: Fuel,
                      title: "Coûts estimés",
                      text: "Le carburant, le véhicule et le mode choisi modifient les coûts affichés.",
                      color: "#FBBF24",
                    },
                    {
                      icon: Route,
                      title: "Déviations",
                      text: "Les risques et l'ETA influencent les propositions de recalcul d'itinéraire.",
                      color: "#6EE7B7",
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.title}
                        style={{
                          padding: 15,
                          borderRadius: 14,
                          background: "rgba(15,23,42,0.48)",
                          border: "1px solid rgba(255,255,255,0.075)",
                          minHeight: 132,
                        }}
                      >
                        <div style={{
                          width: 32,
                          height: 32,
                          borderRadius: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: `${item.color}18`,
                          border: `1px solid ${item.color}30`,
                          marginBottom: 11,
                        }}>
                          <Icon size={15} color={item.color} />
                        </div>

                        <div style={{
                          color: "#E2E8F0",
                          fontSize: 13,
                          fontWeight: 900,
                          marginBottom: 6,
                        }}>
                          {item.title}
                        </div>

                        <p style={{
                          color: "#94A3B8",
                          fontSize: 12,
                          lineHeight: 1.55,
                        }}>
                          {item.text}
                        </p>
                      </div>
                    );
                  })}
                </div>


              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Chat */}
      {assistantOpen && (
        <div style={{ position: "fixed", left: 236, bottom: 24, width: 380, height: 540, borderRadius: 20, overflow: "hidden", background: "#0C1526", border: "1px solid rgba(129,140,248,0.22)", boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(129,140,248,0.08)", display: "flex", flexDirection: "column", zIndex: 1000, animation: "slide-up 0.2s ease" }}>
          <div style={{ padding: "14px 16px", background: "linear-gradient(135deg, rgba(129,140,248,0.15), rgba(110,231,183,0.08))", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #818CF8, #6EE7B7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Brain size={18} color="#080E1C" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#F1F5F9" }}>RouteBot</div>
              <div style={{ fontSize: 10, color: "#475569", fontWeight: 600 }}>Répond instantanément</div>
            </div>
            <button onClick={() => setAssistantOpen(false)} style={{ marginLeft: "auto", width: 28, height: 28, borderRadius: 8, border: 0, background: "rgba(255,255,255,0.06)", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={14} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ maxWidth: "88%", alignSelf: msg.role === "user" ? "flex-end" : "flex-start", background: msg.role === "user" ? "linear-gradient(135deg, #818CF8, #6EE7B7)" : "rgba(255,255,255,0.06)", border: msg.role === "ai" ? "1px solid rgba(255,255,255,0.08)" : "none", borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", padding: "10px 13px", fontSize: 12, color: msg.role === "user" ? "#080E1C" : "#CBD5E1", fontWeight: msg.role === "user" ? 700 : 500, lineHeight: 1.6, whiteSpace: "pre-line" }}>
                {msg.text}
              </div>
            ))}

            {messages.length <= 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 4 }}>
                <div style={{ fontSize: 10, color: "#64748B", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8 }}>
                  Questions fréquentes
                </div>

                {routeBotFAQs.map((faq) => (
                  <button
                    key={faq}
                    type="button"
                    onClick={() => askRouteBot(faq)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      border: "1px solid rgba(129,140,248,0.18)",
                      background: "rgba(129,140,248,0.07)",
                      color: "#C7D2FE",
                      borderRadius: 10,
                      padding: "9px 10px",
                      fontSize: 11,
                      fontWeight: 750,
                      lineHeight: 1.35,
                    }}
                  >
                    {faq}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <input
              value={assistantInput}
              onChange={(e) => setAssistantInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Demander à RouteBot..."
              style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, padding: "9px 12px", fontSize: 12, color: "#E2E8F0", outline: "none" }}
            />
            <button onClick={sendMessage} style={{ width: 36, height: 36, borderRadius: 10, border: 0, background: "linear-gradient(135deg, #818CF8, #6EE7B7)", color: "#080E1C", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


export default App;
