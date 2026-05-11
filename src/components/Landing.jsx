
import {
  ArrowRight,
  Zap,
  Leaf,
  Route,
  Brain,
  Gauge,
  ShieldCheck,
  Sparkles,
  MapPin,
  TrendingDown,
  Truck,
} from "lucide-react";
import { Button, Card, Badge } from "./ui/Primitives";
import { Logo, MoroccoOutline, AmbientBlobs } from "./ui/Brand";

export default function Landing({ onEnter }) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-ink-950 text-white">
      {/* ------------ NAV ------------ */}
      <header className="relative z-50">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <Logo size={38} />
          <nav className="hidden md:flex items-center gap-7 text-sm text-white/70">
            <a href="#features" className="hover:text-white transition">
              Fonctionnalités
            </a>
            <a href="#how" className="hover:text-white transition">
              Comment ça marche
            </a>
            <a href="#impact" className="hover:text-white transition">
              Impact
            </a>
          </nav>
          <Button icon={ArrowRight} onClick={onEnter} size="sm">
            Lancer l'app
          </Button>
        </div>
      </header>

      {/* ------------ HERO ------------ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-40" />
        <AmbientBlobs variant="hero" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-24 md:pb-32">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* LEFT — copy */}
            <div className="lg:col-span-7 animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-eco-300/30 bg-eco-400/10 text-eco-300 text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles size={13} />
                Prototype académique · Maroc
              </div>

              <h1 className="font-display font-bold text-[44px] md:text-[72px] leading-[0.95] tracking-tight">
                Livrer
                <br />
                <span className="eco-gradient-text">plus malin.</span>
                <br />
                Livrer
                <br />
                <span
                  style={{
                    background:
                      "linear-gradient(135deg,#fcd34d 0%,#f59e0b 50%,#fb7185 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  plus propre.
                </span>
              </h1>

              <p className="mt-8 max-w-xl text-base md:text-lg text-white/65 leading-relaxed">
                EcoRoute combine cartographie interactive, IA d'optimisation et
                suivi en temps réel pour transformer chaque trajet logistique au
                Maroc en décision plus rapide, plus économique et plus durable.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button
                  size="lg"
                  icon={Zap}
                  iconRight={ArrowRight}
                  onClick={onEnter}
                >
                  Ouvrir le tableau de bord
                </Button>
                <a
                  href="#features"
                  className="text-sm font-semibold text-white/70 hover:text-white transition inline-flex items-center gap-1.5"
                >
                  Voir les fonctionnalités
                  <ArrowRight size={14} />
                </a>
              </div>

              {/* KPI strip */}
              <div className="mt-14 grid grid-cols-3 gap-4 md:gap-8 max-w-lg">
                <HeroStat value="-27%" label="Coût moyen" />
                <HeroStat value="-34%" label="CO₂ émis" />
                <HeroStat value="18" label="Villes Maroc" />
              </div>
            </div>

            {/* RIGHT — hero visual */}
            <div className="lg:col-span-5 relative">
              <HeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ------------ LOGO / TRUST STRIP ------------ */}
      <section className="relative border-y border-white/5 bg-white/[0.015]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-8 flex flex-wrap items-center justify-between gap-6 text-[11px] font-bold uppercase tracking-[0.22em] text-white/40">
          <span>Conçu pour la logistique marocaine</span>
          <TrustPill icon={Route} label="OSRM Routing" />
          <TrustPill icon={Leaf} label="Mode éco" />
          <TrustPill icon={Brain} label="IA situationnelle" />
          <TrustPill icon={ShieldCheck} label="Alertes temps réel" />
        </div>
      </section>

      {/* ------------ FEATURES ------------ */}
      <section id="features" className="relative py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="max-w-2xl mb-16">
            <Badge color="eco">Capacités principales</Badge>
            <h2 className="mt-4 font-display font-bold text-4xl md:text-5xl tracking-tight leading-[1.05]">
              Un assistant logistique qui
              <span className="eco-gradient-text"> pense d'abord</span>, roule
              ensuite.
            </h2>
            <p className="mt-5 text-white/60 text-lg">
              Chaque trajet analyse la distance, le temps, la consommation, le
              coût, le CO₂ et les incidents en direct pour proposer la décision
              la plus intelligente.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={Brain}
              title="Détection IA du contexte"
              text="Congestion urbaine, météo, incident — l'IA qualifie la situation automatiquement pour chaque trajet."
              accent="#6ee7b7"
            />
            <FeatureCard
              icon={Route}
              title="3 modes intelligents"
              text="IA optimisée, Mode éco, Trajet rapide — basculez en un clic et voyez l'impact immédiatement."
              accent="#a3e635"
            />
            <FeatureCard
              icon={MapPin}
              title="Carte temps réel"
              text="Simulation de flotte sur fond OSRM, suivi de camion et recalcul automatique des trajets."
              accent="#38bdf8"
            />
            <FeatureCard
              icon={TrendingDown}
              title="Rapport CO₂"
              text="Visualisez les litres économisés, le coût évité et les émissions réduites pour chaque livraison."
              accent="#34d399"
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Alertes opérationnelles"
              text="Congestion, météo, fenêtres serrées, incidents : les signaux arrivent avant le retard."
              accent="#fb7185"
            />
            <FeatureCard
              icon={Sparkles}
              title="RouteBot — assistant IA"
              text="Posez une question en langage naturel : départ, priorités, risque, coût. Réponses en contexte."
              accent="#fcd34d"
            />
          </div>
        </div>
      </section>

      {/* ------------ HOW IT WORKS ------------ */}
      <section
        id="how"
        className="relative py-24 md:py-32 border-t border-white/5"
      >
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-10">
          <div className="max-w-2xl mb-14">
            <Badge color="lime">3 étapes</Badge>
            <h2 className="mt-4 font-display font-bold text-4xl md:text-5xl tracking-tight leading-[1.05]">
              De la ville de départ
              <br />
              au bon choix — en secondes.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <StepCard
              number="01"
              title="Choisissez un trajet"
              text="Sélectionnez un point de départ et une destination parmi les 18 villes disponibles."
            />
            <StepCard
              number="02"
              title="L'IA analyse le contexte"
              text="Trafic, météo, alertes en cours : EcoRoute qualifie la situation et calcule 3 trajets."
            />
            <StepCard
              number="03"
              title="Décidez, livrez, réduisez"
              text="Validez le meilleur mode. Suivez la flotte en direct et recevez les recalculs en temps réel."
            />
          </div>
        </div>
      </section>

      {/* ------------ IMPACT ------------ */}
      <section id="impact" className="relative py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <Card variant="eco" className="relative overflow-hidden p-10 md:p-16">
            <div
              className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl"
              style={{ background: "rgba(163,230,53,0.25)" }}
            />
            <div className="relative grid md:grid-cols-2 gap-10 items-center">
              <div>
                <Badge color="lime">Objectif durable</Badge>
                <h2 className="mt-4 font-display font-bold text-4xl md:text-5xl tracking-tight leading-[1.05]">
                  Livrer plus vite, ce n'est plus l'objectif.
                  <br />
                  <span className="eco-gradient-text">
                    Livrer plus intelligemment
                  </span>{" "}
                  l'est.
                </h2>
                <p className="mt-5 text-white/70 max-w-lg">
                  EcoRoute intègre les indicateurs CO₂ et la logique éco-routing
                  pour mesurer l'impact environnemental de chaque décision
                  logistique.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button onClick={onEnter} icon={ArrowRight}>
                    Essayer maintenant
                  </Button>
                  <a
                    href="https://github.com/M0hdii/ecoroute"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button variant="outline">Code source</Button>
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <ImpactTile
                  icon={Leaf}
                  big="-34%"
                  label="Émissions CO₂ sur trajet éco vs rapide"
                  accent="#34d399"
                />
                <ImpactTile
                  icon={Gauge}
                  big="-32%"
                  label="Litres de carburant consommés"
                  accent="#a3e635"
                />
                <ImpactTile
                  icon={Truck}
                  big="+18%"
                  label="Livraisons dans la fenêtre horaire"
                  accent="#6ee7b7"
                />
                <ImpactTile
                  icon={TrendingDown}
                  big="-27%"
                  label="Coût total par livraison"
                  accent="#fcd34d"
                />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ------------ FOOTER ------------ */}
      <footer className="relative border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-wrap items-center justify-between gap-4 text-xs text-white/40">
          <div className="flex items-center gap-3">
            <Logo size={28} />
            <span>· Prototype académique</span>
          </div>
          <div>© {new Date().getFullYear()} EcoRoute — Livrer plus malin.</div>
        </div>
      </footer>
    </div>
  );
}

