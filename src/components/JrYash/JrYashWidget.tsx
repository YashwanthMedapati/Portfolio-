"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Send } from "lucide-react";
import { useJrYash } from "./JrYashContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import {
  Message,
  MessageContent,
  MessageHeader,
} from "@/components/ui/message";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from "@/components/ui/message-scroller";

function TypingIndicator() {
  return (
    <Message align="start">
      <MessageContent>
        <Bubble variant="ghost">
          <BubbleContent className="flex items-center gap-1 px-0 py-1 font-mono text-xs text-green-400">
            <span className="sr-only">Yash is typing</span>
            <span aria-hidden>PS portfolio:\yash&gt;</span>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                aria-hidden
                className="size-1.5 rounded-full bg-muted-foreground animate-bounce"
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  );
}

function TerminalDots() {
  return (
    <div className="flex items-center gap-1.5" aria-hidden>
      <span className="size-2 rounded-full bg-red-400" />
      <span className="size-2 rounded-full bg-yellow-300" />
      <span className="size-2 rounded-full bg-emerald-400" />
    </div>
  );
}

export default function JrYashWidget() {
  const { isOpen, close, messages, ask, isTyping } = useJrYash();
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      const t = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [isOpen, close]);

  const submit = (text: string) => {
    if (!text.trim()) return;
    ask(text);
    setInput("");
  };

  return (
    <div className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 flex flex-col items-end gap-3 sm:inset-x-auto sm:right-4 sm:bottom-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="jr-yash-panel"
            initial={{ opacity: 0, y: 16, scale: 0.96, pointerEvents: "none" }}
            animate={{ opacity: 1, y: 0, scale: 1, pointerEvents: "auto" }}
            exit={{ opacity: 0, y: 16, scale: 0.96, pointerEvents: "none" }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-modal="false"
            aria-labelledby="jr-yash-title"
            id="jr-yash-panel"
            className="h-[70svh] max-h-[540px] w-full max-w-md bg-[#050505] border border-zinc-700 rounded-md shadow-2xl shadow-black/70 flex flex-col overflow-hidden font-mono text-zinc-100 sm:w-[92vw]"
          >
            {/* Terminal tab bar */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-700 bg-[#111111]">
              <div className="flex items-center gap-2.5 min-w-0">
                <TerminalDots />
                <p
                  id="jr-yash-title"
                  className="text-xs text-zinc-200 truncate"
                >
                  Windows PowerShell - Yash
                </p>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={close} aria-label="Close Yash" className="text-zinc-300 hover:bg-zinc-800 hover:text-white">
                <X className="size-3.5" />
              </Button>
            </div>

            {/* Identity strip */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-zinc-800 bg-[#0a0a0a]">
              {/* eslint-disable-next-line @next/next/no-img-element -- tiny static sprite frame, not worth next/image's overhead */}
              <img src="/yash/idle/1.png" alt="" width={26} height={26} className="shrink-0" style={{ width: 26, height: "auto" }} />
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-tight text-green-400">PS portfolio:\yash&gt; ready</p>
                <p className="text-[11px] text-zinc-500 leading-tight">
                  try: follow me, sponsorship, roles, hobbies
                </p>
              </div>
            </div>

            <MessageScrollerProvider autoScroll defaultScrollPosition="end">
              <MessageScroller className="flex-1 min-h-0">
                <MessageScrollerViewport>
                  <MessageScrollerContent
                    aria-live="polite"
                    aria-relevant="additions"
                    className="px-4 py-4 gap-3 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.07),transparent_28%),#050505]"
                  >
                    {messages.map((m) => (
                      <MessageScrollerItem key={m.id} messageId={m.id}>
                        <Message align="start">
                          <MessageContent>
                            <MessageHeader className={m.from === "user" ? "px-0 text-[11px] text-zinc-400" : "px-0 text-[11px] text-green-400"}>
                              {m.from === "user" ? "PS portfolio:\\visitor>" : "PS portfolio:\\yash>"}
                            </MessageHeader>
                            <Bubble
                              align="start"
                              variant="ghost"
                            >
                              <BubbleContent className={m.from === "user" ? "px-0 py-0 text-sm text-zinc-100" : "px-0 py-0 text-sm text-zinc-200"}>
                                {m.text}
                              </BubbleContent>
                            </Bubble>
                            {m.from === "yash" && m.followUps && m.followUps.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {m.followUps.map((f) => (
                                  <button
                                    key={f}
                                    onClick={() => submit(f)}
                                    className="inline-flex items-center gap-1 rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-300 hover:text-white hover:border-green-500/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                                  >
                                    <span className="text-green-400">PS</span>
                                    {f}
                                  </button>
                                ))}
                              </div>
                            )}
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    ))}
                    {isTyping && (
                      <MessageScrollerItem scrollAnchor>
                        <TypingIndicator />
                      </MessageScrollerItem>
                    )}
                  </MessageScrollerContent>
                  <MessageScrollerButton />
                </MessageScrollerViewport>
              </MessageScroller>
            </MessageScrollerProvider>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
              className="flex items-center gap-2 p-3 border-t border-zinc-800 bg-[#0a0a0a]"
            >
              <label htmlFor="jr-yash-input" className="sr-only">
                Ask Yash a question
              </label>
              <span className="text-xs text-green-400 shrink-0" aria-hidden>
                PS&gt;
              </span>
              <Input
                id="jr-yash-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="follow me | ask-yash --about projects"
                className="h-9 flex-1 border-zinc-700 bg-black text-xs text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-green-500"
                autoComplete="off"
              />
              <Button type="submit" size="icon" aria-label="Send message" disabled={!input.trim()} className="bg-zinc-800 text-green-400 hover:bg-zinc-700 hover:text-green-300">
                <Send className="size-4" />
              </Button>
            </form>
            <div className="flex items-center justify-between gap-2 px-4 pb-3 -mt-1 bg-[#0a0a0a]">
              <p className="text-[10.5px] text-zinc-500 leading-snug">
                Answers from my resume, projects, and personal FAQ.
              </p>
              <span className="hidden sm:flex items-center gap-1 text-[10.5px] text-zinc-500 shrink-0">
                <Kbd>Esc</Kbd> to close
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
