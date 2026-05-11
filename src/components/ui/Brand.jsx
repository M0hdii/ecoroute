

/**
 * Bold wordmark + glyph combo. The glyph is a stylized leaf/route hybrid —
 * an organic curve cutting through a circular planet. The wordmark uses Space Grotesk.
 */
export function Logo({ size = 40, withText = true, textClassName = "" }) {
  return (
    <div className="inline-flex items-center gap-3 select-none">
      <LogoMark size={size} />
      {withText ? (
        <span
          className={`font-display font-bold tracking-tight text-[22px] md:text-[24px] ${textClassName}`}
        >
          <span className="text-white">Eco</span>
          <span className="eco-gradient-text">Route</span>
        </span>
      ) : null}
    </div>
  );
}

export function LogoMark({ size = 40 }) {
  return (
    <div
      className="relative shrink-0 rounded-2xl overflow-hidden"
      style={{
        width: size,
        height: size,
        background:
          "linear-gradient(135deg, #10b981 0%, #34d399 50%, #a3e635 100%)",
        boxShadow:
          "0 8px 24px rgba(16,185,129,0.35), inset 0 0 0 1px rgba(255,255,255,0.25)",
      }}
    >
      <svg
        viewBox="0 0 40 40"
        width={size}
        height={size}
        className="relative z-10"
      >
        {/* leaf + route glyph */}
        <path
          d="M9 28 C 9 14, 24 8, 32 8 C 32 22, 24 30, 9 30 Z"
          fill="rgba(255,255,255,0.92)"
        />
        <path
          d="M11 28 C 15 22, 22 16, 30 12"
          stroke="#059669"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="30" cy="12" r="2.2" fill="#059669" />
        <circle cx="11" cy="28" r="2.2" fill="#059669" />
      </svg>
    </div>
  );
}

/**
 * Decorative Moroccan coastline silhouette — very abstract, not a real map.
 * Used as a hero prop / background detail.
 */
export function MoroccoOutline({ className = "", color = "rgba(110,231,183,0.35)" }) {
  return (
    <svg
      viewBox="0 0 400 320"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M60 40 L120 30 L180 55 L250 40 L310 70 L340 120 L360 180 L330 240 L270 270 L220 290 L170 300 L130 285 L100 260 L70 220 L50 170 L45 110 L60 40 Z"
        stroke={color}
        strokeWidth="1.3"
        strokeDasharray="6 6"
      />
      <g fill={color}>
        <circle cx="140" cy="60" r="3" />
        <circle cx="260" cy="80" r="3" />
        <circle cx="175" cy="125" r="3.5" />
        <circle cx="215" cy="150" r="4" />
        <circle cx="130" cy="195" r="3" />
        <circle cx="280" cy="210" r="3" />
        <circle cx="95" cy="265" r="3" />
      </g>
      <path
        d="M140 60 Q 160 95 175 125 Q 195 140 215 150 Q 235 175 280 210"
        stroke="rgba(163,230,53,0.55)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="4 6"
      />
    </svg>
  );
}

/**
 * Decorative background blobs for hero / pages.
 */
export function AmbientBlobs({ variant = "home" }) {
  if (variant === "hero") {
    return (
      <>
        <div
          className="blob animate-blob"
          style={{
            top: "-10%",
            left: "-8%",
            width: 560,
            height: 560,
            background: "rgba(16,185,129,0.35)",
          }}
        />
        <div
          className="blob animate-blob"
          style={{
            top: "20%",
            right: "-10%",
            width: 480,
            height: 480,
            background: "rgba(163,230,53,0.22)",
            animationDelay: "-4s",
          }}
        />
        <div
          className="blob animate-blob"
          style={{
            bottom: "-20%",
            left: "30%",
            width: 520,
            height: 520,
            background: "rgba(252,211,77,0.18)",
            animationDelay: "-8s",
          }}
        />
      </>
    );
  }

  return (
    <>
      <div
        className="blob"
        style={{
          top: "-20%",
          right: "-10%",
          width: 400,
          height: 400,
          background: "rgba(16,185,129,0.18)",
        }}
      />
      <div
        className="blob"
        style={{
          bottom: "-15%",
          left: "-10%",
          width: 360,
          height: 360,
          background: "rgba(163,230,53,0.12)",
        }}
      />
    </>
  );
}
