import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Home,
  Route,
  Truck,
  Bell,
  BarChart3,
  Users,
  ClipboardList,
  Bot,
  ArrowRight,
  MapPin,
  Sparkles,
} from "lucide-react";
import { cities } from "../lib/constants";
import { Kbd, KbdGroup } from "./ui/Kbd";

/**
 * ⌘K / Ctrl-K command palette. Navigation + city quick-jump + RouteBot.
 */
export default function CommandPalette({
  open,
  onClose,
  onNavigate,
  onOpenBot,
  onSelectCity,
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    const id = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(id);
  }, [open]);

  const items = useMemo(() => {
    const nav = [
      {
        group: "Aller à",
        id: "overview",
        label: "Vue d'ensemble",
        kind: "nav",
        icon: Home,
      },
      {
        group: "Aller à",
        id: "planner",
        label: "Planification",
        kind: "nav",
        icon: Route,
      },
      {
        group: "Aller à",
        id: "deliveries",
        label: "Livraisons",
        kind: "nav",
        icon: ClipboardList,
      },
      { group: "Aller à", id: "fleet", label: "Flotte", kind: "nav", icon: Truck },
      {
        group: "Aller à",
        id: "analytics",
        label: "Analytique",
        kind: "nav",
        icon: BarChart3,
      },
      {
        group: "Aller à",
        id: "alerts",
        label: "Alertes",
        kind: "nav",
        icon: Bell,
      },
      { group: "Aller à", id: "team", label: "Équipe", kind: "nav", icon: Users },
    ];
    const actions = [
      {
        group: "Actions",
        id: "open-bot",
        label: "Ouvrir RouteBot",
        kind: "action-bot",
        icon: Bot,
      },
    ];
    const cityItems = Object.keys(cities).map((key) => ({
      group: "Villes",
      id: `city-${key}`,
      label: cities[key].label,
      cityKey: key,
      kind: "city",
      icon: MapPin,
    }));
    const all = [...nav, ...actions, ...cityItems];
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (it) =>
        it.label.toLowerCase().includes(q) ||
        it.group.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    if (active >= items.length) setActive(Math.max(0, items.length - 1));
  }, [items.length, active]);

  function run(item) {
    if (!item) return;
    onClose?.();
    if (item.kind === "nav") {
      onNavigate?.(item.id);
    } else if (item.kind === "action-bot") {
      onOpenBot?.();
    } else if (item.kind === "city") {
      onSelectCity?.(item.cityKey);
    }
  }

  function onKey(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose?.();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(items.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      run(items[active]);
    }
  }

  if (!open) return null;

  // Group items in render
  const groups = [];
  let lastGroup = null;
  items.forEach((it, i) => {
    if (it.group !== lastGroup) {
      groups.push({ group: it.group, items: [] });
      lastGroup = it.group;
    }
    groups[groups.length - 1].items.push({ ...it, _i: i });
  });

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[10vh] px-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-xl rounded-2xl overflow-hidden"
        style={{
          background: "#141a18",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(138,170,122,0.15)",
        }}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
          <Search size={16} strokeWidth={2} className="text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKey}
            placeholder="Chercher une page, une ville, une action…"
            className="flex-1 bg-transparent border-0 outline-none text-[14px] text-slate-50 placeholder:text-slate-400"
          />
          <Kbd>ESC</Kbd>
        </div>

        {/* Results */}
        <div className="max-h-[55vh] overflow-y-auto py-2">
          {groups.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">
              Aucun résultat pour “{query}”.
            </div>
          ) : (
            groups.map((g) => (
              <div key={g.group} className="mb-1">
                <div className="eyebrow text-slate-400 px-4 py-1.5">
                  {g.group}
                </div>
                {g.items.map((it) => {
                  const Icon = it.icon;
                  const isActive = active === it._i;
                  return (
                    <button
                      key={it.id}
                      onMouseEnter={() => setActive(it._i)}
                      onClick={() => run(it)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-[13.5px] text-left transition ${
                        isActive
                          ? "bg-olive-400/15 text-slate-50"
                          : "text-slate-200 hover:bg-white/3"
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-md flex items-center justify-center ${
                          isActive
                            ? "bg-olive-400/30 text-olive-200"
                            : "bg-white/5 text-slate-300"
                        }`}
                      >
                        <Icon size={14} strokeWidth={2} />
                      </span>
                      <span className="flex-1 truncate">{it.label}</span>
                      {isActive ? (
                        <span className="inline-flex items-center gap-1 text-slate-400">
                          <span className="text-[10px] font-mono uppercase tracking-wider">
                            Entrée
                          </span>
                          <ArrowRight size={12} strokeWidth={2} />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/8 bg-white/[0.02]">
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <KbdGroup keys={["↑", "↓"]} /> naviguer
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Kbd>↵</Kbd> ouvrir
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
            <Sparkles size={11} strokeWidth={2} className="text-olive-300" />
            <span className="font-mono uppercase tracking-wider">
              EcoRoute CMD
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
