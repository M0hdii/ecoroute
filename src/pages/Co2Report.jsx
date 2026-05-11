import { TrendingDown, Leaf, Route, Fuel, Gauge, Download } from "lucide-react";
import { co2Breakdown, weeklyCO2 } from "../lib/data";
import { Card, CardHeader, SectionTitle, StatCard, Button, Progress } from "../components/ui";

export function Co2ReportPage() {
  const total = weeklyCO2.reduce((acc, d) => acc + d.value, 0);
  const maxValue = Math.max(...weeklyCO2.map((d) => d.value));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={Leaf}
          label="CO₂ total 7j"
          value={total.toLocaleString("fr-FR")}
          suffix="kg"
          accent="#34d399"
          change={{ label: "-12% vs sem. dernière", color: "#6ee7b7" }}
        />
        <StatCard
          icon={TrendingDown}
          label="Émissions évitées"
          value="382"
          suffix="kg"
          accent="#6ee7b7"
        />
        <StatCard
          icon={Fuel}
          label="Carburant économisé"
          value="612"
          suffix="L"
          accent="#fbbf24"
        />
        <StatCard
          icon={Route}
          label="Distance totale"
          value="5 241"
          suffix="km"
          accent="#818cf8"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
        {/* Weekly chart */}
        <Card tone="raised">
          <CardHeader
            title="Émissions CO₂ cette semaine"
            subtitle="Mesuré par trajet et consolidé par jour — les tournées Eco sont pondérées moins fortement."
            icon={TrendingDown}
            accent="#34d399"
            action={
              <Button variant="ghost" icon={Download}>
                Exporter
              </Button>
            }
          />
          <div className="flex items-end gap-3 h-[260px] px-2">
            {weeklyCO2.map((d) => {
              const h = Math.round((d.value / maxValue) * 100);
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full relative flex-1 flex items-end">
                    <div
                      className="w-full rounded-t-lg transition-all"
                      style={{
                        height: `${h}%`,
                        background:
                          "linear-gradient(180deg, rgba(52,211,153,0.9), rgba(34,211,238,0.55))",
                        boxShadow: "0 -6px 18px rgba(52,211,153,0.22)",
                      }}
                      title={`${d.value} kg`}
                    />
                    <div
                      className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-300 tabular-nums"
                    >
                      {d.value}
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {d.day}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Breakdown */}
        <Card tone="default">
          <SectionTitle icon={Gauge} accent="#818cf8">
            Répartition par type
          </SectionTitle>
          <div className="space-y-3">
            {co2Breakdown.map((b) => (
              <div key={b.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: b.color }}
                    />
                    <span className="text-[12px] font-semibold text-slate-200">
                      {b.label}
                    </span>
                  </div>
                  <span
                    className="text-[12px] font-extrabold tabular-nums"
                    style={{ color: b.color }}
                  >
                    {b.value}%
                  </span>
                </div>
                <Progress value={b.value} color={b.color} />
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl p-3 border border-emerald-400/20 bg-emerald-400/6">
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-300 mb-1">
              Impact EcoRoute
            </div>
            <p className="text-[12.5px] text-slate-200 leading-relaxed">
              En activant le mode éco sur les tournées urbaines, vous avez
              supprimé l'équivalent de <b>382 kg de CO₂</b> cette semaine, soit
              environ <b>156 km</b> de trajet évité.
            </p>
          </div>
        </Card>
      </div>

      <Card tone="default">
        <SectionTitle icon={Leaf} accent="#6ee7b7">
          Recommandations IA
        </SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              title: "Basculer Casa→Rabat en éco",
              body: "Gain estimé : 23 kg CO₂/jour pour 8 min de plus.",
              accent: "#34d399",
            },
            {
              title: "Recharge intermédiaire à Kenitra",
              body: "Réduit la consommation des longs trajets vers le nord.",
              accent: "#22d3ee",
            },
            {
              title: "Regrouper Mohammedia + Casablanca",
              body: "Fusionner les tournées limite 12 km à vide par jour.",
              accent: "#818cf8",
            },
          ].map((r) => (
            <div
              key={r.title}
              className="rounded-xl p-3.5 border"
              style={{
                background: `${r.accent}0D`,
                borderColor: `${r.accent}30`,
              }}
            >
              <div
                className="text-[11px] font-bold uppercase tracking-[0.12em]"
                style={{ color: r.accent }}
              >
                Suggestion IA
              </div>
              <div className="text-[13px] font-bold text-slate-100 mt-1">
                {r.title}
              </div>
              <p className="text-[12px] text-slate-400 mt-1 leading-snug">
                {r.body}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