/* ---------- sub-components ---------- */

function HeroStat({ value, label }) {
  return (
    <div>
      <div className="font-display font-bold text-3xl md:text-4xl tracking-tight eco-gradient-text">
        {value}
      </div>
      <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-white/50">
        {label}
      </div>
    </div>
  );
}

function TrustPill({ icon: Icon, label }) {
  return (
    <div className="inline-flex items-center gap-2 text-white/55">
      <Icon size={14} className="text-eco-300" />
      {label}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, text, accent }) {
  return (
    <div className="card-glass p-6 md:p-7 group hover:border-white/15 transition-all hover:-translate-y-1">
      <div
        className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-5 group-hover:scale-110 transition-transform"
        style={{
          background: `${accent}1a`,
          border: `1px solid ${accent}40`,
          color: accent,
          boxShadow: `0 8px 24px ${accent}20`,
        }}
      >
        <Icon size={22} />
      </div>
      <h3 className="font-display font-bold text-lg tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-white/55 leading-relaxed">{text}</p>
    </div>
  );
}

function StepCard({ number, title, text }) {
  return (
    <div className="card-glass p-7 relative overflow-hidden">
      <div
        className="absolute top-4 right-5 font-display font-bold text-7xl leading-none opacity-[0.07]"
        aria-hidden
      >
        {number}
      </div>
      <div className="relative">
        <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-eco-400/20 border border-eco-400/30 text-eco-300 font-display font-bold text-sm">
          {number}
        </div>
        <h3 className="mt-5 font-display font-bold text-xl tracking-tight">
          {title}
        </h3>
        <p className="mt-2 text-sm text-white/60 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function ImpactTile({ icon: Icon, big, label, accent }) {
  return (
    <div
      className="p-5 rounded-2xl border"
      style={{
        background: `${accent}0f`,
        borderColor: `${accent}30`,
      }}
    >
      <Icon size={18} style={{ color: accent }} />
      <div
        className="mt-3 font-display font-bold text-3xl md:text-4xl tracking-tight"
        style={{ color: accent }}
      >
        {big}
      </div>
      <div className="mt-1 text-[11px] font-semibold text-white/60 leading-snug">
        {label}
      </div>
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="relative aspect-square max-w-[480px] mx-auto">
      {/* glow disc */}
      <div
        className="absolute inset-6 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(163,230,53,0.35), transparent 70%)",
        }}
      />
      {/* ring */}
      <div
        className="absolute inset-0 rounded-full border border-white/10"
        style={{
          background:
            "conic-gradient(from 90deg, rgba(163,230,53,0.4), rgba(16,185,129,0.15), rgba(252,211,77,0.2), rgba(163,230,53,0.4))",
          mask: "linear-gradient(black, black) content-box, linear-gradient(black, black)",
          WebkitMask:
            "linear-gradient(black, black) content-box, linear-gradient(black, black)",
          padding: 1,
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      {/* Morocco silhouette */}
      <div className="absolute inset-10">
        <div className="relative w-full h-full">
          <div
            className="absolute inset-0 rounded-[40%] card-glass-strong noise"
            style={{
              background:
                "radial-gradient(120% 100% at 30% 20%, rgba(16,185,129,0.25), transparent 55%), radial-gradient(100% 80% at 70% 80%, rgba(163,230,53,0.18), transparent 60%), linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
            }}
          />
          <MoroccoOutline className="absolute inset-6" color="rgba(110,231,183,0.55)" />

          {/* floating cards */}
          <FloatingChip
            top="10%"
            right="-6%"
            icon={Leaf}
            label="CO₂"
            value="-34%"
            color="#34d399"
          />
          <FloatingChip
            bottom="15%"
            left="-8%"
            icon={Route}
            label="Trajet"
            value="IA"
            color="#a3e635"
            delay="-2s"
          />
          <FloatingChip
            bottom="-4%"
            right="12%"
            icon={Truck}
            label="ETA"
            value="13:19"
            color="#fcd34d"
            delay="-5s"
          />
        </div>
      </div>
    </div>
  );
}

function FloatingChip({ icon: Icon, label, value, color, top, bottom, left, right, delay }) {
  return (
    <div
      className="absolute animate-float-y card-glass-strong px-4 py-2.5 rounded-2xl flex items-center gap-2.5 min-w-[110px]"
      style={{
        top,
        bottom,
        left,
        right,
        animationDelay: delay,
        boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${color}30`,
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center"
        style={{
          background: `${color}20`,
          border: `1px solid ${color}40`,
          color,
        }}
      >
        <Icon size={14} />
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-white/50">
          {label}
        </div>
        <div
          className="font-display font-bold text-base leading-none"
          style={{ color }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
