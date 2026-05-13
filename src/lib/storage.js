// Small localStorage wrapper for saved/recent routes.
const KEY = "ecoroute.saved.v1";
const MAX = 8;

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    /* noop */
  }
}

export function getSavedRoutes() {
  return read();
}

export function saveRoute({ from, to, waypoints = [], mode, metrics }) {
  if (!from || !to) return;
  const entry = {
    id: `${from}-${to}-${Date.now()}`,
    from,
    to,
    waypoints,
    mode,
    metrics,
    savedAt: new Date().toISOString(),
  };
  const existing = read().filter(
    (r) => !(r.from === from && r.to === to && (r.waypoints || []).join() === waypoints.join())
  );
  write([entry, ...existing]);
  return entry;
}

export function removeRoute(id) {
  const next = read().filter((r) => r.id !== id);
  write(next);
  return next;
}

export function clearSavedRoutes() {
  write([]);
}
