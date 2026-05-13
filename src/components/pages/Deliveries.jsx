import {
  Package,
  Clock,
  MapPin,
  ChevronRight,
  ShieldAlert,
  Truck,
  Route,
} from "lucide-react";
import { cityCoords, deliveryStops, fleetVehicles } from "../../lib/constants";
import {
  priorityBadge,
} from "../../lib/helpers";
import { Card, Badge } from "../ui/Primitives";
import RealMap from "../map/RealMap";

const VEHICLE_STATUS_COPY = {
  en_route: {
    label: "En route",
    hint: "Camion en mouvement",
    badgeColor: "eco",
  },
  loading: {
    label: "Chargement",
    hint: "En cours de chargement au dépôt",
    badgeColor: "sand",
  },
  idle: {
    label: "Au dépôt",
    hint: "Stationné au dépôt / warehouse",
    badgeColor: "slate",
  },
  maintenance: {
    label: "Maintenance",
    hint: "Indisponible",
    badgeColor: "coral",
  },
};

function vehicleStatusInfo(status) {
  return VEHICLE_STATUS_COPY[status] || VEHICLE_STATUS_COPY.idle;
}

function vehicleRouteLabel(vehicle) {
  if (!vehicle) return "—";
  if (vehicle.status === "idle" || vehicle.to === "—") return vehicle.to && vehicle.to !== "—" ? `${vehicle.from} → ${vehicle.to}` : `${vehicle.from} · dépôt`;
  return `${vehicle.from} → ${vehicle.to}`;
}


function markerCoordsForVehicle(vehicle) {
  if (!vehicle) return null;

  const from = cityCoords[vehicle.from];
  const to = vehicle.to && vehicle.to !== "—" ? cityCoords[vehicle.to] : null;

  if (vehicle.status === "en_route" && from && to) {
    const progress = Math.max(0.05, Math.min(0.95, vehicle.progress || 0.45));
    return [
      from[0] + (to[0] - from[0]) * progress,
      from[1] + (to[1] - from[1]) * progress,
    ];
  }

  return from || to || null;
}

function deliveryForVehicle(vehicle, index) {
  const linked = deliveryStops.find(
    (d) => d.vehicleId === vehicle.id || d.truckId === vehicle.id
  );

  if (linked) {
    return {
      ...linked,
      vehicleId: vehicle.id,
      city: vehicle.to && vehicle.to !== "—" ? vehicle.to : vehicle.from,
      window: linked.window || (vehicle.eta ? `ETA ${vehicle.eta}` : "—"),
      status: linked.status || vehicleStatusInfo(vehicle.status).label,
      incident: linked.incident || vehicle.incident || false,
    };
  }

  return {
    stop: index + 1,
    client:
      vehicle.status === "loading"
        ? `Préparation ${vehicle.id}`
        : vehicle.status === "idle"
          ? `Dépôt ${vehicle.from}`
          : `Tournée ${vehicle.id}`,
    city: vehicle.to && vehicle.to !== "—" ? vehicle.to : vehicle.from,
    window: vehicle.status === "idle" ? "En attente" : vehicle.eta ? `ETA ${vehicle.eta}` : "—",
    priority: vehicle.incident ? "Haute" : vehicle.status === "en_route" ? "Haute" : vehicle.status === "loading" ? "Moyenne" : "Normale",
    status: vehicle.incident ? "Incident · en route" : vehicleStatusInfo(vehicle.status).label,
    vehicleId: vehicle.id,
    incident: vehicle.incident || false,
  };
}

