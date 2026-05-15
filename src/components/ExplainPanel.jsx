import {
  Brain,
  Route as RouteIcon,
  TrafficCone,
  CloudRain,
  Users,
  Fuel,
} from "lucide-react";
import { Card } from "./ui/Primitives";
import { useT } from "../lib/i18n";

// Translate the route's scenario / mode into per-factor weights so users
// can see what RouteBot actually optimized for. Total always sums to 100.
function deriveWeights({ mode, scenarioKey }) {
  // Base weights per mode.
  const base =
    mode === "eco"
      ? { distance: 30, traffic: 18, weather: 8, demand: 14, fuel: 30 }
      : mode === "classic"
        ? { distance: 38, traffic: 28, weather: 6, demand: 16, fuel: 12 }
        : { distance: 32, traffic: 22, weather: 10, demand: 18, fuel: 18 };

  const next = { ...base };

  // Live conditions push weights toward the relevant factor.
  if (scenarioKey === "traffic") {
    next.traffic += 10;
    next.distance -= 6;
    next.fuel -= 4;
  } else if (scenarioKey === "weather") {
    next.weather += 12;
    next.distance -= 6;
    next.demand -= 6;
  } else if (scenarioKey === "incident") {
    next.traffic += 14;
    next.distance -= 8;
    next.fuel -= 6;
  }

  // Renormalize to 100.
  const total = Object.values(next).reduce((s, v) => s + v, 0);
  Object.keys(next).forEach((k) => {
    next[k] = Math.round((next[k] / total) * 100);
  });
  return next;
}

const ROWS = [
  { key: "distance", labelKey: "exp.factor.distance", icon: RouteIcon, color: "#a3e635" },
  { key: "traffic",  labelKey: "exp.factor.traffic",  icon: TrafficCone, color: "#fbbf24" },
  { key: "weather",  labelKey: "exp.factor.weather",  icon: CloudRain,   color: "#38bdf8" },
  { key: "demand",   labelKey: "exp.factor.demand",   icon: Users,       color: "#a78bfa" },
  { key: "fuel",     labelKey: "exp.factor.fuel",     icon: Fuel,        color: "#34d399" },
];

export default function ExplainPanel({ mode, scenarioKey }) {
  const t = useT();
  const weights = deriveWeights({ mode, scenarioKey });

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-eco-400/15 border border-eco-400/30 text-eco-300 flex items-center justify-center shrink-0">
          <Brain size={16} />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-eco-300">
            {t("exp.eyebrow")}
          </div>
          <h3 className="font-display font-bold text-base tracking-tight mt-0.5">
            {t("exp.title")}
          </h3>
          <p className="text-[12px] text-white/55 mt-1 leading-relaxed">
            {t("exp.subtitle")}
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {ROWS.map((r) => {
          const pct = weights[r.key] || 0;
          const Icon = r.icon;
          return (
            <div key={r.key} className="space-y-1">
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="inline-flex items-center gap-1.5 text-white/75 font-semibold">
                  <Icon size={11} style={{ color: r.color }} />
                  {t(r.labelKey)}
                </span>
                <span
                  className="font-mono font-bold tabular-nums"
                  style={{ color: r.color }}
                >
                  {pct}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${r.color}, ${r.color}80)`,
                    boxShadow: `0 0 10px ${r.color}80`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
