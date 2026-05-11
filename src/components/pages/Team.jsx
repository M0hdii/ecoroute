
import { Users, Crown, Code2, Info, Sparkles, ShieldCheck } from "lucide-react";
import { teamMembers } from "../../lib/constants";
import { Card, Badge, Button } from "../ui/Primitives";

export default function Team() {
  return (
    <div className="p-5 md:p-8 space-y-6">
      {/* Project Card */}
      <Card
        variant="eco"
        className="relative overflow-hidden p-6 md:p-10"
      >
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-40"
          style={{ background: "rgba(163,230,53,0.3)" }}
        />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="max-w-xl">
            <Badge color="eco">Projet académique</Badge>
            <h2 className="mt-3 font-display font-bold text-3xl md:text-4xl tracking-tight leading-tight">
              EcoRoute — un prototype
              <br />
              <span className="eco-gradient-text">pensé, testé, livré.</span>
            </h2>
            <p className="mt-4 text-white/70 text-sm leading-relaxed">
              Conçu pour démontrer comment l'IA et les outils numériques peuvent
              soutenir la décision logistique au Maroc. Certaines données sont
              simulées pour illustrer un scénario opérationnel réel.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="https://github.com/M0hdii/ecoroute"
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="secondary" icon={Code2}>
                  Voir le code source
                </Button>
              </a>
              <Badge color="sand" icon={Info}>
                Prototype · données partiellement simulées
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Team grid */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-eco-300">
              Équipe projet
            </div>
            <h3 className="font-display font-bold text-2xl tracking-tight mt-1">
              {teamMembers.length} contributeurs
            </h3>
          </div>
          <Badge color="lime" icon={Users}>
            Team EcoRoute
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((m) => (
            <TeamCard key={m.name} member={m} />
          ))}
        </div>
      </div>

      {/* Roadmap / future work */}
      <Card className="p-6 md:p-8">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-sky-accent/15 border border-sky-accent/30 text-sky-accent flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-sky-accent">
              Roadmap
            </div>
            <h3 className="font-display font-bold text-xl tracking-tight mt-0.5">
              Extensions futures possibles
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Roadmap title="APIs trafic temps réel" color="#6ee7b7" />
          <Roadmap title="Données météo en direct" color="#38bdf8" />
          <Roadmap title="GPS flotte + télématique" color="#a3e635" />
          <Roadmap title="Mise à jour prix carburant" color="#fcd34d" />
          <Roadmap title="Intégration ERP / TMS" color="#fb7185" />
          <Roadmap title="Moteur IA back-end dédié" color="#818cf8" />
        </div>
      </Card>

      <Card
        className="p-5 flex items-start gap-3"
        style={{
          borderColor: "rgba(252,211,77,0.3)",
          background:
            "linear-gradient(135deg, rgba(252,211,77,0.08), transparent 60%)",
        }}
      >
        <div className="w-10 h-10 rounded-xl bg-sand-500/15 border border-sand-500/30 text-sand-300 flex items-center justify-center shrink-0">
          <ShieldCheck size={18} />
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-sand-300">
            Note prototype
          </div>
          <p className="text-sm text-white/70 mt-1 leading-relaxed">
            EcoRoute est un prototype fonctionnel à vocation pédagogique. Il
            n'est pas destiné à un usage commercial réel et reste ouvert aux
            améliorations, intégrations et extensions futures.
          </p>
        </div>
      </Card>
    </div>
  );
}

function TeamCard({ member }) {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`card-glass p-5 relative overflow-hidden ${
        member.lead ? "border-eco-300/40" : ""
      }`}
    >
      {member.lead ? (
        <div
          className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl opacity-50"
          style={{ background: "rgba(163,230,53,0.3)" }}
        />
      ) : null}
      <div className="relative flex items-center gap-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-bold text-base ${
            member.lead
              ? "eco-gradient-bg text-ink-950"
              : "bg-white/5 border border-white/10 text-white/80"
          }`}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-base truncate">
            {member.name}
          </div>
          <div className="flex items-center gap-1.5 text-xs mt-0.5">
            {member.lead ? (
              <>
                <Crown size={11} className="text-lime-bright" />
                <span className="text-lime-bright font-bold uppercase tracking-wider text-[10px]">
                  {member.role}
                </span>
              </>
            ) : (
              <span className="text-white/50">{member.role}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Roadmap({ title, color }) {
  return (
    <div
      className="p-3.5 rounded-xl border flex items-center gap-3"
      style={{
        background: `${color}10`,
        borderColor: `${color}30`,
      }}
    >
      <span
        className="w-2.5 h-2.5 rounded-full"
        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
      />
      <span className="text-sm font-semibold text-white/80">{title}</span>
    </div>
  );
}
