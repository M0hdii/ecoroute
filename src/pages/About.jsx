import { Info, Users, Sparkles, Target, Leaf, Github, Mail } from "lucide-react";
import { team } from "../lib/data";
import { Card, CardHeader, SectionTitle, Button } from "../components/ui";
import { LogoMark } from "../components/Logo";

export function AboutPage() {
  return (
    <div className="space-y-5">
      <Card tone="raised">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
              <LogoMark size={40} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="chip" style={{ background: "rgba(52,211,153,0.12)", color: "#6ee7b7", border: "1px solid rgba(52,211,153,0.35)" }}>
                  Prototype 2026
                </span>
                <span className="chip" style={{ background: "rgba(129,140,248,0.12)", color: "#a5b4fc", border: "1px solid rgba(129,140,248,0.35)" }}>
                  Open source
                </span>
              </div>
              <h2 className="text-[22px] font-extrabold text-slate-50 tracking-tight">
                EcoRoute — logistique intelligente pour le Maroc
              </h2>
              <p className="text-[13px] text-slate-400 mt-1 max-w-2xl leading-relaxed">
                EcoRoute réunit planification d'itinéraires, suivi temps réel
                et copilote IA dans un seul tableau de bord. Objectif : livrer
                plus vite, moins cher, avec moins d'émissions.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
          <Pillar
            icon={Target}
            title="Objectif"
            body="Démontrer comment l'IA peut soutenir les décisions logistiques dans un contexte marocain."
            accent="#818cf8"
          />
          <Pillar
            icon={Leaf}
            title="Durabilité"
            body="Mesure, recommandations et reporting CO₂ intégrés à chaque trajet."
            accent="#34d399"
          />
          <Pillar
            icon={Sparkles}
            title="Copilote"
            body="RouteBot répond en langage naturel, comme un dispatcher expérimenté."
            accent="#22d3ee"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-5">
        <Card tone="default">
          <CardHeader
            title="Équipe EcoRoute"
            subtitle="Un projet étudiant / prototype, conçu pour évoluer vers un vrai produit."
            icon={Users}
            accent="#a5b4fc"
          />
          <div className="rounded-xl p-4 border border-indigo-400/25 bg-indigo-400/6 mb-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-200 mb-1">
              Développeur principal
            </div>
            <div className="text-[15px] font-extrabold text-slate-50">
              {team.lead}
            </div>
          </div>
          <SectionTitle accent="#94a3b8">Membres de l'équipe</SectionTitle>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {team.members.map((m) => (
              <li
                key={m}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/8"
              >
                <span className="w-7 h-7 rounded-full bg-emerald-400/12 border border-emerald-400/30 flex items-center justify-center text-[11px] font-bold text-emerald-200">
                  {m.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </span>
                <span className="text-[12.5px] font-semibold text-slate-200">{m}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card tone="default">
          <CardHeader
            title="Technologies"
            icon={Info}
            accent="#22d3ee"
            action={
              <div className="flex gap-2">
                <Button variant="ghost" icon={Github}>
                  Code
                </Button>
                <Button variant="ghost" icon={Mail}>
                  Contact
                </Button>
              </div>
            }
          />
          <div className="grid grid-cols-2 gap-2">
            {[
              "React 19",
              "Vite",
              "Tailwind v4",
              "React Leaflet",
              "Lucide Icons",
              "Node + Express",
              "Groq LLM",
              "OSRM routing",
            ].map((t) => (
              <div
                key={t}
                className="rounded-lg px-3 py-2 text-[12px] font-semibold text-slate-200 bg-white/[0.03] border border-white/8"
              >
                {t}
              </div>
            ))}
          </div>

          <div className="mt-5">
            <SectionTitle accent="#fbbf24">Roadmap proche</SectionTitle>
            <ul className="text-[12.5px] text-slate-300 space-y-2">
              {[
                "Branchement APIs trafic/météo réelles",
                "Mode multi-arrêts avec optimisation TSP",
                "Suivi GPS flotte + replay de tournée",
                "Export CO₂ au format règlementaire",
              ].map((r) => (
                <li key={r} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Pillar({ icon: Icon, title, body, accent }) {
  return (
    <div
      className="rounded-xl p-4 border"
      style={{
        background: `${accent}0D`,
        borderColor: `${accent}33`,
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
        style={{
          background: `${accent}1A`,
          color: accent,
          border: `1px solid ${accent}40`,
        }}
      >
        <Icon size={15} />
      </div>
      <div className="text-[13.5px] font-bold text-slate-100">{title}</div>
      <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">{body}</p>
    </div>
  );
}
