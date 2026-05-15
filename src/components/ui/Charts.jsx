/**
 * Lightweight, dependency-free SVG charts for the analytics page.
 * Everything is responsive via viewBox.
 */

/* ---------- Area / Line chart ---------- */
export function AreaChart({
  data = [],
  valueKey = "value",
  labelKey = "label",
  color = "#8aaa7a",
  height = 180,
  showGrid = true,
  showAxis = true,
  prefix = "",
  suffix = "",
  showPoints = true,
}) {
  if (!data.length) return null;
  const W = 600;
  const H = height;
  const padL = showAxis ? 40 : 12;
  const padR = 12;
  const padT = 16;
  const padB = showAxis ? 28 : 12;

  const values = data.map((d) => Number(d[valueKey]) || 0);
  const max = Math.max(...values) * 1.1 || 1;
  const min = 0;

  const stepX = (W - padL - padR) / Math.max(1, data.length - 1);
  const scaleY = (v) =>
    padT + ((H - padT - padB) * (max - v)) / (max - min || 1);

  const pts = data.map((d, i) => [padL + i * stepX, scaleY(values[i])]);
  const linePath = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1][0]} ${H - padB} L ${pts[0][0]} ${H - padB} Z`;

  const gridLines = showGrid
    ? [0.25, 0.5, 0.75, 1].map((t) => padT + (H - padT - padB) * t)
    : [];

  const id = `areaGrad-${color.replace("#", "")}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full overflow-visible"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* gridlines */}
      {gridLines.map((y, i) => (
        <line
          key={i}
          x1={padL}
          x2={W - padR}
          y1={y}
          y2={y}
          stroke="rgba(255,255,255,0.05)"
          strokeDasharray="2 4"
        />
      ))}

      {/* Y axis labels */}
      {showAxis
        ? [0, 0.5, 1].map((t, i) => {
            const v = max - (max - min) * t;
            const y = padT + (H - padT - padB) * t;
            return (
              <text
                key={i}
                x={padL - 8}
                y={y + 3}
                textAnchor="end"
                fill="#6b7673"
                fontSize="9.5"
                fontFamily="Geist Mono, monospace"
              >
                {Math.round(v)}
              </text>
            );
          })
        : null}

      {/* area fill */}
      <path d={areaPath} fill={`url(#${id})`} />

      {/* main line */}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* points */}
      {showPoints
        ? pts.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.5" fill={color} />
          ))
        : null}

      {/* X axis labels */}
      {showAxis
        ? data.map((d, i) => (
            <text
              key={i}
              x={padL + i * stepX}
              y={H - 10}
              textAnchor="middle"
              fill="#6b7673"
              fontSize="10"
              fontFamily="Geist Mono, monospace"
              letterSpacing="0.08em"
            >
              {String(d[labelKey]).toUpperCase()}
            </text>
          ))
        : null}

      {/* tooltips suffix/prefix (decorative top-right) */}
      {prefix || suffix ? (
        <text
          x={W - padR}
          y={padT - 4}
          textAnchor="end"
          fill="#6b7673"
          fontSize="10"
          fontFamily="Geist Mono, monospace"
        >
          {prefix}
          {Math.round(max)}
          {suffix}
        </text>
      ) : null}
    </svg>
  );
}

