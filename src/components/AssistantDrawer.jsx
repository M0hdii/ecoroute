import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, X, Bot, User, Zap } from "lucide-react";
import { routeBotFAQs } from "../lib/data";
import { buildRouteBotAnswer } from "../lib/helpers";

export function AssistantDrawer({
  open,
  onClose,
  startCity,
  destinationCity,
  mode,
  scenarioKey,
  metrics,
  hasRoute,
  selectedDelivery,
}) {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text:
        "Salut, je suis RouteBot. Je vous assiste comme un dispatcher : " +
        "départ, priorité client, risque de retard, coût, carburant et CO₂. " +
        "Choisissez une question fréquente ou écrivez-moi directement.",
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typing, open]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function ask(q) {
    const text = String(q || "").trim();
    if (!text) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setTyping(true);
    setTimeout(() => {
      const answer = buildRouteBotAnswer({
        question: text,
        startCity,
        destinationCity,
        mode,
        scenarioKey,
        metrics,
        hasRoute,
        selectedDelivery,
      });
      setMessages((prev) => [...prev, { role: "ai", text: answer }]);
      setTyping(false);
    }, 650);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[440px] max-w-full border-l border-white/10 bg-slate-950/90 backdrop-blur-xl flex flex-col transition-transform ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ transitionDuration: "280ms", transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        {/* Header */}
        <div className="relative overflow-hidden border-b border-white/10">
          <div
            className="absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(600px 200px at 20% 0%, rgba(129,140,248,0.25), transparent 60%), radial-gradient(600px 200px at 80% 100%, rgba(110,231,183,0.18), transparent 60%)",
            }}
          />
          <div className="relative flex items-center gap-3 px-5 py-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-400/15 border border-indigo-400/30 flex items-center justify-center text-indigo-200">
              <Sparkles size={17} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[15px] font-extrabold text-slate-50">
                  RouteBot
                </h2>
                <span className="chip" style={{ background: "rgba(52,211,153,0.14)", color: "#6ee7b7", border: "1px solid rgba(52,211,153,0.35)" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 anim-pulse-dot" />
                  En ligne
                </span>
              </div>
              <div className="text-[11.5px] text-slate-400">
                Copilote IA · contexte trajet en direct
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/[0.03] border border-white/10 text-slate-300 hover:bg-white/[0.08]"
              aria-label="Fermer"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
        >
          {messages.map((m, i) => (
            <Message key={i} role={m.role} text={m.text} />
          ))}
          {typing && (
            <div className="flex items-center gap-2 text-slate-400 text-[12px] pl-1">
              <span className="w-7 h-7 rounded-full bg-indigo-400/15 border border-indigo-400/25 flex items-center justify-center text-indigo-200">
                <Bot size={13} />
              </span>
              <span className="flex gap-1">
                <Dot /> <Dot delay={0.15} /> <Dot delay={0.3} />
              </span>
              <span className="ml-1">RouteBot réfléchit…</span>
            </div>
          )}
        </div>

        {/* FAQ chips */}
        <div className="border-t border-white/5 px-4 pt-3 pb-2">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap size={11} className="text-amber-300" />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
              Questions fréquentes
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {routeBotFAQs.map((q) => (
              <button
                key={q}
                onClick={() => ask(q)}
                className="text-[11.5px] font-semibold px-2.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 hover:bg-white/[0.08] hover:border-white/20 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-white/10 p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/10 pr-1 focus-within:border-indigo-400/50 focus-within:shadow-[0_0_0_3px_rgba(129,140,248,0.1)] transition-colors"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Demandez à RouteBot…"
              className="flex-1 bg-transparent text-[13px] text-slate-100 placeholder:text-slate-500 px-3.5 py-3 outline-none"
            />
            <button
              type="submit"
              className="btn btn-primary h-9 px-3"
              disabled={!input.trim() || typing}
            >
              <Send size={13} />
              <span className="hidden sm:inline">Envoyer</span>
            </button>
          </form>
          <p className="text-[10.5px] text-slate-500 mt-2 px-1">
            RouteBot utilise le trajet, les métriques et les alertes en cours pour formuler sa réponse.
          </p>
        </div>
      </aside>
    </>
  );
}

function Message({ role, text }) {
  const isUser = role === "user";
  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : ""} anim-fade-in`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
          isUser
            ? "bg-emerald-400/15 border border-emerald-400/30 text-emerald-200"
            : "bg-indigo-400/15 border border-indigo-400/25 text-indigo-200"
        }`}
      >
        {isUser ? <User size={12} /> : <Bot size={13} />}
      </div>
      <div
        className={`rounded-2xl px-3.5 py-2.5 max-w-[82%] whitespace-pre-wrap leading-relaxed text-[12.5px] border ${
          isUser
            ? "bg-emerald-400/8 border-emerald-400/25 text-emerald-50 rounded-tr-sm"
            : "bg-white/[0.04] border-white/8 text-slate-200 rounded-tl-sm"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

function Dot({ delay = 0 }) {
  return (
    <span
      style={{
        width: 5,
        height: 5,
        borderRadius: 999,
        background: "#94a3b8",
        display: "inline-block",
        animation: `pulse-dot 1s ease-in-out ${delay}s infinite`,
      }}
    />
  );
}
