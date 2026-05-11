import { useEffect, useState } from "react";
import Landing from "./components/Landing";
import AppShell from "./components/layout/AppShell";
import Dashboard from "./components/pages/Dashboard";
import Deliveries from "./components/pages/Deliveries";
import Alerts, { AlertsPopup } from "./components/pages/Alerts";
import Co2Report from "./components/pages/Co2Report";
import Team from "./components/pages/Team";
import RouteBotPanel from "./components/RouteBotPanel";
import { realtimeAlerts } from "./lib/constants";
import { detectScenario, getMoroccoTimeString } from "./lib/helpers";
import { computeMetrics } from "./lib/routeMath";

export default function App() {
  // ---------- top-level view ----------
  const [view, setView] = useState("landing"); // "landing" | "app"
  const [activeScreen, setActiveScreen] = useState("home");

  // ---------- planner state ----------
  const [startCity, setStartCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [optimizedStartCity, setOptimizedStartCity] = useState("");
  const [optimizedDestinationCity, setOptimizedDestinationCity] = useState("");
  const [mode, setMode] = useState("ai");
  const [scenario] = useState("normal");
  const [loading, setLoading] = useState(false);
  const [hasRoute, setHasRoute] = useState(false);
  const [metrics, setMetrics] = useState(null);

  // ---------- UI chrome ----------
  const [liveTime, setLiveTime] = useState(getMoroccoTimeString());
  const [botOpen, setBotOpen] = useState(false);
  const [alertsPopupOpen, setAlertsPopupOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setLiveTime(getMoroccoTimeString()), 30000);
    return () => clearInterval(id);
  }, []);

  const detectedScenarioKey = detectScenario(startCity, destinationCity);

  function simulateOptimize(nextMode = mode) {
    if (!startCity || !destinationCity || startCity === destinationCity) return;
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
  }

  function handleModeChange(nextMode) {
    setMode(nextMode);
    if (hasRoute && startCity && destinationCity) {
      simulateOptimize(nextMode);
    }
  }

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
      >
        {activeScreen === "home" ? (
          <Dashboard
            startCity={startCity}
            setStartCity={setStartCity}
            destinationCity={destinationCity}
            setDestinationCity={setDestinationCity}
            mode={mode}
            onModeChange={handleModeChange}
            detectedScenarioKey={detectedScenarioKey}
            hasRoute={hasRoute}
            metrics={metrics}
            loading={loading}
            onOptimize={() => simulateOptimize(mode)}
            optimizedStartCity={optimizedStartCity}
            optimizedDestinationCity={optimizedDestinationCity}
          />
        ) : null}

        {activeScreen === "deliveries" ? (
          <Deliveries
            selectedDelivery={selectedDelivery}
            onSelectDelivery={setSelectedDelivery}
          />
        ) : null}

        {activeScreen === "alerts" ? <Alerts /> : null}

        {activeScreen === "co2" ? <Co2Report metrics={metrics} /> : null}

        {activeScreen === "settings" ? <Team /> : null}

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
    </>
  );
}
