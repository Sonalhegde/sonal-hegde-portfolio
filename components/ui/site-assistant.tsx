"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, CornerDownLeft, MessageCircle, Sparkles, X } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const suggestions = ["What did Sonal build at NITK?", "Tell me about the marine-debris project", "What is Sonal’s embedded stack?"];

export function SiteAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi — I’m Sonal’s portfolio guide. Ask me about the projects, research, stack, résumé, or contact details." },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || busy) return;
    const nextMessages = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await response.json() as { reply?: string; error?: string };
      setMessages((current) => [...current, { role: "assistant", content: data.reply ?? data.error ?? "I couldn’t answer that just now. Please try again." }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: "The assistant is temporarily offline. You can still reach Sonal at sonalhhegde@gmail.com." }]);
    } finally {
      setBusy(false);
    }
  }

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void ask(input);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.aside
            id="portfolio-assistant"
            role="dialog"
            aria-modal="false"
            aria-labelledby="assistant-title"
            className="assistant-panel glass-panel"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <header className="flex items-start justify-between border-b border-white/10 p-4">
              <div className="flex gap-3">
                <span className="flex size-10 items-center justify-center rounded-full border border-[#B497CF]/30 bg-[#B497CF]/10 text-[#c3f4ff]"><Bot size={18} aria-hidden="true" /></span>
                <div>
                  <h2 id="assistant-title" className="geist-pixel-heading text-sm tracking-[0.08em] text-white">Portfolio assistant</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.13em] text-neutral-500"><span className="status-dot" /> Visitor FAQ · portfolio scoped</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="flex size-11 items-center justify-center rounded-full text-neutral-400 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B497CF]" aria-label="Close portfolio assistant"><X size={18} /></button>
            </header>

            <div ref={transcriptRef} className="assistant-transcript" aria-live="polite">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`assistant-message ${message.role}`}>{message.content}</div>
              ))}
              {busy && <div className="assistant-message assistant flex items-center gap-2"><Sparkles size={13} className="animate-pulse text-[#c3f4ff]" /> Reading the portfolio…</div>}
            </div>

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 px-4 pb-3">
                {suggestions.map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => void ask(suggestion)} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-left text-[10px] leading-4 text-neutral-400 hover:border-[#B497CF]/35 hover:text-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B497CF]">{suggestion}</button>
                ))}
              </div>
            )}

            <form onSubmit={submit} className="flex gap-2 border-t border-white/10 p-3">
              <label htmlFor="portfolio-question" className="sr-only">Ask about Sonal’s portfolio</label>
              <input id="portfolio-question" ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} maxLength={600} placeholder="Ask about Sonal’s work…" className="min-h-11 min-w-0 flex-1 rounded-full border border-white/10 bg-black/35 px-4 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-[#B497CF]/55 focus:ring-2 focus:ring-[#B497CF]/25" />
              <button type="submit" disabled={busy || !input.trim()} className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.09] text-[#c3f4ff] disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B497CF]" aria-label="Send question"><CornerDownLeft size={17} /></button>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="assistant-trigger glass-panel"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        aria-expanded={open}
        aria-controls="portfolio-assistant"
      >
        <MessageCircle size={18} aria-hidden="true" />
        <span className="hidden sm:inline">Ask about Sonal</span>
      </motion.button>
    </>
  );
}
