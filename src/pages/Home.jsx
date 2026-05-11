import { useMemo } from "react";
import {
  Navigation,
  Route,
  Clock,
  Fuel,
  Leaf,
  Package,
  Zap,
  Brain,
  TrendingDown,
  Gauge,
  ShieldAlert,
  CloudSun,
  TrafficCone,
  TimerReset,
  ArrowRight,
  CheckCircle2,
  Wind,
  Thermometer,
  Activity,
} from "lucide-react";
import { cities, modes } from "../lib/data";
import { RouteMap } from "../components/RouteMap";
import {
  Card,
  CardHeader,
  Button,
  StatCard,
  Chip,
  StatusDot,
  Progress,
  SectionTitle,
} from "../components/ui";
import { riskBadge, formatNumber } from "../lib/helpers";

const modeIcons = { ai: Brain, eco: Leaf, classic: Route };

export function HomePage({
  startCity,
  destinationCity,
  onStartCityChange,
  onDestinationCityChange,
  mode,
  onModeChange,
  onOptimize,
  loading,
  hasRoute,
  metrics,
  detectedScenario,
  onSwapCities,
}) {
  const ModeIcon = modeIcons[mode] || Brain;
  const activeMode = modes[mode];
  const risk = useMemo(
    () => riskBadge(metrics?.riskLevel || "Faible"),
    [metrics]
  );
  const canOptimize =
    startCity && destinationCity && startCity !== destinationCity && !loading;

  const incidentMode = detectedScenario?.key === "incident";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-5">
      {/* LEFT: Planner */}
      <div className="space-y-5">
        <Card tone="raised">
          <CardHeader
            title="Planifier un trajet"
            subtitle="Sélectionnez un départ, une destination, puis un mode."
            icon={Navigation}
            accent="#6ee7b7"
          />

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 mb-1.5">
                Ville de départ
              </label>
              <div className="relative">
                <select
                  className="select"
                  value={startCity}
                  onChange={(e) => onStartCityChange(e.target.value)}
                >
                  <option value="">— Choisir —</option>
                  {Object.entries(cities).map(([key, c]) => (
                    <option key={key} value={key}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] pointer-events-none"
                  style={{ display: "none" }}
                />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={onSwapCities}
                title="Inverser"
                className="w-8 h-8 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 flex items-center justify-center transition-colors"
              >
                <ArrowRight size={13} className="rotate-90" />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 mb-1.5">
                Destination
              </label>
              <select
                className="select"
                value={destinationCity}
                onChange={(e) => onDestinationCityChange(e.target.value)}
              >
                <option value="">— Choisir —</option>
                {Object.entries(cities).map(([key, c]) => (
                  <option key={key} value={key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 mb-1.5">
                Mode de calcul
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(modes).map((m) => {
                  const Icon = modeIcons[m.key] || Brain;
                  const active = mode === m.key;
                  return (
                    <button
                      key={m.key}
                      onClick={() => onModeChange(m.key)}
                      className={`p-2.5 rounded-lg border transition-colors text-left ${
                        active
                          ? "bg-white/[0.06] border-white/20"
                          : "bg-white/[0.02] border-white/8 hover:bg-white/[0.04]"
                      }`}
                      style={
                        active
                          ? {
                              borderColor: `${m.accent}55`,
                              background: `${m.accent}10`,
                            }
                          : {}
                      }
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon
                          size={13}
                          style={{ color: active ? m.accent : "#94a3b8" }}
                        />
                        <span
                          className="text-[11px] font-bold"
                          style={{ color: active ? m.accent : "#cbd5e1" }}
                        >
                          {m.label}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 leading-tight">
                        {m.tag}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={onOptimize}
              loading={loading}
              disabled={!canOptimize}
              icon={Zap}
              className="w-full mt-1"
            >
              {hasRoute ? "Recalculer le trajet" : "Calculer le trajet optimisé"}
            </Button>
          </div>
        </Card>

        {/* AI detected scenario */}
        <Card tone="default">
          <SectionTitle icon={Brain} accent={detectedScenario?.accent || "#6ee7b7"}>
            Détection IA
          </SectionTitle>
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: `${detectedScenario?.accent || "#6ee7b7"}1F`,
                border: `1px solid ${detectedScenario?.accent || "#6ee7b7"}40`,
                color: detectedScenario?.accent || "#6ee7b7",
              }}
            >
              {incidentMode ? (
                <ShieldAlert size={16} />
              ) : detectedScenario?.key === "weather" ? (
                <CloudSun size={16} />
              ) : detectedScenario?.key === "traffic" ? (
                <TrafficCone size={16} />
              ) : (
                <CheckCircle2 size={16} />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-slate-100">
                {detectedScenario?.title || "Conditions normales"}
              </div>
              <p className="text-[12px] text-slate-400 leading-snug mt-0.5">
                {detectedScenario?.description}
              </p>
            </div>
          </div>
        </Card>

        {/* Live conditions */}
        <Card tone="default">
          <SectionTitle icon={Activity} accent="#22d3ee">
            Conditions temps réel
          </SectionTitle>
          <div className="space-y-2.5">
            <LiveRow
              icon={TrafficCone}
              label="Trafic"
              value={
                detectedScenario?.key === "traffic"
                  ? "Dense autour de Casablanca"
                  : "Fluide sur axes principaux"
              }
              badge={detectedScenario?.key === "traffic" ? "Moyen" : "Faible"}
              badgeColor={
                detectedScenario?.key === "traffic" ? "#fbbf24" : "#34d399"
              }
            />
            <LiveRow
              icon={CloudSun}
              label="Météo"
              value={
                detectedScenario?.key === "weather"
                  ? "Pluie légère intermittente"
                  : "Ciel dégagé · 24°C"
              }
              badge={detectedScenario?.key === "weather" ? "Moyen" : "Stable"}
              badgeColor={
                detectedScenario?.key === "weather" ? "#fbbf24" : "#34d399"
              }
            />
            <LiveRow
              icon={TimerReset}
              label="Contraintes horaires"
              value="Fenêtres Client B & C serrées"
              badge="Surveillé"
              badgeColor="#22d3ee"
            />
            <LiveRow
              icon={Wind}
              label="Vent"
              value="12 km/h — Ouest"
              badge="OK"
              badgeColor="#34d399"
            />
            <LiveRow
              icon={Thermometer}
              label="Température"
              value="24°C"
              badge="Normal"
              badgeColor="#94a3b8"
            />
          </div>
        </Card>
      </div>

      {/* RIGHT: Map + metrics */}
      <div className="space-y-5 min-w-0">
        {/* Hero map */}
        <Card tone="raised" padded={false} className="overflow-hidden">
          <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <span
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: `${activeMode.accent}1F`,
                  color: activeMode.accent,
                  border: `1px solid ${activeMode.accent}40`,
                }}
              >
                <ModeIcon size={16} />
              </span>
              <div>
                <div className="text-[13px] font-bold text-slate-100">
                  {hasRoute
                    ? `${cities[startCity]?.label || startCity}`
                    : "Carte temps réel"}
                  {hasRoute ? (
                    <>
                      {" "}
                      <ArrowRight
                        size={12}
                        className="inline -mt-0.5 mx-1 text-slate-500"
                      />
                      <span>
                        {cities[destinationCity]?.label || destinationCity}
                      </span>
                    </>
                  ) : null}
                </div>
                <div className="text-[11px] text-slate-400">
                  {hasRoute
                    ? `Mode ${activeMode.label.toLowerCase()} · tracé optimisé`
                    : "Choisissez un départ et une destination"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasRoute && (
                <Chip color={risk.color} icon={Gauge}>
                  Risque {risk.label.toLowerCase()}
                </Chip>
              )}
              <Chip color="#6ee7b7">
                <StatusDot color="#6ee7b7" size={6} />
                Live
              </Chip>
            </div>
          </div>

          <div className="p-3">
            <RouteMap
              startCity={startCity}
              destinationCity={destinationCity}
              hasRoute={hasRoute}
              modeAccent={activeMode.accent}
              incidentMode={incidentMode && hasRoute}
              height={440}
            />
          </div>

          {/* Technical metrics ribbon */}
          {hasRoute && metrics && (
            <div className="px-4 pb-4 pt-2 anim-slide-up">
              <div className="inline-flex items-center gap-2 mb-2 px-2.5 py-1 rounded-full border border-emerald-400/25 bg-emerald-400/8 text-emerald-200 text-[10px] font-bold uppercase tracking-[0.14em]">
                <StatusDot color="#6ee7b7" size={6} />
                Résultat du trajet optimisé
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
                <MetricTile
                  icon={Route}
                  label="Distance"
                  value={formatNumber(metrics.distanceKm)}
                  suffix="km"
                  accent="#60a5fa"
                />
                <MetricTile
                  icon={Clock}
                  label="Durée"
                  value={metrics.estimatedTimeHours}
                  suffix="h"
                  accent="#fbbf24"
                />
                <MetricTile
                  icon={Fuel}
                  label="Carburant"
                  value={formatNumber(metrics.fuelLiters)}
                  suffix="L"
                  accent="#f59e0b"
                />
                <MetricTile
                  icon={Leaf}
                  label="CO₂"
                  value={formatNumber(metrics.co2Kg)}
                  suffix="kg"
                  accent="#34d399"
                />
                <MetricTile
                  icon={Package}
                  label="Coût"
                  value={formatNumber(metrics.estimatedCostMAD)}
                  suffix="MAD"
                  accent="#22d3ee"
                />
              </div>
            </div>
          )}

          {!hasRoute && (
            <div className="px-5 pb-5 pt-2">
              <EmptyStateHint />
            </div>
          )}
        </Card>

        {/* KPIs band */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={TrendingDown}
            label="CO₂ cette semaine"
            value="2 405"
            suffix="kg"
            accent="#34d399"
            change={{ label: "-12% vs sem. dernière", color: "#6ee7b7" }}
          />
          <StatCard
            icon={Route}
            label="Trajets optimisés"
            value="184"
            suffix=""
            accent="#818cf8"
            change={{ label: "+22 aujourd'hui", color: "#a5b4fc" }}
          />
          <StatCard
            icon={Fuel}
            label="Carburant économisé"
            value="612"
            suffix="L"
            accent="#fbbf24"
            change={{ label: "-8%", color: "#6ee7b7" }}
          />
          <StatCard
            icon={Gauge}
            label="Ponctualité"
            value="96.4"
            suffix="%"
            accent="#22d3ee"
            change={{ label: "+1.2 pt", color: "#6ee7b7" }}
          />
        </div>

        {/* Optimization breakdown */}
        {hasRoute && metrics && (
          <Card tone="default">
            <SectionTitle icon={Brain} accent="#818cf8">
              Analyse d'optimisation
            </SectionTitle>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Breakdown
                label="Gain carburant vs trajet standard"
                value={
                  mode === "eco"
                    ? "-18%"
                    : mode === "classic"
                    ? "+4%"
                    : "-8%"
                }
                good={mode !== "classic"}
                progress={mode === "eco" ? 82 : mode === "classic" ? 96 : 88}
                color={
                  mode === "eco"
                    ? "#34d399"
                    : mode === "classic"
                    ? "#f87171"
                    : "#818cf8"
                }
              />
              <Breakdown
                label="Temps par rapport au plus rapide"
                value={
                  mode === "classic"
                    ? "Base"
                    : mode === "eco"
                    ? "+14 min"
                    : "+6 min"
                }
                good={mode === "classic"}
                progress={mode === "classic" ? 100 : mode === "ai" ? 88 : 78}
                color="#22d3ee"
              />
              <Breakdown
                label="Impact CO₂ (kg)"
                value={`${metrics.co2Kg} kg`}
                good
                progress={Math.max(20, 100 - metrics.co2Kg / 3)}
                color="#6ee7b7"
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ---------- internals ---------- */

function LiveRow({ icon: Icon, label, value, badge, badgeColor }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/8 flex items-center justify-center text-slate-400 shrink-0">
        <Icon size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
          {label}
        </div>
        <div className="text-[12.5px] font-semibold text-slate-200 truncate">
          {value}
        </div>
      </div>
      {badge && (
        <Chip color={badgeColor || "#94a3b8"}>
          {badge}
        </Chip>
      )}
    </div>
  );
}

function MetricTile({ icon: Icon, label, value, suffix, accent }) {
  return (
    <div
      className="rounded-xl px-3 py-2.5 border"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
        borderColor: "rgba(255,255,255,0.10)",
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
          {label}
        </span>
        <Icon size={12} style={{ color: accent }} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[18px] font-extrabold text-slate-50 tracking-tight tabular-nums">
          {value}
        </span>
        <span className="text-[11px] font-semibold text-slate-500">
          {suffix}
        </span>
      </div>
    </div>
  );
}

function Breakdown({ label, value, good, progress, color }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
          {label}
        </span>
        <span
          className="text-[13px] font-extrabold tabular-nums"
          style={{ color: good ? color : "#f87171" }}
        >
          {value}
        </span>
      </div>
      <Progress value={progress} color={color} />
    </div>
  );
}

function EmptyStateHint() {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-400/10 border border-indigo-400/25 text-indigo-200 text-[10px] font-bold uppercase tracking-[0.14em] mb-3">
        <Brain size={11} />
        Copilote prêt
      </div>
      <h3 className="text-[15px] font-extrabold text-slate-100">
        Aucun trajet calculé pour le moment
      </h3>
      <p className="text-[12.5px] text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
        Sélectionnez votre départ et votre destination, puis lancez l'IA
        d'optimisation. EcoRoute mettra ensuite à jour la carte, les KPI et
        appellera RouteBot pour vous conseiller.
      </p>
    </div>
  );
}
