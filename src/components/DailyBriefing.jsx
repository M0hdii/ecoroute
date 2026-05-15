import { useMemo, useState } from "react";
import {
  Bot,
  Sparkles,
  RefreshCw,
  ShieldAlert,
  CloudRain,
  ArrowRight,
  Target,
  Activity,
} from "lucide-react";
import { Card, Badge } from "./ui/Primitives";
import {
  fleetVehicles,
  realtimeAlerts,
  weatherSnapshot,
  deliveryStops,
} from "../lib/constants";
import { useLang, useT } from "../lib/i18n";

// Build a deterministic-but-feels-live morning briefing from the existing
// constants. No backend call needed — RouteBot "would" produce these with
// the same data.
function buildBriefing(seed) {
  const enRoute = fleetVehicles.filter((v) => v.status === "en_route");
  const incident = fleetVehicles.find((v) => v.incident);
  const highAlert = realtimeAlerts.find((a) => a.level === "Élevé");
  const rainCity = weatherSnapshot.find((w) => w.cond === "rain");

  const priorityVehicle =
    incident ||
    enRoute.find((v) => v.priority === "Haute") ||
    enRoute[0] ||
    fleetVehicles[0];

  const tightWindow = deliveryStops.find(
    (d) =>
      d.priority === "Haute" ||
      String(d.client).toLowerCase().includes("incident")
  );

  // ---- Three rotating action variations so "Refresh" feels meaningful ----
  const actionsPool = [
    {
      icon: Target,
      labelFR: "Action prioritaire",
      labelAR: "إجراء أولوي",
      titleFR: incident
        ? `Surveiller ${incident.id} · reroutage IA actif`
        : `Lancer ${priorityVehicle?.id || "TRK-201"} en premier`,
      titleAR: incident
        ? `راقب ${incident.id} · إعادة التوجيه نشطة`
        : `أرسل ${priorityVehicle?.id || "TRK-201"} أولاً`,
      bodyFR: incident
        ? `Le camion ${incident.id} est en déviation. ETA ${incident.eta} dans la fenêtre ${incident.arrivalWindow}.`
        : `Tournée ${priorityVehicle?.from} → ${priorityVehicle?.to}. Charge ${priorityVehicle?.load}%, ETA ${priorityVehicle?.eta}.`,
      bodyAR: incident
        ? `الشاحنة ${incident.id} في تحويلة. الوصول ${incident.eta} داخل النافذة ${incident.arrivalWindow}.`
        : `الجولة ${priorityVehicle?.from} → ${priorityVehicle?.to}. الحمولة ${priorityVehicle?.load}٪، الوصول ${priorityVehicle?.eta}.`,
    },
    {
      icon: CloudRain,
      labelFR: "Météo",
      labelAR: "الطقس",
      titleFR: rainCity
        ? `Pluie sur ${rainCity.city} : prévoir +15 min`
        : "Conditions clémentes sur la flotte",
      titleAR: rainCity
        ? `أمطار على ${rainCity.city}: احسب +١٥ د`
        : "ظروف جيدة على الأسطول",
      bodyFR: rainCity
        ? `Sécuriser les freins et garder une distance accrue. Vent ${rainCity.wind} km/h.`
        : "Aucun événement météo bloquant. Avantage carburant si vous activez le mode Éco.",
      bodyAR: rainCity
        ? `راقب الفرامل وحافظ على مسافة كافية. رياح ${rainCity.wind} كم/س.`
        : "لا حدث جوي معيق. ميزة وقود إن فعّلت الوضع البيئي.",
    },
    {
      icon: ShieldAlert,
      labelFR: "Risque opérationnel",
      labelAR: "مخاطر تشغيلية",
      titleFR: highAlert
        ? highAlert.title
        : "Aucun risque haute priorité détecté",
      titleAR: highAlert ? highAlert.title : "لا توجد مخاطر عالية الأولوية",
      bodyFR: highAlert
        ? `${highAlert.text} · ${highAlert.location || ""}`
        : "RouteBot continue d'analyser les données live, vous serez prévenu si un risque émerge.",
      bodyAR: highAlert
        ? `${highAlert.text} · ${highAlert.location || ""}`
        : "يواصل RouteBot تحليل البيانات الحية. سيتم إعلامك عند ظهور أي خطر.",
    },
  ];

  // Use seed to subtly rotate the order so refresh changes which item leads.
  const offset = seed % 3;
  const rotated = [
    actionsPool[offset],
    actionsPool[(offset + 1) % 3],
    actionsPool[(offset + 2) % 3],
  ];

  const summaryFR = incident
    ? `${enRoute.length} camions en route, dont ${incident.id} en reroutage IA actif. ${
        rainCity ? `Pluie repérée à ${rainCity.city}.` : "Météo stable globalement."
      }`
    : `${enRoute.length} camions en mouvement, ${tightWindow ? "1 fenêtre serrée à respecter" : "aucune fenêtre critique"}. ${
        rainCity ? `Surveiller la pluie sur ${rainCity.city}.` : "Météo favorable."
      }`;

  const summaryAR = incident
    ? `${enRoute.length} شاحنات في الطريق، ومن بينها ${incident.id} في إعادة توجيه نشطة. ${
        rainCity ? `أمطار في ${rainCity.city}.` : "الطقس مستقر إجمالاً."
      }`
    : `${enRoute.length} شاحنات في الحركة، ${tightWindow ? "نافذة ضيقة واحدة يجب احترامها" : "لا توجد نافذة حرجة"}. ${
        rainCity ? `راقب الأمطار في ${rainCity.city}.` : "طقس مناسب."
      }`;

  return { items: rotated, summaryFR, summaryAR };
}

