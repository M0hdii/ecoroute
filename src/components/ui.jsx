import { Loader2 } from "lucide-react";

/* ---------- Card ---------- */
export function Card({
  className = "",
  tone = "default",
  padded = true,
  children,
  ...rest
}) {
  const base =
    "rounded-2xl border transition-colors backdrop-blur-sm";
  const toneMap = {
    default:
      "bg-slate-900/55 border-white/7 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset]",
    raised:
      "bg-slate-900/75 border-white/10 shadow-[0_14px_40px_-18px_rgba(0,0,0,0.6)]",
    subtle: "bg-white/[0.02] border-white/5",
  };
  const pad = padded ? "p-5" : "";
  return (
    <div className={`${base} ${toneMap[tone] || toneMap.default} ${pad} ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, icon: Icon, action, accent = "#6ee7b7" }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-start gap-3 min-w-0">
        {Icon ? (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: `${accent}1A`,
              border: `1px solid ${accent}40`,
              color: accent,
            }}
          >
            <Icon size={16} />
          </div>
        ) : null}
        <div className="min-w-0">
          <div className="text-[14px] font-bold text-slate-100 truncate">
            {title}
          </div>
          {subtitle ? (
            <div className="text-[12px] text-slate-400 mt-0.5 leading-snug">
              {subtitle}
            </div>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* ---------- Section title ---------- */
export function SectionTitle({ children, icon: Icon, accent = "#6ee7b7", right }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {Icon ? (
          <span
            className="w-5 h-5 rounded-md flex items-center justify-center"
            style={{ background: `${accent}22`, color: accent }}
          >
            <Icon size={12} />
          </span>
        ) : null}
        <h3 className="text-[12px] uppercase font-bold tracking-[0.14em] text-slate-400">
          {children}
        </h3>
      </div>
      {right}
    </div>
  );
}

/* ---------- Chip / StatusPill ---------- */
export function Chip({ children, color = "#94a3b8", filled = false, icon: Icon }) {
  const style = filled
    ? { background: color, color: "#05070d" }
    : {
        background: `${color}1F`,
        border: `1px solid ${color}4D`,
        color,
      };
  return (
    <span className="chip" style={style}>
      {Icon ? <Icon size={11} /> : null}
      {children}
    </span>
  );
}

export function StatusDot({ color = "#6ee7b7", size = 8, pulse = true }) {
  return (
    <span
      className={pulse ? "anim-pulse-dot" : ""}
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 ${size * 1.4}px ${color}`,
      }}
    />
  );
}

/* ---------- Buttons ---------- */
export function Button({
  children,
  variant = "primary",
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  className = "",
  ...rest
}) {
  const cls = `btn ${variant === "ghost" ? "btn-ghost" : "btn-primary"} ${className}`;
  return (
    <button className={cls} disabled={loading || rest.disabled} {...rest}>
      {loading ? (
        <Loader2 size={14} className="animate-[spin_0.8s_linear_infinite]" />
      ) : Icon ? (
        <Icon size={14} />
      ) : null}
      {children}
      {IconRight ? <IconRight size={14} /> : null}
    </button>
  );
}

export function IconButton({ icon: Icon, label, onClick, active = false }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-colors ${
        active
          ? "bg-emerald-400/10 border-emerald-400/30 text-emerald-200"
          : "bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06] hover:border-white/20"
      }`}
    >
      <Icon size={15} />
    </button>
  );
}

/* ---------- Stat / KPI ---------- */
export function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  change,
  accent = "#818cf8",
}) {
  return (
    <div
      className="rounded-xl p-4 border transition-colors"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
          {label}
        </span>
        {Icon ? (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `${accent}1F`, color: accent }}
          >
            <Icon size={13} />
          </div>
        ) : null}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-[22px] font-extrabold text-slate-50 tracking-tight">
          {value}
        </span>
        {suffix ? (
          <span className="text-[12px] font-semibold text-slate-500">{suffix}</span>
        ) : null}
      </div>
      {change ? (
        <div
          className="text-[11px] font-semibold mt-1.5"
          style={{ color: change.color || "#34d399" }}
        >
          {change.label}
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Skeleton ---------- */
export function Skeleton({ className = "" }) {
  return (
    <div
      className={`rounded-md ${className}`}
      style={{
        background:
          "linear-gradient(90deg, rgba(148,163,184,0.04), rgba(148,163,184,0.12), rgba(148,163,184,0.04))",
        backgroundSize: "400px 100%",
        animation: "shimmer 1.4s linear infinite",
      }}
    />
  );
}

/* ---------- Progress ---------- */
export function Progress({ value = 0, color = "#6ee7b7", height = 6 }) {
  return (
    <div
      className="rounded-full overflow-hidden"
      style={{ height, background: "rgba(148,163,184,0.12)" }}
    >
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          background: `linear-gradient(90deg, ${color}, ${color}CC)`,
          boxShadow: `0 0 12px ${color}55`,
        }}
      />
    </div>
  );
}
