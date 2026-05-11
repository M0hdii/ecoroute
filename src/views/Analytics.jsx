import {
  BarChart3,
  TrendingUp,
  Leaf,
  Fuel,
  Clock,
  DollarSign,
  Package,
} from "lucide-react";
import {
  Card,
  CardBody,
  CardHeader,
  PageHeader,
  Kpi,
  Badge,
  Button,
  Progress,
} from "../ui.jsx";
import { MONTHLY_KPIS } from "../data.js";

function LineChart({ data, valueKey, color = "#059669" }) {
  const w = 600;
  const h = 180;
  const padX = 30;
  const padY = 20;

  const values = data.map((d) => d[valueKey]);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * (w - padX * 2);
    const y = h - padY - ((d[valueKey] - min) / range) * (h - padY * 2);
    return [x, y];
  });

  const path = points
    .map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`))
    .join(" ");

  const area =
    points
      .map((p, i) => (i === 0 ? `M ${p[0]} ${h - padY}` : ``))
      .join(" ") +
    " " +
    points.map((p) => `L ${p[0]} ${p[1]}`).join(" ") +
    ` L ${points[points.length - 1][0]} ${h - padY} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-48">
      <defs>
        <linearGradient id={`grad-${valueKey}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* grid lines */}
      {[0.25, 0.5, 0.75].map((r, i) => {
        const y = padY + r * (h - padY * 2);
        return (
          <line
            key={i}
            x1={padX}
            x2={w - padX}
            y1={y}
            y2={y}
            stroke="#e2e8f0"
            strokeDasharray="3 3"
          />
        );
      })}
      <path d={area} fill={`url(#grad-${valueKey})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p[0]}
          cy={p[1]}
          r="3"
          fill="#fff"
          stroke={color}
          strokeWidth="2"
        />
      ))}
      {data.map((d, i) => {
        const x = padX + (i / (data.length - 1)) * (w - padX * 2);
        return (
          <text
            key={d.month}
            x={x}
            y={h - 4}
            fontSize="10"
            textAnchor="middle"
            fill="#94a3b8"
            fontFamily="Inter"
          >
            {d.month}
          </text>
        );
      })}
    </svg>
  );
}

function DonutChart({ segments }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = 40;
  const c = 2 * Math.PI * r;

  // Pré-calcul des offsets pour éviter une réassignation pendant le rendu.
  const prepared = [];
  let acc = 0;
  for (const seg of segments) {
    prepared.push({ ...seg, offset: (acc / total) * c });
    acc += seg.value;
  }

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />
        {prepared.map((seg, i) => {
          const frac = seg.value / total;
          const len = frac * c;
          return (
            <circle
              key={i}
              cx="60"
              cy="60"
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="14"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="butt"
            />
          );
        })}
      </svg>
      <ul className="space-y-2 text-sm">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: s.color }}
            />
            <span className="text-slate-700">{s.label}</span>
            <span className="ml-auto tabular-nums font-semibold text-slate-900">
              {Math.round((s.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Analytics() {
  return (
    <div>
      <PageHeader
        eyebrow="Performance"
        title="Analytique opérationnelle"
        description="Analyse des indicateurs clés sur la période. Suivez les livraisons, les coûts, le carburant et l'empreinte carbone."
        actions={
          <Button variant="secondary">Exporter le rapport</Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi
          label="Livraisons (mois)"
          value="612"
          delta="+3.9% vs Juil"
          deltaType="up"
          icon={Package}
          accent="slate"
        />
        <Kpi
          label="Coût total"
          value="549 k"
          unit="DH"
          delta="+2.6%"
          deltaType="up"
          icon={DollarSign}
          accent="sky"
        />
        <Kpi
          label="Ponctualité"
          value="94,2"
          unit="%"
          delta="+1.8 pts"
          deltaType="up"
          icon={Clock}
          accent="emerald"
        />
        <Kpi
          label="CO₂ émis"
          value="36,1"
          unit="t"
          delta="−3% vs Juil"
          deltaType="down"
          icon={Leaf}
          accent="emerald"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            icon={TrendingUp}
            title="Évolution des livraisons"
            subtitle="8 derniers mois"
            action={<Badge tone="emerald">Tendance haussière</Badge>}
          />
          <CardBody>
            <LineChart data={MONTHLY_KPIS} valueKey="livraisons" color="#059669" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            icon={Leaf}
            title="Empreinte carbone"
            subtitle="Répartition des émissions"
          />
          <CardBody>
            <DonutChart
              segments={[
                { label: "Longue distance", value: 58, color: "#059669" },
                { label: "Urbain", value: 24, color: "#0ea5e9" },
                { label: "Frigorifique", value: 18, color: "#f59e0b" },
              ]}
            />
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            icon={Fuel}
            title="Coût mensuel"
            subtitle="Dépenses de transport (DH)"
          />
          <CardBody>
            <LineChart data={MONTHLY_KPIS} valueKey="cout" color="#0ea5e9" />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            icon={BarChart3}
            title="Axes les plus actifs"
            subtitle="Top 5 des itinéraires"
          />
          <CardBody className="p-0">
            <ul className="divide-y divide-slate-200">
              {[
                { from: "Casablanca", to: "Marrakech", runs: 142, pct: 92 },
                { from: "Casablanca", to: "Rabat", runs: 128, pct: 83 },
                { from: "Tanger", to: "Casablanca", runs: 98, pct: 64 },
                { from: "Casablanca", to: "Agadir", runs: 81, pct: 53 },
                { from: "Fès", to: "Casablanca", runs: 67, pct: 44 },
              ].map((r, i) => (
                <li key={i} className="flex items-center gap-4 px-5 py-3">
                  <span className="w-5 text-center text-xs font-semibold text-slate-400 tabular-nums">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">
                      {r.from} → {r.to}
                    </p>
                    <Progress value={r.pct} tone="emerald" className="mt-1.5" />
                  </div>
                  <span className="tabular-nums text-sm font-semibold text-slate-700">
                    {r.runs}
                  </span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
