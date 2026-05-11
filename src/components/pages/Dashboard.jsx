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
} from "lucide-react";
import { cities, modes } from "../../lib/constants";
import { scenarioLabel, scenarioDescription } from "../../lib/helpers";
import { Card, Button, Badge, StatTile, LiveDot } from "../ui/Primitives";
import RealMap from "../map/RealMap";

export default function Dashboard({
  startCity,
  setStartCity,
  destinationCity,
  setDestinationCity,
  mode,
  onModeChange,
  detectedScenarioKey,
  hasRoute,
  metrics,
  loading,
  onOptimize,
  optimizedStartCity,
  optimizedDestinationCity,
}) {
  const canOptimize =
    startCity && destinationCity && startCity !== destinationCity;

  const activeMode = modes[mode];
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
      ? "#fb7185"
      : detectedScenarioKey === "traffic"
        ? "#fbbf24"
        : detectedScenarioKey === "weather"
          ? "#38bdf8"
          : "#34d399";

  return (
    <div className="p-5 md:p-8 space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* ------------ LEFT PANEL — planner ------------ */}
        <div className="xl:col-span-4 space-y-5">
          {/* Route planner */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <Badge color="eco" icon={Sparkles}>
                Nouveau trajet
              </Badge>
            </div>
            <h2 className="font-display font-bold text-xl tracking-tight mt-3">
              Planifier une livraison
            </h2>
            <p className="text-xs text-white/50 mt-1">
              Sélectionnez un point de départ et une destination.
            </p>

            <div className="mt-5 space-y-3">
              <CityField
                label="Départ"
                value={startCity}
                onChange={setStartCity}
                accent="#34d399"
              />
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    const s = startCity;
                    setStartCity(destinationCity);
                    setDestinationCity(s);
                  }}
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-eco-300/40 hover:bg-eco-400/10 transition text-white/60 hover:text-eco-300 flex items-center justify-center"
                  title="Inverser"
                >
                  <ArrowRightLeft size={14} />
                </button>
              </div>
              <CityField
                label="Destination"
                value={destinationCity}
                onChange={setDestinationCity}
                accent="#a3e635"
              />
            </div>

            {/* Mode selector */}
            <div className="mt-6">
              <div className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-2.5">
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
                      className={`relative p-3 rounded-xl border transition-all text-left ${
                        isActive
                          ? "bg-white/[0.06]"
                          : "bg-white/[0.02] hover:bg-white/[0.04] border-white/8"
                      }`}
                      style={
                        isActive
                          ? {
                              borderColor: `${m.accent}66`,
                              boxShadow: `0 8px 24px ${m.accent}22, inset 0 0 0 1px ${m.accent}33`,
                            }
                          : {}
                      }
                    >
                      <Icon
                        size={16}
                        style={{ color: isActive ? m.accent : "#94a3b8" }}
                      />
                      <div
                        className="mt-2 text-xs font-bold"
                        style={{ color: isActive ? m.accent : "#cbd5e1" }}
                      >
                        {m.short}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-white/45 mt-2.5 leading-snug">
                {activeMode.desc}
              </p>
            </div>

            <div className="mt-6">
              <Button
                size="lg"
                icon={loading ? Loader2 : Zap}
                onClick={onOptimize}
                disabled={!canOptimize || loading}
                className={`w-full ${
                  loading ? "[&_svg]:animate-spin" : ""
                } ${!canOptimize ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loading ? "Calcul en cours…" : "Calculer l'itinéraire"}
              </Button>
            </div>
          </Card>

          {/* AI scenario card */}
          <Card
            className="p-5 relative overflow-hidden"
            style={{
              borderColor: `${scenarioAccent}35`,
              background: `linear-gradient(135deg, ${scenarioAccent}10, transparent 60%)`,
            }}
          >
            <div
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-40"
              style={{ background: scenarioAccent }}
            />
            <div className="relative flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: `${scenarioAccent}20`,
                  border: `1px solid ${scenarioAccent}40`,
                  color: scenarioAccent,
                }}
              >
                <ScenarioIcon size={18} />
              </div>
              <div className="min-w-0">
                <div
                  className="text-[10px] font-bold uppercase tracking-[0.2em] mb-0.5"
                  style={{ color: scenarioAccent }}
                >
                  <LiveDot color={scenarioAccent} size={6} /> Situation détectée
                </div>
                <h3 className="font-display font-bold text-base">
                  {scenarioTitle}
                </h3>
                <p className="text-xs text-white/60 leading-relaxed mt-1">
                  {scenarioDesc}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* ------------ RIGHT PANEL — map + metrics ------------ */}
        <div className="xl:col-span-8 space-y-5">
          {/* Map card */}
          <Card className="p-2 overflow-hidden">
            <RealMap
              fromCity={optimizedStartCity || startCity}
              toCity={optimizedDestinationCity || destinationCity}
              hasRoute={hasRoute}
              routeMode={mode}
              height={520}
            />
          </Card>

          {/* Metrics row */}
          {metrics ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatTile
                icon={MapPin}
                label="Distance"
                value={metrics.distanceKm}
                suffix="km"
                accent="#6ee7b7"
              />
              <StatTile
                icon={Clock}
                label="Durée estimée"
                value={metrics.estimatedTimeHours}
                suffix="h"
                accent="#a3e635"
              />
              <StatTile
                icon={Fuel}
                label="Carburant"
                value={metrics.fuelLiters}
                suffix="L"
                accent="#fcd34d"
              />
              <StatTile
                icon={Coins}
                label="Coût estimé"
                value={metrics.estimatedCostMAD}
                suffix="MAD"
                accent="#38bdf8"
              />
              <StatTile
                icon={TrendingDown}
                label="Émissions CO₂"
                value={metrics.co2Kg}
                suffix="kg"
                accent="#34d399"
              />
              <StatTile
                icon={Gauge}
                label="Risque retard"
                value={metrics.riskLevel}
                accent={
                  metrics.riskLevel === "Élevé"
                    ? "#fb7185"
                    : metrics.riskLevel === "Moyen"
                      ? "#fbbf24"
                      : "#34d399"
                }
              />
              <StatTile
                icon={Brain}
                label="Mode actif"
                value={activeMode.short}
                accent={activeMode.accent}
              />
              <StatTile
                icon={Sparkles}
                label="Confiance IA"
                value="94"
                suffix="%"
                accent="#a3e635"
              />
            </div>
          ) : (
            <Card className="p-10 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl eco-gradient-bg text-ink-950 mb-4">
                <Zap size={22} />
              </div>
              <h3 className="font-display font-bold text-lg">
                Prêt à optimiser votre trajet
              </h3>
              <p className="text-sm text-white/55 mt-2 max-w-md mx-auto">
                Choisissez un départ et une destination, puis lancez le calcul.
                EcoRoute analysera distance, durée, carburant, coût et CO₂ en
                temps réel.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function CityField({ label, value, onChange, accent }) {
  return (
    <div>
      <label className="text-[11px] font-bold uppercase tracking-wider text-white/50 mb-1.5 flex items-center gap-1.5">
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
          <option key={key} value={key}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  );
}
