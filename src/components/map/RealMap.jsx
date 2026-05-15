import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowRight } from "lucide-react";
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


function vehicleStatusIcon({ status = "idle", incident = false, label = "" }) {
  const palette = incident
    ? { bg: "#fb7185", glow: "rgba(251,113,133,0.55)", color: "#05070d" }
    : status === "en_route"
      ? { bg: "#34d399", glow: "rgba(52,211,153,0.55)", color: "#05070d" }
      : status === "loading"
        ? { bg: "#fbbf24", glow: "rgba(251,191,36,0.45)", color: "#05070d" }
        : { bg: "#64748b", glow: "rgba(100,116,139,0.35)", color: "#f8fafc" };

  const symbol = incident ? "!" : status === "loading" ? "⬢" : status === "idle" ? "⌂" : "🚚";

  return L.divIcon({
    className: "",
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    html: `
      <div style="position:relative;width:42px;height:42px;display:flex;align-items:center;justify-content:center;">
        <span style="position:absolute;inset:2px;border-radius:50%;background:${palette.glow};filter:blur(9px);opacity:0.85;"></span>
        <span style="position:relative;width:32px;height:32px;border-radius:12px;background:${palette.bg};border:2px solid rgba(5,7,13,0.9);display:flex;align-items:center;justify-content:center;color:${palette.color};font-weight:900;font-size:15px;box-shadow:0 8px 22px ${palette.glow};">
          ${symbol}
        </span>
        ${
          label
            ? `<span style="position:absolute;top:40px;left:50%;transform:translateX(-50%);padding:3px 8px;border-radius:999px;background:rgba(5,7,13,0.92);border:1px solid rgba(255,255,255,0.12);color:#e6ebf5;font-size:10px;font-weight:800;letter-spacing:0.02em;white-space:nowrap;backdrop-filter:blur(6px);">${label}</span>`
            : ""
        }
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
/*
  AnimatedRoutePolyline drives the dashed flow effect directly in JS by
  updating the SVG path's stroke-dashoffset every frame on the underlying
  Leaflet polyline. CSS-based animation through pathOptions.className was
  unreliable across react-leaflet renders and production builds, so we
  attach to the path element via the polyline ref and animate it ourselves.
*/
function AnimatedRoutePolyline({
  positions,
  color,
  weight = 5.5,
  dash = "14 18",
  speed = 40,
  opacity = 1,
}) {
  const polylineRef = useRef(null);
  const offsetRef = useRef(0);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);

  const setDashAttrs = useCallback((path, dashValue, offsetValue) => {
    if (!path) return;
    path.setAttribute("stroke-dasharray", dashValue);
    path.setAttribute("stroke-dashoffset", String(offsetValue));
  }, []);

  useEffect(() => {
    const polyline = polylineRef.current;
    if (!polyline) return undefined;
    const path = polyline._path;
    if (!path) return undefined;

    setDashAttrs(path, dash, offsetRef.current);

    function tick(now) {
      if (lastTimeRef.current == null) lastTimeRef.current = now;
      const elapsed = now - lastTimeRef.current;
      lastTimeRef.current = now;

      offsetRef.current -= (elapsed / 1000) * speed;
      if (offsetRef.current < -10000) offsetRef.current = 0;

      const livePath = polylineRef.current?._path;
      if (livePath) {
        livePath.setAttribute("stroke-dashoffset", String(offsetRef.current));
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimeRef.current = null;
    };
  }, [positions, dash, speed, setDashAttrs]);

  return (
    <Polyline
      ref={polylineRef}
      positions={positions}
      pathOptions={{
        color,
        weight,
        opacity,
        lineCap: "round",
        lineJoin: "round",
      }}
    />
  );
}

function FitBounds({ points, fitKey }) {
  const map = useMap();
  const lastFitKeyRef = useRef(null);

  useEffect(() => {
    if (!points || points.length < 2 || !fitKey) return;
    if (lastFitKeyRef.current === fitKey) return;

    lastFitKeyRef.current = fitKey;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 11 });
  }, [fitKey, map]);

  return null;
}


function segmentDistance(a, b) {
  if (!a || !b) return 0;
  const latDistance = a[0] - b[0];
  const lngDistance = a[1] - b[1];
  return Math.sqrt(latDistance * latDistance + lngDistance * lngDistance);
}

function getPointAtProgress(routePoints, progress) {
  if (!routePoints?.length) return null;
  if (routePoints.length === 1) return routePoints[0];

  const clamped = Math.max(0, Math.min(1, progress));
  const distances = [];
  let total = 0;

  for (let i = 0; i < routePoints.length - 1; i += 1) {
    const distance = segmentDistance(routePoints[i], routePoints[i + 1]);
    distances.push(distance);
    total += distance;
  }

  if (!total) return routePoints[0];

  let target = total * clamped;

  for (let i = 0; i < distances.length; i += 1) {
    const distance = distances[i];
    if (target <= distance) {
      const ratio = distance === 0 ? 0 : target / distance;
      const a = routePoints[i];
      const b = routePoints[i + 1];

      return [
        a[0] + (b[0] - a[0]) * ratio,
        a[1] + (b[1] - a[1]) * ratio,
      ];
    }
    target -= distance;
  }

  return routePoints[routePoints.length - 1];
}

function AnimatedTruck({ routePoints, progress }) {
  const pos = getPointAtProgress(routePoints, progress);
  if (!pos) return null;
  return <Marker position={pos} icon={truckIcon()} zIndexOffset={1000} />;
}

function useTruckProgress(active, routePoints, startProgress = 0.35, zoom = MOROCCO_ZOOM) {
  const routeKey = `${routePoints?.length || 0}:${routePoints?.[0]?.join(",") || ""}:${routePoints?.at?.(-1)?.join(",") || ""}`;
  const [progress, setProgress] = useState(startProgress);
  const progressRef = useRef(startProgress);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);
  const zoomRef = useRef(zoom);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    progressRef.current = startProgress;
    setProgress(startProgress);
    lastTimeRef.current = null;
  }, [startProgress, routeKey]);

  useEffect(() => {
    if (!active || !routePoints?.length) return undefined;

    const baseSpeedPerMs = 0.000024;
    const baseZoom = 8;
    const endProgress = 0.94;

    function tick(now) {
      if (lastTimeRef.current == null) {
        lastTimeRef.current = now;
      }

      const elapsed = Math.min(80, now - lastTimeRef.current);
      lastTimeRef.current = now;

      // When zooming in, the same geographic movement covers more screen pixels.
      // This factor slows the route progress down so the truck keeps a similar visual speed.
      const zoomFactor = Math.pow(2, Math.max(0, zoomRef.current - baseZoom));
      const adjustedSpeed = baseSpeedPerMs / zoomFactor;

      let next = progressRef.current + elapsed * adjustedSpeed;
      if (next >= endProgress) next = startProgress;

      progressRef.current = next;
      setProgress(next);
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimeRef.current = null;
    };
  }, [active, routeKey, startProgress, routePoints]);

  return progress;
}

function TruckLayer({ active, routePoints, startProgress }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });

  const progress = useTruckProgress(active, routePoints, startProgress, zoom);
  if (!active) return null;

  return <AnimatedTruck routePoints={routePoints} progress={progress} />;
}

const EMPTY_WAYPOINTS = [];
const EMPTY_MARKERS = [];

function buildDetourPoint(fromPoint, toPoint) {
  if (!fromPoint || !toPoint) return null;

  const [fromLat, fromLng] = fromPoint;
  const [toLat, toLng] = toPoint;

  const midLat = (fromLat + toLat) / 2;
  const midLng = (fromLng + toLng) / 2;

  const dLat = toLat - fromLat;
  const dLng = toLng - fromLng;
  const length = Math.sqrt(dLat * dLat + dLng * dLng) || 1;

  // Perpendicular offset. Minimum offset keeps short city routes visibly rerouted.
  const offset = Math.max(0.035, Math.min(0.12, length * 0.45));
  const perpLat = -dLng / length;
  const perpLng = dLat / length;

  return [midLat + perpLat * offset, midLng + perpLng * offset];
}

async function fetchOsrmRoute(points, signal) {
  const coordString = points
    .map(([lat, lng]) => `${lng},${lat}`)
    .join(";");

  const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?alternatives=false&steps=false&overview=full&geometries=geojson`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error("OSRM reroute unavailable");
  }

  const data = await response.json();
  const coords = data.routes?.[0]?.geometry?.coordinates;

  if (!coords?.length) {
    throw new Error("OSRM reroute returned no geometry");
  }

  return coords.map(([lng, lat]) => [lat, lng]);
}


/* ---------- Main component ---------- */
export default function RealMap({
  fromCity,
  toCity,
  waypointCities = EMPTY_WAYPOINTS,
  hasRoute,
  routeMode = "ai",
  incidentReroute = false,
  incidentLabel = "Incident détecté",
  truckStartProgress = 0.35,
  showStaticTruck = false,
  height = 480,
  onSelectCity,
  showTruck = false,
  extraMarkers = EMPTY_MARKERS,
}) {
  const waypointKey = (waypointCities || []).join('|');
  const markerKey = (extraMarkers || []).map((m) => m.id).join('|');

  const fromCoords = getCityCoords(fromCity);
  const toCoords = getCityCoords(toCity);
  const waypointCoords = (waypointCities || [])
    .map((city) => ({ key: city, coords: getCityCoords(city) }))
    .filter((item) => item.coords);
  const fullRouteCoords = [
    fromCoords,
    ...waypointCoords.map((item) => item.coords),
    toCoords,
  ].filter(Boolean);
  const canShowRoute = Boolean(hasRoute && fromCoords && toCoords && fullRouteCoords.length >= 2);
  const [routePoints, setRoutePoints] = useState([]);
  const [alternativeRoutePoints, setAlternativeRoutePoints] = useState([]);
  const [routeSource, setRouteSource] = useState("none");

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
    const wCoords = (waypointCities || [])
      .map((city) => getCityCoords(city))
      .filter(Boolean);
    const orderedCoords = [fCoords, ...wCoords, tCoords].filter(Boolean);
    const can = Boolean(hasRoute && fCoords && tCoords && orderedCoords.length >= 2);

    function fallbackPolyline(points) {
      const expanded = [];
      for (let i = 0; i < points.length - 1; i += 1) {
        const a = points[i];
        const b = points[i + 1];
        const midLat = (a[0] + b[0]) / 2;
        const midLng = (a[1] + b[1]) / 2;
        const inlandLng = Math.min(midLng + 0.18, Math.max(a[1], b[1]) + 0.25);
        if (i === 0) expanded.push(a);
        expanded.push([midLat, inlandLng], b);
      }
      return expanded;
    }

    async function load() {
      if (!can) {
        setRoutePoints([]);
        return;
      }
      // Use OSRM only so localhost and Vercel draw the same road route.
      setRoutePoints([]);
      setRouteSource("loading");
      try {
        const coordString = orderedCoords
          .map((coords) => `${coords[1]},${coords[0]}`)
          .join(";");
        const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?alternatives=${incidentReroute ? "true" : "false"}&steps=false&overview=full&geometries=geojson`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.routes?.[0]?.geometry?.coordinates?.length)
          throw new Error("OSRM unavailable");
        const points = data.routes[0].geometry.coordinates.map(([lng, lat]) => [
          lat,
          lng,
        ]);

        let alternativePoints =
          incidentReroute && data.routes?.[1]?.geometry?.coordinates?.length
            ? data.routes[1].geometry.coordinates.map(([lng, lat]) => [lat, lng])
            : [];

        // OSRM often returns no alternative on short urban routes.
        // In that case, force a real recalculated route via a detour point and ask OSRM again.
        if (incidentReroute && !alternativePoints.length && points.length > 4) {
          try {
            const incidentIdx = Math.max(1, Math.floor(points.length * 0.52));
            const incidentPoint = points[incidentIdx];
            const destinationPoint = orderedCoords[orderedCoords.length - 1];
            const detourPoint = buildDetourPoint(incidentPoint, destinationPoint);

            if (detourPoint) {
              alternativePoints = await fetchOsrmRoute(
                [incidentPoint, detourPoint, destinationPoint],
                controller.signal
              );
            }
          } catch (rerouteError) {
            console.warn("Forced incident reroute unavailable:", rerouteError);
            alternativePoints = [];
          }
        }

        if (!cancelled) {
          setRoutePoints(points);
          setAlternativeRoutePoints(alternativePoints);
          setRouteSource(
            alternativePoints.length ? "OSRM + reroute incident" : "OSRM"
          );
        }
      } catch (err) {
        if (cancelled || err?.name === "AbortError") return;
        console.warn("OSRM route unavailable:", err);
        setRoutePoints([]);
        setAlternativeRoutePoints([]);
        setRouteSource("OSRM indisponible");
      }
    }

    const t = setTimeout(load, 100);
    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(t);
    };
  }, [fromCity, toCity, waypointKey, hasRoute, incidentReroute]);

  const incidentIndex =
    incidentReroute && routePoints.length > 4
      ? Math.max(1, Math.floor(routePoints.length * 0.52))
      : -1;

  const routeBefore =
    incidentIndex > 0 ? routePoints.slice(0, incidentIndex + 1) : routePoints;

  // Real incident alternative: OSRM route alternative if available.
  // If OSRM returns no alternative, we keep the original route and only show the incident marker.
  const hasRealAlternative = incidentIndex > 0 && alternativeRoutePoints.length > 1;
  const routeAfter = hasRealAlternative ? alternativeRoutePoints : [];
  const blockedBranch = incidentIndex > 0 ? routePoints.slice(incidentIndex) : [];

  const incidentPt =
    incidentIndex > 0 && blockedBranch.length > 1
      ? blockedBranch[
          Math.min(
            Math.floor(blockedBranch.length * 0.28),
            blockedBranch.length - 1
          )
        ]
      : null;
  const fitPoints =
    routePoints.length > 1
      ? [
          ...routePoints,
          ...extraMarkers.map((m) => m.coords).filter(Boolean),
        ]
      : [
          ...fullRouteCoords,
          ...extraMarkers.map((m) => m.coords).filter(Boolean),
        ];

  const fitKey = [
    fromCity || "",
    toCity || "",
    waypointKey || "",
    hasRoute ? "route" : "selection",
    incidentReroute ? "incident" : "normal",
  ].join("|");

  // All cities as quiet background markers
  const selectedCityKeys = new Set([fromCity, toCity, ...(waypointCities || [])].filter(Boolean));
  const backgroundCities = Object.entries(cityCoords).filter(
    ([key]) => !selectedCityKeys.has(key)
  );

  return (
    <div
      className="relative z-0 isolate w-full overflow-hidden rounded-2xl"
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

        {/* Background city dots: clickable before optimization */}
        {backgroundCities.map(([key, coords]) => (
          <Marker
            key={key}
            position={coords}
            icon={cityMarkerIcon({ kind: "dot", label: !canShowRoute ? cities[key]?.label : "" })}
            eventHandlers={
              !canShowRoute && onSelectCity
                ? { click: () => onSelectCity(key) }
                : undefined
            }
          >
            {!canShowRoute ? (
              <Popup>
                <strong>{cities[key]?.label || key}</strong>
                <br />
                Cliquez pour sélectionner cette ville.
              </Popup>
            ) : null}
          </Marker>
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


        {/* Extra vehicle markers: used by Livraisons to show en route, charging, and depot vehicles */}
        {extraMarkers.map((marker) =>
          marker.coords ? (
            <Marker
              key={marker.id}
              position={marker.coords}
              icon={vehicleStatusIcon({
                status: marker.status,
                incident: marker.incident,
                label: marker.label,
              })}
              zIndexOffset={marker.status === "en_route" ? 900 : 700}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <div style={{ fontSize: 13, fontWeight: 900 }}>
                    {marker.title || marker.label}
                  </div>
                  <div style={{ fontSize: 12, marginTop: 4, opacity: 0.8 }}>
                    {marker.description}
                  </div>
                </div>
              </Popup>
            </Marker>
          ) : null
        )}


        {/* Waypoint stops */}
        {waypointCoords.map((wp, index) => (
          <Marker
            key={`waypoint-${wp.key}-${index}`}
            position={wp.coords}
            icon={cityMarkerIcon({
              kind: "dot",
              label: `Arrêt ${index + 1} · ${cities[wp.key]?.label || wp.key}`,
            })}
          />
        ))}

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
            {/* main line: animated via JS so the dash flow works in dev and prod */}
            {incidentIndex > 0 ? (
              <>
                <AnimatedRoutePolyline
                  positions={routeBefore}
                  color={routeVisual.main}
                  weight={5.5}
                  dash="18 18"
                  speed={45}
                />
                <AnimatedRoutePolyline
                  positions={blockedBranch}
                  color="#fb7185"
                  weight={4}
                  dash="10 14"
                  speed={30}
                  opacity={hasRealAlternative ? 0.72 : 0.45}
                />
                {hasRealAlternative ? (
                  <AnimatedRoutePolyline
                    positions={routeAfter}
                    color="#a3e635"
                    weight={5.5}
                    dash="18 18"
                    speed={45}
                  />
                ) : null}
              </>
            ) : (
              <AnimatedRoutePolyline
                positions={routePoints}
                color={routeVisual.main}
                weight={5.5}
                dash="18 18"
                speed={45}
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

            {/* Truck shown only where explicitly requested, such as delivery tracking. */}
            {showTruck ? (
              showStaticTruck ? (
                <Marker
                  position={
                    routePoints[
                      Math.floor(routePoints.length * truckStartProgress)
                    ] || routePoints[0]
                  }
                  icon={truckIcon()}
                />
              ) : (
                <TruckLayer
                  active={canShowRoute && showTruck}
                  routePoints={routePoints}
                  startProgress={truckStartProgress}
                />
              )
            ) : null}
            <FitBounds points={fitPoints} fitKey={fitKey} />
          </>
        ) : null}

        {/* No-route FitBounds: keeps selected départ, arrêts and destination visible before optimization */}
        {!canShowRoute && fitPoints.length >= 2 ? <FitBounds points={fitPoints} fitKey={fitKey} /> : null}
      </MapContainer>

      {/* OVERLAY CARDS */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none z-[20]">
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
            Incident · recalcul IA · ETA 13:34
          </div>
        ) : null}
      </div>    </div>
  );
}
