// Client API léger pour le backend Express (server.js).
// Base URL: on suppose un proxy local ou même origine en dev.

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

async function post(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${path} a échoué (${res.status}) ${text}`);
  }
  return res.json();
}

export function optimizeRoute(payload) {
  return post("/api/optimize-route", payload);
}

export function fetchRealtime(payload) {
  return post("/api/realtime-data", payload);
}

export function askAssistant(payload) {
  return post("/api/assistant", payload);
}
