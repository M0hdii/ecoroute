import { useState } from "react";
import {
  BellRing,
  AlertTriangle,
  Info,
  CheckCircle2,
  Filter,
} from "lucide-react";
import {
  Card,
  CardBody,
  CardHeader,
  PageHeader,
  Segmented,
  Button,
  Badge,
} from "../ui.jsx";
import { ALERTS } from "../data.js";

const LEVELS = [
  { value: "all", label: "Toutes" },
  { value: "critique", label: "Critiques" },
  { value: "avertissement", label: "Avertissements" },
  { value: "info", label: "Info" },
];

const ICON = {
  critique: AlertTriangle,
  avertissement: Info,
  info: CheckCircle2,
};

const TONE = {
  critique: "text-rose-600 bg-rose-50 ring-rose-200",
  avertissement: "text-amber-600 bg-amber-50 ring-amber-200",
  info: "text-slate-500 bg-slate-50 ring-slate-200",
};

const BADGE_TONE = {
  critique: "rose",
  avertissement: "amber",
  info: "slate",
};

export default function Alerts() {
  const [filter, setFilter] = useState("all");
  const filtered =
    filter === "all" ? ALERTS : ALERTS.filter((a) => a.level === filter);

  return (
    <div>
      <PageHeader
        eyebrow="Suivi"
        title="Centre d'alertes"
        description="Toutes les alertes opérationnelles regroupées : incidents, météo, trafic et maintenance."
        actions={
          <Button variant="secondary" icon={Filter}>
            Préférences
          </Button>
        }
      />

      <Card>
        <CardHeader
          icon={BellRing}
          title="Flux d'alertes"
          subtitle={`${filtered.length} alertes`}
          action={
            <Segmented options={LEVELS} value={filter} onChange={setFilter} />
          }
        />
        <CardBody className="p-0">
          <ul className="divide-y divide-slate-200">
            {filtered.map((a) => {
              const Icon = ICON[a.level];
              return (
                <li key={a.id} className="flex gap-4 px-5 py-4 hover:bg-slate-50/60">
                  <span
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ${TONE[a.level]}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {a.title}
                        </p>
                        <p className="mt-0.5 text-sm text-slate-600">
                          {a.message}
                        </p>
                      </div>
                      <Badge tone={BADGE_TONE[a.level]} className="capitalize">
                        {a.level}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                      <span>{a.time}</span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span>Zone : {a.zone}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
