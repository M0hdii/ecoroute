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
  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
