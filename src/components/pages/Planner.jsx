import { useState } from "react";
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
  Loader2,
  Sparkles,
  X,
  Plus,
  GripVertical,
  Bot,
} from "lucide-react";
import { cities, modes } from "../../lib/constants";
import { computeSavings } from "../../lib/routeMath";
import { Card, Button, Badge, LiveDot, CountUp } from "../ui/Primitives";
import RealMap from "../map/RealMap";
import ExplainPanel from "../ExplainPanel";
import { useT } from "../../lib/i18n";

export default function Planner({
  startCity,
  setStartCity,
  destinationCity,
  setDestinationCity,
  waypoints,
  addWaypoint,
  removeWaypoint,
  reorderWaypoints,
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
  const t = useT();
  const canOptimize =
    startCity && destinationCity && startCity !== destinationCity;

  // ---- Drag & drop state for waypoint reordering ----
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Mode + risk lookup helpers tied to the current locale.
  function modeLabel(key) {
    if (!key) return "—";
    return t(`mode.${key}`, modes[key]?.label);
  }
  function modeShort(key) {
    if (!key) return "—";
    return t(`mode.${key}.short`, modes[key]?.short);
  }
  function modeDesc(key) {
    if (!key) return "";
    return t(`mode.${key}.desc`, modes[key]?.desc);
  }
  function riskLabel(level) {
    if (level === "Élevé") return t("risk.high");
    if (level === "Moyen") return t("risk.medium");
    return t("risk.low");
  }

  const activeMode = modes[mode];
  const savings = computeSavings(metrics);

  // Effective mode = what's actually applied to metrics + map.
  // - If user is on "AI", Groq's selectedMode (eco/classic/ai) wins.
  // - If user explicitly forced eco/classic, that overrides Groq.
  const effectiveMode =
    mode === "ai" && aiRouteDecision?.selectedMode
      ? aiRouteDecision.selectedMode
      : mode;

  return (
    <div className="p-5 md:p-8 space-y-5">
      {/* ================ TOP — Form (left) + Map (right) ================ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* ---- LEFT: Form card stretches to match the map ---- */}
        <div className="xl:col-span-4 flex">
          <Card className="p-5 flex-1 flex flex-col w-full">
            <div className="flex items-center justify-between mb-3">
              <Badge color="olive" icon={Sparkles}>
                {t("pl.eyebrow")}
              </Badge>
              {hasRoute ? (
                <button
                  onClick={onClearRoute}
                  className="text-[10px] font-mono uppercase tracking-wider text-slate-400 hover:text-rust-300 inline-flex items-center gap-1 transition"
                >
                  <X size={11} strokeWidth={2.2} />
                  {t("pl.clear")}
                </button>
              ) : null}
            </div>
            <h2 className="font-display font-semibold text-[20px] tracking-tight text-slate-50 leading-[1.15]">
              {t("pl.title.1")}{" "}
              <span className="italic font-normal eco-gradient-text">
                {t("pl.title.2")}
              </span>
            </h2>

            <div className="mt-4 space-y-2.5">
              <CityField
                label={t("pl.start")}
                value={startCity}
                onChange={(value) => {
                  setStartCity(value);
                  if (value === destinationCity) setDestinationCity("");
                  onClearRoute?.();
                }}
                accent="#8aaa7a"
              />

              {waypoints.map((wp, i) => {
                const isDragged = dragIndex === i;
                const isDragOver = dragOverIndex === i && dragIndex !== i;
                return (
                  <div
                    key={`${wp}-${i}`}
                    draggable={Boolean(reorderWaypoints) && waypoints.length > 1}
                    onDragStart={(e) => {
                      setDragIndex(i);
                      e.dataTransfer.effectAllowed = "move";
                      try {
                        e.dataTransfer.setData("text/plain", String(i));
                      } catch {
                        /* noop */
                      }
                    }}
                    onDragOver={(e) => {
                      if (dragIndex == null) return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      if (dragOverIndex !== i) setDragOverIndex(i);
                    }}
                    onDragLeave={() => {
                      if (dragOverIndex === i) setDragOverIndex(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragIndex != null && reorderWaypoints) {
                        reorderWaypoints(dragIndex, i);
                      }
                      setDragIndex(null);
                      setDragOverIndex(null);
                    }}
                    onDragEnd={() => {
                      setDragIndex(null);
                      setDragOverIndex(null);
                    }}
                    className={`flex items-center gap-2 transition ${
                      isDragged ? "opacity-40" : ""
                    } ${
                      isDragOver
                        ? "ring-2 ring-eco-300/50 rounded-lg bg-eco-400/5"
                        : ""
                    }`}
                  >
                    <GripVertical
                      size={14}
                      strokeWidth={2}
                      className={`shrink-0 cursor-grab active:cursor-grabbing ${
                        waypoints.length > 1
                          ? "text-eco-300/80 hover:text-eco-300"
                          : "text-slate-400"
                      }`}
                      title={waypoints.length > 1 ? "Glisser pour réorganiser" : ""}
                    />
                    <div className="flex-1">
                      <div className="eyebrow text-slate-400 mb-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-copper-400" />
                        {t("pl.stop")} {i + 1}
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
                );
              })}

              <div className="flex items-center gap-2">
                {waypoints.length < 4 ? (
                  <div className="flex-1">
                    <AddWaypoint
                      existing={[startCity, destinationCity, ...waypoints].filter(Boolean)}
                      onAdd={addWaypoint}
                      label={t("pl.add.stop")}
                    />
                  </div>
                ) : null}
                <button
                  onClick={() => {
                    const s = startCity;
                    setStartCity(destinationCity);
                    setDestinationCity(s);
                    onClearRoute?.();
                  }}
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:border-olive-400/50 hover:bg-olive-400/10 transition text-slate-400 hover:text-olive-200 flex items-center justify-center shrink-0"
                  title={t("pl.swap")}
                >
                  <ArrowRightLeft size={13} strokeWidth={2} />
                </button>
              </div>

              <CityField
                label={t("pl.destination")}
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
                {t("pl.mode")}
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
                        {modeShort(m.key)}
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11.5px] text-slate-400 mt-2.5 leading-snug">
                {modeDesc(mode)}
              </p>
            </div>

            <div className="mt-auto pt-5">
              <Button
                size="md"
                variant="primary"
                icon={loading ? Loader2 : Zap}
                onClick={onOptimize}
                disabled={!canOptimize || loading}
                className={`w-full ${
                  loading ? "[&_svg]:animate-spin" : ""
                } ${!canOptimize ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                {loading ? t("pl.optimizing") : t("pl.optimize")}
              </Button>
            </div>
          </Card>
        </div>

        {/* ---- RIGHT: Map with floating KPI panel ---- */}
        <div className="xl:col-span-8">
          <div className="relative rounded-2xl overflow-hidden">
            <RealMap
              fromCity={optimizedStartCity || startCity}
              toCity={optimizedDestinationCity || destinationCity}
              waypointCities={waypoints}
              hasRoute={hasRoute}
              routeMode={effectiveMode}
              enableModeAlternatives
              height={620}
              onSelectCity={onMapCitySelect}
            />

            {/* Floating KPI strip — horizontal, pinned bottom of the map */}
            {metrics ? (
              <div
                className="absolute z-[20] hidden md:block"
                style={{ left: 12, right: 12, bottom: 12 }}
              >
                <div className="card-glass-strong px-4 py-2.5">
                  <div className="flex items-center gap-3 overflow-x-auto">
                    <div className="shrink-0 pr-3 border-r border-white/10">
                      <div className="eyebrow text-olive-300 inline-flex items-center gap-1.5">
                        <LiveDot size={5} />
                        {t("kpi.title")}
                      </div>
                      <div className="text-[10.5px] text-slate-400 truncate max-w-[140px]">
                        {optimizedStartCity || startCity} →{" "}
                        {optimizedDestinationCity || destinationCity}
                      </div>
                    </div>

                    <KpiInline
                      icon={MapPin}
                      label={t("kpi.distance")}
                      value={metrics.distanceKm}
                      suffix="km"
                      accent="#8aaa7a"
                    />
                    <KpiInline
                      icon={Clock}
                      label={t("kpi.duration")}
                      value={metrics.estimatedTimeHours}
                      suffix="h"
                      accent="#b9c9a4"
                    />
                    <KpiInline
                      icon={Fuel}
                      label={t("kpi.fuel")}
                      value={metrics.fuelLiters}
                      suffix="L"
                      accent="#c9a96a"
                    />
                    <KpiInline
                      icon={Coins}
                      label={t("kpi.cost")}
                      value={metrics.estimatedCostMAD}
                      suffix="MAD"
                      accent="#6a9fb5"
                    />
                    <KpiInline
                      icon={TrendingDown}
                      label={t("kpi.co2")}
                      value={metrics.co2Kg}
                      suffix="kg"
                      accent="#8aaa7a"
                    />
                    <KpiInline
                      icon={Gauge}
                      label={t("kpi.risk")}
                      value={riskLabel(metrics.riskLevel)}
                      accent={
                        metrics.riskLevel === "Élevé"
                          ? "#cf6a4f"
                          : metrics.riskLevel === "Moyen"
                            ? "#d8a84a"
                            : "#8aaa7a"
                      }
                    />

                    {savings ? (
                      <>
                        <div className="h-8 w-px bg-white/10 shrink-0 mx-1" />
                        <div className="shrink-0 inline-flex items-center gap-1.5 text-eco-300 text-[10px] font-bold uppercase tracking-wider">
                          <Sparkles size={10} />
                          {t("kpi.savings")}
                        </div>
                        <KpiInline
                          icon={Coins}
                          label="MAD"
                          value={savings.costSaved}
                          suffix="MAD"
                          accent="#6f9661"
                        />
                        <KpiInline
                          icon={Fuel}
                          label={t("kpi.fuel")}
                          value={savings.fuelSaved}
                          suffix="L"
                          accent="#b9c9a4"
                        />
                        <KpiInline
                          icon={TrendingDown}
                          label={t("kpi.co2")}
                          value={savings.co2Saved}
                          suffix="kg"
                          accent="#34d399"
                        />
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ================ BELOW MAP — AI decision (left) + Explainability (right, under map) ================ */}
      {hasRoute || aiRouteDecision ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          <div className="xl:col-span-8">
            {aiRouteDecision ? (
              <Card className="p-5 relative overflow-hidden border-olive-400/40">
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-25 bg-olive-400" />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="eyebrow text-olive-300 inline-flex items-center gap-2">
                      <Bot size={12} strokeWidth={2.2} />
                      {t("ai.decision")}
                    </div>
                    <span
                      className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md"
                      style={{
                        color:
                          aiRouteDecision.riskLevel === "Élevé"
                            ? "#cf6a4f"
                            : aiRouteDecision.riskLevel === "Moyen"
                              ? "#d8a84a"
                              : "#8aaa7a",
                        background:
                          aiRouteDecision.riskLevel === "Élevé"
                            ? "rgba(207,106,79,0.12)"
                            : aiRouteDecision.riskLevel === "Moyen"
                              ? "rgba(216,168,74,0.12)"
                              : "rgba(138,170,122,0.12)",
                      }}
                    >
                      {t("ai.risk")} {riskLabel(aiRouteDecision.riskLevel)}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="rounded-lg bg-white/[0.03] border border-white/8 p-2.5">
                      <div className="eyebrow text-slate-400 mb-1">{t("ai.mode.chosen")}</div>
                      <div className="text-[13px] font-semibold text-slate-50">
                        {modeLabel(aiRouteDecision.recommendedMode)}
                      </div>
                    </div>
                    <div className="rounded-lg bg-white/[0.03] border border-white/8 p-2.5">
                      <div className="eyebrow text-slate-400 mb-1">{t("ai.mode.applied")}</div>
                      <div className="text-[13px] font-semibold text-slate-50">
                        {modeLabel(aiRouteDecision.selectedMode || mode)}
                      </div>
                    </div>
                  </div>

                  {aiRouteDecision.userMode &&
                  aiRouteDecision.userMode !== "ai" &&
                  aiRouteDecision.recommendedMode !== aiRouteDecision.selectedMode ? (
                    <p className="text-[11.5px] text-amber-200/90 mt-2 leading-snug">
                      {t("ai.user.override")}{" "}
                      <strong>{modeLabel(aiRouteDecision.userMode)}</strong>
                      {t("ai.user.override.tail")}{" "}
                      <em>{t("mode.ai")}</em>{" "}
                      {t("ai.user.override.suffix")}
                    </p>
                  ) : null}

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[12.5px] text-slate-300 leading-relaxed">
                        {aiRouteDecision.reason}
                      </p>

                      {Array.isArray(aiRouteDecision.advice) &&
                      aiRouteDecision.advice.length ? (
                        <ul className="mt-3 space-y-1.5">
                          {aiRouteDecision.advice.map((tip, i) => (
                            <li
                              key={i}
                              className="text-[12px] text-slate-300 leading-snug flex gap-2"
                            >
                              <span className="text-olive-300 shrink-0 mt-0.5">›</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>

                    {Array.isArray(aiRouteDecision.liveContext) &&
                    aiRouteDecision.liveContext.length ? (
                      <div>
                        <div className="eyebrow text-slate-400 mb-1.5">
                          {t("ai.live.context")}
                        </div>
                        <div className="space-y-1.5">
                          {aiRouteDecision.liveContext.map((ctx, i) => {
                            const trafficInfo = ctx.traffic;
                            const trafficLabel =
                              trafficInfo?.available === false ||
                              trafficInfo?.risk === "Inconnu"
                                ? t("ai.traffic.unavailable")
                                : `${trafficInfo?.congestionPercent ?? "—"}% (${
                                    riskLabel(trafficInfo?.risk) || "?"
                                  })`;
                            return (
                              <div
                                key={i}
                                className="text-[11.5px] text-slate-400 leading-snug rounded-md bg-white/[0.02] border border-white/6 px-2 py-1.5"
                              >
                                <span className="text-slate-200 font-semibold">
                                  {ctx.city}
                                </span>{" "}
                                · trafic {trafficLabel} ·{" "}
                                {ctx.weather?.condition || "?"}{" "}
                                {ctx.weather?.temperature != null
                                  ? `${ctx.weather.temperature}°C`
                                  : ""}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </Card>
            ) : null}
          </div>

          <div className="xl:col-span-4">
            {hasRoute ? (
              <ExplainPanel mode={mode} scenarioKey={detectedScenarioKey} />
            ) : null}
          </div>
        </div>
      ) : null}

      {/* ================ Empty state when nothing has been computed yet ================ */}
      {!aiRouteDecision && !hasRoute ? (
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
      ) : null}
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

function AddWaypoint({ existing, onAdd, label = "Ajouter un arrêt" }) {
  return (
    <details className="group">
      <summary className="list-none cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/12 hover:border-olive-400/40 hover:bg-olive-400/5 text-[12.5px] text-slate-400 hover:text-olive-300 transition">
        <Plus size={13} strokeWidth={2} />
        {label}
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

function KpiInline({ icon: Icon, label, value, suffix, accent }) {
  const isNumeric = typeof value === "number" || /^\d/.test(String(value || ""));
  return (
    <div className="shrink-0 flex items-center gap-2">
      {Icon ? (
        <span
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
          style={{
            background: `${accent}1a`,
            border: `1px solid ${accent}30`,
            color: accent,
          }}
        >
          <Icon size={12} />
        </span>
      ) : null}
      <div className="leading-tight">
        <div className="text-[9.5px] font-bold uppercase tracking-wider text-white/55">
          {label}
        </div>
        <div
          className="font-display font-bold text-[13px] tabular-nums"
          style={{ color: accent }}
        >
          {isNumeric ? <CountUp value={value} /> : value}
          {suffix ? (
            <span className="ml-0.5 text-[9.5px] text-white/45 font-semibold">
              {suffix}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
