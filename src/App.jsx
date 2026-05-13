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
    (nextMode = mode) => {
      if (!startCity || !destinationCity || startCity === destinationCity)
        return;
      setLoading(true);
      setTimeout(() => {
        const nextMetrics = computeMetrics({
          startCity,
          destinationCity,
          mode: nextMode,
          scenarioKey: detectedScenarioKey,
        });
        setMetrics(nextMetrics);
        setOptimizedStartCity(startCity);
        setOptimizedDestinationCity(destinationCity);
        setHasRoute(true);
        setLoading(false);
      }, 650);
    },
    [startCity, destinationCity, mode, detectedScenarioKey]
  );

  function handleModeChange(nextMode) {
    setMode(nextMode);
    if (hasRoute && startCity && destinationCity) {
      simulateOptimize(nextMode);
    }
  }

  function addWaypoint(cityKey) {
    setWaypoints((wps) => (wps.includes(cityKey) ? wps : [...wps, cityKey]));
  }

  function removeWaypoint(idx) {
    setWaypoints((wps) => wps.filter((_, i) => i !== idx));
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
            mode={mode}
            onModeChange={handleModeChange}
            detectedScenarioKey={detectedScenarioKey}
            hasRoute={hasRoute}
            metrics={metrics}
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
