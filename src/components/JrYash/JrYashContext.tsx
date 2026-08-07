"use client";

import { createContext, useCallback, useContext, useRef, useState, ReactNode } from "react";
import { askJrYash, greeting, YashAnswer, NavAction } from "@/lib/jrYashBrain";
import { personal } from "@/data/resume";

export type ChatMessage = {
  id: string;
  from: "user" | "yash";
  text: string;
  followUps?: string[];
};

type JrYashContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  messages: ChatMessage[];
  ask: (query: string) => void;
  hasGreeted: boolean;
  isTyping: boolean;
  isFollowingCursor: boolean;
};

const JrYashContext = createContext<JrYashContextValue | null>(null);

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `msg-${idCounter}`;
}

function runAction(action: NavAction) {
  if (action.type === "scroll") {
    setTimeout(() => {
      document.getElementById(action.target)?.scrollIntoView({ behavior: "smooth" });
    }, 250);
  } else if (action.type === "resume") {
    setTimeout(() => {
      document.getElementById("resume")?.scrollIntoView({ behavior: "smooth" });
    }, 250);
  } else if (action.type === "external") {
    window.open(action.url, "_blank", "noopener,noreferrer");
  }
}

function triggerEasterEgg(name: "break" | "hearts") {
  const eventName = name === "break" ? "portfolio:arm-break" : "portfolio:hearts";
  window.dispatchEvent(new CustomEvent(eventName));
}

export function JrYashProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isFollowingCursor, setIsFollowingCursor] = useState(false);
  const greetedRef = useRef(false);

  const open = useCallback(() => {
    setIsOpen(true);
    if (!greetedRef.current) {
      greetedRef.current = true;
      setHasGreeted(true);
      setMessages([
        {
          id: nextId(),
          from: "yash",
          text: greeting.text,
          followUps: greeting.followUps,
        },
      ]);
    }
  }, []);

  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next && !greetedRef.current) {
        greetedRef.current = true;
        setHasGreeted(true);
        setMessages([
          {
            id: nextId(),
            from: "yash",
            text: greeting.text,
            followUps: greeting.followUps,
          },
        ]);
      }
      return next;
    });
  }, []);

  const ask = useCallback((query: string) => {
    const normalized = query.trim().toLowerCase();
    setIsOpen(true);
    setMessages((prev) => [...prev, { id: nextId(), from: "user", text: query }]);
    setIsTyping(true);
    const isFollowCommand = normalized === "follow me";
    const isStopFollowCommand = ["stop following", "stop follow", "stay there", "go back"].includes(normalized);
    const isBreakCommand = /\bbreak\b/i.test(normalized);
    const isPriyaCommand = /\bpriya\b/i.test(normalized);
    const answer: YashAnswer = isFollowCommand
      ? {
          text: "Follow mode is on. Move your cursor and I will run after it from my little spot. You can also drag me anywhere to park me there. Type \"stop following\" if you want me to stop chasing the cursor.",
          action: { type: "none" },
          followUps: ["stop following", "What tech stack does he use?"],
        }
      : isStopFollowCommand
        ? {
            text: "Parking back in the corner. Type \"follow me\" anytime you want me to chase the cursor again.",
            action: { type: "none" },
          followUps: ["follow me", "Show me Yash's AI projects"],
        }
      : isBreakCommand
        ? {
            text: "Hammer mode armed. Click anywhere on the site and I will crack the page for fun. Refresh the page when you want everything perfectly back in place.",
            action: { type: "none" },
            followUps: ["priya", "stop following", "Show me Yash's AI projects"],
          }
        : isPriyaCommand
          ? {
              text: "Okay, that one gets the secret heart burst. I will keep it sweet and dramatic for a few seconds.",
              action: { type: "none" },
              followUps: ["break", "What tech stack does he use?"],
            }
      : askJrYash(query);
    setTimeout(() => {
      setIsTyping(false);
      if (isFollowCommand) setIsFollowingCursor(true);
      if (isStopFollowCommand) setIsFollowingCursor(false);
      if (isBreakCommand) triggerEasterEgg("break");
      if (isPriyaCommand) triggerEasterEgg("hearts");
      setMessages((prev) => [
        ...prev,
        { id: nextId(), from: "yash", text: answer.text, followUps: answer.followUps },
      ]);
      runAction(answer.action);
    }, 500);
  }, []);

  return (
    <JrYashContext.Provider
      value={{ isOpen, open, close, toggle, messages, ask, hasGreeted, isTyping, isFollowingCursor }}
    >
      {children}
    </JrYashContext.Provider>
  );
}

export function useJrYash() {
  const ctx = useContext(JrYashContext);
  if (!ctx) throw new Error("useJrYash must be used within JrYashProvider");
  return ctx;
}

export const jrYashContactHint = personal.email;
