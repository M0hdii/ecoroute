

/* ---------- Button ---------- */
export function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconRight: IconRight,
  className = "",
  ...props
}) {
  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
    md: "px-4 py-2.5 text-sm gap-2 rounded-xl",
    lg: "px-6 py-3.5 text-base gap-2.5 rounded-2xl",
  };

  const variants = {
    primary:
      "text-ink-950 font-bold eco-gradient-bg shadow-[0_8px_30px_rgba(52,211,153,0.35)] hover:shadow-[0_12px_40px_rgba(52,211,153,0.55)] hover:-translate-y-0.5 active:translate-y-0 transition-all",
    secondary:
      "bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 font-semibold transition-colors",
    ghost:
      "text-white/70 hover:text-white hover:bg-white/5 font-medium transition-colors",
    danger:
      "bg-coral-500/15 hover:bg-coral-500/25 text-coral-400 border border-coral-500/30 font-semibold transition-colors",
    outline:
      "bg-transparent hover:bg-white/5 text-white border border-white/20 hover:border-white/40 font-semibold transition-colors",
  };

  return (
    <button
      className={`inline-flex items-center justify-center ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon ? <Icon size={size === "sm" ? 14 : size === "lg" ? 20 : 16} /> : null}
      {children}
      {IconRight ? <IconRight size={size === "sm" ? 14 : size === "lg" ? 20 : 16} /> : null}
    </button>
  );
}

/* ---------- Card ---------- */
export function Card({ children, className = "", variant = "glass", ...props }) {
  const base = {
    glass: "card-glass",
    strong: "card-glass-strong",
    eco: "card-eco",
    flat: "bg-ink-800 border border-white/8 rounded-2xl",
  };
  return (
    <div className={`${base[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}

/* ---------- Badge ---------- */
export function Badge({ children, color = "eco", className = "", icon: Icon }) {
  const palettes = {
    eco: "bg-eco-400/15 text-eco-300 border-eco-300/30",
    lime: "bg-lime-accent/15 text-lime-bright border-lime-accent/30",
    sand: "bg-sand-500/15 text-sand-300 border-sand-500/30",
    coral: "bg-coral-500/15 text-coral-400 border-coral-500/30",
    sky: "bg-sky-accent/15 text-sky-accent border-sky-accent/30",
    olive: "bg-eco-400/15 text-eco-300 border-eco-300/30",
    clay: "bg-coral-500/15 text-coral-400 border-coral-500/30",
    gold: "bg-lime-accent/15 text-lime-bright border-lime-accent/30",
    slate: "bg-white/5 text-white/70 border-white/10",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border rounded-full ${palettes[color]} ${className}`}
    >
      {Icon ? <Icon size={12} /> : null}
      {children}
    </span>
  );
}

/* ---------- StatTile ---------- */
export function StatTile({
  icon: Icon,
  label,
  value,
  suffix,
  accent = "#6ee7b7",
  change,
  compact = false,
}) {
  return (
    <div
      className={`card-glass relative overflow-hidden ${compact ? "p-4" : "p-5"}`}
    >
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-20 blur-2xl"
        style={{ background: accent }}
      />
      <div className="relative flex items-center gap-3 mb-3">
        {Icon ? (
          <div
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl"
            style={{
              background: `${accent}22`,
              border: `1px solid ${accent}40`,
              color: accent,
            }}
          >
            <Icon size={17} />
          </div>
        ) : null}
        <div className="text-[11px] uppercase font-bold tracking-wider text-white/55">
          {label}
        </div>
      </div>
      <div className="relative flex items-baseline gap-1.5">
        <span
          className={`font-display font-bold leading-none ${
            compact ? "text-2xl" : "text-3xl"
          }`}
        >
          {value}
        </span>
        {suffix ? (
          <span className="text-xs text-white/50 font-semibold">{suffix}</span>
        ) : null}
      </div>
      {change ? (
        <div className="relative mt-2 text-[11px] text-white/45">{change}</div>
      ) : null}
    </div>
  );
}

/* ---------- Section heading ---------- */
export function SectionHeading({
  eyebrow,
  title,
  description,
  icon: Icon,
  action,
  accent = "#6ee7b7",
  className = "",
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 flex-wrap ${className}`}
    >
      <div>
        {eyebrow ? (
          <div
            className="inline-flex items-center gap-2 mb-2 text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ color: accent }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
            />
            {eyebrow}
          </div>
        ) : null}
        <div className="flex items-center gap-3">
          {Icon ? (
            <div
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl"
              style={{
                background: `${accent}1a`,
                border: `1px solid ${accent}35`,
                color: accent,
              }}
            >
              <Icon size={18} />
            </div>
          ) : null}
          <h2 className="font-display text-2xl md:text-[28px] font-bold tracking-tight text-white">
            {title}
          </h2>
        </div>
        {description ? (
          <p className="mt-2 text-sm text-white/55 max-w-xl">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

/* ---------- Live pulse dot ---------- */
export function LiveDot({ color = "#34d399", size = 8 }) {
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      <span
        className="absolute inset-0 rounded-full animate-pulse-dot"
        style={{ background: color, boxShadow: `0 0 10px ${color}` }}
      />
    </span>
  );
}

/* ---------- Divider ---------- */
export function Divider({ className = "" }) {
  return <div className={`h-px bg-white/8 ${className}`} />;
}

/* ---------- Simple bar (used in CO₂ report) ---------- */
export function HBar({ value, max, color = "#34d399", label, sub }) {
  const pct = Math.max(2, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs font-semibold text-white/70">{label}</span>
        <span className="text-[11px] font-bold text-white/50">{sub}</span>
      </div>
      <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}, ${color}80)`,
            boxShadow: `0 0 12px ${color}80`,
          }}
        />
      </div>
    </div>
  );
}


/* ---------- Vehicle/status pill used by Fleet and Overview ---------- */
export function StatusPill({ status }) {
  const map = {
    en_route: {
      label: "En route",
      color: "#a3e635",
      bg: "rgba(163,230,53,0.10)",
      border: "rgba(163,230,53,0.26)",
    },
    loading: {
      label: "Chargement",
      color: "#fbbf24",
      bg: "rgba(251,191,36,0.10)",
      border: "rgba(251,191,36,0.26)",
    },
    idle: {
      label: "Au dépôt",
      color: "#94a3b8",
      bg: "rgba(148,163,184,0.08)",
      border: "rgba(148,163,184,0.18)",
    },
    maintenance: {
      label: "Maintenance",
      color: "#fb7185",
      bg: "rgba(251,113,133,0.10)",
      border: "rgba(251,113,133,0.26)",
    },
  };

  const item = map[status] || map.idle;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-[0.16em]"
      style={{
        color: item.color,
        background: item.bg,
        borderColor: item.border,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: item.color }}
      />
      {item.label}
    </span>
  );
}
