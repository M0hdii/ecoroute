import {
  TrendingDown,
  Fuel,
  Coins,
  Award,
  Gauge,
  BarChart3,
  Leaf,
  Trees,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import {
  weekHistory,
  modeUsage,
} from "../../lib/constants";
import { Card, Badge, StatTile, HBar } from "../ui/Primitives";
import { AreaChart, BarChart, Donut } from "../ui/Charts";
import { computeSavings } from "../../lib/routeMath";

export default function Analytics({ metrics }) {
  const [range, setRange] = useState("7d");
  const savings = computeSavings(metrics);

  const costPerDeliveryData = weekHistory.map((d) => ({
    ...d,
    costPerDelivery: Math.round(d.cost / Math.max(1, d.deliveries)),
  }));

  const bestEfficiencyDay = costPerDeliveryData.reduce((best, current) =>
    current.costPerDelivery < best.costPerDelivery ? current : best
  );

  const totalCo2 = weekHistory.reduce((a, d) => a + d.co2, 0);
  const totalDeliveries = weekHistory.reduce((a, d) => a + d.deliveries, 0);
  const totalCost = weekHistory.reduce((a, d) => a + d.cost, 0);
  const totalKm = weekHistory.reduce((a, d) => a + d.km, 0);

  return (
    <div className="p-5 md:p-8 space-y-5">
      {/* HERO */}
      <Card variant="hero" className="relative overflow-hidden p-7 md:p-8">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl"
          style={{ background: "rgba(138,170,122,0.3)" }}
        />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <Badge color="olive">Analytique · 7 jours</Badge>
            <h2 className="mt-3 font-display font-semibold text-4xl md:text-[46px] tracking-[-0.025em] leading-[1.04] text-slate-50">
              Mesurer l'impact,
              <br />
              <span className="italic font-normal eco-gradient-text">
                piloter la décision.
              </span>
            </h2>
            <p className="mt-3 text-slate-300 text-[13px] max-w-xl leading-relaxed">
              Vue complète de la performance : CO₂, coût, carburant,
              livraisons, utilisation des modes.
            </p>
          </div>
          <div className="flex items-center gap-2 p-1 rounded-lg bg-white/[0.04] border border-white/8">
            {["7d", "30d", "90d"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-md text-[11.5px] font-mono uppercase tracking-wider transition ${
                  range === r
                    ? "bg-olive-400/20 text-olive-200"
                    : "text-slate-400 hover:text-slate-50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          icon={TrendingDown}
          label="CO₂ total"
          value={totalCo2}
          suffix="kg"
          accent="#8aaa7a"
          change="-23% vs semaine dernière"
          changeDirection="down"
        />
        <StatTile
          icon={Coins}
          label="Coût total"
          value={totalCost.toLocaleString()}
          suffix="MAD"
          accent="#c9a96a"
          change="-18% grâce à l'IA"
          changeDirection="down"
        />
        <StatTile
          icon={BarChart3}
          label="Livraisons"
          value={totalDeliveries}
          accent="#6a9fb5"
          change="+12% vs période"
          changeDirection="up"
        />
        <StatTile
          icon={Gauge}
          label="Km parcourus"
          value={totalKm.toLocaleString()}
          suffix="km"
          accent="#b9c9a4"
          change="rendement 82%"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <Card className="xl:col-span-8 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="eyebrow text-olive-300">— Tendance CO₂</div>
              <h3 className="font-display font-semibold text-[18px] tracking-tight text-slate-50 mt-1">
                Émissions quotidiennes
              </h3>
            </div>
            <div className="text-[11px] font-mono text-slate-400 inline-flex items-center gap-2">
              <Calendar size={11} strokeWidth={2} />
              <span>7 derniers jours</span>
            </div>
          </div>
          <AreaChart
            data={weekHistory}
            valueKey="co2"
            labelKey="day"
            color="#8aaa7a"
            height={200}
            suffix=" kg"
            showPoints={true}
            />
        </Card>

        <Card className="xl:col-span-4 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="eyebrow text-copper-400">— Modes</div>
              <h3 className="font-display font-semibold text-[18px] tracking-tight text-slate-50 mt-1">
                Utilisation
              </h3>
            </div>
          </div>
          <div className="flex items-center justify-center py-4">
            <Donut
              data={modeUsage}
              centerValue="58%"
              centerLabel="IA optimisée"
            />
          </div>
          <div className="space-y-2 mt-2">
            {modeUsage.map((m) => (
              <div key={m.label} className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: m.color }}
                />
                <span className="text-[12.5px] text-slate-200 flex-1">
                  {m.label}
                </span>
                <span className="text-[12.5px] font-mono text-slate-400 tabular">
                  {m.value}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Efficiency chart */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="eyebrow text-olive-300">— Efficacité opérationnelle</div>
            <h3 className="font-display font-semibold text-[18px] tracking-tight text-slate-50 mt-1">
              Coût moyen par livraison
            </h3>
            <p className="mt-1 text-[12px] text-slate-400">
              Plus le coût par livraison est bas, plus la tournée est efficace.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-olive-300">
            <span className="w-2 h-2 rounded-full bg-olive-300" />
            MAD / livraison
          </span>
        </div>

        <BarChart
          data={costPerDeliveryData}
          keys={["costPerDelivery"]}
          colors={["#8aaa7a"]}
          labelKey="day"
          height={220}
        />

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-[12px]">
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
            <div className="text-slate-400">Meilleur jour</div>
            <div className="mt-1 font-display font-semibold text-slate-50">
              {bestEfficiencyDay.day}
            </div>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
            <div className="text-slate-400">Lecture</div>
            <div className="mt-1 font-display font-semibold text-slate-50">
              Coût / arrêt
            </div>
          </div>
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
            <div className="text-slate-400">Objectif</div>
            <div className="mt-1 font-display font-semibold text-olive-300">
              Réduire le ratio
            </div>
          </div>
        </div>
      </Card>

      {/* Per-trip breakdown */}
      {metrics ? (
        <Card className="p-5">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-11 h-11 rounded-lg bg-olive-400/12 border border-olive-400/35 text-olive-300 flex items-center justify-center shrink-0">
              <Gauge size={18} strokeWidth={2} />
            </div>
            <div>
              <div className="eyebrow text-olive-300">— Trajet courant</div>
              <h3 className="font-display font-semibold text-[18px] tracking-tight text-slate-50 mt-1">
                Comparaison vs baseline rapide
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div>
              <CompareGroup
                title="CO₂ (kg)"
                color="#8aaa7a"
                current={metrics.co2Kg}
                baseline={savings.baselineCo2}
              />
            </div>
            <div>
              <CompareGroup
                title="Carburant (L)"
                color="#c9a96a"
                current={metrics.fuelLiters}
                baseline={savings.baselineFuel}
              />
            </div>
            <div>
              <CompareGroup
                title="Coût (MAD)"
                color="#6a9fb5"
                current={metrics.estimatedCostMAD}
                baseline={savings.baselineCost}
              />
            </div>
          </div>
        </Card>
      ) : null}

      {/* Equivalences */}
      <Card className="p-5">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-11 h-11 rounded-lg bg-copper-400/14 border border-copper-400/35 text-copper-300 flex items-center justify-center shrink-0">
            <Leaf size={18} strokeWidth={2} />
          </div>
          <div>
            <div className="eyebrow text-copper-400">— Équivalences</div>
            <h3 className="font-display font-semibold text-[18px] tracking-tight text-slate-50 mt-1">
              Ce que 142 kg de CO₂ évités représentent
            </h3>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Equivalence icon={Trees} big="6" label="arbres plantés · compensation annuelle" accent="#8aaa7a" />
          <Equivalence icon={Fuel} big="58 L" label="carburant économisé" accent="#c9a96a" />
          <Equivalence icon={Coins} big="1 240 MAD" label="budget opérationnel évité" accent="#6a9fb5" />
        </div>
      </Card>
    </div>
  );
}

function CompareGroup({ title, color, current, baseline }) {
  const max = Math.max(current, baseline, 1);
  return (
    <div>
      <div className="eyebrow text-slate-400 mb-3">{title}</div>
      <div className="space-y-3">
        <HBar label="Actuel" sub={String(current)} value={current} max={max} color={color} />
        <HBar label="Baseline" sub={String(baseline)} value={baseline} max={max} color="#4a5451" />
      </div>
    </div>
  );
}

function Equivalence({ icon: Icon, big, label, accent }) {
  return (
    <div
      className="p-4 rounded-lg border relative overflow-hidden"
      style={{
        background: `${accent}0e`,
        borderColor: `${accent}33`,
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center border"
        style={{
          background: `${accent}18`,
          borderColor: `${accent}40`,
          color: accent,
        }}
      >
        <Icon size={16} strokeWidth={2} />
      </div>
      <div
        className="mt-3 font-display font-semibold text-[26px] tracking-[-0.03em] leading-none tabular"
        style={{ color: accent }}
      >
        {big}
      </div>
      <div className="mt-1.5 text-[12px] text-slate-300">{label}</div>
    </div>
  );
}
