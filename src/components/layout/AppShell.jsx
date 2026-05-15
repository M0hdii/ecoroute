
import {
  LayoutDashboard,
  Route,
  ClipboardList,
  Truck,
  BarChart3,
  Bell,
  Users,
  Bot,
  ArrowLeft,
  Clock,
  Activity,
  Command,
  Languages,
} from "lucide-react";
import { Logo, LogoMark } from "../ui/Brand";
import { LiveDot, Badge } from "../ui/Primitives";
import { Kbd } from "../ui/Kbd";
import { LANGS, useLang, useT } from "../../lib/i18n";

function buildNav(t) {
  return [
    { key: "overview",   label: t("nav.overview"),   icon: LayoutDashboard },
    { key: "planner",    label: t("nav.planner"),    icon: Route },
    { key: "deliveries", label: t("nav.deliveries"), icon: ClipboardList },
    { key: "fleet",      label: t("nav.fleet"),      icon: Truck },
    { key: "analytics",  label: t("nav.analytics"),  icon: BarChart3 },
    { key: "alerts",     label: t("nav.alerts"),     icon: Bell },
    { key: "team",       label: t("nav.team"),       icon: Users },
  ];
}

export default function AppShell({
  active,
  onChange,
  onExit,
  liveTime,
  alertCount,
  onOpenBot,
  onOpenAlerts,
  onOpenCommand,
  children,
}) {
  const t = useT();
  const { lang, setLang, dir } = useLang();
  const NAV = buildNav(t);

  return (
    <div className="flex min-h-screen bg-ink-950 text-white" dir={dir}>
      {/* ------------ SIDEBAR ------------ */}
      <aside className="hidden md:flex flex-col w-[260px] shrink-0 border-r border-white/5 bg-ink-900/60 backdrop-blur-xl sticky top-0 h-screen">
        <div className="px-5 pt-6 pb-4">
          <Logo size={36} />
        </div>

        <div className="px-3 pb-4">
          <button
            onClick={onOpenCommand}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/8 hover:border-white/16 hover:bg-white/[0.06] text-white/70 hover:text-white transition"
          >
            <Command size={13} strokeWidth={2} />
            <span className="text-[12.5px] font-semibold">{t("nav.search")}</span>
            <span className="ml-auto inline-flex items-center gap-1">
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </span>
          </button>
        </div>

        <div className="px-5 pb-2">
          <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/30">
            {t("nav.menu")}
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV.map((item) => {
            const isActive = active === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => onChange(item.key)}
                className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative ${
                  isActive
                    ? "bg-white/5 text-white border border-white/10"
                    : "text-white/55 hover:text-white hover:bg-white/[0.03] border border-transparent"
                }`}
              >
                {isActive ? (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                    style={{
                      background:
                        "linear-gradient(180deg,#a3e635,#34d399)",
                      boxShadow: "0 0 12px rgba(163,230,53,0.55)",
                    }}
                  />
                ) : null}
                <Icon
                  size={17}
                  className={isActive ? "text-eco-300" : "text-white/50"}
                />
                <span>{item.label}</span>
                {item.key === "alerts" && alertCount > 0 ? (
                  <span className="ml-auto inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-coral-500/20 border border-coral-500/40 text-coral-400 text-[10px] font-bold">
                    {alertCount}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* l’IA CTA */}
        <div className="p-3">
          <button
            onClick={onOpenBot}
            className="w-full group text-left relative overflow-hidden rounded-2xl p-4 border border-eco-300/25 bg-gradient-to-br from-eco-400/15 via-lime-accent/5 to-transparent hover:border-eco-300/45 transition-all"
          >
            <div
              className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity"
              style={{ background: "rgba(163,230,53,0.35)" }}
            />
            <div className="relative flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl eco-gradient-bg flex items-center justify-center text-ink-950 shrink-0">
                <Bot size={18} strokeWidth={2.4} />
              </div>
              <div>
                <div className="font-display font-bold text-sm">RouteBot</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-eco-300 inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-eco-300 animate-pulse-dot" />
                  {t("bot.online")}
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* live status */}
        <div className="px-3 pb-3 space-y-2">
          <div className="px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Clock size={13} />
              {t("topbar.morocco")}
            </div>
            <div className="font-display font-bold text-sm text-white tabular-nums">
              {liveTime}
            </div>
          </div>
          <div className="px-3 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <LiveDot color="#34d399" />
              {t("topbar.fleet")}
            </div>
            <div className="font-display font-bold text-sm text-eco-300">
              4/4 {t("topbar.fleet.active")}
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-white/5">
          <button
            onClick={onExit}
            className="text-[11px] font-bold uppercase tracking-wider text-white/40 hover:text-white/80 transition inline-flex items-center gap-1.5"
          >
            <ArrowLeft size={12} />
            {t("nav.back")}
          </button>
        </div>
      </aside>

      {/* ------------ MAIN ------------ */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* MOBILE TOP BAR */}
        <div className="md:hidden sticky top-0 z-40 bg-ink-900/80 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <button onClick={onExit} className="inline-flex items-center gap-2">
            <LogoMark size={30} />
            <span className="font-display font-bold text-base">
              <span className="text-white">Eco</span>
              <span className="eco-gradient-text">Route</span>
            </span>
          </button>
          <button
            onClick={onOpenBot}
            className="w-10 h-10 rounded-xl eco-gradient-bg text-ink-950 flex items-center justify-center"
          >
            <Bot size={18} strokeWidth={2.4} />
          </button>
        </div>

        {/* MOBILE NAV (horizontal) */}
        <div className="md:hidden sticky top-[58px] z-30 bg-ink-950/90 backdrop-blur-xl border-b border-white/5 px-3 py-2.5 flex gap-2 overflow-x-auto">
          {NAV.map((item) => {
            const isActive = active === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => onChange(item.key)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                  isActive
                    ? "bg-eco-400/15 text-eco-300 border-eco-400/30"
                    : "bg-white/[0.02] text-white/60 border-white/5"
                }`}
              >
                <Icon size={13} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* DESKTOP TOP BAR */}
        <div className="hidden md:flex items-center justify-between sticky top-0 z-30 bg-ink-950/70 backdrop-blur-xl border-b border-white/5 px-8 py-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
              {t("topbar.console")}
            </div>
            <h1 className="font-display font-bold text-xl tracking-tight mt-0.5">
              {NAV.find((n) => n.key === active)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <LangToggle lang={lang} setLang={setLang} compact />
            <button
              onClick={onOpenAlerts}
              className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/8 hover:border-white/15 transition text-sm"
            >
              <Bell size={15} className="text-white/70" />
              <span className="text-white/80 font-semibold">{t("topbar.alerts")}</span>
              {alertCount > 0 ? (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-coral-500 text-[9px] font-bold text-ink-950">
                  {alertCount}
                </span>
              ) : null}
            </button>
            <Badge color="eco" icon={Activity}>
              {t("topbar.demo")}
            </Badge>
          </div>
        </div>

        <div className="flex-1 min-w-0 relative">{children}</div>
      </main>
    </div>
  );
}


/* ---------- Language toggle ---------- */
function LangToggle({ lang, setLang, compact = false }) {
  return (
    <div
      className={`inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-white/[0.04] border border-white/10 ${
        compact ? "" : ""
      }`}
      role="group"
      aria-label="Language"
    >
      <Languages size={12} className="text-white/40 mx-1.5" />
      {Object.values(LANGS).map((l) => {
        const active = l.code === lang;
        return (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            className={`px-2 h-6 rounded-md text-[10.5px] font-bold uppercase tracking-wider transition ${
              active
                ? "bg-eco-400/20 text-eco-300 border border-eco-300/40"
                : "text-white/55 hover:text-white border border-transparent"
            }`}
            title={l.name}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}
