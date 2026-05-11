import {
  Home,
  ClipboardList,
  Bell,
  TrendingDown,
  Settings,
  Info,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { screens } from "../lib/data";
import { LogoWordmark } from "./Logo";

const iconMap = {
  Home,
  ClipboardList,
  Bell,
  TrendingDown,
  Settings,
  Info,
};

export function Sidebar({ activeScreen, onNavigate, onOpenAssistant }) {
  return (
    <aside className="hidden lg:flex lg:w-[248px] shrink-0 flex-col border-r border-white/5 bg-slate-950/40 backdrop-blur-xl">
      <div className="px-5 pt-5 pb-4">
        <LogoWordmark />
      </div>

      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-2 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
          Navigation
        </div>
        {screens.map((s) => {
          const Icon = iconMap[s.icon] || Home;
          const active = s.key === activeScreen;
          return (
            <button
              key={s.key}
              onClick={() => onNavigate(s.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-colors ${
                active
                  ? "bg-emerald-400/10 text-emerald-200 border border-emerald-400/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]"
                  : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <Icon size={15} />
              <span className="truncate">{s.label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-300" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-3 space-y-2">
        <button
          onClick={onOpenAssistant}
          className="group w-full relative overflow-hidden rounded-xl p-3 text-left border border-indigo-400/25 bg-gradient-to-br from-indigo-500/15 via-indigo-400/10 to-emerald-400/10 hover:border-indigo-400/40 transition-colors"
        >
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="w-7 h-7 rounded-lg bg-indigo-400/15 border border-indigo-400/30 flex items-center justify-center text-indigo-200">
              <Sparkles size={14} />
            </span>
            <span className="text-[13px] font-bold text-slate-100">
              RouteBot
            </span>
            <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-300">
              En ligne
            </span>
          </div>
          <p className="text-[11.5px] leading-snug text-slate-400">
            Votre copilote IA pour la décision logistique en temps réel.
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-200 group-hover:text-indigo-100">
            <MessageSquare size={11} />
            Ouvrir le chat
          </div>
        </button>

        <div className="rounded-xl p-3 border border-white/5 bg-white/[0.02]">
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[10px] uppercase font-bold tracking-[0.12em] text-slate-500">
              Statut
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] anim-pulse-dot" />
              Actif
            </span>
          </div>
          <div className="text-[12px] font-semibold text-slate-200">
            Flotte synchronisée
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Données temps réel · Maroc
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileTopNav({ activeScreen, onNavigate }) {
  return (
    <nav className="lg:hidden flex gap-1.5 overflow-x-auto px-3 py-2 border-b border-white/5 bg-slate-950/70 backdrop-blur">
      {screens.map((s) => {
        const Icon = iconMap[s.icon] || Home;
        const active = s.key === activeScreen;
        return (
          <button
            key={s.key}
            onClick={() => onNavigate(s.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-colors ${
              active
                ? "bg-emerald-400/10 text-emerald-200 border border-emerald-400/25"
                : "text-slate-400 border border-transparent hover:bg-white/[0.04]"
            }`}
          >
            <Icon size={13} />
            {s.label}
          </button>
        );
      })}
    </nav>
  );
}
