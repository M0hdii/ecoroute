import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowRight, Crosshair } from "lucide-react";
import { cities, cityCoords } from "../../lib/constants";
import { getCityCoords } from "../../lib/helpers";

const MOROCCO_CENTER = [31.79, -7.09];
const MOROCCO_ZOOM = 6;

/* ---------- Icons ---------- */
function cityMarkerIcon({ kind, label }) {
  const palette =
    kind === "start"
      ? { ring: "#34d399", glow: "rgba(52,211,153,0.6)" }
      : kind === "end"
        ? { ring: "#a3e635", glow: "rgba(163,230,53,0.6)" }
        : { ring: "#475569", glow: "rgba(71,85,105,0.4)" };

  const size = kind === "start" || kind === "end" ? 38 : 22;
  const dot = kind === "start" || kind === "end" ? 10 : 6;

  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;">
        <span style="position:absolute;inset:0;border-radius:50%;background:${palette.glow};filter:blur(6px);opacity:0.8;"></span>
        <span style="position:relative;width:${size - 6}px;height:${
          size - 6
        }px;border-radius:50%;background:rgba(5,7,13,0.9);border:2px solid ${palette.ring};display:flex;align-items:center;justify-content:center;">
          <span style="width:${dot}px;height:${dot}px;border-radius:50%;background:${palette.ring};box-shadow:0 0 10px ${palette.ring};"></span>
        </span>
        ${
          label
            ? `<span style="position:absolute;top:${
                size + 4
              }px;left:50%;transform:translateX(-50%);padding:3px 8px;border-radius:999px;background:rgba(5,7,13,0.92);border:1px solid rgba(255,255,255,0.12);color:#e6ebf5;font-size:10px;font-weight:700;letter-spacing:0.02em;white-space:nowrap;backdrop-filter:blur(6px);">${label}</span>`
            : ""
        }
      </div>
    `,
  });
}

function truckIcon() {
  return L.divIcon({
    className: "",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    html: `
      <div style="position:relative;width:44px;height:44px;">
        <span style="position:absolute;inset:2px;border-radius:50%;background:rgba(163,230,53,0.25);filter:blur(10px);animation:pulseDot 2s ease-in-out infinite;"></span>
        <span style="position:absolute;inset:6px;border-radius:50%;background:linear-gradient(135deg,#a3e635,#34d399);border:2px solid rgba(5,7,13,0.9);box-shadow:0 4px 18px rgba(163,230,53,0.65),inset 0 0 0 2px rgba(255,255,255,0.3);display:flex;align-items:center;justify-content:center;color:#05070d;font-weight:800;font-size:13px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
            <rect x="1" y="6" width="15" height="10" rx="1"></rect>
            <path d="M16 8h4l3 4v4h-7"></path>
            <circle cx="6" cy="18" r="2"></circle>
            <circle cx="18" cy="18" r="2"></circle>
          </svg>
        </span>
      </div>
    `,
  });
}

function incidentIcon() {
  return L.divIcon({
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    html: `
      <div style="position:relative;width:34px;height:34px;">
        <span style="position:absolute;inset:0;border-radius:50%;background:rgba(251,113,133,0.4);filter:blur(8px);animation:pulseDot 1.4s ease-in-out infinite;"></span>
        <span style="position:absolute;inset:6px;border-radius:50%;background:#fb7185;border:2px solid rgba(5,7,13,0.9);display:flex;align-items:center;justify-content:center;color:#05070d;font-weight:900;font-size:14px;">!</span>
      </div>
    `,
  });
}

/* ---------- Helpers ---------- */
function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length < 2) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 11 });
  }, [points, map]);
  return null;
}

function AnimatedTruck({ routePoints, progress }) {
  const idx = Math.max(
    0,
    Math.min(routePoints.length - 1, Math.floor(routePoints.length * progress))
  );
  const pos = routePoints[idx];
  if (!pos) return null;
  return <Marker position={pos} icon={truckIcon()} zIndexOffset={1000} />;
}

function useTruckProgress(active, routePoints, startProgress = 0.35) {
  const routeKey = routePoints?.length || 0;
  const [progress, setProgress] = useState(startProgress);

  useEffect(() => {
    if (!active || !routeKey) return undefined;
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + 0.008;
        return next >= 0.92 ? 0.35 : next;
      });
    }, 280);
    return () => clearInterval(id);
  }, [active, routeKey]);

  return progress;
}

/* ---------- Main component ---------- */
export default function RealMap({
  fromCity,
  toCity,
  hasRoute,
  routeMode = "ai",
  incidentReroute = false,
  incidentLabel = "Incident détecté",
  truckStartProgress = 0.35,
  showStaticTruck = false,
  height = 480,
}) {
  const fromCoords = getCityCoords(fromCity);
  const toCoords = getCityCoords(toCity);
  const canShowRoute = Boolean(hasRoute && fromCoords && toCoords);
  const [routePoints, setRoutePoints] = useState([]);

  // Visual palette per mode
  const routeVisual = useMemo(() => {
    if (routeMode === "eco")
      return { main: "#34d399", glow: "#6ee7b7", label: "Mode éco" };
    if (routeMode === "classic")
      return { main: "#38bdf8", glow: "#93c5fd", label: "Trajet rapide" };
    return { main: "#a3e635", glow: "#d9f99d", label: "IA optimisée" };
  }, [routeMode]);

  // Fetch OSRM route
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    const fCoords = getCityCoords(fromCity);
    const tCoords = getCityCoords(toCity);
    const can = Boolean(hasRoute && fCoords && tCoords);

    async function load() {
      if (!can) {
        setRoutePoints([]);
        return;
      }
      setRoutePoints([]);
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${fCoords[1]},${fCoords[0]};${tCoords[1]},${tCoords[0]}?overview=full&geometries=geojson`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.routes?.[0]?.geometry?.coordinates?.length)
          throw new Error("OSRM unavailable");
        const points = data.routes[0].geometry.coordinates.map(([lng, lat]) => [
          lat,
          lng,
        ]);
        if (!cancelled) setRoutePoints(points);
      } catch (err) {
        if (cancelled || err?.name === "AbortError") return;
        const midLat = (fCoords[0] + tCoords[0]) / 2;
        const midLng = (fCoords[1] + tCoords[1]) / 2;
        setRoutePoints([fCoords, [midLat - 0.04, midLng + 0.04], tCoords]);
      }
    }

    const t = setTimeout(load, 100);
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(t);
    };
  }, [fromCity, toCity, hasRoute]);

  const incidentIndex =
    incidentReroute && routePoints.length > 4
      ? Math.max(1, Math.floor(routePoints.length * 0.52))
      : -1;

  const routeBefore =
    incidentIndex > 0 ? routePoints.slice(0, incidentIndex + 1) : routePoints;
  const routeAfter =
    incidentIndex > 0 ? routePoints.slice(incidentIndex) : [];
  const blockedBranch =
    incidentIndex > 0
      ? routePoints.slice(incidentIndex).map(([lat, lng], i, seg) => {
          if (i === 0) return [lat, lng];
          const p = i / Math.max(1, seg.length - 1);
          const wave = Math.sin(p * Math.PI);
          return [lat + wave * 0.008, lng + wave * 0.006];
        })
      : [];

  const incidentPt = incidentIndex > 0 ? routePoints[incidentIndex] : null;

  const truckProgress = useTruckProgress(
    canShowRoute && !showStaticTruck,
    routePoints,
    truckStartProgress
  );

  // All cities as quiet background markers
  const backgroundCities = Object.entries(cityCoords).filter(
    ([key]) => key !== fromCity && key !== toCity
  );

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl"
      style={{ height }}
    >
      <MapContainer
        center={MOROCCO_CENTER}
        zoom={MOROCCO_ZOOM}
        scrollWheelZoom={true}
        zoomControl={true}
        className="ecoroute-map w-full h-full"
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Background city dots */}
        {backgroundCities.map(([key, coords]) => (
          <Marker
            key={key}
            position={coords}
            icon={cityMarkerIcon({ kind: "dot" })}
          />
        ))}

        {/* Start / End */}
        {fromCoords ? (
          <Marker
            position={fromCoords}
            icon={cityMarkerIcon({
              kind: "start",
              label: cities[fromCity]?.label,
            })}
          />
        ) : null}
        {toCoords ? (
          <Marker
            position={toCoords}
            icon={cityMarkerIcon({
              kind: "end",
              label: cities[toCity]?.label,
            })}
          />
        ) : null}

        {/* Route itself */}
        {canShowRoute && routePoints.length > 1 ? (
          <>
            {/* glow underlay */}
            <Polyline
              positions={routePoints}
              pathOptions={{
                color: routeVisual.main,
                weight: 10,
                opacity: 0.18,
                lineCap: "round",
              }}
            />
            {/* main line */}
            {incidentIndex > 0 ? (
              <>
                <Polyline
                  positions={routeBefore}
                  pathOptions={{
                    color: routeVisual.main,
                    weight: 4.5,
                    opacity: 0.95,
                    lineCap: "round",
                  }}
                />
                <Polyline
                  positions={blockedBranch}
                  pathOptions={{
                    color: "#fb7185",
                    weight: 3,
                    opacity: 0.6,
                    dashArray: "6 8",
                    lineCap: "round",
                  }}
                />
                <Polyline
                  positions={routeAfter}
                  pathOptions={{
                    color: "#a3e635",
                    weight: 4.5,
                    opacity: 0.95,
                    dashArray: "14 10",
                    lineCap: "round",
                    className: "route-animate-dash",
                  }}
                />
              </>
            ) : (
              <Polyline
                positions={routePoints}
                pathOptions={{
                  color: routeVisual.main,
                  weight: 4.5,
                  opacity: 0.95,
                  lineCap: "round",
                  className: "route-animate-dash",
                }}
              />
            )}

            {/* Incident marker */}
            {incidentPt ? (
              <Marker position={incidentPt} icon={incidentIcon()}>
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "#fb7185",
                      }}
                    >
                      Incident
                    </div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>
                      {incidentLabel}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ) : null}

            {/* Animated truck */}
            {showStaticTruck ? (
              <Marker
                position={
                  routePoints[
                    Math.floor(routePoints.length * truckStartProgress)
                  ] || routePoints[0]
                }
                icon={truckIcon()}
              />
            ) : (
              <AnimatedTruck
                routePoints={routePoints}
                progress={truckProgress}
              />
            )}
            <FitBounds points={routePoints} />
          </>
        ) : null}
      </MapContainer>

      {/* OVERLAY CARDS */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none z-[500]">
        <div className="card-glass-strong pointer-events-auto flex items-center gap-3 px-3 py-2">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: "#34d399",
                boxShadow: "0 0 8px #34d399",
              }}
            />
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-white/45">
                Départ
              </div>
              <div className="text-xs font-bold">
                {cities[fromCity]?.label || "—"}
              </div>
            </div>
          </div>
          <ArrowRight size={13} className="text-white/40" />
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: "#a3e635",
                boxShadow: "0 0 8px #a3e635",
              }}
            />
            <div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-white/45">
                Arrivée
              </div>
              <div className="text-xs font-bold">
                {cities[toCity]?.label || "—"}
              </div>
            </div>
          </div>
        </div>

        {canShowRoute && routePoints.length > 0 ? (
          <div
            className="pointer-events-auto card-glass-strong flex items-center gap-2 px-3 py-2 text-xs font-bold"
            style={{
              borderColor: `${routeVisual.main}55`,
              color: routeVisual.glow,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: routeVisual.main,
                boxShadow: `0 0 8px ${routeVisual.main}`,
              }}
            />
            {routeVisual.label}
          </div>
        ) : null}

        {incidentReroute && canShowRoute ? (
          <div className="pointer-events-auto card-glass-strong flex items-center gap-2 px-3 py-2 text-xs font-bold border-coral-500/40 text-coral-400">
            <span
              className="w-2 h-2 rounded-full bg-coral-400"
              style={{ boxShadow: "0 0 8px #fb7185" }}
            />
            Incident · recalcul IA · ETA 13:19
          </div>
        ) : null}
      </div>

      {/* Empty state */}
      {!canShowRoute ? (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center card-glass-strong px-6 py-5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl eco-gradient-bg text-ink-950 mb-3">
              <Crosshair size={20} strokeWidth={2.4} />
            </div>
            <div className="font-display font-bold text-sm">
              Choisissez un trajet pour voir la carte
            </div>
            <div className="text-xs text-white/50 mt-1">
              Départ + destination, puis calcul de l'itinéraire.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
