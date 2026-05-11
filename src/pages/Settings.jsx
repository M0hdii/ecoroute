import { Settings, Bell, Gauge, Globe, Save } from "lucide-react";
import { Card, CardHeader, Button } from "../components/ui";

export function SettingsPage() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <Card tone="raised">
        <CardHeader
          title="Préférences générales"
          subtitle="Personnalisez l'affichage et les unités d'EcoRoute."
          icon={Settings}
          accent="#818cf8"
        />
        <div className="space-y-4">
          <Row
            label="Langue"
            description="Interface et communications RouteBot"
            control={
              <select className="select max-w-[180px]" defaultValue="fr">
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            }
          />
          <Row
            label="Fuseau horaire"
            description="Basé sur l'Afrique / Casablanca"
            control={
              <select className="select max-w-[220px]" defaultValue="casa">
                <option value="casa">Africa/Casablanca (GMT+1)</option>
                <option value="utc">UTC</option>
              </select>
            }
          />
          <Row
            label="Mode sombre"
            description="Recommandé pour la salle d'exploitation"
            control={<Toggle defaultChecked />}
          />
          <Row
            label="Unité de distance"
            description="km ou miles"
            control={
              <select className="select max-w-[140px]" defaultValue="km">
                <option value="km">Kilomètres</option>
                <option value="mi">Miles</option>
              </select>
            }
          />
        </div>
      </Card>

      <Card tone="default">
        <CardHeader
          title="Alertes & notifications"
          icon={Bell}
          accent="#fbbf24"
        />
        <div className="space-y-4">
          <Row
            label="Notifications incidents"
            description="Alerte immédiate sur tout incident terrain"
            control={<Toggle defaultChecked />}
          />
          <Row
            label="Alertes fenêtres horaires"
            description="Prévenir si une livraison dépasse 90 % de sa fenêtre"
            control={<Toggle defaultChecked />}
          />
          <Row
            label="Alertes météo"
            description="Pluie forte, vent > 50 km/h"
            control={<Toggle defaultChecked />}
          />
          <Row
            label="Rapports hebdomadaires"
            description="Envoyer le récap CO₂ chaque lundi"
            control={<Toggle />}
          />
        </div>
      </Card>

      <Card tone="default">
        <CardHeader
          title="Optimisation"
          icon={Gauge}
          accent="#34d399"
        />
        <div className="space-y-4">
          <Row
            label="Mode par défaut"
            description="Appliqué lors du calcul d'un nouveau trajet"
            control={
              <select className="select max-w-[160px]" defaultValue="ai">
                <option value="ai">IA optimisée</option>
                <option value="eco">Mode éco</option>
                <option value="classic">Trajet rapide</option>
              </select>
            }
          />
          <Row
            label="Seuil de recalcul"
            description="Distance avant qu'une alerte déclenche un recalcul"
            control={
              <select className="select max-w-[120px]" defaultValue="10">
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="20">20 km</option>
              </select>
            }
          />
          <Row
            label="Priorité"
            description="Choisissez ce que l'IA doit maximiser"
            control={
              <select className="select max-w-[180px]" defaultValue="balance">
                <option value="balance">Équilibre</option>
                <option value="co2">CO₂</option>
                <option value="speed">Vitesse</option>
                <option value="cost">Coût</option>
              </select>
            }
          />
        </div>
      </Card>

      <Card tone="default">
        <CardHeader
          title="Sécurité & compte"
          icon={Globe}
          accent="#22d3ee"
          action={
            <Button icon={Save}>Enregistrer</Button>
          }
        />
        <div className="space-y-4">
          <Row
            label="Authentification à deux facteurs"
            description="Recommandé pour les rôles administrateur"
            control={<Toggle defaultChecked />}
          />
          <Row
            label="Journal d'audit"
            description="Conserver l'historique des décisions IA"
            control={<Toggle defaultChecked />}
          />
          <Row
            label="Clé API RouteBot"
            description="Utilisée par vos intégrations"
            control={
              <input
                className="input max-w-[220px] tracking-wider"
                readOnly
                value="sk-eco-••••-3F92"
              />
            }
          />
        </div>
      </Card>
    </div>
  );
}

function Row({ label, description, control }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-white/5 last:border-0">
      <div className="min-w-0">
        <div className="text-[13px] font-bold text-slate-100">{label}</div>
        {description ? (
          <div className="text-[11.5px] text-slate-400 mt-0.5">{description}</div>
        ) : null}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

function Toggle({ defaultChecked = false }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer select-none">
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        className="peer sr-only"
      />
      <span
        className="w-10 h-6 rounded-full transition-colors border"
        style={{
          background: defaultChecked
            ? "rgba(52,211,153,0.25)"
            : "rgba(148,163,184,0.18)",
          borderColor: defaultChecked
            ? "rgba(52,211,153,0.5)"
            : "rgba(148,163,184,0.3)",
        }}
      />
      <span
        className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-slate-100 shadow transition-transform"
        style={{
          transform: defaultChecked ? "translateX(16px)" : "translateX(0)",
        }}
      />
    </label>
  );
}