export default function DailyBriefing({ onOpenBot }) {
  const t = useT();
  const { lang } = useLang();
  const [seed, setSeed] = useState(0);

  const briefing = useMemo(() => buildBriefing(seed), [seed]);
  const summary = lang === "ar" ? briefing.summaryAR : briefing.summaryFR;

  return (
    <Card variant="eco" className="relative overflow-hidden p-5 md:p-6">
      <div
        className="absolute -top-16 -right-16 w-72 h-72 rounded-full blur-3xl opacity-40"
        style={{ background: "rgba(163,230,53,0.30)" }}
      />
      <div
        className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl opacity-25"
        style={{ background: "rgba(56,189,248,0.18)" }}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl eco-gradient-bg text-ink-950 flex items-center justify-center shrink-0"
              style={{ boxShadow: "0 12px 28px rgba(163,230,53,0.40)" }}
            >
              <Bot size={20} strokeWidth={2.4} />
            </div>
            <div>
              <Badge color="lime" icon={Sparkles}>
                {t("brief.eyebrow")}
              </Badge>
              <h2 className="mt-2 font-display font-bold text-xl md:text-2xl tracking-tight leading-tight">
                {t("brief.title")}
              </h2>
              <p className="mt-1 text-[12.5px] text-white/55">
                {t("brief.subtitle")}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSeed((s) => s + 1)}
            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-[11px] font-bold uppercase tracking-wider text-white/70 hover:text-white transition shrink-0"
            title={t("brief.refresh")}
          >
            <RefreshCw size={11} />
            {t("brief.refresh")}
          </button>
        </div>

        {/* Live one-liner summary */}
        <div className="mt-4 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-[12.5px] text-white/75 leading-relaxed flex items-start gap-2.5">
          <Activity size={13} className="text-eco-300 shrink-0 mt-0.5" />
          <span>{summary}</span>
        </div>

        {/* Three bullets */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {briefing.items.map((item, i) => {
            const Icon = item.icon;
            const label = lang === "ar" ? item.labelAR : item.labelFR;
            const title = lang === "ar" ? item.titleAR : item.titleFR;
            const body = lang === "ar" ? item.bodyAR : item.bodyFR;
            return (
              <div
                key={i}
                className="rounded-xl p-3.5 bg-white/[0.03] border border-white/8 hover:border-eco-300/35 transition flex flex-col gap-2"
              >
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-eco-300">
                  <Icon size={12} />
                  {label}
                </div>
                <div className="font-display font-bold text-sm leading-snug">
                  {title}
                </div>
                <div className="text-[12px] text-white/60 leading-relaxed">
                  {body}
                </div>
              </div>
            );
          })}
        </div>

        {onOpenBot ? (
          <div className="mt-4 flex justify-end">
            <button
              onClick={onOpenBot}
              className="inline-flex items-center gap-1.5 text-[12px] font-bold text-eco-300 hover:text-eco-200 transition"
            >
              {t("bot.online")}
              <ArrowRight size={13} />
            </button>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
