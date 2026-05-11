import {
  Truck,
  Package,
  Leaf,
  Fuel,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
  MapPin,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import {
  Card,
  CardBody,
  CardHeader,
  Kpi,
  Badge,
  Progress,
  PageHeader,
  Button,
} from "../ui.jsx";
import {
  SHIPMENTS,
  ALERTS,
  FLEET,
  CITIES,
  CITY_LABELS,
  STATUS_COLORS,
  MONTHLY_KPIS,
} from "../data.js";

/* ----------------------------- Mini heat map ----------------------------- */
function FleetMap() {
  const depots = [
    { city: "Casablanca", size: 10 },
    { city: "Rabat", size: 7 },
    { city: "Tanger", size: 6 },
    { city: "Marrakech", size: 5 },
    { city: "Agadir", size: 5 },
    { city: "Fes", size: 4 },
    { city: "Oujda", size: 3 },
  ];

  return (
    <div className="h-80 w-full overflow-hidden rounded-lg border border-slate-200">
      <MapContainer
        center={[31.8, -7.0]}
        zoom={5}
        scrollWheelZoom={false}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>, &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {depots.map((d) => {
          const c = CITIES[d.city];
          if (!c) return null;
          return (
            <CircleMarker
              key={d.city}
              center={[c.coords[1], c.coords[0]]}
              radius={d.size}
              pathOptions={{
                color: "#059669",
                fillColor: "#10b981",
                fillOpacity: 0.4,
                weight: 1.5,
              }}
            >
              <Tooltip direction="top" offset={[0, -4]} opacity={1}>
                <span className="text-xs font-medium">
                  {CITY_LABELS[d.city]} · {d.size} véhicules
                </span>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

/* ----------------------------- Mini bar chart ---------------------------- */
function MiniBarChart({ data, accent = "emerald" }) {
  const max = Math.max(...data.map((d) => d.livraisons));
  const tones = {
    emerald: "bg-emerald-500",
    sky: "bg-sky-500",
    slate: "bg-slate-400",
  };
  return (
    <div className="flex h-32 items-end gap-2">
      {data.map((d) => {
        const h = (d.livraisons / max) * 100;
        return (
          <div key={d.month} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-end" style={{ height: "100%" }}>
              <div
                className={`w-full rounded-t-md ${tones[accent]} opacity-90 transition hover:opacity-100`}
                style={{ height: `${h}%` }}
                title={`${d.month}: ${d.livraisons} livraisons`}
              />
            </div>
            <span className="text-[10px] font-medium text-slate-500">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------------- View ---------------------------------- */
export default function Dashboard({ onGoToPlanner }) {
  const activeShipments = SHIPMENTS.filter((s) => s.status === "En route");
  const delayed = SHIPMENTS.filter((s) => s.status === "Retardé");
  const totalKm = FLEET.reduce((s, f) => s + f.km, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Vue d'ensemble"
        title="Tableau de bord opérationnel"
        description="Suivi en temps réel de votre flotte, des expéditions en cours et des indicateurs clés de performance logistique."
        actions={
          <>
            <Button variant="secondary" size="md">
              Exporter
            </Button>
            <Button variant="primary" size="md" icon={ArrowUpRight} onClick={onGoToPlanner}>
              Planifier un trajet
            </Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi
          label="Expéditions actives"
          value={activeShipments.length}
          delta="+12% vs semaine dernière"
          deltaType="up"
          icon={Package}
          accent="emerald"
        />
        <Kpi
          label="Véhicules en route"
          value={FLEET.filter((f) => f.status === "En route").length}
          unit={`/ ${FLEET.length}`}
          delta="3 en chargement"
          deltaType="flat"
          icon={Truck}
          accent="sky"
        />
        <Kpi
          label="Distance parcourue"
          value={totalKm.toLocaleString("fr-FR")}
          unit="km"
          delta="+8.4% ce mois"
          deltaType="up"
          icon={Activity}
          accent="violet"
        />
        <Kpi
          label="CO₂ économisé"
          value="2,184"
          unit="kg"
          delta="−14% émissions"
          deltaType="down"
          icon={Leaf}
          accent="emerald"
        />
      </div>

      {/* Main grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Map */}
        <Card className="lg:col-span-2">
          <CardHeader
            icon={MapPin}
            title="Répartition de la flotte"
            subtitle="Densité des véhicules actifs par région"
            action={
              <Badge tone="emerald">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
                Temps réel
              </Badge>
            }
          />
          <CardBody className="p-4">
            <FleetMap />
          </CardBody>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader
            icon={AlertTriangle}
            title="Alertes du jour"
            subtitle={`${ALERTS.length} notifications`}
            action={
              <button className="text-xs font-medium text-emerald-700 hover:text-emerald-800">
                Tout voir
              </button>
            }
          />
          <CardBody className="p-0">
            <ul className="divide-y divide-slate-200">
              {ALERTS.slice(0, 4).map((a) => {
                const icon =
                  a.level === "critique"
                    ? AlertTriangle
                    : a.level === "avertissement"
                    ? Info
                    : CheckCircle2;
                const tone =
                  a.level === "critique"
                    ? "text-rose-600 bg-rose-50 ring-rose-200"
                    : a.level === "avertissement"
                    ? "text-amber-600 bg-amber-50 ring-amber-200"
                    : "text-slate-500 bg-slate-50 ring-slate-200";
                const Icon = icon;
                return (
                  <li key={a.id} className="flex gap-3 px-5 py-4">
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ${tone}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {a.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                        {a.message}
                      </p>
                      <p className="mt-1.5 text-[11px] text-slate-400">
                        {a.time} · {a.zone}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
      </div>

      {/* Second row: shipments + chart */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            icon={Package}
            title="Expéditions en cours"
            subtitle={`${activeShipments.length} trajets actifs · ${delayed.length} retardés`}
            action={
              <button className="text-xs font-medium text-emerald-700 hover:text-emerald-800">
                Voir toutes
              </button>
            }
          />
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/60 text-left">
                    <th className="px-5 py-2.5 text-xs font-semibold text-slate-600">
                      Référence
                    </th>
                    <th className="px-5 py-2.5 text-xs font-semibold text-slate-600">
                      Client
                    </th>
                    <th className="px-5 py-2.5 text-xs font-semibold text-slate-600">
                      Itinéraire
                    </th>
                    <th className="px-5 py-2.5 text-xs font-semibold text-slate-600">
                      Progression
                    </th>
                    <th className="px-5 py-2.5 text-xs font-semibold text-slate-600">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {SHIPMENTS.slice(0, 6).map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-3">
                        <span className="font-mono text-xs text-slate-900">{s.id}</span>
                      </td>
                      <td className="px-5 py-3 text-slate-700">{s.client}</td>
                      <td className="px-5 py-3 text-slate-600">
                        <span className="inline-flex items-center gap-1.5">
                          {CITY_LABELS[s.from] || s.from}
                          <span className="text-slate-300">→</span>
                          {CITY_LABELS[s.to] || s.to}
                        </span>
                      </td>
                      <td className="px-5 py-3 w-48">
                        <div className="flex items-center gap-2">
                          <Progress
                            value={s.progress}
                            tone={
                              s.status === "Retardé"
                                ? "rose"
                                : s.status === "Livré"
                                ? "sky"
                                : "emerald"
                            }
                          />
                          <span className="w-8 text-right text-xs tabular-nums text-slate-500">
                            {s.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ${
                            STATUS_COLORS[s.status] ||
                            "bg-slate-50 text-slate-600 ring-slate-200"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            icon={TrendingUp}
            title="Livraisons mensuelles"
            subtitle="Tendance sur 8 mois"
          />
          <CardBody>
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <p className="text-2xl font-semibold text-slate-900 tabular-nums">
                  612
                </p>
                <p className="text-xs text-slate-500">Aoû · en cours</p>
              </div>
              <Badge tone="emerald">+3.9% vs Juil</Badge>
            </div>
            <MiniBarChart data={MONTHLY_KPIS} />

            <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-200 pt-4">
              <div>
                <p className="text-[11px] text-slate-500">Carburant</p>
                <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-slate-900">
                  <Fuel className="h-3.5 w-3.5 text-slate-400" />
                  48 k L
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Ponctualité</p>
                <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-slate-900">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  94 %
                </p>
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Coût / km</p>
                <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-slate-900">
                  <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />
                  3,4 DH
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
