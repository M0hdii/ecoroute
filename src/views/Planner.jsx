import { useState, useMemo, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Route,
  Fuel,
  Clock,
  Leaf,
  Zap,
  Loader2,
  MapPin,
  CloudSun,
  Wind,
  Thermometer,
  TrafficCone,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import {
  Card,
  CardBody,
  CardHeader,
  PageHeader,
  Select,
  Segmented,
  Button,
  Badge,
  EmptyState,
  Progress,
} from "../ui.jsx";
import {
  CITY_KEYS,
  CITY_LABELS,
  CITIES,
  MODES,
  SCENARIOS,
} from "../data.js";
import { optimizeRoute } from "../lib/api.js";

/* Custom Leaflet icons */
const startIcon = L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;border-radius:50%;background:#059669;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.15);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:11px">A</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});
const endIcon = L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;border-radius:50%;background:#0f172a;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.15);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:600;font-size:11px">B</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function FitBounds({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (!coords || coords.length < 2) return;
    const b = L.latLngBounds(coords);
    map.fitBounds(b, { padding: [40, 40] });
  }, [coords, map]);
  return null;
}

/* ----------------------------- Info tiles -------------------------------- */
function MetricTile({ label, value, unit, icon: Icon, tone = "slate" }) {
  const tones = {
    slate: "text-slate-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    sky: "text-sky-600",
    rose: "text-rose-600",
  };
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
        <Icon className={`h-3.5 w-3.5 ${tones[tone]}`} />
        {label}
      </div>
      <p className="mt-1.5 text-lg font-semibold text-slate-900 tabular-nums">
        {value}
        {unit && <span className="ml-1 text-xs font-medium text-slate-500">{unit}</span>}
      </p>
    </div>
  );
}

