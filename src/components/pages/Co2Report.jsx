
import {
  Leaf,
  Fuel,
  Coins,
  TrendingDown,
  Award,
  Gauge,
  BarChart3,
  Trees,
} from "lucide-react";
import { Card, Badge, StatTile, HBar } from "../ui/Primitives";
import { computeSavings } from "../../lib/routeMath";

export default function Co2Report({ metrics }) {
  const savings = computeSavings(metrics);

  return (
    <div className="p-5 md:p-8 space-y-6">
      {/* HERO strip */}
      <Card
        variant="eco"
        className="relative overflow-hidden p-6 md:p-8"
      >
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-40"
          style={{ background: "rgba(163,230,53,0.3)" }}
        />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Badge color="lime">Impact environnemental</Badge>
            <h2 className="mt-3 font-display font-bold text-3xl md:text-4xl tracking-tight leading-tight">
              Livrer plus vite, ce n'est plus l'objectif.
              <br />
              <span className="eco-gradient-text">
                Livrer plus intelligemment
              </span>{" "}
              l'est.
            </h2>
            <p className="mt-3 text-white/65 text-sm max-w-xl">
              EcoRoute estime la réduction d'émissions, la baisse de
              consommation et les économies de coût pour chaque trajet
              optimisé.
            </p>
          </div>
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 eco-gradient-bg text-ink-950 animate-float-y"
            style={{ boxShadow: "0 20px 40px rgba(163,230,53,0.4)" }}
          >
            <Trees size={32} strokeWidth={2.2} />
          </div>
        </div>
      </Card>

      {!metrics ? (
        <Card className="p-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-white/60 mb-4">
            <BarChart3 size={22} />
          </div>
          <h3 className="font-display font-bold text-lg">
            Aucun trajet calculé pour l'instant
          </h3>
          <p className="text-sm text-white/55 mt-2 max-w-md mx-auto">
            Ouvrez la page Planification, choisissez un départ et une
            destination, puis revenez ici pour voir l'impact CO₂ détaillé.
          </p>
        </Card>
      ) : (
        <>
          {/* KPI tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile
              icon={TrendingDown}
              label="CO₂ émis"
              value={metrics.co2Kg}
              suffix="kg"
              accent="#34d399"
              change={`Base rapide : ${savings.baselineCo2} kg`}
            />
            <StatTile
              icon={Fuel}
              label="Carburant consommé"
              value={metrics.fuelLiters}
              suffix="L"
              accent="#fcd34d"
              change={`Base rapide : ${savings.baselineFuel} L`}
            />
            <StatTile
              icon={Coins}
              label="Coût trajet"
              value={metrics.estimatedCostMAD}
              suffix="MAD"
              accent="#38bdf8"
              change={`Base rapide : ${savings.baselineCost} MAD`}
            />
            <StatTile
              icon={Award}
              label="Économie CO₂"
              value={savings.co2Saved}
              suffix="kg"
              accent="#a3e635"
              change="Grâce au mode choisi"
            />
          </div>

          {/* Comparison bars */}
          <Card className="p-6 md:p-8">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-eco-400/15 border border-eco-400/30 text-eco-300 flex items-center justify-center shrink-0">
                <Gauge size={18} />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-eco-300">
                  Benchmark
                </div>
                <h3 className="font-display font-bold text-xl tracking-tight mt-0.5">
                  Comparaison trajet actuel vs trajet rapide
                </h3>
                <p className="text-sm text-white/55 mt-1">
                  Les barres montrent les valeurs relatives par rapport au
                  maximum mesuré dans la comparaison.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <CompareGroup
                title="Émissions CO₂ (kg)"
                color="#34d399"
                current={metrics.co2Kg}
                baseline={savings.baselineCo2}
              />
              <CompareGroup
                title="Carburant (L)"
                color="#fcd34d"
                current={metrics.fuelLiters}
                baseline={savings.baselineFuel}
              />
              <CompareGroup
                title="Coût (MAD)"
                color="#38bdf8"
                current={metrics.estimatedCostMAD}
                baseline={savings.baselineCost}
              />
            </div>
          </Card>

          {/* Equivalences panel */}
          <Card className="p-6 md:p-8">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-lime-accent/15 border border-lime-accent/30 text-lime-bright flex items-center justify-center shrink-0">
                <Leaf size={18} />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-lime-bright">
                  Équivalences
                </div>
                <h3 className="font-display font-bold text-xl tracking-tight mt-0.5">
                  Ce que représente l'économie
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Equivalence
                icon={Trees}
                big={Math.max(1, Math.round(savings.co2Saved / 22))}
                label="arbres plantés pour compenser"
                accent="#34d399"
              />
              <Equivalence
                icon={Fuel}
                big={`${savings.fuelSaved} L`}
                label="carburant économisé"
                accent="#fcd34d"
              />
              <Equivalence
                icon={Coins}
                big={`${savings.costSaved} MAD`}
                label="budget opérationnel évité"
                accent="#38bdf8"
              />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function CompareGroup({ title, color, current, baseline }) {
  const max = Math.max(current, baseline, 1);
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3">
        {title}
      </div>
      <div className="space-y-3">
        <HBar
          label="Trajet actuel"
          sub={String(current)}
          value={current}
          max={max}
          color={color}
        />
        <HBar
          label="Trajet rapide (baseline)"
          sub={String(baseline)}
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
      className="p-5 rounded-2xl border"
      style={{
        background: `${accent}0f`,
        borderColor: `${accent}30`,
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
        <Icon size={18} />
      </div>
      <div
        className="mt-3 font-display font-bold text-3xl tracking-tight"
        style={{ color: accent }}
      >
        {big}
      </div>
      <div className="mt-1 text-xs text-white/60">{label}</div>
    </div>
  );
}
