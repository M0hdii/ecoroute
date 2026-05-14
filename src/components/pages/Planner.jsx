import {
  Brain,
  Leaf,
  Route,
  Zap,
  Gauge,
  Clock,
  Fuel,
  TrendingDown,
  Coins,
  MapPin,
  ArrowRightLeft,
  ShieldAlert,
  CloudSun,
  TrafficCone,
  CheckCircle2,
  Loader2,
  Sparkles,
  X,
  Plus,
  GripVertical,
} from "lucide-react";
import { cities, modes } from "../../lib/constants";
import { computeSavings } from "../../lib/routeMath";
import { scenarioLabel, scenarioDescription } from "../../lib/helpers";
import { Card, Button, Badge, StatTile, LiveDot } from "../ui/Primitives";
import RealMap from "../map/RealMap";

export default function Planner({
  startCity,
  setStartCity,
  destinationCity,
  setDestinationCity,
  waypoints,
  addWaypoint,
  removeWaypoint,
  mode,
  onModeChange,
  detectedScenarioKey,
  hasRoute,
  metrics,
  aiRouteDecision,
  lastAiPayload,
  loading,
  onOptimize,
  optimizedStartCity,
  optimizedDestinationCity,
  onClearRoute,
  onMapCitySelect,
  onSaveRoute,
  isSaved,
}) {
  const canOptimize =
    startCity && destinationCity && startCity !== destinationCity;

  const activeMode = modes[mode];
  const savings = computeSavings(metrics);
  const scenarioTitle = scenarioLabel(detectedScenarioKey);
  const scenarioDesc = scenarioDescription(detectedScenarioKey);

  const scenarioIcon =
    detectedScenarioKey === "incident"
      ? ShieldAlert
      : detectedScenarioKey === "traffic"
        ? TrafficCone
        : detectedScenarioKey === "weather"
          ? CloudSun
          : CheckCircle2;
  const ScenarioIcon = scenarioIcon;

  const scenarioAccent =
    detectedScenarioKey === "incident"
      ? "#cf6a4f"
      : detectedScenarioKey === "traffic"
        ? "#d8a84a"
        : detectedScenarioKey === "weather"
          ? "#6a9fb5"
          : "#8aaa7a";

  return (
    <div className="p-5 md:p-8 space-y-5">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* ------------ LEFT PANEL ------------ */}
        <div className="xl:col-span-4 space-y-4">
          {/* Route planner */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <Badge color="olive" icon={Sparkles}>
                Nouveau trajet
              </Badge>
              {hasRoute ? (
                <button
                  onClick={onClearRoute}
                  className="text-[10px] font-mono uppercase tracking-wider text-slate-400 hover:text-rust-300 inline-flex items-center gap-1 transition"
                >
                  <X size={11} strokeWidth={2.2} />
                  Effacer
                </button>
              ) : null}
            </div>
            <h2 className="font-display font-semibold text-[22px] tracking-tight text-slate-50 leading-[1.15]">
              Planifier
              <br />
              <span className="italic font-normal eco-gradient-text">
                une livraison
              </span>
            </h2>
            <p className="text-[13px] text-slate-400 mt-2 leading-relaxed">
              Sélectionnez un départ, une destination, et ajoutez des arrêts
              intermédiaires.
            </p>

            <div className="mt-5 space-y-2.5">
              <CityField
                label="Départ"
                value={startCity}
                onChange={(value) => {
                  setStartCity(value);
                  if (value === destinationCity) setDestinationCity("");
                  onClearRoute?.();
                }}
                accent="#8aaa7a"
              />

              {/* Waypoints */}
              {waypoints.map((wp, i) => (
                <div key={`${wp}-${i}`} className="flex items-center gap-2">
                  <GripVertical
                    size={14}
                    strokeWidth={2}
                    className="text-slate-400 shrink-0"
                  />
                  <div className="flex-1">
                    <div className="eyebrow text-slate-400 mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-copper-400" />
                      Arrêt {i + 1}
                    </div>
                    <div className="field inline-flex items-center justify-between w-full">
                      <span className="text-[13px] text-slate-50">
                        {cities[wp]?.label || wp}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeWaypoint(i)}
                    className="w-8 h-8 rounded-md bg-white/5 hover:bg-rust-400/15 text-slate-400 hover:text-rust-300 transition flex items-center justify-center shrink-0"
                  >
                    <X size={13} strokeWidth={2} />
                  </button>
                </div>
              ))}

              {/* Add waypoint */}
              {waypoints.length < 4 ? (
                <AddWaypoint
                  existing={[startCity, destinationCity, ...waypoints].filter(Boolean)}
                  onAdd={addWaypoint}
                />
              ) : null}

              <div className="flex justify-center py-1">
                <button
                  onClick={() => {
                    const s = startCity;
                    setStartCity(destinationCity);
                    setDestinationCity(s);
                    onClearRoute?.();
                  }}
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-olive-400/50 hover:bg-olive-400/10 transition text-slate-400 hover:text-olive-200 flex items-center justify-center"
                  title="Inverser"
                >
                  <ArrowRightLeft size={13} strokeWidth={2} />
                </button>
              </div>

              <CityField
                label="Destination"
                value={destinationCity}
                onChange={(value) => {
                  setDestinationCity(value);
                  onClearRoute?.();
                }}
                disabledCity={startCity}
                accent="#c9a96a"
              />
            </div>

            {/* Mode selector */}
            <div className="mt-5">
              <div className="eyebrow text-slate-400 mb-2.5">
                Mode d'optimisation
              </div>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(modes).map((m) => {
                  const Icon = m.key === "ai" ? Brain : m.key === "eco" ? Leaf : Route;
                  const isActive = mode === m.key;
                  return (
                    <button
                      key={m.key}
                      onClick={() => onModeChange(m.key)}
                      className={`relative p-3 rounded-lg border transition-all text-left ${
                        isActive
                          ? "bg-white/[0.06]"
                          : "bg-white/[0.02] hover:bg-white/[0.04] border-white/8"
                      }`}
                      style={
                        isActive
                          ? {
                              borderColor: `${m.accent}60`,
                              boxShadow: `0 0 20px -6px ${m.accent}45, inset 0 0 0 1px ${m.accent}30`,
                            }
                          : {}
                      }
                    >
                      <Icon
                        size={15}
                        strokeWidth={2}
                        style={{ color: isActive ? m.accent : "#98a3a0" }}
                      />
                      <div
                        className="mt-1.5 text-[11.5px] font-semibold"
                        style={{ color: isActive ? m.accent : "#c2cbc8" }}
                      >
                        {m.short}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11.5px] text-slate-400 mt-2.5 leading-snug">
                {activeMode.desc}
              </p>
            </div>

            <div className="mt-5 space-y-2">
              <Button
                size="lg"
                variant="primary"
                icon={loading ? Loader2 : Zap}
                onClick={onOptimize}
                disabled={!canOptimize || loading}
                className={`w-full ${
                  loading ? "[&_svg]:animate-spin" : ""
                } ${!canOptimize ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                {loading ? "Calcul en cours…" : "Calculer l'itinéraire"}
              </Button>
            </div>
          </Card>

          {/* AI scenario card */}
          <Card
            className="p-5 relative overflow-hidden"
            style={{
              borderColor: `${scenarioAccent}40`,
              background: `linear-gradient(135deg, ${scenarioAccent}14, transparent 65%)`,
            }}
          >
            <div
              className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-30"
              style={{ background: scenarioAccent }}
            />
            <div className="relative flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: `${scenarioAccent}18`,
                  border: `1px solid ${scenarioAccent}40`,
                  color: scenarioAccent,
                }}
              >
                <ScenarioIcon size={16} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <div
                  className="eyebrow inline-flex items-center gap-2"
                  style={{ color: scenarioAccent }}
                >
                  <LiveDot color={scenarioAccent} size={6} /> Situation détectée
                </div>
                <h3 className="font-display font-semibold text-[15px] mt-1.5 text-slate-50 tracking-tight">
                  {scenarioTitle}
                </h3>
                <p className="text-[13px] text-slate-300 leading-relaxed mt-1">
                  {scenarioDesc}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* ------------ RIGHT PANEL ------------ */}
        <div className="xl:col-span-8 space-y-5">
          <Card className="p-2 overflow-hidden">
                      {lastAiPayload ? (
            <Card className="p-4 border border-olive-400/20 bg-olive-400/[0.05]">
              <div className="flex items-center gap-2 text-olive-300">
                <Sparkles size={14} strokeWidth={2.2} />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
                  Route envoyée à l'IA
                </span>
              </div>
              <div className="mt-2 text-[12px] font-mono text-slate-400">
                IA analyse : {[lastAiPayload.startCity, ...(lastAiPayload.waypoints || []), lastAiPayload.destinationCity].filter(Boolean).join(" → ")}
              </div>
              <div className="mt-1 text-[11px] font-mono text-slate-500">
                Mode : {lastAiPayload.mode} · Scénario : {lastAiPayload.scenarioKey}
              </div>
            </Card>
          ) : null}

<RealMap
              fromCity={optimizedStartCity || startCity}
              toCity={optimizedDestinationCity || destinationCity}
              waypointCities={waypoints}
              hasRoute={hasRoute}
              routeMode={mode}
              height={520}
              onSelectCity={onMapCitySelect}
            />
          </Card>

          {metrics ? (
            <>
              <div className="flex items-center justify-between px-1">
                <div className="eyebrow text-olive-300 inline-flex items-center gap-2">
                  <LiveDot size={6} />
                  Indicateurs calculés
                </div>
                <div className="eyebrow text-slate-400">
                  {optimizedStartCity} → {optimizedDestinationCity}
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatTile
                  icon={MapPin}
                  label="Distance"
                  value={metrics.distanceKm}
                  suffix="km"
                  accent="#8aaa7a"
                />
                <StatTile
                  icon={Clock}
                  label="Durée estimée"
                  value={metrics.estimatedTimeHours}
                  suffix="h"
                  accent="#b9c9a4"
                />
                <StatTile
                  icon={Fuel}
                  label="Carburant"
                  value={metrics.fuelLiters}
                  suffix="L"
                  accent="#c9a96a"
                />
                <StatTile
                  icon={Coins}
                  label="Coût"
                  value={metrics.estimatedCostMAD}
                  suffix="MAD"
                  accent="#6a9fb5"
                />
                <StatTile
                  icon={TrendingDown}
                  label="Économie MAD"
                  value={savings?.costSaved ?? 0}
                  suffix="MAD"
                  accent="#6f9661"
                />
                <StatTile
                  icon={Fuel}
                  label="Carburant économisé"
                  value={savings?.fuelSaved ?? 0}
                  suffix="L"
                  accent="#b9c9a4"
                />
                <StatTile
                  icon={TrendingDown}
                  label="CO₂ émis"
                  value={metrics.co2Kg}
                  suffix="kg"
                  accent="#8aaa7a"
                />
                <StatTile
                  icon={Gauge}
                  label="Risque retard"
                  value={metrics.riskLevel}
                  accent={
                    metrics.riskLevel === "Élevé"
                      ? "#cf6a4f"
                      : metrics.riskLevel === "Moyen"
                        ? "#d8a84a"
                        : "#8aaa7a"
                  }
                />
              </div>
            </>
          ) : (
            <Card className="p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 dot-grid opacity-40" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-olive-400/15 border border-olive-400/35 text-olive-300 mb-4">
                  <Zap size={22} strokeWidth={2} />
                </div>
                <h3 className="font-display font-semibold text-xl tracking-tight text-slate-50">
                  Prêt à{" "}
                  <span className="italic font-normal eco-gradient-text">
                    optimiser
                  </span>
                </h3>
                <p className="text-[13px] text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                  Choisissez un départ et une destination, puis lancez le
                  calcul. EcoRoute analysera distance, durée, carburant, coût
                  et CO₂ en temps réel.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function CityField({ label, value, onChange, accent, disabledCity }) {
  return (
    <div>
      <label className="eyebrow text-slate-400 mb-1 flex items-center gap-1.5">
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: accent, boxShadow: `0 0 6px ${accent}` }}
        />
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field"
      >
        <option value="">— Sélectionner —</option>
        {Object.entries(cities).map(([key, c]) => (
          <option key={key} value={key} disabled={key === disabledCity}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function AddWaypoint({ existing, onAdd }) {
  return (
    <details className="group">
      <summary className="list-none cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/12 hover:border-olive-400/40 hover:bg-olive-400/5 text-[12.5px] text-slate-400 hover:text-olive-300 transition">
        <Plus size={13} strokeWidth={2} />
        Ajouter un arrêt
      </summary>
      <div className="mt-2 grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto p-2 border border-white/6 rounded-lg bg-white/[0.02]">
        {Object.keys(cities)
          .filter((k) => !existing.includes(k))
          .map((k) => (
            <button
              key={k}
              onClick={(e) => {
                e.preventDefault();
                onAdd(k);
                e.currentTarget.closest("details").open = false;
              }}
              className="text-left px-2 py-1.5 rounded-md text-[11.5px] text-slate-300 hover:bg-olive-400/10 hover:text-olive-200 transition"
            >
              {cities[k].label}
            </button>
          ))}
      </div>
    </details>
  );
}
