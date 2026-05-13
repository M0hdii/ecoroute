export function Kbd({ children, className = "" }) {
  return <span className={`kbd ${className}`}>{children}</span>;
}

export function KbdGroup({ keys = [] }) {
  return (
    <span className="inline-flex items-center gap-1">
      {keys.map((k, i) => (
        <Kbd key={i}>{k}</Kbd>
      ))}
    </span>
  );
}
