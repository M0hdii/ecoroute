import {
  Package,
  Clock,
  MapPin,
  ChevronRight,
  ShieldAlert,
  CheckCircle2,
  TimerReset,
  Truck,
  Route,
} from "lucide-react";
import { deliveryStops } from "../../lib/constants";
import {
  priorityBadge,
  getDeliveryStartCityKey,
  getDeliveryDestinationCityKey,
  hasDeliveryIncident,
  getDeliveryIncidentText,
  getDeliveryEtaUpdate,
} from "../../lib/helpers";
import { Card, Badge } from "../ui/Primitives";
import RealMap from "../map/RealMap";

export default function Deliveries({ selectedDelivery, onSelectDelivery }) {
  return (
    <div className="p-5 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* --- LIST --- */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-eco-300">
                Tournée du jour
              </div>
              <h2 className="font-display font-bold text-2xl tracking-tight mt-1">
                {deliveryStops.length} arrêts · 4 clients
              </h2>
            </div>
            <Badge color="eco">Planifié</Badge>
          </div>

          <div className="space-y-3">
            {deliveryStops.map((d) => {
              const pb = priorityBadge(d.priority);
              const isActive = selectedDelivery?.stop === d.stop;
              const incident = hasDeliveryIncident(d);
              return (
                <button
                  key={d.stop}
                  onClick={() => onSelectDelivery(d)}
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
                          : "bg-eco-400/15 text-eco-300 border border-eco-400/30"
                      }`}
                    >
                      {d.stop}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-display font-bold text-base">
                          {d.client}
                        </div>
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                          style={{
                            color: pb.color,
                            background: pb.bg,
                            borderColor: `${pb.color}40`,
                          }}
                        >
                          {d.priority}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-white/60">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={11} />
                          {d.city}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} />
                          {d.window}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white/45">
                          Statut · {d.status}
                        </span>
                        {incident ? (
                          <Badge color="coral" icon={ShieldAlert}>
                            Incident
                          </Badge>
                        ) : null}
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

        {/* --- DETAIL --- */}
        <div className="lg:col-span-7 space-y-5">
          {selectedDelivery ? (
            <DeliveryDetail delivery={selectedDelivery} />
          ) : (
            <Card className="p-10 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl eco-gradient-bg text-ink-950 mb-4">
                <Package size={22} />
              </div>
              <h3 className="font-display font-bold text-lg">
                Sélectionnez une livraison
              </h3>
              <p className="text-sm text-white/55 mt-2 max-w-md mx-auto">
                Cliquez sur une carte à gauche pour afficher le trajet, l'ETA et
                les éventuels incidents détectés par l'IA.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function DeliveryDetail({ delivery }) {
  const fromCity = getDeliveryStartCityKey(delivery);
  const toCity = getDeliveryDestinationCityKey(delivery);
  const incident = hasDeliveryIncident(delivery);
  const eta = getDeliveryEtaUpdate(delivery);

  return (
    <>
      <Card className="p-2 overflow-hidden">
        <RealMap
          fromCity={fromCity}
          toCity={toCity}
          hasRoute={true}
          routeMode="ai"
          incidentReroute={incident}
          incidentLabel={getDeliveryIncidentText(delivery)}
          showStaticTruck={false}
          truckStartProgress={0.35}
          height={460}
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/55 mb-2">
            <Truck size={13} />
            Véhicule
          </div>
          <div className="font-display font-bold text-lg">
            TRK-{200 + delivery.stop}
          </div>
          <div className="text-xs text-white/50 mt-1">
            Chauffeur : A. {delivery.client.slice(-1)}.
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/55 mb-2">
            <Route size={13} />
            Trajet
          </div>
          <div className="font-display font-bold text-lg">
            {fromCity} → {toCity}
          </div>
          <div className="text-xs text-white/50 mt-1">
            Fenêtre {delivery.window}
          </div>
        </Card>
        <Card
          className="p-5 relative overflow-hidden"
          style={{
            borderColor: incident
              ? "rgba(251,113,133,0.35)"
              : "rgba(52,211,153,0.3)",
          }}
        >
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/55 mb-2">
            <TimerReset size={13} />
            ETA
          </div>
          {incident && eta ? (
            <>
              <div className="font-display font-bold text-lg">
                <span className="text-white/40 line-through mr-2">
                  {eta.oldEta}
                </span>
                <span className="text-coral-400">{eta.newEta}</span>
              </div>
              <div className="text-xs text-coral-400 mt-1 font-semibold">
                +{eta.delayMinutes} min · {eta.status}
              </div>
            </>
          ) : (
            <>
              <div className="font-display font-bold text-lg text-eco-300">
                13:05
              </div>
              <div className="text-xs text-eco-300 mt-1 inline-flex items-center gap-1">
                <CheckCircle2 size={12} />
                Dans la fenêtre
              </div>
            </>
          )}
        </Card>
      </div>

      {incident ? (
        <Card
          className="p-5 relative overflow-hidden"
          style={{
            borderColor: "rgba(251,113,133,0.35)",
            background:
              "linear-gradient(135deg, rgba(251,113,133,0.10), transparent 70%)",
          }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-coral-500/15 border border-coral-500/30 text-coral-400 flex items-center justify-center shrink-0">
              <ShieldAlert size={18} />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-coral-400 mb-0.5">
                Incident détecté
              </div>
              <h4 className="font-display font-bold text-base">
                Trajectoire recalculée par l'IA
              </h4>
              <p className="text-sm text-white/65 mt-1 leading-relaxed">
                {getDeliveryIncidentText(delivery)}
              </p>
              {eta ? (
                <p className="text-xs text-white/55 mt-2">
                  Marge avant fin de fenêtre : {eta.marginMinutes} min · motif :{" "}
                  {eta.reason}.
                </p>
              ) : null}
            </div>
          </div>
        </Card>
      ) : null}
    </>
  );
}
