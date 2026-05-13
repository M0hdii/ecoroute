import {
  Truck,
  Fuel,
  Package,
  Thermometer,
  MapPin,
  Clock,
  User,
  Gauge,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";
import { useState } from "react";
import { fleetVehicles } from "../../lib/constants";
import { Card, Badge, StatTile, StatusPill, LiveDot } from "../ui/Primitives";
import { Sparkline } from "../ui/Charts";

// Mock "past 8 hours" fuel trend per vehicle
const fuelTrend = {
  "TRK-201": [100, 96, 92, 85, 79, 74, 69, 64],
  "TRK-202": [100, 97, 93, 90, 87, 85, 83, 81],
  "TRK-203": [78, 80, 85, 88, 90, 92, 94, 95],
  "TRK-204": [82, 80, 78, 76, 75, 74, 73, 73],
};

export default function Fleet() {
  const [selected, setSelected] = useState(fleetVehicles[0]);

  const totalActive = fleetVehicles.filter((v) => v.status === "en_route").length;
  const avgFuel = Math.round(
    fleetVehicles.reduce((acc, v) => acc + v.fuel, 0) / fleetVehicles.length
  );
  const totalKm = fleetVehicles.reduce((acc, v) => acc + v.kmToday, 0);
  const avgLoad = Math.round(
    fleetVehicles.reduce((acc, v) => acc + v.load, 0) / fleetVehicles.length
  );

  return (
    <div className="p-5 md:p-8 space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatTile
          icon={Truck}
          label="Camions actifs"
          value={totalActive}
          suffix={`/${fleetVehicles.length}`}
          accent="#8aaa7a"
        />
        <StatTile
          icon={Gauge}
          label="Km aujourd'hui"
          value={totalKm}
          suffix="km"
          accent="#c9a96a"
        />
        <StatTile
          icon={Fuel}
          label="Carburant moyen"
          value={avgFuel}
          suffix="%"
          accent="#b9c9a4"
        />
        <StatTile
          icon={Package}
          label="Charge moyenne"
          value={avgLoad}
          suffix="%"
          accent="#6a9fb5"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Vehicle list */}
        <div className="lg:col-span-7">
          <Card className="p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <div className="eyebrow text-olive-300 inline-flex items-center gap-2">
                  <LiveDot size={6} />
                  Flotte temps réel
                </div>
                <h3 className="font-display font-semibold text-[18px] tracking-tight text-slate-50 mt-1">
                  Véhicules · {fleetVehicles.length}
                </h3>
              </div>
              <Badge color="olive">Live</Badge>
            </div>

            {/* Table header */}
            <div className="hidden md:grid grid-cols-12 px-5 py-2.5 eyebrow text-slate-400 border-b border-white/5 bg-white/[0.02]">
              <div className="col-span-3">Véhicule</div>
              <div className="col-span-3">Trajet</div>
              <div className="col-span-2">Statut</div>
              <div className="col-span-2">Carburant</div>
              <div className="col-span-2 text-right">Progression</div>
            </div>

            <div className="divide-y divide-white/5">
              {fleetVehicles.map((v) => {
                const isSelected = selected?.id === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelected(v)}
                    className={`w-full grid grid-cols-1 md:grid-cols-12 gap-3 px-5 py-3.5 text-left hover:bg-white/[0.03] transition ${
                      isSelected ? "bg-olive-400/8" : ""
                    }`}
                  >
                    {/* Vehicle */}
                    <div className="md:col-span-3 flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                          isSelected
                            ? "bg-olive-400/20 border-olive-400/45 text-olive-200"
                            : "bg-white/[0.04] border-white/10 text-slate-300"
                        }`}
                      >
                        <Truck size={15} strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-mono text-[13px] font-semibold text-slate-50">
                          {v.id}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                          <User size={10} strokeWidth={2} />
                          {v.driver}
                        </div>
                      </div>
                    </div>

                    {/* Trajet */}
                    <div className="md:col-span-3 flex items-center gap-1.5 text-[12.5px] text-slate-200">
                      <MapPin size={11} strokeWidth={2} className="text-slate-400 shrink-0" />
                      <span className="truncate">
                        {v.from} <span className="text-slate-500">→</span> {v.to}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="md:col-span-2">
                      <StatusPill status={v.status} />
                        {v.incident ? <Badge color="coral" icon={ShieldAlert}>Incident</Badge> : null}
                    </div>

                    {/* Fuel */}
                    <div className="md:col-span-2 flex items-center gap-2">
                      <Fuel size={11} strokeWidth={2} className="text-slate-400 shrink-0" />
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${v.fuel}%`,
                            background:
                              v.fuel > 40 ? "#8aaa7a" : v.fuel > 20 ? "#d8a84a" : "#cf6a4f",
                          }}
                        />
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 tabular w-7 text-right">
                        {v.fuel}%
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="md:col-span-2 text-right">
                      {v.status === "en_route" ? (
                        <div className="inline-flex items-baseline gap-1 font-mono text-[12.5px] tabular">
                          <span className="text-olive-300">
                            {Math.round(v.progress * 100)}
                          </span>
                          <span className="text-slate-400 text-[10px]">%</span>
                          <span className="text-slate-500 text-[10px] ml-1.5">
                            ETA {v.eta}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-400">
                          —
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-5">
          {selected ? <VehicleDetail vehicle={selected} /> : null}
        </div>
      </div>
    </div>
  );
}

function VehicleDetail({ vehicle }) {
  const trend = fuelTrend[vehicle.id] || [];

  return (
    <Card className="p-5 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="eyebrow text-olive-300 inline-flex items-center gap-2">
            <LiveDot size={6} />
            Détails véhicule
          </div>
          <div className="font-display font-semibold text-[24px] text-slate-50 tracking-tight mt-1">
            {vehicle.id}
          </div>
          <div className="text-[12px] text-slate-400 mt-0.5 flex items-center gap-1.5">
            <User size={11} strokeWidth={2} />
            {vehicle.driver}
          </div>
        </div>
        <StatusPill status={vehicle.status} />
      </div>

      {/* Route */}
      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
        <div className="eyebrow text-slate-400 mb-2">Trajet en cours</div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-[11px] font-mono text-olive-300 uppercase tracking-wider">
              Départ
            </div>
            <div className="font-display font-semibold text-[15px] text-slate-50 mt-0.5">
              {vehicle.from}
            </div>
          </div>
          <div className="relative flex-1 h-px bg-white/10">
            <span
              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-olive-300"
              style={{
                left: `${vehicle.progress * 100}%`,
                boxShadow: "0 0 8px rgba(138,170,122,0.6)",
              }}
            />
          </div>
          <div className="flex-1 text-right">
            <div className="text-[11px] font-mono text-copper-400 uppercase tracking-wider">
              Arrivée
            </div>
            <div className="font-display font-semibold text-[15px] text-slate-50 mt-0.5">
              {vehicle.to}
            </div>
          </div>
        </div>
      </div>

      {/* Metric grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricBlock
          icon={Clock}
          label="ETA"
          value={vehicle.eta}
          accent="#8aaa7a"
        />
        <MetricBlock
          icon={TrendingUp}
          label="Km aujourd'hui"
          value={`${vehicle.kmToday} km`}
          accent="#c9a96a"
        />
        <MetricBlock
          icon={Package}
          label="Chargement"
          value={`${vehicle.load}%`}
          accent="#6a9fb5"
        />
        <MetricBlock
          icon={Thermometer}
          label="Température"
          value={`${vehicle.temp}°C`}
          accent="#b9c9a4"
        />
      </div>

      {/* Fuel sparkline */}
      <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="eyebrow text-slate-400">Carburant · 8h</div>
            <div className="font-display font-semibold text-[22px] text-slate-50 mt-1 tabular">
              {vehicle.fuel}
              <span className="text-slate-400 text-sm font-mono font-normal">
                %
              </span>
            </div>
          </div>
          <Sparkline
            data={trend}
            color={vehicle.fuel > 40 ? "#8aaa7a" : "#d8a84a"}
            width={120}
            height={40}
          />
        </div>
      </div>
    </Card>
  );
}

function MetricBlock({ icon: Icon, label, value, accent }) {
  return (
    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={12} strokeWidth={2} style={{ color: accent }} />
        <div className="eyebrow text-slate-400">{label}</div>
      </div>
      <div className="font-display font-semibold text-[17px] text-slate-50 tabular">
        {value}
      </div>
    </div>
  );
}
