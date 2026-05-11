export function LogoMark({ size = 28, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="eco-logo-grad" x1="0" y1="0" x2="40" y2="40">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="60%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
      </defs>
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="10"
        fill="url(#eco-logo-grad)"
        opacity="0.18"
      />
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="10"
        stroke="url(#eco-logo-grad)"
        strokeWidth="1.3"
      />
      {/* leaf */}
      <path
        d="M12.5 24c1.5-7 7.5-11.5 15-11.5-.2 7-4.5 13-11 14.5"
        stroke="url(#eco-logo-grad)"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* route dot path */}
      <circle cx="14" cy="28" r="2" fill="#6ee7b7" />
      <circle cx="22" cy="22" r="2" fill="#22d3ee" />
      <circle cx="30" cy="14" r="2" fill="#818cf8" />
      <path
        d="M14 28 L22 22 L30 14"
        stroke="#6ee7b7"
        strokeWidth="1.4"
        strokeDasharray="2 2"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
    </svg>
  );
}

export function LogoWordmark({ size = 28 }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <LogoMark size={size} />
      <div className="leading-tight">
        <div className="text-[15px] font-extrabold tracking-tight text-slate-50">
          EcoRoute<span className="text-emerald-300">.ai</span>
        </div>
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Smart logistics · Morocco
        </div>
      </div>
    </div>
  );
}
