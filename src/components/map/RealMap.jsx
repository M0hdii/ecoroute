import { useEffect, useMemo, useRef, useState } from "react";
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
import { useT } from "../../lib/i18n";

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
  Sweeping-shimmer route style:
  - A clean solid line with a soft outer halo.
  - Four short bright highlights slide along the path on a continuous loop,
    evenly spaced and graduated in brightness so the route feels populated
    without turning into a dashed pattern.
*/
function AnimatedRoutePolyline({
  positions,
  color,
  weight = 5.5,
  speed = 360, // SVG units per second the shimmer travels
  opacity = 1,
  // Legacy prop, ignored.
  // eslint-disable-next-line no-unused-vars
  dash,
}) {
  const shimmerRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];
  const offsetRef = useRef(0);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(null);

  // Lighter tint of the main color for the shimmers.
  const shimmerColor = useMemo(() => {
    if (!color || !color.startsWith("#") || color.length !== 7) return "#ffffff";
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const mix = (c) => Math.round(c + (255 - c) * 0.7);
    return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
  }, [color]);

  useEffect(() => {
    const segLen = 95; // length of each shimmer segment in SVG units
    const gap = 2400; // gap between cycles per polyline
    const cycle = segLen + gap;
    const count = shimmerRefs.length;
    const stagger = cycle / count;

    function tick(now) {
      if (lastTimeRef.current == null) lastTimeRef.current = now;
      const elapsed = now - lastTimeRef.current;
      lastTimeRef.current = now;

      offsetRef.current -= (elapsed / 1000) * speed;
      if (offsetRef.current < -cycle) offsetRef.current += cycle;

      for (let i = 0; i < count; i += 1) {
        const path = shimmerRefs[i].current?._path;
        if (!path) continue;
        path.setAttribute("stroke-dasharray", `${segLen} ${gap}`);
        path.setAttribute(
          "stroke-dashoffset",
          String(offsetRef.current - i * stagger)
        );
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed]);

  // All four shimmers share the same bright styling so the flow reads as a
  // continuous bright stream rather than a fading head/tail.
  const shimmerStyles = [
    { weightMul: 1.05, op: 0.95 },
    { weightMul: 1.05, op: 0.95 },
    { weightMul: 1.05, op: 0.95 },
    { weightMul: 1.05, op: 0.95 },
  ];

  return (
    <>
      {/* Soft outer halo */}
      <Polyline
        positions={positions}
        pathOptions={{
          color,
          weight: weight * 2.2,
          opacity: 0.14 * opacity,
          lineCap: "round",
          lineJoin: "round",
        }}
      />
      {/* Clean solid base line */}
      <Polyline
        positions={positions}
        pathOptions={{
          color,
          weight,
          opacity: 0.95 * opacity,
          lineCap: "round",
          lineJoin: "round",
        }}
      />
      {/* Stream of shimmers */}
      {shimmerStyles.map((s, i) => (
        <Polyline
          key={i}
          ref={shimmerRefs[i]}
          positions={positions}
          pathOptions={{
            color: shimmerColor,
            weight: weight * s.weightMul,
            opacity: s.op * opacity,
            lineCap: "round",
            lineJoin: "round",
          }}
        />
      ))}
    </>
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

function TruckLayer({ active, routePoints, startProgress, followTruck = false }) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  // When the user drags or zooms, pause auto-follow until they hit "recentrer".
  const userInteractedRef = useRef(false);
  const programmaticPanRef = useRef(false);

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
    // dragstart fires only on user-initiated panning.
    dragstart: () => {
      userInteractedRef.current = true;
    },
    // movestart fires for both user and programmatic moves; we only flag
    // the user's by ignoring the move we initiated ourselves.
    movestart: () => {
      if (programmaticPanRef.current) {
        programmaticPanRef.current = false;
        return;
      }
    },
  });

  // Reset interaction lock when follow mode toggles or the route changes.
  const routeKey = routePoints?.length || 0;
  useEffect(() => {
    userInteractedRef.current = false;
  }, [followTruck, routeKey]);

  // When follow turns on, zoom in close to the truck so it's actually useful.
  const wasFollowingRef = useRef(false);
  useEffect(() => {
    if (followTruck && !wasFollowingRef.current && active && routePoints?.length > 1) {
      const truckNow = getPointAtProgress(routePoints, startProgress);
      if (truckNow) {
        programmaticPanRef.current = true;
        map.setView(truckNow, Math.max(map.getZoom(), 11), { animate: true });
      }
    }
    wasFollowingRef.current = followTruck;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followTruck, active]);

  const progress = useTruckProgress(active, routePoints, startProgress, zoom);

  // Pan the map to keep the truck on screen when follow is on and the user
  // hasn't manually moved the map.
  const truckPos = active ? getPointAtProgress(routePoints, progress) : null;
  useEffect(() => {
    if (!followTruck || !active || !truckPos) return;
    if (userInteractedRef.current) return;

    // Only pan if the truck has actually moved off-center to avoid jitter.
    const center = map.getCenter();
    const dLat = Math.abs(center.lat - truckPos[0]);
    const dLng = Math.abs(center.lng - truckPos[1]);
    if (dLat < 0.005 && dLng < 0.005) return;

    programmaticPanRef.current = true;
    map.panTo(truckPos, { animate: true, duration: 0.6 });
  }, [followTruck, active, truckPos, map]);

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

// Build a perpendicular detour midpoint between two points. Direction controls
// which side of the direct line the detour bends toward, so two synthesized
// alternatives (eco vs ai) clearly diverge on the map.
function buildDetourMidpoint(fromPoint, toPoint, direction = 1, strength = 0.4) {
  if (!fromPoint || !toPoint) return null;

  const [fromLat, fromLng] = fromPoint;
  const [toLat, toLng] = toPoint;

  const midLat = (fromLat + toLat) / 2;
  const midLng = (fromLng + toLng) / 2;

  const dLat = toLat - fromLat;
  const dLng = toLng - fromLng;
  const length = Math.sqrt(dLat * dLat + dLng * dLng) || 1;

  // The perpendicular vector. Direction flips the side.
  const perpLat = (-dLng / length) * direction;
  const perpLng = (dLat / length) * direction;

  // Offset proportional to the leg length so short city hops still reroute
  // visibly while long corridors don't get pulled across the country.
  const offset = Math.max(0.08, Math.min(0.35, length * strength));

  return [midLat + perpLat * offset, midLng + perpLng * offset];
}

// Synthesize a per-mode alternative by asking OSRM to route through a forced
// midpoint. Used when OSRM only returns one real alternative.
async function fetchSynthesizedAlternative(orderedCoords, direction, strength, signal) {
  if (orderedCoords.length < 2) return [];
  const start = orderedCoords[0];
  const end = orderedCoords[orderedCoords.length - 1];
  const mid = buildDetourMidpoint(start, end, direction, strength);
  if (!mid) return [];

  // Insert the detour midpoint between start and end while preserving any
  // user-supplied intermediate stops.
  const viaPoints = [
    start,
    ...orderedCoords.slice(1, -1),
    mid,
    end,
  ];

  try {
    return await fetchOsrmRoute(viaPoints, signal);
  } catch {
    return [];
  }
}


/* ---------- Main component ---------- */
export default function RealMap({
  fromCity,
  toCity,
  waypointCities = EMPTY_WAYPOINTS,
  hasRoute,
  routeMode = "ai",
  // When true (Planner), the map keeps a separate geometry per mode so
  // switching between Rapide / IA / Éco visibly swaps polylines. Other pages
  // (Deliveries, Fleet) want a single direct OSRM route — we don't want a
  // synthesized perpendicular detour bending the truck through random cities.
  enableModeAlternatives = false,
  incidentReroute = false,
  incidentLabel = "Incident détecté",
  truckStartProgress = 0.35,
  showStaticTruck = false,
  height = 480,
  onSelectCity,
  showTruck = false,
  // When true, the map auto-pans to keep the truck visible. Used by
  // Livraisons so the dispatcher's view follows the vehicle.
  followTruck = false,
  extraMarkers = EMPTY_MARKERS,
}) {
  const t = useT();
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
  // routesByMode caches the OSRM geometries per visual mode. Switching modes
  // just picks a different cached geometry, so the map never re-fetches and
  // the line never blanks on mode change.
  const [routesByMode, setRoutesByMode] = useState({
    ai: [],
    eco: [],
    classic: [],
  });
  const [alternativeRoutePoints, setAlternativeRoutePoints] = useState([]);
  const [routeSource, setRouteSource] = useState("none");

  const routePoints =
    routesByMode[routeMode]?.length
      ? routesByMode[routeMode]
      : routesByMode.ai?.length
        ? routesByMode.ai
        : routesByMode.classic?.length
          ? routesByMode.classic
          : routesByMode.eco || [];

  // Visual palette per mode
  const routeVisual = useMemo(() => {
    if (routeMode === "eco")
      return { main: "#34d399", glow: "#6ee7b7", label: "Mode éco" };
    if (routeMode === "classic")
      return { main: "#38bdf8", glow: "#93c5fd", label: "Trajet rapide" };
    return { main: "#a3e635", glow: "#d9f99d", label: "IA optimisée" };
  }, [routeMode]);

  // Track the previous route signature so we can clear stale geometry only
  // when the actual cities change (different truck / new route), not on mode
  // switches where we want to keep the line visible while the new mode loads.
  const prevSigRef = useRef("");

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

    // Signature for "this is a different route". When it changes, drop the
    // stale geometry immediately so the previous truck's path doesn't render
    // with the new truck's position.
    const sig = `${fromCity || ""}|${toCity || ""}|${waypointKey}|${incidentReroute ? "i" : ""}`;
    if (sig !== prevSigRef.current) {
      prevSigRef.current = sig;
      setRoutesByMode({ ai: [], eco: [], classic: [] });
      setAlternativeRoutePoints([]);
    }

    async function load() {
      if (!can) {
        setRoutesByMode({ ai: [], eco: [], classic: [] });
        setAlternativeRoutePoints([]);
        return;
      }
      // Use OSRM only so localhost and Vercel draw the same road route.
      // Keep previous routePoints visible until the new fetch resolves so the
      // line doesn't visually break on re-renders (e.g. mode switches).
      setRouteSource("loading");
      try {
        const coordString = orderedCoords
          .map((coords) => `${coords[1]},${coords[0]}`)
          .join(";");
        // Always request alternatives so each mode (Rapide / IA / Éco) can map
        // to a different real OSRM route when the road network offers them.
        const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?alternatives=3&steps=false&overview=full&geometries=geojson`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok || !data.routes?.[0]?.geometry?.coordinates?.length)
          throw new Error("OSRM unavailable");

        const allRoutes = (data.routes || [])
          .filter((r) => r?.geometry?.coordinates?.length)
          .map((r) => ({
            duration: r.duration,
            distance: r.distance,
            points: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
          }));

        // Build per-mode assignment from the alternatives.
        // - classic = the fastest (shortest duration)
        // - eco     = the most distinct alternative (slowest / longest, often avoids urban core)
        // - ai      = middle compromise, defaults to fastest if only one returned
        const byDuration = [...allRoutes].sort((a, b) => a.duration - b.duration);
        const fastest = byDuration[0];
        const slowest = byDuration[byDuration.length - 1];
        const middle =
          byDuration.length >= 3
            ? byDuration[Math.floor(byDuration.length / 2)]
            : null;

        const nextRoutesByMode = {
          classic: fastest?.points || [],
          eco:
            byDuration.length > 1 && slowest && slowest !== fastest
              ? slowest.points
              : fastest?.points || [],
          ai: (middle || fastest)?.points || [],
        };

        // OSRM's public demo often returns only one route. Synthesize visibly
        // different alternatives by routing through forced detour midpoints so
        // switching modes always changes the polyline on the map.
        // Skipped on pages that don't need mode-specific geometries (e.g. Deliveries),
        // where bending the route would create illogical detours.
        if (enableModeAlternatives) {
          const ecoSame =
            !nextRoutesByMode.eco.length ||
            nextRoutesByMode.eco === nextRoutesByMode.classic;
          const aiSame =
            !nextRoutesByMode.ai.length ||
            nextRoutesByMode.ai === nextRoutesByMode.classic;

          if (ecoSame) {
            const ecoSynth = await fetchSynthesizedAlternative(
              orderedCoords,
              +1,
              0.32,
              controller.signal
            );
            if (!cancelled && ecoSynth.length) nextRoutesByMode.eco = ecoSynth;
          }
          if (aiSame) {
            const aiSynth = await fetchSynthesizedAlternative(
              orderedCoords,
              -1,
              0.18,
              controller.signal
            );
            if (!cancelled && aiSynth.length) nextRoutesByMode.ai = aiSynth;
          }
        }

        // Incident handling stays compatible: keep the legacy alternativeRoutePoints
        // signal for the red branch + reroute polyline.
        let alternativePoints =
          incidentReroute && allRoutes[1]?.points?.length
            ? allRoutes[1].points
            : [];

        const primaryPoints = fastest?.points || [];

        if (incidentReroute && !alternativePoints.length && primaryPoints.length > 4) {
          try {
            const incidentIdx = Math.max(1, Math.floor(primaryPoints.length * 0.52));
            const incidentPoint = primaryPoints[incidentIdx];
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
          setRoutesByMode(nextRoutesByMode);
          setAlternativeRoutePoints(alternativePoints);
          setRouteSource(
            allRoutes.length > 1
              ? `OSRM · ${allRoutes.length} variantes`
              : "OSRM"
          );
        }
      } catch (err) {
        if (cancelled || err?.name === "AbortError") return;
        console.warn("OSRM route unavailable:", err);
        setRoutesByMode({ ai: [], eco: [], classic: [] });
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
  }, [fromCity, toCity, waypointKey, hasRoute, incidentReroute, enableModeAlternatives]);

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

  // The path the truck actually drives. With an incident reroute, that's the
  // segment before the obstacle stitched to the AI's recalculated detour —
  // not the original blocked road.
  const driverPath = hasRealAlternative
    ? [...routeBefore, ...routeAfter]
    : routePoints;

  // Incident pin sits in the middle of the blocked stretch — that's the
  // obstructed zone dispatchers actually care about. The fork point itself is
  // visually unhelpful because the reroute often shadows the original road
  // for a few hundred meters before peeling off.
  const incidentPt = (() => {
    if (incidentIndex <= 0) return null;
    const blocked = blockedBranch;
    if (!blocked.length) return null;
    // Midpoint of the blocked branch.
    return blocked[Math.floor(blocked.length * 0.5)] || blocked[0];
  })();
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
            {incidentIndex > 0 ? (
              <>
                <AnimatedRoutePolyline
                  positions={routeBefore}
                  color={routeVisual.main}
                  weight={5.5}
                  speed={250}
                />
                <AnimatedRoutePolyline
                  positions={blockedBranch}
                  color="#fb7185"
                  weight={4}
                  speed={110}
                  opacity={hasRealAlternative ? 0.6 : 0.4}
                />
                {hasRealAlternative ? (
                  <AnimatedRoutePolyline
                    positions={routeAfter}
                    color="#a3e635"
                    weight={5.5}
                    speed={250}
                  />
                ) : null}
              </>
            ) : (
              <AnimatedRoutePolyline
                positions={routePoints}
                color={routeVisual.main}
                weight={5.5}
                speed={250}
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
                    driverPath[
                      Math.floor(driverPath.length * truckStartProgress)
                    ] || driverPath[0]
                  }
                  icon={truckIcon()}
                />
              ) : (
                <TruckLayer
                  active={canShowRoute && showTruck}
                  routePoints={driverPath}
                  startProgress={truckStartProgress}
                  followTruck={followTruck}
                />
              )
            ) : null}
            {/* When the map is set to follow the truck, skip the auto-fit
                that would otherwise zoom out to show the whole route. */}
            {followTruck && showTruck ? null : (
              <FitBounds points={fitPoints} fitKey={fitKey} />
            )}
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
                {t("map.from")}
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
                {t("map.to")}
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
