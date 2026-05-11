import {
  ClipboardList,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldAlert,
  TimerReset,
  ArrowRight,
  Package,
} from "lucide-react";
import { deliveryStops } from "../lib/data";
import { Card, CardHeader, SectionTitle, Chip, Progress, Button } from "../components/ui";
import {
  getDeliveryStartCityKey,
  getDeliveryDestinationCityKey,
  hasDeliveryIncident,
  getDeliveryIncidentText,
  getDeliveryEtaUpdate,
  priorityBadge,
} from "../lib/helpers";
import { RouteMap } from "../components/RouteMap";
import { cities } from "../lib/data";

export function DeliveriesPage({ selectedDelivery, onSelectDelivery }) {
  const active = selectedDelivery || deliveryStops[0];
  const incident = hasDeliveryIncident(active);
  const eta = getDeliveryEtaUpdate(active);
  const fromCity = getDeliveryStartCityKey(active);
  const toCity = getDeliveryDestinationCityKey(active);
  const fromLabel = cities[fromCity]?.label || fromCity;
  const toLabel = cities[toCity]?.label || toCity;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
      {/* Left: list + map */}
      <div className="space-y-5 min-w-0">
        {/* Live tracking map */}
        <Card tone="raised" padded={false}>
          <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/5">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center bg-indigo-400/12 border border-indigo-400/30 text-indigo-200">
                <Truck size={16} />
              </span>
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-slate-100 flex items-center gap-1.5">
                  <span>{fromLabel}</span>
                  <ArrowRight size={12} className="text-slate-500" />
                  <span>{toLabel}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Livraison {active.client} · arrêt {active.stop}
                </div>
              </div>
            </div>
            {incident ? (
              <Chip color="#f87171" icon={ShieldAlert}>
                Incident · RouteBot recalcule
              </Chip>
            ) : (
              <Chip color="#34d399" icon={CheckCircle2}>
                Dans la fenêtre horaire
              </Chip>
            )}
          </div>
          <div className="p-3">
            <RouteMap
              startCity={fromCity}
              destinationCity={toCity}
              hasRoute
              modeAccent={incident ? "#f87171" : "#818cf8"}
              incidentMode={incident}
              height={380}
            />
          </div>
          {incident && (
            <div className="mx-4 mb-4 rounded-xl border border-rose-400/25 bg-rose-400/8 p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-rose-400/15 border border-rose-400/30 text-rose-200 shrink-0">
                  <ShieldAlert size={15} />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-rose-100">
                    Déviation en cours
                  </div>
                  <p className="text-[12px] text-rose-100/80 leading-snug mt-0.5">
                    {getDeliveryIncidentText(active)}
                  </p>
                  {eta && (
                    <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                      <EtaTile label="ETA initiale" value={eta.oldEta} muted />
                      <EtaTile label="Nouvelle ETA" value={eta.newEta} accent="#fbbf24" />
                      <EtaTile label="Marge" value={`${eta.marginMinutes} min`} accent="#34d399" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Delivery list */}
        <Card tone="default">
          <CardHeader
            title="Tournée du jour"
            subtitle="Cliquez un arrêt pour suivre son trajet et voir la recalibration IA."
            icon={ClipboardList}
            accent="#818cf8"
            action={
              <Chip color="#22d3ee" icon={Package}>
                {deliveryStops.length} arrêts
              </Chip>
            }
          />
          <div className="space-y-2">
            {deliveryStops.map((d) => {
              const isActive = active.stop === d.stop;
              const badge = priorityBadge(d.priority);
              const hasInc = hasDeliveryIncident(d);
              return (
                <button
                  key={d.stop}
                  onClick={() => onSelectDelivery(d)}
                  className={`w-full text-left rounded-xl border transition-colors p-3.5 flex items-center gap-3 ${
                    isActive
                      ? "bg-emerald-400/8 border-emerald-400/30"
                      : "bg-white/[0.02] border-white/6 hover:bg-white/[0.05]"
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-extrabold shrink-0"
                    style={{
                      background: isActive
                        ? "rgba(52,211,153,0.18)"
                        : "rgba(255,255,255,0.05)",
                      color: isActive ? "#6ee7b7" : "#cbd5e1",
                      border: isActive
                        ? "1px solid rgba(52,211,153,0.35)"
                        : "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {d.stop}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13.5px] font-bold text-slate-100">
                        {d.client}
                      </span>
                      <span
                        className="chip"
                        style={{
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.color}30`,
                        }}
                      >
                        {d.priority}
                      </span>
                      {hasInc && (
                        <Chip color="#f87171" icon={ShieldAlert}>
                          Incident
                        </Chip>
                      )}
                    </div>
                    <div className="text-[11.5px] text-slate-400 mt-0.5 flex items-center gap-3 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={11} /> {d.city}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} /> {d.window}
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        {d.status}
                      </span>
                    </div>
                  </div>
                  <ArrowRight
                    size={14}
                    className={isActive ? "text-emerald-300" : "text-slate-500"}
                  />
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Right: selected delivery details */}
      <div className="space-y-5">
        <Card tone="raised">
          <SectionTitle icon={Truck} accent="#6ee7b7">
            Détails livraison
          </SectionTitle>
          <div className="text-[15px] font-extrabold text-slate-50">
            Arrêt {active.stop} · {active.client}
          </div>
          <div className="text-[12px] text-slate-400">{active.city}</div>

          <div className="mt-4 space-y-3">
            <DetailRow icon={Clock} label="Fenêtre" value={active.window} />
            <DetailRow icon={MapPin} label="Destination" value={active.city} />
            <DetailRow icon={CheckCircle2} label="Statut" value={active.status} />
            <DetailRow
              icon={TimerReset}
              label="ETA"
              value={eta ? `${eta.newEta} · ${eta.status}` : "12:18 · à l'heure"}
              accent={eta ? "#fbbf24" : "#34d399"}
            />
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                Progression
              </span>
              <span className="text-[12px] font-bold text-slate-100 tabular-nums">
                {Math.round(progressFor(active) * 100)}%
              </span>
            </div>
            <Progress
              value={progressFor(active) * 100}
              color={incident ? "#fbbf24" : "#6ee7b7"}
            />
          </div>

          <div className="mt-5 flex gap-2">
            <Button icon={Truck} className="flex-1">
              Contacter le camion
            </Button>
            <Button variant="ghost" icon={TimerReset}>
              Décaler
            </Button>
          </div>
        </Card>

        <Card tone="default">
          <SectionTitle icon={CheckCircle2} accent="#34d399">
            Checklist
          </SectionTitle>
          <ul className="space-y-2 text-[12.5px]">
            {[
              "Marge de 15 min avant fenêtre",
              "Signature électronique activée",
              "Carburant vérifié au dépôt",
              "Stop suivant chargé",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-slate-300">
                <span className="w-4 h-4 rounded-full bg-emerald-400/15 border border-emerald-400/40 flex items-center justify-center">
                  <CheckCircle2 size={10} className="text-emerald-300" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/8 flex items-center justify-center text-slate-400 shrink-0">
        <Icon size={13} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
          {label}
        </div>
        <div
          className="text-[12.5px] font-semibold truncate"
          style={{ color: accent || "#e2e8f0" }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function EtaTile({ label, value, accent = "#e2e8f0", muted }) {
  return (
    <div
      className="rounded-lg p-2 border"
      style={{
        background: "rgba(11,17,32,0.45)",
        borderColor: "rgba(148,163,184,0.14)",
      }}
    >
      <div className="text-[9.5px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </div>
      <div
        className="text-[14px] font-extrabold tabular-nums"
        style={{ color: muted ? "#94a3b8" : accent }}
      >
        {value}
      </div>
    </div>
  );
}

function progressFor(delivery) {
  const map = { 1: 0.72, 2: 0.58, 3: 0.46, 4: 0.34 };
  return map[delivery?.stop] ?? 0.5;
}
