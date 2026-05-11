import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar.jsx";
import TopBar from "./components/TopBar.jsx";
import AssistantDrawer from "./components/AssistantDrawer.jsx";
import Dashboard from "./views/Dashboard.jsx";
import Planner from "./views/Planner.jsx";
import Shipments from "./views/Shipments.jsx";
import Fleet from "./views/Fleet.jsx";
import Alerts from "./views/Alerts.jsx";
import Analytics from "./views/Analytics.jsx";
import Settings from "./views/Settings.jsx";
import { ALERTS, SHIPMENTS } from "./data.js";

const PAGE_META = {
  dashboard: {
    title: "Tableau de bord",
    subtitle: "Vue d'ensemble de vos opérations logistiques",
  },
  planner: {
    title: "Planificateur",
    subtitle: "Calculez et optimisez vos itinéraires",
  },
  shipments: {
    title: "Expéditions",
    subtitle: "Suivi et gestion des livraisons",
  },
  fleet: { title: "Flotte", subtitle: "Supervision des véhicules" },
  alerts: { title: "Alertes", subtitle: "Notifications opérationnelles" },
  analytics: {
    title: "Analytique",
    subtitle: "Indicateurs de performance",
  },
  settings: { title: "Paramètres", subtitle: "Configuration de la plateforme" },
  help: { title: "Aide & support", subtitle: "Documentation et contact" },
};

export default function App() {
  const [view, setView] = useState("dashboard");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [liveTime, setLiveTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setLiveTime(
        d.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const meta = PAGE_META[view] || PAGE_META.dashboard;

  const content = (() => {
    switch (view) {
      case "dashboard":
        return <Dashboard onGoToPlanner={() => setView("planner")} />;
      case "planner":
        return <Planner />;
      case "shipments":
        return <Shipments />;
      case "fleet":
        return <Fleet />;
      case "alerts":
        return <Alerts />;
      case "analytics":
        return <Analytics />;
      case "settings":
        return <Settings />;
      case "help":
        return <HelpView />;
      default:
        return <Dashboard />;
    }
  })();

  const assistantContext = {
    shipments: SHIPMENTS.slice(0, 5),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="flex min-h-screen">
        <Sidebar
          active={view}
          onChange={(id) => {
            setView(id);
            setMobileNavOpen(false);
          }}
          badges={{ alerts: ALERTS.filter((a) => a.level !== "info").length }}
          onOpenAssistant={() => setAssistantOpen(true)}
        />

        {/* Mobile nav overlay */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-slate-900/30"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-64 bg-white">
              <Sidebar
                active={view}
                onChange={(id) => {
                  setView(id);
                  setMobileNavOpen(false);
                }}
                badges={{ alerts: ALERTS.filter((a) => a.level !== "info").length }}
                onOpenAssistant={() => {
                  setAssistantOpen(true);
                  setMobileNavOpen(false);
                }}
              />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar
            title={meta.title}
            subtitle={meta.subtitle}
            liveTime={liveTime}
            onOpenAssistant={() => setAssistantOpen(true)}
            onToggleMobileNav={() => setMobileNavOpen(true)}
            alertsCount={ALERTS.filter((a) => a.level !== "info").length}
          />

          <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
            {content}
          </main>
        </div>
      </div>

      <AssistantDrawer
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        liveTime={liveTime}
        context={assistantContext}
      />
    </div>
  );
}

function HelpView() {
  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-emerald-700 mb-1">
          Support
        </p>
        <h1 className="text-xl font-semibold text-slate-900">Aide & documentation</h1>
        <p className="mt-1 text-sm text-slate-500 max-w-2xl">
          Retrouvez la documentation, les guides pratiques et les contacts support.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Guide de démarrage",
            desc: "Premiers pas avec EcoRoute : paramétrage, utilisateurs, premières tournées.",
          },
          {
            title: "API & intégrations",
            desc: "Connectez EcoRoute à votre ERP, TMS ou systèmes de géolocalisation.",
          },
          {
            title: "Contact support",
            desc: "Notre équipe répond en moins de 2 h ouvrées. Ligne prioritaire 24/7 pour les clients Entreprise.",
          },
        ].map((c) => (
          <div
            key={c.title}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <h3 className="text-sm font-semibold text-slate-900">{c.title}</h3>
            <p className="mt-1.5 text-sm text-slate-500">{c.desc}</p>
            <button className="mt-4 text-xs font-medium text-emerald-700 hover:text-emerald-800">
              Ouvrir →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
