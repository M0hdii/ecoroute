import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { cities, cityCoords } from "../lib/data";
import { getCityCoords, getCityLabel } from "../lib/helpers";

/* ---------- Leaflet DivIcon builders ---------- */

function buildCityIcon({ accent = "#94a3b8", label, size = 12, primary = false }) {
  const ring = primary ? 18 : 12;
  return L.divIcon({
    className: "",
    iconSize: [0, 0],
    html: `
      <div style="
        position: relative;
        width: ${ring}px;
        height: ${ring}px;
        transform: translate(-${ring / 2}px, -${ring / 2}px);
      ">
        <div style="
          position: absolute; inset: 0;
          border-radius: 999px;
          background: ${accent}33;
          border: 1px solid ${accent}AA;
          box-shadow: 0 0 ${primary ? 14 : 6}px ${accent}AA;
          ${primary ? "animation: pulse-dot 1.8s ease-in-out infinite;" : ""}
        "></div>
        <div style="
          position: absolute;
          left: 50%; top: 50%;
          transform: translate(-50%, -50%);
          width: ${size / 2}px; height: ${size / 2}px;
          border-radius: 999px;
          background: ${accent};
        "></div>
        ${
          label
            ? `<div style="
                position: absolute;
                left: 50%;
                top: calc(100% + 6px);
                transform: translateX(-50%);
                font-size: 10px;
                font-weight: 700;
                color: #e2e8f0;
                background: rgba(11,17,32,0.85);
                border: 1px solid rgba(148,163,184,0.18);
                border-radius: 6px;
                padding: 2px 6px;
                white-space: nowrap;
                box-shadow: 0 6px 16px rgba(0,0,0,0.4);
              ">${label}</div>`
            : ""
        }
      </div>
    `,
  });
}

function buildTruckIcon() {
  return L.divIcon({
    className: "",
    iconSize: [0, 0],
    html: `
      <div style="
        transform: translate(-14px, -14px);
        width: 28px; height: 28px;
        border-radius: 999px;
        background: linear-gradient(135deg, #34d399, #22d3ee);
        border: 2px solid #041814;
        box-shadow: 0 6px 16px rgba(52,211,153,0.55);
        display: flex; align-items: center; justify-content: center;
        font-size: 14px;
      ">🚚</div>
    `,
  });
}

function buildIncidentIcon() {
  return L.divIcon({
    className: "",
    iconSize: [0, 0],
    html: `
      <div style="
        transform: translate(-13px, -13px);
        width: 26px; height: 26px;
        border-radius: 999px;
        background: rgba(248,113,113,0.15);
        border: 2px solid #f87171;
        box-shadow: 0 0 18px rgba(248,113,113,0.7);
        display: flex; align-items: center; justify-content: center;
        animation: pulse-dot 1.2s ease-in-out infinite;
        color: #fecaca;
        font-size: 13px;
        font-weight: 800;
      ">!</div>
    `,
  });
}

/* ---------- Fitter ---------- */

function FitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points || points.length < 2) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 9 });
  }, [points, map]);
  return null;
}

/* ---------- Public component ---------- */

export function RouteMap({
  startCity,
  destinationCity,
  hasRoute = false,
  incidentMode = false,
  modeAccent = "#818cf8",
  height = 420,
}) {
  const from = getCityCoords(startCity);
  const to = getCityCoords(destinationCity);

  const center = from && to
    ? [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2]
    : [31.8, -7.0];

  const otherCityEntries = useMemo(
    () =>
      Object.entries(cityCoords).filter(
        ([key]) => key !== startCity && key !== destinationCity
      ),
    [startCity, destinationCity]
  );

  const fromIcon = useMemo(
    () =>
      buildCityIcon({
        accent: "#34d399",
        label: startCity ? getCityLabel(startCity) : null,
        size: 14,
        primary: true,
      }),
    [startCity]
  );
  const toIcon = useMemo(
    () =>
      buildCityIcon({
        accent: modeAccent,
        label: destinationCity ? getCityLabel(destinationCity) : null,
        size: 14,
        primary: true,
      }),
    [destinationCity, modeAccent]
  );
  const otherIcon = useMemo(
    () => buildCityIcon({ accent: "rgba(148,163,184,0.6)", size: 8 }),
    []
  );
  const truckIcon = useMemo(() => buildTruckIcon(), []);
  const incidentIcon = useMemo(() => buildIncidentIcon(), []);

  const routePoints = from && to && hasRoute ? [from, to] : null;

  const truckPos =
    routePoints && !incidentMode
      ? [
          from[0] + (to[0] - from[0]) * 0.55,
          from[1] + (to[1] - from[1]) * 0.55,
        ]
      : null;

  const incidentPos =
    routePoints && incidentMode
      ? [
          from[0] + (to[0] - from[0]) * 0.5,
          from[1] + (to[1] - from[1]) * 0.5,
        ]
      : null;

  const fitPoints = routePoints || [
    [35.9, -13.5],
    [27.0, -1.5],
  ];

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-white/10"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={6}
        className="eco-map"
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
        zoomControl
        attributionControl
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds points={fitPoints} />

        {/* Background city dots */}
        {otherCityEntries.map(([key, coords]) => (
          <Marker key={key} position={coords} icon={otherIcon}>
            <Tooltip direction="top" offset={[0, -6]} opacity={0.9}>
              {cities[key]?.label || key}
            </Tooltip>
          </Marker>
        ))}

        {/* Route */}
        {routePoints && (
          <>
            {/* halo under line */}
            <Polyline
              positions={routePoints}
              pathOptions={{
                color: modeAccent,
                weight: 9,
                opacity: 0.18,
              }}
            />
            {/* main line */}
            <Polyline
              positions={routePoints}
              pathOptions={{
                color: modeAccent,
                weight: 3,
                opacity: 0.95,
                dashArray: incidentMode ? "6 6" : null,
                className: "route-line-animated",
              }}
            />
          </>
        )}

        {/* Start / end markers */}
        {from && <Marker position={from} icon={fromIcon} />}
        {to && <Marker position={to} icon={toIcon} />}

        {/* Incident or truck */}
        {incidentPos && <Marker position={incidentPos} icon={incidentIcon} />}
        {truckPos && <Marker position={truckPos} icon={truckIcon} />}
      </MapContainer>

      {/* Floating legend */}
      <div className="absolute left-3 bottom-3 flex flex-wrap gap-2 z-[400]">
        <LegendChip color="#34d399" label={startCity ? getCityLabel(startCity) : "Départ"} />
        <LegendChip color={modeAccent} label={destinationCity ? getCityLabel(destinationCity) : "Destination"} />
        {incidentMode && (
          <LegendChip color="#f87171" label="Incident actif" pulse />
        )}
        {hasRoute && !incidentMode && (
          <LegendChip color="#22d3ee" label="Camion en mouvement" pulse />
        )}
      </div>
    </div>
  );
}

function LegendChip({ color, label, pulse = false }) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
      style={{
        background: "rgba(11,17,32,0.82)",
        border: "1px solid rgba(148,163,184,0.18)",
        color: "#e2e8f0",
        backdropFilter: "blur(6px)",
      }}
    >
      <span
        className={pulse ? "anim-pulse-dot" : ""}
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: color,
          boxShadow: `0 0 8px ${color}`,
        }}
      />
      {label}
    </div>
  );
}
