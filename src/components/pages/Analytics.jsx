import { useMemo, useState } from "react";
import {
  TrendingDown,
  Fuel,
  Coins,
  BarChart3,
  Gauge,
  Trees,
  Calendar,
  Sparkles,
  Truck,
  CheckCircle2,
  Brain,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { weekHistory, modeUsage, fleetVehicles } from "../../lib/constants";
import { computeSavings } from "../../lib/routeMath";
import { Card, Badge, HBar } from "../ui/Primitives";
import { DualMetricChart, Heatmap, RadialProgress, Sparkline } from "../ui/Charts";
import { useT } from "../../lib/i18n";

// Brand-tuned palette so charts feel cohesive with the rest of the app.
const PALETTE = {
  co2: "#34d399",
  cost: "#fbbf24",
  deliveries: "#38bdf8",
  km: "#a3e635",
  fleet: "#a78bfa",
  ontime: "#34d399",
  fuel: "#fb7185",
  ai: "#a3e635",
};

export default function Analytics({ metrics }) {
  const t = useT();
  const [range, setRange] = useState("7d");
  const savings = computeSavings(metrics);

  const totals = useMemo(() => {
    const co2 = weekHistory.reduce((s, d) => s + d.co2, 0);
    const cost = weekHistory.reduce((s, d) => s + d.cost, 0);
    const deliveries = weekHistory.reduce((s, d) => s + d.deliveries, 0);
    const km = weekHistory.reduce((s, d) => s + d.km, 0);
    return { co2, cost, deliveries, km };
  }, []);

  const costPerDelivery = useMemo(
    () =>
      weekHistory.map((d) => ({
        ...d,
        ratio: Math.round(d.cost / Math.max(1, d.deliveries)),
      })),
    []
  );

  const bestDay = costPerDelivery.reduce((b, c) =>
    c.ratio < b.ratio ? c : b
  );
  const worstDay = costPerDelivery.reduce((w, c) =>
    c.ratio > w.ratio ? c : w
  );

  // Series for sparklines (one tiny chart per KPI tile).
  const co2Series = weekHistory.map((d) => d.co2);
  const costSeries = weekHistory.map((d) => d.cost);
  const delvSeries = weekHistory.map((d) => d.deliveries);
  const kmSeries = weekHistory.map((d) => d.km);

  // Fake operational gauges driven from current data.
  const fleetUtilization = Math.round(
    (fleetVehicles.filter((v) => v.status !== "idle").length /
      fleetVehicles.length) *
      100
  );
  const onTime = 96;
  const fuelScore = 78;
  const aiAdoption = modeUsage.find((m) => m.label === "IA optimisée")?.value || 58;

  return (
    <div className="p-5 md:p-8 space-y-5">
      {/* ============== HERO ============== */}
      <Card variant="eco" className="relative overflow-hidden p-6 md:p-7">
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-40"
          style={{ background: "rgba(163,230,53,0.30)" }}
        />
        <div
          className="absolute -bottom-24 -left-12 w-72 h-72 rounded-full blur-3xl opacity-25"
          style={{ background: "rgba(56,189,248,0.18)" }}
        />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div>
            <Badge color="lime" icon={Sparkles}>
              {t("an.eyebrow")}
            </Badge>
            <h2 className="mt-3 font-display font-bold text-3xl md:text-4xl tracking-tight leading-[1.1]">
              {t("an.title.1")}
              <br />
              <span className="italic font-normal eco-gradient-text">
                {t("an.title.2")}
              </span>
            </h2>
            <p className="mt-3 text-white/65 text-sm max-w-xl leading-relaxed">
              {t("an.subtitle")}
            </p>
          </div>

          <div
            className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10 shrink-0"
            role="group"
          >
            {[
              { key: "7d", label: t("an.range.7d") },
              { key: "30d", label: t("an.range.30d") },
              { key: "90d", label: t("an.range.90d") },
            ].map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition ${
                  range === r.key
                    ? "bg-eco-400/20 text-eco-300 border border-eco-300/40"
                    : "text-white/55 hover:text-white border border-transparent"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* ============== KPI RIBBON with sparklines ============== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon={TrendingDown}
          label={t("an.kpi.co2")}
          value={totals.co2}
          suffix="kg"
          accent={PALETTE.co2}
          delta={{ direction: "down", text: t("an.kpi.co2.sub") }}
          series={co2Series}
        />
        <KpiCard
          icon={Coins}
          label={t("an.kpi.cost")}
          value={totals.cost}
          suffix="MAD"
          accent={PALETTE.cost}
          delta={{ direction: "down", text: t("an.kpi.cost.sub") }}
          series={costSeries}
        />
        <KpiCard
          icon={BarChart3}
          label={t("an.kpi.deliveries")}
          value={totals.deliveries}
          accent={PALETTE.deliveries}
          delta={{ direction: "up", text: t("an.kpi.deliveries.sub") }}
          series={delvSeries}
        />
        <KpiCard
          icon={Gauge}
          label={t("an.kpi.km")}
          value={totals.km}
          suffix="km"
          accent={PALETTE.km}
          delta={{ direction: "up", text: t("an.kpi.km.sub") }}
          series={kmSeries}
        />
      </div>

      {/* ============== DUAL TREND CHART ============== */}
      <Card className="p-5">
        <div className="flex items-start justify-between mb-4 gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-eco-300">
              {t("an.trend.title")}
            </div>
            <h3 className="mt-0.5 font-display font-bold text-xl tracking-tight">
              {t("an.trend.subtitle")}
            </h3>
          </div>
          <div className="text-[11px] font-mono text-white/45 inline-flex items-center gap-1.5 shrink-0">
            <Calendar size={11} />
            {t("an.range.7d")}
          </div>
        </div>
        <DualMetricChart
          data={weekHistory}
          primaryKey="co2"
          secondaryKey="cost"
          labelKey="day"
          primaryColor={PALETTE.co2}
          secondaryColor={PALETTE.cost}
          primaryLabel="CO₂"
          secondaryLabel="MAD"
          primarySuffix=" kg"
          secondarySuffix=""
          height={250}
        />
      </Card>

      {/* ============== HEATMAP + EFFICIENCY split ============== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <Card className="xl:col-span-7 p-5 flex flex-col">
          <div className="mb-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-sky-accent">
              {t("an.heatmap.title")}
            </div>
            <h3 className="mt-0.5 font-display font-bold text-lg tracking-tight">
              {t("an.heatmap.label")}
            </h3>
            <p className="mt-1 text-[12px] text-white/55">
              {t("an.heatmap.subtitle")}
            </p>
          </div>
          <div className="flex-1 flex items-stretch">
            <Heatmap
              data={weekHistory.map((d) => ({ label: d.day, value: d.deliveries }))}
              valueKey="value"
              labelKey="label"
              color={PALETTE.deliveries}
              cellHeight={120}
            />
          </div>
        </Card>

        <Card className="xl:col-span-5 p-5">
          <div className="mb-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-lime-bright">
              {t("an.eff.eyebrow")}
            </div>
            <h3 className="mt-0.5 font-display font-bold text-lg tracking-tight">
              {t("an.eff.title")}
            </h3>
          </div>
          <div className="space-y-2.5">
            {costPerDelivery.map((d) => {
              const max = Math.max(...costPerDelivery.map((x) => x.ratio));
              const isBest = d.day === bestDay.day;
              const isWorst = d.day === worstDay.day;
              const color = isBest ? PALETTE.co2 : isWorst ? PALETTE.fuel : "#94a3b8";
              return (
                <HBar
                  key={d.day}
                  label={d.day}
                  sub={`${d.ratio} MAD`}
                  value={d.ratio}
                  max={max}
                  color={color}
                />
              );
            })}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Mini
              label={t("an.eff.best")}
              value={`${bestDay.day} · ${bestDay.ratio} MAD`}
              color={PALETTE.co2}
              icon={CheckCircle2}
            />
            <Mini
              label={t("an.eff.worst")}
              value={`${worstDay.day} · ${worstDay.ratio} MAD`}
              color={PALETTE.fuel}
              icon={ArrowUpRight}
            />
          </div>
        </Card>
      </div>

      {/* ============== GAUGES + MODE BREAKDOWN ============== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <Card className="xl:col-span-7 p-5">
          <div className="mb-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-eco-300">
              {t("an.gauges.eyebrow")}
            </div>
            <h3 className="mt-0.5 font-display font-bold text-lg tracking-tight">
              {t("an.gauges.title")}
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Gauge3
              icon={Truck}
              label={t("an.gauges.fleet")}
              value={fleetUtilization}
              color={PALETTE.fleet}
            />
            <Gauge3
              icon={CheckCircle2}
              label={t("an.gauges.ontime")}
              value={onTime}
              color={PALETTE.ontime}
            />
            <Gauge3
              icon={Fuel}
              label={t("an.gauges.fuel")}
              value={fuelScore}
              color={PALETTE.fuel}
            />
            <Gauge3
              icon={Brain}
              label={t("an.gauges.ai")}
              value={aiAdoption}
              color={PALETTE.ai}
            />
          </div>
        </Card>

        <Card className="xl:col-span-5 p-5">
          <div className="mb-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-lime-bright">
              {t("an.modes.title")}
            </div>
            <h3 className="mt-0.5 font-display font-bold text-lg tracking-tight">
              {t("an.modes.subtitle")}
            </h3>
          </div>
          <div className="space-y-3">
            {modeUsage.map((m) => (
              <div key={m.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="inline-flex items-center gap-2 text-[12.5px] text-white/80 font-semibold">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: m.color,
                        boxShadow: `0 0 8px ${m.color}`,
                      }}
                    />
                    {m.label}
                  </span>
                  <span
                    className="text-[12px] font-mono font-bold tabular-nums"
                    style={{ color: m.color }}
                  >
                    {m.value}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-700"
                    style={{
                      width: `${m.value}%`,
                      background: `linear-gradient(90deg, ${m.color}, ${m.color}90)`,
                      boxShadow: `0 0 10px ${m.color}80`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ============== PER-TRIP BENCHMARK ============== */}
      {metrics ? (
        <Card className="p-5">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-11 h-11 rounded-xl bg-eco-400/15 border border-eco-400/35 text-eco-300 flex items-center justify-center shrink-0">
              <Gauge size={18} />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-eco-300">
                {t("an.compare.eyebrow")}
              </div>
              <h3 className="mt-0.5 font-display font-bold text-lg tracking-tight">
                {t("an.compare.title")}
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <CompareGroup
              title="CO₂ (kg)"
              color={PALETTE.co2}
              current={metrics.co2Kg}
              baseline={savings.baselineCo2}
              currentLabel={t("an.compare.current")}
              baselineLabel={t("an.compare.baseline")}
            />
            <CompareGroup
              title="Carburant (L)"
              color={PALETTE.cost}
              current={metrics.fuelLiters}
              baseline={savings.baselineFuel}
              currentLabel={t("an.compare.current")}
              baselineLabel={t("an.compare.baseline")}
            />
            <CompareGroup
              title="MAD"
              color={PALETTE.deliveries}
              current={metrics.estimatedCostMAD}
              baseline={savings.baselineCost}
              currentLabel={t("an.compare.current")}
              baselineLabel={t("an.compare.baseline")}
            />
          </div>
        </Card>
      ) : null}

      {/* ============== EQUIVALENCES ============== */}
      <Card className="p-5">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-lime-accent/15 border border-lime-accent/35 text-lime-bright flex items-center justify-center shrink-0">
            <Trees size={18} />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-lime-bright">
              {t("an.equiv.eyebrow")}
            </div>
            <h3 className="mt-0.5 font-display font-bold text-lg tracking-tight">
              {t("an.equiv.title")}
            </h3>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Equivalence
            icon={Trees}
            big={Math.round(totals.co2 / 25)}
            label={t("an.equiv.trees")}
            accent={PALETTE.co2}
          />
          <Equivalence
            icon={Fuel}
            big={`${Math.round(totals.co2 / 2.68)} L`}
            label={t("an.equiv.fuel")}
            accent={PALETTE.cost}
          />
          <Equivalence
            icon={Coins}
            big={`${Math.round(totals.cost * 0.18).toLocaleString()} MAD`}
            label={t("an.equiv.budget")}
            accent={PALETTE.deliveries}
          />
        </div>
      </Card>
    </div>
  );
}

/* ---------- Sub-components ---------- */
function KpiCard({ icon: Icon, label, value, suffix, accent, delta, series }) {
  const Arrow = delta?.direction === "up" ? ArrowUpRight : ArrowDownRight;
  // For "down is good" metrics (CO₂, cost), green; for "up is good" metrics, green too.
  // Use the accent color for the arrow; the parent decides what direction means.
  return (
    <div className="card-glass relative overflow-hidden p-4">
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-20 blur-2xl"
        style={{ background: accent }}
      />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {Icon ? (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: `${accent}1f`,
                border: `1px solid ${accent}40`,
                color: accent,
              }}
            >
              <Icon size={15} />
            </div>
          ) : null}
          <div className="text-[10.5px] uppercase font-bold tracking-wider text-white/55">
            {label}
          </div>
        </div>
        {series?.length ? (
          <Sparkline data={series} color={accent} width={56} height={20} />
        ) : null}
      </div>
      <div className="relative mt-3 flex items-baseline gap-1.5">
        <span className="font-display font-bold text-2xl leading-none tabular-nums">
          {Number(value).toLocaleString("fr-FR")}
        </span>
        {suffix ? (
          <span className="text-[11px] text-white/50 font-semibold">{suffix}</span>
        ) : null}
      </div>
      {delta ? (
        <div
          className="relative mt-1.5 inline-flex items-center gap-1 text-[10.5px] font-semibold"
          style={{ color: accent }}
        >
          <Arrow size={11} />
          {delta.text}
        </div>
      ) : null}
    </div>
  );
}

function Mini({ label, value, color, icon: Icon }) {
  return (
    <div
      className="rounded-xl border p-3"
      style={{
        background: `${color}10`,
        borderColor: `${color}35`,
      }}
    >
      <div
        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider"
        style={{ color }}
      >
        {Icon ? <Icon size={11} /> : null}
        {label}
      </div>
      <div className="mt-1 font-display font-bold text-[13px] text-white/90">
        {value}
      </div>
    </div>
  );
}

function Gauge3({ icon: Icon, label, value, color }) {
  return (
    <div
      className="rounded-xl border p-3 flex flex-col items-center gap-2 text-center"
      style={{
        background: `${color}0e`,
        borderColor: `${color}30`,
      }}
    >
      <RadialProgress value={value} max={100} size={72} stroke={7} color={color} />
      <div
        className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
        style={{ color }}
      >
        {Icon ? <Icon size={11} /> : null}
        {label}
      </div>
    </div>
  );
}

function CompareGroup({
  title,
  color,
  current,
  baseline,
  currentLabel,
  baselineLabel,
}) {
  const max = Math.max(current, baseline, 1);
  const saved = Math.max(0, baseline - current);
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-white/55">
          {title}
        </div>
        {saved > 0 ? (
          <span
            className="text-[10px] font-bold tabular-nums"
            style={{ color }}
          >
            −{Number(saved).toLocaleString("fr-FR")}
          </span>
        ) : null}
      </div>
      <div className="space-y-2.5">
        <HBar
          label={currentLabel}
          sub={String(Number(current).toLocaleString("fr-FR"))}
          value={current}
          max={max}
          color={color}
        />
        <HBar
          label={baselineLabel}
          sub={String(Number(baseline).toLocaleString("fr-FR"))}
          value={baseline}
          max={max}
          color="#475569"
        />
      </div>
    </div>
  );
}

function Equivalence({ icon: Icon, big, label, accent }) {
  return (
    <div
      className="p-4 rounded-2xl border relative overflow-hidden"
      style={{
        background: `${accent}0f`,
        borderColor: `${accent}33`,
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{
          background: `${accent}22`,
          border: `1px solid ${accent}40`,
          color: accent,
        }}
      >
        <Icon size={17} />
      </div>
      <div
        className="mt-3 font-display font-bold text-[26px] leading-none tabular-nums"
        style={{ color: accent }}
      >
        {big}
      </div>
      <div className="mt-1.5 text-[12px] text-white/65">{label}</div>
    </div>
  );
}
