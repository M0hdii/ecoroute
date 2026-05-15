import { useCallback, useEffect, useMemo, useState } from "react";
import Landing from "./components/Landing";
import AppShell from "./components/layout/AppShell";
import Overview from "./components/pages/Overview";
import Planner from "./components/pages/Planner";
import Deliveries from "./components/pages/Deliveries";
import Fleet from "./components/pages/Fleet";
import Alerts, { AlertsPopup } from "./components/pages/Alerts";
import Analytics from "./components/pages/Analytics";
import Team from "./components/pages/Team";
import RouteBotPanel from "./components/RouteBotPanel";
import CommandPalette from "./components/CommandPalette";
import { realtimeAlerts } from "./lib/constants";
import { detectScenario, getMoroccoTimeString } from "./lib/helpers";
import { computeMetrics } from "./lib/routeMath";
import { getSavedRoutes, saveRoute } from "./lib/storage";

export default function App() {
  // ---------- top-level view ----------
  const [view, setView] = useState("landing");
  const [activeScreen, setActiveScreen] = useState("overview");

  // ---------- planner state ----------
  const [startCity, setStartCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [waypoints, setWaypoints] = useState([]);
  const [optimizedStartCity, setOptimizedStartCity] = useState("");
  const [optimizedDestinationCity, setOptimizedDestinationCity] = useState("");
  const [mode, setMode] = useState("ai");
  const [scenario] = useState("normal");
  const [loading, setLoading] = useState(false);
  const [hasRoute, setHasRoute] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [aiRouteDecision, setAiRouteDecision] = useState(null);
  const [lastAiPayload, setLastAiPayload] = useState(null);
  const [savedSignal, setSavedSignal] = useState(0);

  // ---------- UI chrome ----------
  const [liveTime, setLiveTime] = useState(getMoroccoTimeString());
  const [botOpen, setBotOpen] = useState(false);
  const [alertsPopupOpen, setAlertsPopupOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setLiveTime(getMoroccoTimeString()), 30000);
    return () => clearInterval(id);
  }, []);

  // ---------- Keyboard shortcut for ⌘K ----------
  useEffect(() => {
    function handler(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (view !== "landing") setCommandOpen((v) => !v);
      } else if (e.key === "Escape") {
        if (commandOpen) setCommandOpen(false);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [view, commandOpen]);

  function clearCurrentRoute() {
    setHasRoute(false);
    setMetrics(null);
    setOptimizedStartCity("");
    setOptimizedDestinationCity("");
  }

  function handleMapCitySelect(cityKey) {
    clearCurrentRoute();
    if (!startCity) {
      setStartCity(cityKey);
      return;
    }
    if (cityKey === startCity) return;
    setDestinationCity(cityKey);
  }

  const detectedScenarioKey = detectScenario(startCity, destinationCity);

  const simulateOptimize = useCallback(
    async (nextMode = mode) => {
      if (!startCity || !destinationCity || startCity === destinationCity)
        return;

      setLoading(true);

      try {
        let finalMode = nextMode;
        let finalWaypoints = waypoints;
        let decision = null;

        try {
          const aiPayload = {
            startCity,
            destinationCity,
            waypoints,
            mode: nextMode,
            scenarioKey: detectedScenarioKey,
          };

          console.log("Route envoyée à l'IA :", aiPayload);
          setLastAiPayload(aiPayload);

          const AI_ENDPOINT =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api/ai-route-decision"
    : "/api/ai-route-decision";

const response = await fetch(AI_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(aiPayload),
          });

          if (response.ok) {
            decision = await response.json();
            if (
              Array.isArray(decision.optimizedStopOrder) &&
              decision.optimizedStopOrder.length === waypoints.length
            ) {
              finalWaypoints = decision.optimizedStopOrder;
            }
            // In "AI" mode, let Groq pick the best mode (eco / classic / ai).
            // If the user explicitly chose Éco or Rapide, that choice always wins.
            const groqMode = decision.recommendedMode;
            const groqModeIsValid = ["ai", "eco", "classic"].includes(groqMode);
            if (nextMode === "ai" && groqModeIsValid) {
              finalMode = groqMode;
            } else {
              finalMode = nextMode;
            }
            setAiRouteDecision({
              ...decision,
              selectedMode: finalMode,
              userMode: nextMode,
              recommendedMode: groqMode || nextMode,
            });
          }
        } catch (aiError) {
          console.warn("AI route decision unavailable, using local logic.", aiError);
          setAiRouteDecision({
            source: "local",
            selectedMode: nextMode,
            recommendedMode: nextMode,
            optimizedStopOrder: waypoints,
            riskLevel: detectedScenarioKey === "normal" ? "Faible" : "Moyen",
            reason: "Décision IA indisponible : calcul local utilisé.",
            advice: ["Vérifier le serveur IA ou la clé GROQ_API_KEY."],
          });
        }

        const nextMetrics = computeMetrics({
          startCity,
          destinationCity,
          waypoints: finalWaypoints,
          mode: finalMode,
          scenarioKey: detectedScenarioKey,
        });

        if (finalWaypoints.join("|") !== waypoints.join("|")) {
          setWaypoints(finalWaypoints);
        }

        setMetrics(nextMetrics);
        setOptimizedStartCity(startCity);
        setOptimizedDestinationCity(destinationCity);
        setHasRoute(true);
      } finally {
        setLoading(false);
      }
    },
    [startCity, destinationCity, waypoints, mode, detectedScenarioKey]
  );

  function handleModeChange(nextMode) {
    setMode(nextMode);
    if (!hasRoute || !startCity || !destinationCity) return;

    // Mode switch should be instant: keep the same geometry, just recompute metrics.
    // Re-running the full pipeline (AI + OSRM) used to flash the polyline empty.
    // When the user picks "AI", reapply Groq's stored recommendation if we have one.
    const groqMode = aiRouteDecision?.recommendedMode;
    const groqModeIsValid = ["ai", "eco", "classic"].includes(groqMode);
    const effectiveMode =
      nextMode === "ai" && groqModeIsValid ? groqMode : nextMode;

    const nextMetrics = computeMetrics({
      startCity,
      destinationCity,
      waypoints,
      mode: effectiveMode,
      scenarioKey: detectedScenarioKey,
    });
    setMetrics(nextMetrics);

    // Keep the AI decision card in sync with the user override.
    setAiRouteDecision((prev) =>
      prev
        ? {
            ...prev,
            userMode: nextMode,
            selectedMode: effectiveMode,
          }
        : prev
    );
  }

  function addWaypoint(cityKey) {
    setWaypoints((wps) => (wps.includes(cityKey) ? wps : [...wps, cityKey]));
    clearCurrentRoute();
  }

  function removeWaypoint(idx) {
    setWaypoints((wps) => wps.filter((_, i) => i !== idx));
    clearCurrentRoute();
  }

  function reorderWaypoints(fromIdx, toIdx) {
    setWaypoints((wps) => {
      if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0) return wps;
      if (fromIdx >= wps.length || toIdx >= wps.length) return wps;
      const next = [...wps];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
    clearCurrentRoute();
  }

  function handleSaveRoute() {
    saveRoute({
      from: optimizedStartCity || startCity,
      to: optimizedDestinationCity || destinationCity,
      waypoints,
      mode,
      metrics,
    });
    setSavedSignal((s) => s + 1);
  }

  function handleLoadSaved(r) {
    setStartCity(r.from);
    setDestinationCity(r.to);
    setWaypoints(r.waypoints || []);
    if (r.mode) setMode(r.mode);
    setActiveScreen("planner");
    setTimeout(() => simulateOptimize(r.mode || mode), 50);
  }

  const isSaved = useMemo(() => {
    if (!hasRoute) return false;
    const list = getSavedRoutes();
    return list.some(
      (r) =>
        r.from === (optimizedStartCity || startCity) &&
        r.to === (optimizedDestinationCity || destinationCity)
    );
    // savedSignal forces recompute after a save
  }, [
    hasRoute,
    startCity,
    destinationCity,
    optimizedStartCity,
    optimizedDestinationCity,
    savedSignal,
  ]);

  const highAlertCount = realtimeAlerts.filter(
    (a) => a.level === "Élevé"
  ).length;

  if (view === "landing") {
    return <Landing onEnter={() => setView("app")} />;
  }

  return (
    <>
      <AppShell
        active={activeScreen}
        onChange={setActiveScreen}
        onExit={() => setView("landing")}
        liveTime={liveTime}
        alertCount={highAlertCount}
        onOpenBot={() => setBotOpen(true)}
        onOpenAlerts={() => setAlertsPopupOpen(true)}
        onOpenCommand={() => setCommandOpen(true)}
      >
        {activeScreen === "overview" ? (
          <Overview
            onNavigate={setActiveScreen}
            onLoadSaved={handleLoadSaved}
            onOpenBot={() => setBotOpen(true)}
          />
        ) : null}

        {activeScreen === "planner" ? (
          <Planner
            startCity={startCity}
            setStartCity={setStartCity}
            destinationCity={destinationCity}
            setDestinationCity={setDestinationCity}
            waypoints={waypoints}
            addWaypoint={addWaypoint}
            removeWaypoint={removeWaypoint}
            reorderWaypoints={reorderWaypoints}
            mode={mode}
            onModeChange={handleModeChange}
            detectedScenarioKey={detectedScenarioKey}
            hasRoute={hasRoute}
            metrics={metrics}
            aiRouteDecision={aiRouteDecision}
            lastAiPayload={lastAiPayload}
            loading={loading}
            onOptimize={() => simulateOptimize(mode)}
            optimizedStartCity={optimizedStartCity}
            optimizedDestinationCity={optimizedDestinationCity}
            onClearRoute={clearCurrentRoute}
            onMapCitySelect={handleMapCitySelect}
            onSaveRoute={handleSaveRoute}
            isSaved={isSaved}
          />
        ) : null}

        {activeScreen === "deliveries" ? (
          <Deliveries
            selectedDelivery={selectedDelivery}
            onSelectDelivery={setSelectedDelivery}
          />
        ) : null}

        {activeScreen === "fleet" ? <Fleet /> : null}

        {activeScreen === "alerts" ? <Alerts /> : null}

        {activeScreen === "analytics" ? <Analytics metrics={metrics} /> : null}

        {activeScreen === "team" ? <Team /> : null}

        {alertsPopupOpen ? (
          <AlertsPopup onClose={() => setAlertsPopupOpen(false)} />
        ) : null}
      </AppShell>

      <RouteBotPanel
        open={botOpen}
        onClose={() => setBotOpen(false)}
        startCity={startCity}
        destinationCity={destinationCity}
        mode={mode}
        scenario={scenario}
        metrics={metrics}
        hasRoute={hasRoute}
        selectedDelivery={selectedDelivery}
      />

      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onNavigate={(key) => setActiveScreen(key)}
        onOpenBot={() => setBotOpen(true)}
        onSelectCity={(key) => {
          handleMapCitySelect(key);
          setActiveScreen("planner");
        }}
      />
    </>
  );
}
