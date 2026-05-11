import {
  LayoutDashboard,
  Map,
  Package,
  Truck,
  BellRing,
  BarChart3,
  Settings,
  Sparkles,
  HelpCircle,
  Leaf,
} from "lucide-react";
import { cx } from "../lib/cx.js";

const NAV = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "planner", label: "Planificateur", icon: Map },
  { id: "shipments", label: "Expéditions", icon: Package },
  { id: "fleet", label: "Flotte", icon: Truck },
  { id: "alerts", label: "Alertes", icon: BellRing, badgeKey: "alerts" },
  { id: "analytics", label: "Analytique", icon: BarChart3 },
];

const BOTTOM_NAV = [
  { id: "settings", label: "Paramètres", icon: Settings },
  { id: "help", label: "Aide & support", icon: HelpCircle },
];

export default function Sidebar({ active, onChange, badges = {}, onOpenAssistant }) {
  return (
    <aside className="hidden md:flex md:w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 px-5 border-b border-slate-200">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
          <Leaf className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-900">EcoRoute</p>
          <p className="text-[11px] text-slate-500">Plateforme logistique</p>
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Opérations
        </p>
        <ul className="space-y-1">
          {NAV.map((item) => {
            const isActive = active === item.id;
            const Icon = item.icon;
            const badge = item.badgeKey ? badges[item.badgeKey] : null;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onChange(item.id)}
                  className={cx(
                    "group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition",
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <Icon
                    className={cx(
                      "h-4 w-4",
                      isActive ? "text-white" : "text-slate-500 group-hover:text-slate-700"
                    )}
                  />
                  <span className="font-medium">{item.label}</span>
                  {badge != null && badge > 0 && (
                    <span
                      className={cx(
                        "ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-rose-100 text-rose-700"
                      )}
                    >
                      {badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Intelligence
        </p>
        <button
          onClick={onOpenAssistant}
          className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
        >
          <Sparkles className="h-4 w-4 text-emerald-600" />
          <span className="font-medium">Assistant IA</span>
          <span className="ml-auto rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
            Nouveau
          </span>
        </button>
      </nav>

      {/* Bottom nav */}
      <div className="border-t border-slate-200 px-3 py-3">
        <ul className="space-y-1">
          {BOTTOM_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onChange(item.id)}
                  className={cx(
                    "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition",
                    isActive
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-4 w-4 text-slate-500" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-3 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
            MO
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-xs font-semibold text-slate-900">
              M. Omar
            </p>
            <p className="truncate text-[11px] text-slate-500">
              Responsable opérations
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
