import { useEffect, useMemo, useState } from "react";
import { Sidebar, MobileTopNav } from "./components/Sidebar";
import { TopBar } from "./components/TopBar";
import { AssistantDrawer } from "./components/AssistantDrawer";
import { HomePage } from "./pages/Home";
import { DeliveriesPage } from "./pages/Deliveries";
import { AlertsPage } from "./pages/Alerts";
import { Co2ReportPage } from "./pages/Co2Report";
import { SettingsPage } from "./pages/Settings";
import { AboutPage } from "./pages/About";
import {
  computeRouteMetrics,
  detectScenarioKey,
  scenarioDescription,
  getMoroccoTimeString,
} from "./lib/helpers";
import { realtimeAlerts } from "./lib/data";

const screenMeta = {
  home: {
    title: "Tableau de bord EcoRoute",
    subtitle: "Vue d'ensemble de la flotte et planification en temps réel",
  },
  deliveries: {
    title: "Livraisons en cours",
    subtitle: "Suivi des tournées, incidents et recalibrations IA",
  },
  alerts: {
    title: "Alertes & incidents",
    subtitle: "Flux temps réel de RouteBot",
  },
  co2: {
    title: "Rapport CO₂",
    subtitle: "Impact environnemental et gains de la flotte",
  },
  settings: {
    title: "Paramètres",
    subtitle: "Personnalisation d'EcoRoute et de RouteBot",
  },
  about: {
    title: "À propos d'EcoRoute",
    subtitle: "Équipe, technologies et feuille de route",
  },
};

export default function App() {
  const [screen, setScreen] = useState("home");
  const [startCity, setStartCity] = useState("Rabat");
  const [destinationCity, setDestinationCity] = useState("Casablanca");
  const [mode, setMode] = useState("ai");
  const [loading, setLoading] = useState(false);
  const [hasRoute, setHasRoute] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [liveTime, setLiveTime] = useState(getMoroccoTimeString());
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  // Live clock
  useEffect(() => {
    const id = setInterval(() => setLiveTime(getMoroccoTimeString()), 30_000);
    return () => clearInterval(id);
  }, []);

  const detectedKey = useMemo(
    () => detectScenarioKey(startCity, destinationCity),
    [startCity, destinationCity]
  );
  const detectedScenario = useMemo(
    () => ({ key: detectedKey, ...scenarioDescription(detectedKey) }),
    [detectedKey]
  );

  function runOptimize(nextMode = mode) {
    if (!startCity || !destinationCity || startCity === destinationCity) return;
    setLoading(true);
    setTimeout(() => {
      const result = computeRouteMetrics({
        startCity,
        destinationCity,
        mode: nextMode,
        scenarioKey: detectedKey,
      });
      setMetrics(result);
      setHasRoute(true);
      setLoading(false);
    }, 650);
  }

  function handleModeChange(nextMode) {
    setMode(nextMode);
    if (hasRoute) runOptimize(nextMode);
  }

  function handleSwapCities() {
    setStartCity(destinationCity);
    setDestinationCity(startCity);
    if (hasRoute) {
      // recompute with swapped cities on next tick
      setTimeout(() => runOptimize(mode), 0);
    }
  }

  const meta = screenMeta[screen] || screenMeta.home;
  const alertCount = realtimeAlerts.filter((a) => a.level !== "Faible").length;

  return (
    <div className="flex min-h-screen">
      <Sidebar
        activeScreen={screen}
        onNavigate={setScreen}
        onOpenAssistant={() => setAssistantOpen(true)}
      />

      <main className="flex-1 min-w-0 flex flex-col">
        <TopBar
          title={meta.title}
          subtitle={meta.subtitle}
          liveTime={liveTime}
          alertCount={alertCount}
          onOpenAlerts={() => setScreen("alerts")}
          onOpenAssistant={() => setAssistantOpen(true)}
        />

        <MobileTopNav activeScreen={screen} onNavigate={setScreen} />

        <div className="p-4 sm:p-6 flex-1">
          {screen === "home" && (
            <HomePage
              startCity={startCity}
              destinationCity={destinationCity}
              onStartCityChange={(v) => {
                setStartCity(v);
                setHasRoute(false);
                setMetrics(null);
              }}
              onDestinationCityChange={(v) => {
                setDestinationCity(v);
                setHasRoute(false);
                setMetrics(null);
              }}
              mode={mode}
              onModeChange={handleModeChange}
              onOptimize={() => runOptimize(mode)}
              loading={loading}
              hasRoute={hasRoute}
              metrics={metrics}
              detectedScenario={detectedScenario}
              onSwapCities={handleSwapCities}
            />
          )}

          {screen === "deliveries" && (
            <DeliveriesPage
              selectedDelivery={selectedDelivery}
              onSelectDelivery={setSelectedDelivery}
            />
          )}

          {screen === "alerts" && <AlertsPage />}
          {screen === "co2" && <Co2ReportPage />}
          {screen === "settings" && <SettingsPage />}
          {screen === "about" && <AboutPage />}
        </div>

        <footer className="px-4 sm:px-6 py-4 border-t border-white/5 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>
            © 2026 EcoRoute · Prototype académique · Conçu au Maroc
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 anim-pulse-dot" />
            Flux temps réel simulé
          </span>
        </footer>
      </main>

      <AssistantDrawer
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        startCity={startCity}
        destinationCity={destinationCity}
        mode={mode}
        scenarioKey={detectedKey}
        metrics={metrics}
        hasRoute={hasRoute}
        selectedDelivery={selectedDelivery}
      />
    </div>
  );
}
