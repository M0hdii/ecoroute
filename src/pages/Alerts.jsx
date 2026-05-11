import {
  Bell,
  ShieldAlert,
  AlertCircle,
  Info,
  CheckCircle2,
  Filter,
  Settings2,
} from "lucide-react";
import { realtimeAlerts } from "../lib/data";
import { Card, CardHeader, SectionTitle, Chip, Button } from "../components/ui";
import { riskBadge } from "../lib/helpers";

const iconMap = {
  ShieldAlert,
  AlertCircle,
  Info,
  CheckCircle2,
};

export function AlertsPage() {
  const buckets = {
    "Élevé": realtimeAlerts.filter((a) => a.level === "Élevé"),
    "Moyen": realtimeAlerts.filter((a) => a.level === "Moyen"),
    "Faible": realtimeAlerts.filter((a) => a.level === "Faible"),
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
      <div className="space-y-5 min-w-0">
        <Card tone="raised">
          <CardHeader
            title="Centre d'alertes temps réel"
            subtitle="Incidents, trafic, météo et contraintes détectés automatiquement par RouteBot."
            icon={Bell}
            accent="#f87171"
            action={
              <div className="flex items-center gap-2">
                <Button variant="ghost" icon={Filter}>
                  Filtrer
                </Button>
                <Button icon={Settings2} variant="ghost">
                  Préférences
                </Button>
              </div>
            }
          />

          <div className="grid grid-cols-3 gap-2.5 mb-5">
            <Summary level="Élevé" count={buckets["Élevé"].length} accent="#f87171" />
            <Summary level="Moyen" count={buckets["Moyen"].length} accent="#fbbf24" />
            <Summary level="Faible" count={buckets["Faible"].length} accent="#34d399" />
          </div>

          <div className="space-y-2.5">
            {realtimeAlerts.map((a, i) => {
              const Icon = iconMap[a.icon] || Info;
              const badge = riskBadge(a.level);
              return (
                <div
                  key={i}
                  className="rounded-xl p-4 border transition-colors flex items-start gap-3"
                  style={{
                    background: `${a.accent}08`,
                    borderColor: `${a.accent}30`,
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: `${a.accent}1A`,
                      color: a.accent,
                      border: `1px solid ${a.accent}35`,
                    }}
                  >
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13.5px] font-bold text-slate-100">
                        {a.title}
                      </span>
                      <Chip color={badge.color}>Risque {badge.label.toLowerCase()}</Chip>
                      {a.eta && (
                        <Chip color="#fbbf24">
                          {a.eta}
                        </Chip>
                      )}
                    </div>
                    <p className="text-[12.5px] text-slate-300 leading-relaxed mt-1">
                      {a.text}
                    </p>
                  </div>
                  <button
                    className="text-[11px] font-semibold text-slate-400 hover:text-slate-200 shrink-0 hidden sm:inline-block"
                  >
                    Ignorer
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        <Card tone="default">
          <SectionTitle icon={Bell} accent="#fbbf24">
            Aperçu
          </SectionTitle>
          <p className="text-[12.5px] text-slate-400 leading-relaxed">
            RouteBot analyse en permanence le trafic, la météo et les fenêtres
            horaires pour alerter votre équipe terrain avant qu'un retard
            n'impacte la promesse client.
          </p>
          <div className="mt-4 space-y-2.5 text-[12px]">
            <Line label="Incidents recalculés" value="18" color="#f87171" />
            <Line label="Alertes résolues aujourd'hui" value="42" color="#34d399" />
            <Line label="Tournées sauvegardées" value="11" color="#818cf8" />
          </div>
        </Card>

        <Card tone="default">
          <SectionTitle icon={Info} accent="#22d3ee">
            Règles actives
          </SectionTitle>
          <ul className="space-y-2 text-[12px] text-slate-300">
            {[
              "Alerter si retard > 15 min",
              "Recalculer en cas d'incident sur la route",
              "Notifier si la fenêtre horaire dépasse 90 % utilisée",
              "Déclencher RouteBot en cas de pluie forte",
            ].map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-indigo-400 shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Summary({ level, count, accent }) {
  return (
    <div
      className="rounded-xl p-3 border"
      style={{
        background: `${accent}0D`,
        borderColor: `${accent}33`,
      }}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: accent }}>
        Niveau {level}
      </div>
      <div className="text-[22px] font-extrabold text-slate-50 mt-0.5 tabular-nums">
        {count}
      </div>
    </div>
  );
}

function Line({ label, value, color }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
      <span className="text-slate-400">{label}</span>
      <span
        className="font-extrabold tabular-nums"
        style={{ color }}
      >
        {value}
      </span>
    </div>
  );
}
