import { Search, BellRing, Sparkles, Menu } from "lucide-react";
import { Button, Badge } from "../ui.jsx";

export default function TopBar({
  title,
  subtitle,
  liveTime,
  onOpenAssistant,
  onToggleMobileNav,
  alertsCount = 0,
}) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 backdrop-blur px-4 md:px-6">
      <button
        onClick={onToggleMobileNav}
        className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
        aria-label="Menu"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="hidden md:block min-w-0">
        <h2 className="text-sm font-semibold text-slate-900 truncate">{title}</h2>
        {subtitle && (
          <p className="text-xs text-slate-500 truncate">{subtitle}</p>
        )}
      </div>

      {/* Search */}
      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Rechercher une expédition, un camion, un client..."
            className="h-9 w-80 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 placeholder-slate-400 focus:border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <Badge tone="emerald">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
            Temps réel · {liveTime}
          </Badge>
        </div>

        <button
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
          aria-label="Notifications"
        >
          <BellRing className="h-4 w-4" />
          {alertsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold text-white">
              {alertsCount}
            </span>
          )}
        </button>

        <Button
          variant="brand"
          size="md"
          icon={Sparkles}
          onClick={onOpenAssistant}
          className="hidden sm:inline-flex"
        >
          Assistant IA
        </Button>
      </div>
    </header>
  );
}
