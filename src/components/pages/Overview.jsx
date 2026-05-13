import {
  TrendingDown,
  Truck,
  Route,
  Sparkles,
  ArrowRight,
  Activity,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  Cloud,
  CloudRain,
  Sun,
  Wind,
  MapPin,
  Package,
} from "lucide-react";
import {
  activityLog,
  weatherSnapshot,
  fleetVehicles,
  realtimeAlerts,
  deliveryStops,
} from "../../lib/constants";
import { Card, Badge, StatTile, StatusPill } from "../ui/Primitives";

const accentMap = {
  eco: "#8aaa7a",
  sand: "#c9a96a",
  teal: "#6a9fb5",
  clay: "#cf6a4f",
};

export default function Overview({ onNavigate, onLoadSaved }) {
const activeTrucks = fleetVehicles.filter((t) => t.status === "en_route").length;
  const totalKm = fleetVehicles.reduce((acc, t) => acc + t.kmToday, 0);
  const highAlerts = realtimeAlerts.filter((a) => a.level === "Élevé").length;

  return (
    <div className="p-5 md:p-8 space-y-5">
      {/* ------- ROW 1 — KPIs ------- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          icon={Truck}
          label="Camions en route"
          value={activeTrucks}
          suffix={`/${fleetVehicles.length}`}
          accent="#8aaa7a"
          change="tous dans la fenêtre"
        />
        <StatTile
          icon={Route}
          label="Km parcourus aujourd'hui"
          value={totalKm}
          suffix="km"
          accent="#c9a96a"
          change="+18% vs hier"
        />
        <StatTile
          icon={TrendingDown}
          label="CO₂ économisé (7j)"
          value="142"
          suffix="kg"
          accent="#6a9fb5"
          change="-23% vs baseline"
        />
        <StatTile
          icon={ShieldAlert}
          label="Alertes actives"
          value={highAlerts}
          accent="#cf6a4f"
          change="2 haute priorité"
        />
      </div>

      {/* ------- ROW 2 — Weather (horizontal strip) ------- */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="eyebrow text-slate-400">Météo flotte</div>
            <h3 className="font-display font-semibold text-[18px] tracking-tight text-slate-50 mt-1">
              Conditions actuelles
            </h3>
          </div>
          <Badge color="sky" icon={Cloud}>
            Live
          </Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {weatherSnapshot.map((w) => (
            <div
              key={w.city}
              className="flex items-center gap-3 py-2.5 px-3 rounded-md bg-white/[0.02] border border-white/5"
            >
              <WeatherIcon cond={w.cond} />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-slate-100 truncate">
                  {w.city}
                </div>
                <div className="text-[11px] text-slate-400 font-mono inline-flex items-center gap-1">
                  <Wind size={10} strokeWidth={2} />
                  {w.wind} km/h
                </div>
              </div>
              <div className="font-display font-semibold text-[20px] text-slate-50 tabular shrink-0">
                {w.temp}
                <span className="text-slate-400 text-xs font-mono font-normal">
                  °
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ------- ROW 3 — Activity + Fleet + Side column ------- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Activity log */}
        <Card className="xl:col-span-5 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="eyebrow text-olive-300">Activité récente</div>
              <h3 className="font-display font-semibold text-[18px] tracking-tight text-slate-50 mt-1 inline-flex items-center gap-2">
                Fil d'opérations
                <Activity size={16} strokeWidth={2} className="text-slate-400" />
              </h3>
            </div>
          </div>
          <div className="space-y-0">
            {activityLog.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 py-2.5 border-b border-white/5 last:border-b-0"
              >
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: `${accentMap[item.accent]}15`,
                    color: accentMap[item.accent],
                    border: `1px solid ${accentMap[item.accent]}35`,
                  }}
                >
                  {item.type === "alert" ? (
                    <AlertCircle size={13} strokeWidth={2} />
                  ) : item.type === "delivery" ? (
                    <CheckCircle2 size={13} strokeWidth={2} />
                  ) : item.type === "fleet" ? (
                    <Truck size={13} strokeWidth={2} />
                  ) : (
                    <Sparkles size={13} strokeWidth={2} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[13px] font-medium text-slate-100">
                      {item.title}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 tabular shrink-0">
                      {item.time}
                    </div>
                  </div>
                  <div className="text-[12px] text-slate-400 leading-relaxed mt-0.5">
                    {item.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Fleet snapshot */}
        <Card className="xl:col-span-4 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="eyebrow text-slate-400">Flotte</div>
              <h3 className="font-display font-semibold text-[18px] tracking-tight text-slate-50 mt-1">
                Camions en route
              </h3>
            </div>
            <button
              onClick={() => onNavigate?.("fleet")}
              className="inline-flex items-center gap-1 text-[12px] text-olive-300 hover:text-olive-200 transition"
            >
              Voir tout
              <ArrowRight size={12} strokeWidth={2} />
            </button>
          </div>
          <div className="space-y-2">
            {fleetVehicles.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-md bg-white/[0.02] border border-white/5 hover:border-white/12 transition cursor-pointer"
                onClick={() => onNavigate?.("fleet")}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-mono text-[13px] font-semibold text-slate-50">
                    {t.id}
                  </div>
                  <StatusPill status={t.status} />
                </div>
                <div className="text-[12px] text-slate-300 mb-2 flex items-center gap-1.5">
                  <MapPin size={11} strokeWidth={2} className="text-slate-400" />
                  {t.from} → {t.to}
                </div>
                {t.status === "en_route" ? (
                  <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-olive-300"
                      style={{
                        width: `${Math.round(t.progress * 100)}%`,
                        boxShadow: "0 0 8px rgba(138,170,122,0.5)",
                      }}
                    />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Card>

        {/* Side column : today's deliveries */}
        <div className="xl:col-span-3">
          <Card className="p-5 min-h-[360px] flex flex-col">
            <div className="eyebrow text-slate-400">Livraisons du jour</div>
            <h3 className="font-display font-semibold text-[18px] tracking-tight text-slate-50 mt-1 inline-flex items-center gap-2">
              <Package size={15} strokeWidth={2} className="text-slate-400" />
              {deliveryStops.length} arrêts
            </h3>

            <div className="mt-5 space-y-3 flex-1">
              {deliveryStops.slice(0, 4).map((d) => (
                <div
                  key={d.stop}
                  className="flex items-center gap-3 text-[12px] py-2 rounded-lg hover:bg-white/[0.03] transition"
                >
                  <span className="w-7 h-7 rounded-md bg-white/5 border border-white/10 text-slate-300 font-mono text-[11px] flex items-center justify-center shrink-0">
                    {d.stop}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-slate-100">
                      {d.client}
                    </div>
                    <div className="text-[10.5px] font-mono text-slate-400 tabular mt-0.5">
                      {d.window.split(" – ")[0]}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate?.("deliveries")}
              className="w-full mt-4 text-[12px] text-olive-300 hover:text-olive-200 transition inline-flex items-center justify-center gap-1"
            >
              Voir toutes les livraisons
              <ArrowRight size={12} strokeWidth={2} />
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}

function WeatherIcon({ cond }) {
  const map = {
    clear: { Icon: Sun, color: "#c9a96a" },
    cloud: { Icon: Cloud, color: "#8bbdd0" },
    rain: { Icon: CloudRain, color: "#6a9fb5" },
  };
  const { Icon, color } = map[cond] || map.cloud;
  return (
    <div
      className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
      style={{
        background: `${color}15`,
        border: `1px solid ${color}30`,
        color,
      }}
    >
      <Icon size={15} strokeWidth={2} />
    </div>
  );
}
