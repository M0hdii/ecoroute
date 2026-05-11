import {
  Truck,
  Fuel,
  Package,
  Plus,
  Download,
  User,
  Gauge,
} from "lucide-react";
import {
  Card,
  CardBody,
  PageHeader,
  Button,
  Progress,
  Kpi,
} from "../ui.jsx";
import { FLEET, STATUS_COLORS } from "../data.js";

function FuelIndicator({ pct }) {
  const tone = pct > 50 ? "emerald" : pct > 25 ? "amber" : "rose";
  return (
    <div className="flex items-center gap-2">
      <Progress value={pct} tone={tone} className="w-24" />
      <span className="text-xs tabular-nums text-slate-600 w-8">{pct}%</span>
    </div>
  );
}

export default function Fleet() {
  const active = FLEET.filter((f) => f.status === "En route").length;
  const available = FLEET.filter((f) => f.status === "Disponible").length;
  const maintenance = FLEET.filter((f) => f.status === "Maintenance").length;
  const loading = FLEET.filter((f) => f.status === "Chargement").length;

  return (
    <div>
      <PageHeader
        eyebrow="Ressources"
        title="Flotte de véhicules"
        description="Visualisez la disponibilité et l'état de chaque véhicule, suivez le carburant, la charge et la maintenance."
        actions={
          <>
            <Button variant="secondary" icon={Download}>
              Rapport
            </Button>
            <Button variant="primary" icon={Plus}>
              Ajouter un véhicule
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Véhicules total" value={FLEET.length} icon={Truck} accent="slate" />
        <Kpi
          label="En route"
          value={active}
          delta={`${Math.round((active / FLEET.length) * 100)}% de la flotte`}
          deltaType="up"
          icon={Gauge}
          accent="emerald"
        />
        <Kpi label="Disponibles" value={available + loading} icon={Package} accent="sky" />
        <Kpi label="En maintenance" value={maintenance} icon={Fuel} accent="amber" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {FLEET.map((t) => (
          <Card key={t.id}>
            <CardBody className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                      <Truck className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-mono text-sm font-semibold text-slate-900">
                        {t.id}
                      </p>
                      <p className="text-[11px] text-slate-500">{t.plate}</p>
                    </div>
                  </div>
                </div>
                <span
                  className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ring-1 ${
                    STATUS_COLORS[t.status] ||
                    "bg-slate-50 text-slate-600 ring-slate-200"
                  }`}
                >
                  {t.status}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-slate-700">
                <User className="h-3.5 w-3.5 text-slate-400" />
                {t.driver}
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {t.type} · capacité {t.capacityT} t
              </p>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Fuel className="h-3 w-3" />
                      Carburant
                    </span>
                    <FuelIndicator pct={t.fuelPct} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      Chargement
                    </span>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={t.loadPct}
                        tone={t.loadPct > 85 ? "rose" : "sky"}
                        className="w-24"
                      />
                      <span className="text-xs tabular-nums text-slate-600 w-8">
                        {t.loadPct}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-500">
                <span>{t.location}</span>
                <span className="tabular-nums text-slate-700 font-medium">
                  {t.km} km
                </span>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
