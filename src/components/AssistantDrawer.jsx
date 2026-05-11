import { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Loader2, User } from "lucide-react";
import { Button } from "../ui.jsx";
import { cx } from "../lib/cx.js";
import { askAssistant } from "../lib/api.js";

const SUGGESTIONS = [
  "Puis-je partir maintenant vers Marrakech ?",
  "Quel itinéraire privilégier aujourd'hui ?",
  "Résume les risques météo sur mes trajets.",
  "Quelle est ma livraison la plus critique ?",
];

export default function AssistantDrawer({ open, onClose, liveTime, context }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Bonjour. Je suis l'assistant EcoRoute. Posez-moi une question sur vos trajets, votre flotte ou vos livraisons. Je vous donne une recommandation claire et concrète.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(text) {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    setMessages((m) => [...m, { role: "user", content: question }]);
    setInput("");
    setLoading(true);

    try {
      const data = await askAssistant({
        question,
        startCityLabel: context?.startLabel || "",
        destinationCityLabel: context?.destinationLabel || "",
        modeLabel: context?.modeLabel || "",
        scenarioLabel: context?.scenarioLabel || "",
        metrics: context?.metrics || null,
        realtime: context?.realtime || null,
        liveTime,
        currentAdvice: context?.advice || [],
        deliveryStops: context?.shipments || [],
        selectedDelivery: null,
        routeAvailable: !!context?.metrics,
      });
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.answer || "Je n'ai pas pu formuler de réponse." },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "Le service est momentanément indisponible. Vérifiez que le backend EcoRoute est démarré sur le port 5000.",
          error: true,
        },
      ]);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* backdrop */}
      <div
        className={cx(
          "fixed inset-0 z-40 bg-slate-900/30 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      {/* drawer */}
      <aside
        className={cx(
          "fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl transition-transform",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* header */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900">Assistant IA</p>
            <p className="text-xs text-slate-500">
              Analyse contextuelle · {liveTime}
            </p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((m, i) => (
            <Message key={i} message={m} />
          ))}
          {loading && (
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="rounded-2xl rounded-tl-sm bg-slate-50 px-4 py-2.5 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Analyse en cours…
                </span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* suggestions */}
        {messages.length <= 1 && (
          <div className="border-t border-slate-200 px-5 py-3">
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Suggestions
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* input */}
        <div className="border-t border-slate-200 px-5 py-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Posez votre question…"
              rows={2}
              className="flex-1 resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
            <Button
              type="submit"
              variant="brand"
              size="md"
              icon={loading ? Loader2 : Send}
              disabled={loading || !input.trim()}
            >
              Envoyer
            </Button>
          </form>
          <p className="mt-2 text-[10px] text-slate-400">
            Les réponses peuvent être approximatives. Vérifiez les informations critiques.
          </p>
        </div>
      </aside>
    </>
  );
}

function Message({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={cx("flex gap-3", isUser ? "flex-row-reverse" : "")}>
      <span
        className={cx(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-slate-900 text-white"
            : message.error
            ? "bg-rose-100 text-rose-700"
            : "bg-emerald-100 text-emerald-700"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
      </span>
      <div
        className={cx(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-slate-900 text-white rounded-tr-sm"
            : message.error
            ? "bg-rose-50 text-rose-700 border border-rose-200 rounded-tl-sm"
            : "bg-slate-50 text-slate-800 rounded-tl-sm"
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
