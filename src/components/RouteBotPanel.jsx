import { useEffect, useRef, useState } from "react";
import { Bot, X, Send, Sparkles } from "lucide-react";
import { routeBotFAQs } from "../lib/constants";
import { buildRouteBotAnswer } from "../lib/routeBot";

export default function RouteBotPanel({
  open,
  onClose,
  startCity,
  destinationCity,
  mode,
  scenario,
  metrics,
  hasRoute,
  selectedDelivery,
}) {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Salut, c'est RouteBot. Je t'aide comme un dispatcher : départ, priorité client, risque de retard, coût, carburant et CO₂. Choisis une question fréquente ou écris-moi directement.",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  function ask(question) {
    const q = String(question || "").trim();
    if (!q) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setTimeout(() => {
      const answer = buildRouteBotAnswer({
        question: q,
        startCity,
        destinationCity,
        mode,
        scenario,
        metrics,
        hasRoute,
        selectedDelivery,
      });
      setMessages((prev) => [...prev, { role: "ai", text: answer }]);
    }, 500);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[90] bg-ink-950/40 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 bottom-0 z-[100] w-full sm:max-w-md flex flex-col card-glass-strong !rounded-none sm:!rounded-l-3xl border-l border-white/10 transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: "rgba(10,15,28,0.96)" }}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl eco-gradient-bg text-ink-950 flex items-center justify-center">
              <Bot size={18} strokeWidth={2.4} />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-lime-accent border-2 border-ink-900 animate-pulse-dot" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-eco-300">
                Assistant IA
              </div>
              <h3 className="font-display font-bold text-base">RouteBot</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.role === "user"
                    ? "eco-gradient-bg text-ink-950 font-semibold rounded-br-sm"
                    : "bg-white/5 border border-white/8 text-white/85 rounded-bl-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ chips */}
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-1.5">
            {routeBotFAQs.map((q) => (
              <button
                key={q}
                onClick={() => ask(q)}
                className="px-2.5 py-1.5 rounded-full border border-white/10 bg-white/[0.02] hover:border-eco-300/40 hover:bg-eco-400/10 text-[11px] font-semibold text-white/70 hover:text-eco-300 transition inline-flex items-center gap-1"
              >
                <Sparkles size={10} />
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pose une question à l’IA…"
              className="field flex-1"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-11 h-11 rounded-xl eco-gradient-bg text-ink-950 flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 transition-transform"
            >
              <Send size={16} strokeWidth={2.4} />
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