/* ---------- Bar chart (paired bars) ---------- */
export function BarChart({
  data = [],
  keys = ["a", "b"],
  colors = ["#8aaa7a", "#6b7673"],
  labelKey = "label",
  height = 200,
}) {
  if (!data.length) return null;
  const W = 600;
  const H = height;
  const padL = 40;
  const padR = 16;
  const padT = 16;
  const padB = 28;

  const allVals = data.flatMap((d) => keys.map((k) => Number(d[k]) || 0));
  const max = Math.max(...allVals) * 1.15 || 1;

  const groupW = (W - padL - padR) / data.length;
  const barW = Math.max(4, (groupW - 12) / keys.length);
  const scaleY = (v) => padT + ((H - padT - padB) * (max - v)) / max;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ display: "block" }}>
      {/* gridlines */}
      {[0.25, 0.5, 0.75, 1].map((t, i) => (
        <line
          key={i}
          x1={padL}
          x2={W - padR}
          y1={padT + (H - padT - padB) * t}
          y2={padT + (H - padT - padB) * t}
          stroke="rgba(255,255,255,0.05)"
          strokeDasharray="2 4"
        />
      ))}

      {/* Y axis labels */}
      {[0, 0.5, 1].map((t, i) => {
        const v = max - max * t;
        const y = padT + (H - padT - padB) * t;
        return (
          <text
            key={i}
            x={padL - 8}
            y={y + 3}
            textAnchor="end"
            fill="#6b7673"
            fontSize="9.5"
            fontFamily="Geist Mono, monospace"
          >
            {Math.round(v)}
          </text>
        );
      })}

      {/* bars */}
      {data.map((d, i) => {
        const gx = padL + i * groupW + 6;
        return (
          <g key={i}>
            {keys.map((k, j) => {
              const v = Number(d[k]) || 0;
              const x = gx + j * (barW + 4);
              const y = scaleY(v);
              const h = H - padB - y;
              return (
                <rect
                  key={k}
                  x={x}
                  y={y}
                  width={barW}
                  height={h}
                  rx={3}
                  fill={colors[j]}
                  opacity="0.92"
                />
              );
            })}
            <text
              x={gx + (groupW - 12) / 2}
              y={H - 10}
              textAnchor="middle"
              fill="#6b7673"
              fontSize="10"
              fontFamily="Geist Mono, monospace"
              letterSpacing="0.08em"
            >
              {String(d[labelKey]).toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- Donut chart ---------- */
export function Donut({ data = [], size = 140, stroke = 16, centerLabel, centerValue }) {
  const total = data.reduce((acc, d) => acc + (Number(d.value) || 0), 0);
  if (!total) return null;

  const R = size / 2 - stroke / 2;
  const C = 2 * Math.PI * R;
  let acc = 0;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={R}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={stroke}
        />
        {data.map((d, i) => {
          const val = Number(d.value) || 0;
          const dash = (val / total) * C;
          const offset = C - (acc / total) * C;
          acc += val;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={R}
              fill="none"
              stroke={d.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={offset}
              strokeLinecap="butt"
              style={{ transition: "stroke-dasharray 0.5s ease" }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="font-display font-semibold text-[22px] text-slate-50 tabular">
          {centerValue}
        </div>
        {centerLabel ? (
          <div className="eyebrow text-slate-400 mt-1">{centerLabel}</div>
        ) : null}
      </div>
    </div>
  );
}

/* ---------- Sparkline (mini inline) ---------- */
export function Sparkline({ data = [], color = "#8aaa7a", width = 80, height = 24 }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / Math.max(1, data.length - 1);
  const path = data
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  // Build the area version too so we can shade under the line.
  const areaPath = `${path} L ${(width).toFixed(1)} ${height.toFixed(1)} L 0 ${height.toFixed(1)} Z`;
  const id = `spark-${color.replace("#", "")}-${Math.random().toString(36).slice(2, 6)}`;
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${id})`} />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ---------- Dual metric chart: area for primary + line for secondary ----------
   Two metrics on a shared X, independent Y scales. Used by Analytics to
   show CO₂ trend (filled area) alongside cost trend (smooth line). */
export function DualMetricChart({
  data = [],
  primaryKey = "co2",
  secondaryKey = "cost",
  labelKey = "day",
  primaryColor = "#34d399",
  secondaryColor = "#fbbf24",
  primaryLabel = "CO₂",
  secondaryLabel = "Coût",
  primarySuffix = " kg",
  secondarySuffix = " MAD",
  height = 240,
}) {
  if (!data.length) return null;
  const W = 680;
  const H = height;
  const padL = 44;
  const padR = 44;
  const padT = 18;
  const padB = 28;

  const v1 = data.map((d) => Number(d[primaryKey]) || 0);
  const v2 = data.map((d) => Number(d[secondaryKey]) || 0);
  const max1 = Math.max(...v1) * 1.12 || 1;
  const max2 = Math.max(...v2) * 1.12 || 1;

  const stepX = (W - padL - padR) / Math.max(1, data.length - 1);
  const scaleY1 = (v) => padT + ((H - padT - padB) * (max1 - v)) / max1;
  const scaleY2 = (v) => padT + ((H - padT - padB) * (max2 - v)) / max2;

  const pts1 = data.map((d, i) => [padL + i * stepX, scaleY1(v1[i])]);
  const pts2 = data.map((d, i) => [padL + i * stepX, scaleY2(v2[i])]);

  // Smooth path using cubic bezier between points.
  function smoothPath(pts) {
    if (pts.length < 2) return "";
    const d = [`M ${pts[0][0]} ${pts[0][1]}`];
    for (let i = 1; i < pts.length; i += 1) {
      const [x0, y0] = pts[i - 1];
      const [x1, y1] = pts[i];
      const cx = (x0 + x1) / 2;
      d.push(`C ${cx} ${y0} ${cx} ${y1} ${x1} ${y1}`);
    }
    return d.join(" ");
  }
  const line1 = smoothPath(pts1);
  const line2 = smoothPath(pts2);
  const area1 = `${line1} L ${pts1[pts1.length - 1][0]} ${H - padB} L ${pts1[0][0]} ${H - padB} Z`;

  const id = `dualGrad-${primaryColor.replace("#", "")}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ display: "block" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={primaryColor} stopOpacity="0.45" />
          <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* gridlines */}
      {[0.25, 0.5, 0.75, 1].map((t, i) => (
        <line
          key={i}
          x1={padL}
          x2={W - padR}
          y1={padT + (H - padT - padB) * t}
          y2={padT + (H - padT - padB) * t}
          stroke="rgba(255,255,255,0.05)"
          strokeDasharray="2 4"
        />
      ))}

      {/* Left axis labels (primary) */}
      {[0, 0.5, 1].map((t, i) => {
        const v = max1 - max1 * t;
        const y = padT + (H - padT - padB) * t;
        return (
          <text
            key={`l-${i}`}
            x={padL - 8}
            y={y + 3}
            textAnchor="end"
            fill={primaryColor}
            fontSize="9.5"
            fontFamily="Geist Mono, monospace"
            opacity="0.7"
          >
            {Math.round(v)}
          </text>
        );
      })}

      {/* Right axis labels (secondary) */}
      {[0, 0.5, 1].map((t, i) => {
        const v = max2 - max2 * t;
        const y = padT + (H - padT - padB) * t;
        return (
          <text
            key={`r-${i}`}
            x={W - padR + 8}
            y={y + 3}
            textAnchor="start"
            fill={secondaryColor}
            fontSize="9.5"
            fontFamily="Geist Mono, monospace"
            opacity="0.7"
          >
            {Math.round(v)}
          </text>
        );
      })}

      {/* Primary area */}
      <path d={area1} fill={`url(#${id})`} />
      <path
        d={line1}
        fill="none"
        stroke={primaryColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Secondary line (dashed for distinction) */}
      <path
        d={line2}
        fill="none"
        stroke={secondaryColor}
        strokeWidth="2"
        strokeDasharray="4 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Points on both lines */}
      {pts1.map(([x, y], i) => (
        <circle key={`p1-${i}`} cx={x} cy={y} r="3" fill={primaryColor} />
      ))}
      {pts2.map(([x, y], i) => (
        <circle
          key={`p2-${i}`}
          cx={x}
          cy={y}
          r="2.5"
          fill="#0a0f1c"
          stroke={secondaryColor}
          strokeWidth="1.5"
        />
      ))}

      {/* X axis labels */}
      {data.map((d, i) => (
        <text
          key={`x-${i}`}
          x={padL + i * stepX}
          y={H - 10}
          textAnchor="middle"
          fill="#6b7673"
          fontSize="10"
          fontFamily="Geist Mono, monospace"
          letterSpacing="0.08em"
        >
          {String(d[labelKey]).toUpperCase()}
        </text>
      ))}

      {/* Legends top */}
      <g>
        <rect x={padL} y={2} width={10} height={3} fill={primaryColor} rx={1.5} />
        <text
          x={padL + 14}
          y={6}
          fill="#cbd5e1"
          fontSize="10"
          fontFamily="Geist Mono, monospace"
          letterSpacing="0.06em"
        >
          {primaryLabel.toUpperCase()}
          {primarySuffix.toUpperCase()}
        </text>
        <rect
          x={padL + 130}
          y={2}
          width={10}
          height={2}
          fill={secondaryColor}
          rx={1}
        />
        <rect
          x={padL + 144}
          y={2}
          width={4}
          height={2}
          fill={secondaryColor}
          rx={1}
        />
        <text
          x={padL + 154}
          y={6}
          fill="#cbd5e1"
          fontSize="10"
          fontFamily="Geist Mono, monospace"
          letterSpacing="0.06em"
        >
          {secondaryLabel.toUpperCase()}
          {secondarySuffix.toUpperCase()}
        </text>
      </g>
    </svg>
  );
}

/* ---------- Heatmap ---------- */
// Renders a row of cells colored by intensity. Used for "deliveries per day"
// where the user wants to spot which days are heaviest.
export function Heatmap({
  data = [],
  valueKey = "value",
  labelKey = "label",
  color = "#8aaa7a",
  cellHeight = 64,
}) {
  if (!data.length) return null;
  const values = data.map((d) => Number(d[valueKey]) || 0);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  return (
    <div className="grid gap-2 w-full" style={{ gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))` }}>
      {data.map((d, i) => {
        const v = Number(d[valueKey]) || 0;
        const intensity = (v - min) / range; // 0..1
        const opacity = 0.18 + intensity * 0.72;
        return (
          <div
            key={i}
            className="rounded-xl border flex flex-col items-center justify-between px-2 py-3 transition hover:border-white/30"
            style={{
              background: `${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")}`,
              borderColor: `${color}${Math.round(intensity * 0.55 * 255).toString(16).padStart(2, "0")}`,
              minHeight: cellHeight,
            }}
            title={`${d[labelKey]}: ${v}`}
          >
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-white/55">
              {d[labelKey]}
            </div>
            <div
              className="font-display font-bold text-lg tabular-nums"
              style={{ color: intensity > 0.4 ? "#0a0f1c" : color }}
            >
              {v}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Radial progress bar ---------- */
// Circular progress used to show a single percentage in a compact tile.
export function RadialProgress({
  value = 0,
  max = 100,
  size = 80,
  stroke = 8,
  color = "#34d399",
  label,
  trackColor = "rgba(255,255,255,0.08)",
}) {
  const pct = Math.max(0, Math.min(1, value / max));
  const R = size / 2 - stroke / 2;
  const C = 2 * Math.PI * R;
  const offset = C * (1 - pct);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={R}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={R}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={C}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.7s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div
          className="font-display font-bold text-base leading-none"
          style={{ color }}
        >
          {Math.round(pct * 100)}%
        </div>
        {label ? (
          <div className="text-[8.5px] font-bold uppercase tracking-wider text-white/55 mt-0.5">
            {label}
          </div>
        ) : null}
      </div>
    </div>
  );
}
