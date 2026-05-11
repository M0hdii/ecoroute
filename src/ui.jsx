import { cx } from "./lib/cx.js";

/* -------------------------------------------------------------------------- */
/*                                    Card                                    */
/* -------------------------------------------------------------------------- */
export function Card({ className, children, as: Tag = "div" }) {
  return (
    <Tag
      className={cx(
        "bg-white border border-slate-200 rounded-xl",
        className
      )}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ title, subtitle, action, icon: Icon, className }) {
  return (
    <div
      className={cx(
        "flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-200",
        className
      )}
    >
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600 ring-1 ring-slate-200">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900 truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500 truncate">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cx("p-5", className)}>{children}</div>;
}

/* -------------------------------------------------------------------------- */
/*                                    KPI                                     */
/* -------------------------------------------------------------------------- */
export function Kpi({ label, value, unit, delta, deltaType = "up", icon: Icon, accent = "slate" }) {
  const accents = {
    slate: "bg-slate-50 text-slate-600 ring-slate-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    sky: "bg-sky-50 text-sky-700 ring-sky-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
  };
  const deltaColor =
    deltaType === "up"
      ? "text-emerald-600"
      : deltaType === "down"
      ? "text-rose-600"
      : "text-slate-500";

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 tabular-nums">
            {value}
            {unit && (
              <span className="ml-1 text-sm font-medium text-slate-500">
                {unit}
              </span>
            )}
          </p>
          {delta !== undefined && (
            <p className={cx("mt-1 text-xs font-medium tabular-nums", deltaColor)}>
              {deltaType === "up" ? "▲" : deltaType === "down" ? "▼" : "•"} {delta}
            </p>
          )}
        </div>
        {Icon && (
          <span
            className={cx(
              "flex h-10 w-10 items-center justify-center rounded-lg ring-1",
              accents[accent]
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Badge                                    */
/* -------------------------------------------------------------------------- */
export function Badge({ children, className, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-50 text-slate-700 ring-slate-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
    sky: "bg-sky-50 text-sky-700 ring-sky-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ring-1",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Button                                   */
/* -------------------------------------------------------------------------- */
export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  icon: Icon,
  iconPosition = "left",
  ...rest
}) {
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-3.5 text-sm",
    lg: "h-10 px-4 text-sm",
  };
  const variants = {
    primary:
      "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-900 border border-slate-900",
    brand:
      "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-700 border border-emerald-600",
    secondary:
      "bg-white text-slate-800 hover:bg-slate-50 border border-slate-300",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100 border border-transparent",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 border border-rose-600",
  };

  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        sizes[size],
        variants[variant],
        className
      )}
      {...rest}
    >
      {Icon && iconPosition === "left" && <Icon className="h-4 w-4" />}
      {children}
      {Icon && iconPosition === "right" && <Icon className="h-4 w-4" />}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Select                                   */
/* -------------------------------------------------------------------------- */
export function Select({ label, value, onChange, options, className, hint }) {
  return (
    <label className={cx("block", className)}>
      {label && (
        <span className="block text-xs font-medium text-slate-600 mb-1.5">
          {label}
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 SegmentedButton                            */
/* -------------------------------------------------------------------------- */
export function Segmented({ options, value, onChange, className }) {
  return (
    <div
      className={cx(
        "inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 gap-1",
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cx(
              "h-7 px-3 text-xs font-medium rounded-md transition",
              active
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 ProgressBar                                */
/* -------------------------------------------------------------------------- */
export function Progress({ value = 0, tone = "emerald", className }) {
  const tones = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
    sky: "bg-sky-500",
    slate: "bg-slate-400",
  };
  return (
    <div
      className={cx(
        "h-1.5 w-full overflow-hidden rounded-full bg-slate-100",
        className
      )}
    >
      <div
        className={cx("h-full transition-all", tones[tone])}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 EmptyState                                 */
/* -------------------------------------------------------------------------- */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && (
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 ring-1 ring-slate-200">
          <Icon className="h-6 w-6" />
        </span>
      )}
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                  PageHeader                                */
/* -------------------------------------------------------------------------- */
export function PageHeader({ title, description, actions, eyebrow }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
      <div>
        {eyebrow && (
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-700 mb-1">
            {eyebrow}
          </p>
        )}
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                   Divider                                  */
/* -------------------------------------------------------------------------- */
export function Divider({ className }) {
  return <div className={cx("h-px w-full bg-slate-200", className)} />;
}
