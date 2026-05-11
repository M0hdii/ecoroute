import { Bell, Sparkles, Search } from "lucide-react";
import { LogoMark } from "./Logo";
import { IconButton } from "./ui";

export function TopBar({
  title,
  subtitle,
  liveTime,
  alertCount = 0,
  onOpenAlerts,
  onOpenAssistant,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
      <div className="flex items-center gap-4 px-4 sm:px-6 py-3">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2">
          <LogoMark size={26} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-[16px] sm:text-[17px] font-extrabold text-slate-50 tracking-tight truncate">
              {title}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/25 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 anim-pulse-dot" />
              Live
            </span>
          </div>
          {subtitle ? (
            <p className="text-[12px] text-slate-400 truncate mt-0.5">
              {subtitle}
            </p>
          ) : null}
        </div>

        {/* Search (desktop) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/10 text-slate-400 min-w-[220px]">
          <Search size={14} />
          <input
            placeholder="Rechercher une ville, un client…"
            className="bg-transparent outline-none text-[13px] text-slate-200 placeholder:text-slate-500 w-full"
          />
          <kbd className="hidden lg:inline-flex px-1.5 py-0.5 rounded bg-white/5 text-[10px] font-bold text-slate-400 border border-white/10">
            ⌘K
          </kbd>
        </div>

        {/* Live time */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 anim-pulse-dot" />
          <span className="text-[11px] uppercase font-bold tracking-[0.12em] text-slate-400">
            Casablanca
          </span>
          <span className="text-[13px] font-bold text-slate-100 tabular-nums">
            {liveTime}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <IconButton icon={Bell} label="Alertes" onClick={onOpenAlerts} />
            {alertCount > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-extrabold flex items-center justify-center border-2"
                style={{
                  background: "#f87171",
                  color: "#141014",
                  borderColor: "#0b1120",
                }}
              >
                {alertCount}
              </span>
            )}
          </div>
          <button
            onClick={onOpenAssistant}
            className="btn btn-primary h-9 px-3 text-[12px]"
          >
            <Sparkles size={13} />
            <span className="hidden sm:inline">Demander à RouteBot</span>
            <span className="sm:hidden">RouteBot</span>
          </button>
        </div>
      </div>
    </header>
  );
}
