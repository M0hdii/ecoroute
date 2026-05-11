import { useState, useMemo } from "react";
import {
  Package,
  Download,
  Plus,
  Search,
  ArrowUpRight,
} from "lucide-react";
import {
  Card,
  CardBody,
  CardHeader,
  PageHeader,
  Button,
  Segmented,
  Progress,
} from "../ui.jsx";
import {
  SHIPMENTS,
  CITY_LABELS,
  STATUS_COLORS,
  PRIORITY_COLORS,
} from "../data.js";

const FILTERS = [
  { value: "all", label: "Toutes" },
  { value: "En route", label: "En route" },
  { value: "Planifié", label: "Planifié" },
  { value: "Chargement", label: "Chargement" },
  { value: "Livré", label: "Livré" },
  { value: "Retardé", label: "Retardé" },
];

export default function Shipments() {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return SHIPMENTS.filter((s) => {
      if (filter !== "all" && s.status !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          s.id.toLowerCase().includes(q) ||
          s.client.toLowerCase().includes(q) ||
          s.from.toLowerCase().includes(q) ||
          s.to.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [filter, query]);

  return (
    <div>
      <PageHeader
        eyebrow="Opérations"
        title="Expéditions"
        description="Gérez l'ensemble de vos expéditions, suivez leur progression et leur statut en temps réel."
        actions={
          <>
            <Button variant="secondary" icon={Download}>
              Exporter
            </Button>
            <Button variant="primary" icon={Plus}>
              Nouvelle expédition
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader
          icon={Package}
          title={`${filtered.length} expéditions`}
          subtitle="Vue filtrée"
          action={
            <div className="flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher…"
                  className="h-8 w-56 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
              <Segmented
                options={FILTERS}
                value={filter}
                onChange={setFilter}
              />
            </div>
          }
        />

        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 text-left">
                  <th className="px-5 py-2.5 text-xs font-semibold text-slate-600">
                    Référence
                  </th>
                  <th className="px-5 py-2.5 text-xs font-semibold text-slate-600">
                    Client
                  </th>
                  <th className="px-5 py-2.5 text-xs font-semibold text-slate-600">
                    Itinéraire
                  </th>
                  <th className="px-5 py-2.5 text-xs font-semibold text-slate-600">
                    Poids
                  </th>
                  <th className="px-5 py-2.5 text-xs font-semibold text-slate-600">
                    Véhicule
                  </th>
                  <th className="px-5 py-2.5 text-xs font-semibold text-slate-600">
                    ETA
                  </th>
                  <th className="px-5 py-2.5 text-xs font-semibold text-slate-600">
                    Progression
                  </th>
                  <th className="px-5 py-2.5 text-xs font-semibold text-slate-600">
                    Priorité
                  </th>
                  <th className="px-5 py-2.5 text-xs font-semibold text-slate-600">
                    Statut
                  </th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs text-slate-900">
                        {s.id}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{s.client}</td>
                    <td className="px-5 py-3 text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        {CITY_LABELS[s.from] || s.from}
                        <span className="text-slate-300">→</span>
                        {CITY_LABELS[s.to] || s.to}
                      </span>
                    </td>
                    <td className="px-5 py-3 tabular-nums text-slate-600">
                      {s.weightT} t
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-600">
                      {s.truck}
                    </td>
                    <td className="px-5 py-3 tabular-nums text-slate-700">
                      {s.eta}
                    </td>
                    <td className="px-5 py-3 w-40">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={s.progress}
                          tone={
                            s.status === "Retardé"
                              ? "rose"
                              : s.status === "Livré"
                              ? "sky"
                              : "emerald"
                          }
                        />
                        <span className="w-8 text-right text-xs tabular-nums text-slate-500">
                          {s.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ring-1 ${
                          PRIORITY_COLORS[s.priority] ||
                          "bg-slate-50 text-slate-600 ring-slate-200"
                        }`}
                      >
                        {s.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ring-1 ${
                          STATUS_COLORS[s.status] ||
                          "bg-slate-50 text-slate-600 ring-slate-200"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        aria-label="Détails"
                      >
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