function RealtimeCard({ title, data, city }) {
  if (!data) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {title}
        </p>
        <Badge tone="slate">{CITY_LABELS[city] || city}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {data.weather && (
          <>
            <div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <Thermometer className="h-3 w-3" />
                Température
              </p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">
                {data.weather.temperature}°C
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <Wind className="h-3 w-3" />
                Vent
              </p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">
                {data.weather.wind} km/h
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                <CloudSun className="h-3 w-3" />
                Conditions
              </p>
              <p className="text-sm font-medium text-slate-900 mt-0.5">
                {data.weather.condition}
              </p>
            </div>
          </>
        )}
        {data.traffic && (
          <div className="col-span-2 rounded-md bg-slate-50 p-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-slate-600 flex items-center gap-1">
                <TrafficCone className="h-3 w-3" />
                Trafic
              </p>
              <Badge
                tone={
                  data.traffic.risk === "Élevé"
                    ? "rose"
                    : data.traffic.risk === "Moyen"
                    ? "amber"
                    : "emerald"
                }
              >
                {data.traffic.risk}
              </Badge>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Progress
                value={data.traffic.congestionPercent || 0}
                tone={
                  data.traffic.risk === "Élevé"
                    ? "rose"
                    : data.traffic.risk === "Moyen"
                    ? "amber"
                    : "emerald"
                }
              />
              <span className="text-xs font-medium tabular-nums text-slate-600 w-10 text-right">
                {data.traffic.congestionPercent || 0}%
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              {data.traffic.message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- Main view --------------------------------- */
export default function Planner() {
  const [start, setStart] = useState("Casablanca");
  const [destination, setDestination] = useState("Marrakech");
  const [mode, setMode] = useState("ai");
  const [scenario, setScenario] = useState("standard");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const cityOptions = useMemo(
    () =>
      CITY_KEYS.map((k) => ({
        value: k,
        label: CITY_LABELS[k] || k,
      })),
    []
  );

  const routeLine = useMemo(() => {
    if (!result?.geometry?.coordinates) return null;
    return result.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  }, [result]);

  async function handleOptimize() {
    if (start === destination) {
      setError("Veuillez choisir deux villes différentes.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await optimizeRoute({
        startCity: start,
        destinationCity: destination,
        mode,
        scenario,
      });
      setResult(data);
    } catch (e) {
      setError(
        "Impossible de calculer le trajet. Vérifiez que le backend est démarré (port 5000)."
      );
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const startCoords = CITIES[start]?.coords;
  const endCoords = CITIES[destination]?.coords;
  const center = startCoords
    ? [
        (startCoords[1] + (endCoords?.[1] || startCoords[1])) / 2,
        (startCoords[0] + (endCoords?.[0] || startCoords[0])) / 2,
      ]
    : [31.8, -7];

  return (
    <div>
      <PageHeader
        eyebrow="Planification intelligente"
        title="Planificateur d'itinéraires"
        description="Optimisez vos tournées en intégrant trafic, météo et contraintes opérationnelles. L'IA calcule le meilleur compromis entre délai, coût et empreinte carbone."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader
              icon={Route}
              title="Paramètres du trajet"
              subtitle="Définissez les villes et le mode de calcul"
            />
            <CardBody className="space-y-4">
              <Select
                label="Ville de départ"
                value={start}
                onChange={setStart}
                options={cityOptions}
              />
              <Select
                label="Destination"
                value={destination}
                onChange={setDestination}
                options={cityOptions}
              />

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Mode d'optimisation
                </label>
                <Segmented
                  options={MODES.map((m) => ({ value: m.id, label: m.label }))}
                  value={mode}
                  onChange={setMode}
                  className="w-full"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  {MODES.find((m) => m.id === mode)?.hint}
                </p>
              </div>

              <Select
                label="Type de chargement"
                value={scenario}
                onChange={setScenario}
                options={SCENARIOS.map((s) => ({
                  value: s.id,
                  label: s.label,
                }))}
              />

              <Button
                variant="brand"
                size="lg"
                icon={loading ? Loader2 : Zap}
                onClick={handleOptimize}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Calcul en cours…" : "Calculer l'itinéraire"}
              </Button>

              {error && (
                <div className="flex gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Realtime */}
          {result?.realtimeData && (
            <div className="space-y-3">
              <RealtimeCard
                title="Départ"
                data={{
                  weather: result.realtimeData.weather?.start,
                  traffic: result.realtimeData.traffic?.start,
                }}
                city={start}
              />
              <RealtimeCard
                title="Destination"
                data={{
                  weather: result.realtimeData.weather?.destination,
                  traffic: result.realtimeData.traffic?.destination,
                }}
                city={destination}
              />
            </div>
          )}
        </div>

        {/* Map + results */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              icon={MapPin}
              title="Carte du trajet"
              subtitle={
                result
                  ? `${CITY_LABELS[start]} → ${CITY_LABELS[destination]}`
                  : "Calculez un itinéraire pour visualiser le trajet"
              }
              action={
                result && (
                  <Badge tone="emerald">
                    <CheckCircle2 className="h-3 w-3" />
                    Trajet calculé
                  </Badge>
                )
              }
            />
            <CardBody className="p-0">
              <div className="h-[420px] w-full">
                <MapContainer
                  center={center}
                  zoom={6}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>, &copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  />

                  {startCoords && (
                    <Marker
                      position={[startCoords[1], startCoords[0]]}
                      icon={startIcon}
                    />
                  )}
                  {endCoords && (
                    <Marker
                      position={[endCoords[1], endCoords[0]]}
                      icon={endIcon}
                    />
                  )}

                  {routeLine && (
                    <>
                      <Polyline
                        positions={routeLine}
                        pathOptions={{
                          color: "#059669",
                          weight: 5,
                          opacity: 0.9,
                        }}
                      />
                      <FitBounds coords={routeLine} />
                    </>
                  )}
                </MapContainer>
              </div>
            </CardBody>
          </Card>

          {/* Metrics grid */}
          {result ? (
            <>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                <MetricTile
                  label="Distance"
                  value={result.distanceKm}
                  unit="km"
                  icon={Route}
                />
                <MetricTile
                  label="Durée"
                  value={result.estimatedTimeHours}
                  unit="h"
                  icon={Clock}
                />
                <MetricTile
                  label="Carburant"
                  value={result.fuelLiters}
                  unit="L"
                  icon={Fuel}
                  tone="amber"
                />
                <MetricTile
                  label="Coût"
                  value={result.estimatedCostMAD?.toLocaleString("fr-FR")}
                  unit="DH"
                  icon={DollarSign}
                  tone="sky"
                />
                <MetricTile
                  label="CO₂"
                  value={result.co2Kg}
                  unit="kg"
                  icon={Leaf}
                  tone="emerald"
                />
              </div>

              {/* AI advice */}
              <Card>
                <CardHeader
                  icon={Sparkles}
                  title="Recommandations de l'IA"
                  subtitle="Analyse contextuelle basée sur le trafic, la météo et les contraintes"
                  action={
                    <Badge tone="emerald">
                      Niveau de risque : {result.riskLevel || "Faible"}
                    </Badge>
                  }
                />
                <CardBody>
                  <ul className="space-y-3">
                    {(result.aiAdvice || []).map((advice, i) => (
                      <li
                        key={i}
                        className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                          {i + 1}
                        </span>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {advice}
                        </p>
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            </>
          ) : (
            <Card>
              <CardBody>
                <EmptyState
                  icon={Route}
                  title="Aucun trajet calculé"
                  description="Configurez les paramètres puis lancez le calcul pour obtenir l'itinéraire optimal, les indicateurs clés et les recommandations de l'IA."
                />
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
