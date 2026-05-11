import {
  Bell,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { realtimeAlerts } from "../../lib/constants";
import { Card } from "../ui/Primitives";

const LEVEL_STYLES = {
  "Élevé": {
    icon: ShieldAlert,
    accent: "#fb7185",
    bg: "rgba(251,113,133,0.10)",
    border: "rgba(251,113,133,0.35)",
  },
  "Moyen": {
    icon: AlertCircle,
    accent: "#fbbf24",
    bg: "rgba(251,191,36,0.10)",
    border: "rgba(251,191,36,0.35)",
  },
  "Faible": {
    icon: CheckCircle2,
    accent: "#34d399",
    bg: "rgba(52,211,153,0.10)",
    border: "rgba(52,211,153,0.35)",
  },
};

export default function Alerts() {
  const high = realtimeAlerts.filter((a) => a.level === "Élevé").length;
  const medium = realtimeAlerts.filter((a) => a.level === "Moyen").length;
  const low = realtimeAlerts.filter((a) => a.level === "Faible").length;

  return (
    <div className="p-5 md:p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryTile
          label="Priorité haute"
          value={high}
          accent="#fb7185"
          icon={ShieldAlert}
        />
        <SummaryTile
          label="Priorité moyenne"
          value={medium}
          accent="#fbbf24"
          icon={AlertCircle}
        />
        <SummaryTile
          label="Informations"
          value={low}
          accent="#34d399"
          icon={CheckCircle2}
        />
      </div>

      <div className="space-y-3">
        {realtimeAlerts.map((a, idx) => {
          const style = LEVEL_STYLES[a.level];
          const Icon = style.icon;
          return (
            <Card
              key={idx}
              className="p-5 relative overflow-hidden"
              style={{
                borderColor: style.border,
                background: `linear-gradient(135deg, ${style.bg}, transparent 65%)`,
              }}
            >
              <div
                className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl opacity-30"
                style={{ background: style.accent }}
              />
              <div className="relative flex items-start gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: `${style.accent}20`,
                    border: `1px solid ${style.accent}45`,
                    color: style.accent,
                  }}
                >
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-display font-bold text-base">
                      {a.title}
                    </h4>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                      style={{
                        color: style.accent,
                        background: style.bg,
                        borderColor: `${style.accent}45`,
                      }}
                    >
                      Niveau {a.level}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-white/65 leading-relaxed">
                    {a.text}
                  </p>
                  {a.eta ? (
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-coral-400">
                      <Clock size={12} />
                      {a.eta}
                    </div>
                  ) : null}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function SummaryTile({ label, value, accent, icon: Icon }) {
  return (
    <Card
      className="p-5 relative overflow-hidden"
      style={{ borderColor: `${accent}30` }}
    >
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl opacity-30"
        style={{ background: accent }}
      />
      <div className="relative flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{
            background: `${accent}20`,
            border: `1px solid ${accent}40`,
            color: accent,
          }}
        >
          <Icon size={18} />
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-white/55">
            {label}
          </div>
          <div
            className="font-display font-bold text-2xl mt-0.5"
            style={{ color: accent }}
          >
            {value}
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ---------- Popup variant (used from top bar) ---------- */
export function AlertsPopup({ onClose }) {
  return (
    <div className="absolute inset-0 z-50 flex items-start justify-end pointer-events-none">
      <div
        className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />
      <div
        className="relative pointer-events-auto w-full max-w-md mr-4 mt-4 card-glass-strong p-5 overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 120px)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl eco-gradient-bg text-ink-950 flex items-center justify-center">
              <Bell size={15} />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-eco-300">
                Temps réel
              </div>
              <div className="font-display font-bold text-base">Alertes</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white text-xs font-semibold"
          >
            Fermer
          </button>
        </div>

        <div className="space-y-2.5">
          {realtimeAlerts.map((a, idx) => {
            const style = LEVEL_STYLES[a.level];
            const Icon = style.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-xl border"
                style={{
                  background: style.bg,
                  borderColor: style.border,
                }}
              >
                <div className="flex items-start gap-2.5">
                  <Icon size={15} style={{ color: style.accent }} />
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-xs font-bold"
                      style={{ color: style.accent }}
                    >
                      {a.title}
                    </div>
                    <div className="text-[11px] text-white/65 mt-1 leading-relaxed">
                      {a.text}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