export default function Deliveries({ selectedDelivery, onSelectDelivery }) {
  const deliveryFleetRows = fleetVehicles.map((vehicle, index) => ({
    vehicle,
    delivery: deliveryForVehicle(vehicle, index),
    statusInfo: vehicleStatusInfo(vehicle.status),
  }));

  const enRouteCount = fleetVehicles.filter((v) => v.status === "en_route").length;
  const loadingCount = fleetVehicles.filter((v) => v.status === "loading").length;
  const depotCount = fleetVehicles.filter((v) => v.status === "idle").length;

  const selectedVehicle =
    selectedDelivery?.vehicle ||
    fleetVehicles.find((v) => v.id === selectedDelivery?.vehicleId) ||
    null;

  const selectedRow =
    deliveryFleetRows.find((row) => row.vehicle.id === selectedVehicle?.id) ||
    null;

  const mapStartCity = selectedVehicle?.from || "";
  const mapDestinationCity =
    selectedVehicle?.to && selectedVehicle.to !== "—"
      ? selectedVehicle.to
      : selectedVehicle?.from || "";

  const selectedMapMarkers =
    selectedVehicle && selectedVehicle.status !== "en_route"
      ? [
          {
            id: selectedVehicle.id,
            coords: markerCoordsForVehicle(selectedVehicle),
            status: selectedVehicle.status,
            incident: selectedVehicle.incident,
            label: selectedVehicle.id,
            title: `${selectedVehicle.id} · ${selectedVehicle.driver}`,
            description:
              selectedVehicle.status === "loading"
                ? `Chargement au dépôt de ${selectedVehicle.from} avant départ vers ${selectedVehicle.to}`
                : `Au dépôt / warehouse de ${selectedVehicle.from} · trajet prévu vers ${selectedVehicle.to || "—"}`,
          },
        ]
      : [];

  return (
    <div className="p-5 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* --- LIST --- */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-eco-300">
                Tournée du jour · synchronisée avec Flotte
              </div>
              <h2 className="font-display font-bold text-2xl tracking-tight mt-1">
                {fleetVehicles.length} véhicules suivis · {enRouteCount} en route · {loadingCount} chargement · {depotCount} dépôt
              </h2>
            </div>
            <div className="hidden xl:flex flex-wrap gap-2 justify-end">
              <Badge color="eco">{enRouteCount} en route</Badge>
              <Badge color="sand">{loadingCount} chargement</Badge>
              <Badge color="slate">{depotCount} dépôt</Badge>
            </div>
          </div>

          <div className="space-y-3">
            {deliveryFleetRows.map(({ vehicle, delivery: d, statusInfo }) => {
              const pb = priorityBadge(d.priority);
              const isActive = selectedVehicle?.id === vehicle.id;
              const incident = d.incident || vehicle.incident;
              return (
                <button
                  key={vehicle.id}
                  onClick={() => onSelectDelivery({ ...d, vehicle })}
                  className={`w-full text-left card-glass p-4 transition-all hover:border-white/20 ${
                    isActive ? "border-eco-300/50" : ""
                  }`}
                  style={
                    isActive
                      ? {
                          boxShadow:
                            "0 12px 40px rgba(52,211,153,0.15), inset 0 0 0 1px rgba(52,211,153,0.35)",
                        }
                      : {}
                  }
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm shrink-0 ${
                        incident
                          ? "bg-coral-500/15 text-coral-400 border border-coral-500/30"
                          : vehicle.status === "en_route"
                            ? "bg-eco-400/15 text-eco-300 border border-eco-400/30"
                            : vehicle.status === "loading"
                              ? "bg-sand-500/15 text-sand-300 border border-sand-500/30"
                              : "bg-white/5 text-white/50 border border-white/10"
                      }`}
                    >
                      {d.stop}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-display font-bold text-base">
                            {d.client}
                          </div>
                          <div className="mt-0.5 text-[11px] text-white/45">
                            {vehicle.id} · {vehicle.driver}
                          </div>
                        </div>

                        <span
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0"
                          style={{
                            color: pb.color,
                            background: pb.bg,
                            borderColor: `${pb.color}40`,
                          }}
                        >
                          {d.priority}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/60">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={11} />
                          {vehicleRouteLabel(vehicle)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} />
                          {d.window}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/45">
                          Statut · {d.status}
                        </span>
                        <Badge
                          color={incident ? "coral" : statusInfo.badgeColor}
                          icon={incident ? ShieldAlert : vehicle.status === "loading" ? Package : Truck}
                        >
                          {incident ? "Incident" : statusInfo.label}
                        </Badge>
                      </div>
                    </div>

                    <ChevronRight
                      size={16}
                      className={
                        isActive ? "text-eco-300" : "text-white/30"
                      }
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* --- MAP + DETAIL --- */}
        <div className="lg:col-span-7 space-y-4">
          {!selectedVehicle ? (
            <Card className="p-4 border-dashed border-white/10 bg-white/[0.02]">
              <div className="text-sm text-white/60">
                Cliquez sur une livraison à gauche pour afficher son camion. Les véhicules en route s’animent sur la trajectoire réelle ; les véhicules en chargement ou au dépôt restent fixes.
              </div>
            </Card>
          ) : null}

          <div className="h-[420px] lg:h-[520px]">
            <RealMap
              fromCity={mapStartCity}
              toCity={mapDestinationCity}
              waypointCities={[]}
              hasRoute={Boolean(selectedVehicle && mapStartCity && mapDestinationCity && mapStartCity !== mapDestinationCity)}
              routeMode="ai"
              incidentReroute={selectedVehicle?.incident}
              incidentLabel="Incident détecté : recalcul IA actif"
              showStaticTruck={false}
              truckStartProgress={selectedVehicle?.progress || 0.45}
              showTruck={Boolean(selectedVehicle?.status === "en_route")}
              extraMarkers={selectedMapMarkers}
            />
          </div>

          <Card className="p-5">
            <div className="flex items-start gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedVehicle?.incident
                    ? "bg-coral-500/15 text-coral-400 border border-coral-500/30"
                    : selectedVehicle?.status === "en_route"
                      ? "bg-eco-400/15 text-eco-300 border border-eco-400/30"
                      : selectedVehicle?.status === "loading"
                        ? "bg-sand-500/15 text-sand-300 border border-sand-500/30"
                        : "bg-white/5 text-white/55 border border-white/10"
                }`}
              >
                {selectedVehicle?.incident ? (
                  <ShieldAlert size={20} />
                ) : selectedVehicle?.status === "loading" ? (
                  <Package size={20} />
                ) : (
                  <Truck size={20} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">
                  Détail véhicule
                </div>
                <h3 className="font-display font-bold text-xl mt-1">
                  {selectedVehicle?.id} · {selectedVehicle?.driver}
                </h3>
                <p className="text-sm text-white/60 mt-1">
                  {vehicleRouteLabel(selectedVehicle)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge
                    color={selectedVehicle?.incident ? "coral" : vehicleStatusInfo(selectedVehicle?.status).badgeColor}
                    icon={selectedVehicle?.incident ? ShieldAlert : selectedVehicle?.status === "loading" ? Package : Truck}
                  >
                    {selectedVehicle?.incident ? "Incident en route" : vehicleStatusInfo(selectedVehicle?.status).label}
                  </Badge>
                  <Badge color="slate">ETA {selectedVehicle?.eta || "—"}</Badge>
                  <Badge color="slate">Charge {selectedVehicle?.load ?? 0}%</Badge>
                  <Badge color="slate">Carburant {selectedVehicle?.fuel ?? 0}%</Badge>
                </div>

                {selectedVehicle?.incident ? (
                  <div className="mt-4 rounded-xl border border-coral-500/25 bg-coral-500/10 p-3 text-sm text-coral-300">
                    Incident détecté sur la tournée : recalcul IA actif. Le véhicule reste en mouvement vers {selectedVehicle?.to}.
                  </div>
                ) : selectedVehicle?.status === "loading" ? (
                  <div className="mt-4 rounded-xl border border-sand-500/25 bg-sand-500/10 p-3 text-sm text-sand-300">
                    Véhicule en chargement au dépôt avant départ vers {selectedVehicle?.to}.
                  </div>
                ) : selectedVehicle?.status === "idle" ? (
                  <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-white/55">
                    Véhicule stationné au dépôt / warehouse de {selectedVehicle?.from}. Trajet prévu vers {selectedVehicle?.to}.
                  </div>
                ) : null}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
