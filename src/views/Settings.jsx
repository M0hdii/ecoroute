import { useState } from "react";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Globe,
  Users,
  Key,
} from "lucide-react";
import {
  Card,
  CardBody,
  CardHeader,
  PageHeader,
  Button,
  Badge,
  Divider,
} from "../ui.jsx";

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition ${
          checked ? "bg-emerald-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}

export default function Settings() {
  const [alerts, setAlerts] = useState({
    critical: true,
    traffic: true,
    weather: true,
    maintenance: false,
    weekly: true,
  });

  return (
    <div>
      <PageHeader
        eyebrow="Configuration"
        title="Paramètres de la plateforme"
        description="Configurez les préférences de votre espace, les notifications et les accès équipe."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Organization */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              icon={SettingsIcon}
              title="Organisation"
              subtitle="Informations générales de votre compte"
            />
            <CardBody className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Raison sociale" value="EcoRoute Logistics SARL" />
                <Field label="Identifiant fiscal" value="ICE 001234567000089" />
                <Field label="Siège" value="Casablanca, Maroc" />
                <Field label="Responsable" value="M. Omar Ben El Haj" />
              </div>
              <Divider />
              <div className="flex justify-end gap-2">
                <Button variant="secondary">Annuler</Button>
                <Button variant="primary">Enregistrer</Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              icon={Bell}
              title="Notifications"
              subtitle="Choisissez les alertes que vous souhaitez recevoir"
            />
            <CardBody className="divide-y divide-slate-200">
              <Toggle
                checked={alerts.critical}
                onChange={(v) => setAlerts({ ...alerts, critical: v })}
                label="Alertes critiques"
                description="Incidents sur la route, retards importants, pannes véhicule."
              />
              <Toggle
                checked={alerts.traffic}
                onChange={(v) => setAlerts({ ...alerts, traffic: v })}
                label="Trafic en temps réel"
                description="Congestion et ralentissements sur vos itinéraires actifs."
              />
              <Toggle
                checked={alerts.weather}
                onChange={(v) => setAlerts({ ...alerts, weather: v })}
                label="Conditions météo"
                description="Pluie, vent, brouillard sur les zones de livraison."
              />
              <Toggle
                checked={alerts.maintenance}
                onChange={(v) => setAlerts({ ...alerts, maintenance: v })}
                label="Maintenance préventive"
                description="Rappels d'entretien et contrôles techniques."
              />
              <Toggle
                checked={alerts.weekly}
                onChange={(v) => setAlerts({ ...alerts, weekly: v })}
                label="Rapport hebdomadaire"
                description="Synthèse des performances chaque lundi matin."
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              icon={Users}
              title="Équipe & rôles"
              subtitle="Gestion des utilisateurs de la plateforme"
              action={<Button variant="primary" size="sm">Inviter</Button>}
            />
            <CardBody className="p-0">
              <ul className="divide-y divide-slate-200">
                {[
                  { name: "M. Omar Ben El Haj", role: "Admin", email: "omar@ecoroute.ma" },
                  { name: "Youssef Benali", role: "Dispatcher", email: "y.benali@ecoroute.ma" },
                  { name: "Salma El Idrissi", role: "Opérations", email: "s.idrissi@ecoroute.ma" },
                  { name: "Nadia Amrani", role: "Analyste", email: "n.amrani@ecoroute.ma" },
                ].map((u, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                      {u.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                    <Badge tone={u.role === "Admin" ? "emerald" : "slate"}>
                      {u.role}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader icon={Palette} title="Apparence" subtitle="Thème de l'interface" />
            <CardBody className="space-y-2">
              <ThemePreview active label="Clair (actuel)" preview="bg-white border-slate-200" />
              <ThemePreview label="Sombre" preview="bg-slate-900 border-slate-800" />
              <ThemePreview label="Auto" preview="bg-gradient-to-br from-white to-slate-900 border-slate-300" />
            </CardBody>
          </Card>

          <Card>
            <CardHeader icon={Globe} title="Région & langue" />
            <CardBody className="space-y-3">
              <Field label="Langue" value="Français" />
              <Field label="Fuseau horaire" value="Africa/Casablanca (GMT+1)" />
              <Field label="Devise" value="Dirham marocain (DH)" />
              <Field label="Unité de distance" value="Kilomètres" />
            </CardBody>
          </Card>

          <Card>
            <CardHeader icon={Shield} title="Sécurité" />
            <CardBody className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Double authentification
                  </p>
                  <p className="text-xs text-slate-500">Active</p>
                </div>
                <Badge tone="emerald">Activée</Badge>
              </div>
              <Divider />
              <Button variant="secondary" icon={Key} className="w-full">
                Changer le mot de passe
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm text-slate-900">{value}</p>
    </div>
  );
}

function ThemePreview({ label, preview, active }) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition hover:bg-slate-50 ${
        active ? "border-emerald-500 ring-1 ring-emerald-500" : "border-slate-200"
      }`}
    >
      <span className={`h-8 w-12 rounded-md border ${preview}`} />
      <span className="flex-1 text-sm font-medium text-slate-800">{label}</span>
      {active && <Badge tone="emerald">Actif</Badge>}
    </button>
  );
}
