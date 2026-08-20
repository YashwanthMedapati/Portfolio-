"use client";

import { createContext, useCallback, useContext, useRef, useState, ReactNode } from "react";
import { matchIntent, fallback, greeting, YashAnswer, NavAction } from "@/lib/jrYashBrain";
import { askYashAI } from "@/lib/askYashAI";
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

const EASTER_EGG_EVENTS = {
  break: "portfolio:arm-break",
  "revert-break": "portfolio:revert-break",
  hearts: "portfolio:hearts",
} as const;

function triggerEasterEgg(name: keyof typeof EASTER_EGG_EVENTS) {
  window.dispatchEvent(new CustomEvent(EASTER_EGG_EVENTS[name]));
}

function triggerYashPose(pose: "blush" | "cry") {
  window.dispatchEvent(new CustomEvent("portfolio:yash-pose", { detail: { pose } }));
}

// Simple keyword heuristic, not sentiment analysis - just enough to catch
// someone being openly rude to Yash and have him react (cry pose) instead
// of answering as if nothing happened.
const MEAN_PATTERN =
  /\b(stupid|dumb|idiot|useless|worthless|pathetic|hate you|shut up|suck|sucks|ugly|trash|garbage|lame|loser|awful|terrible|annoying|dumbest|worst (bot|assistant|ai))\b/i;

function playCloseSound() {
  window.dispatchEvent(new CustomEvent("portfolio:sound", { detail: { type: "bye" } }));
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

  // Reads isOpen directly rather than via a setState updater callback:
  // updater callbacks are meant to be pure (React can and does invoke them
  // more than once, e.g. under StrictMode) - the close sound firing twice
  // in dev was exactly that side-effect-in-an-updater trap.
  const close = useCallback(() => {
    if (isOpen) playCloseSound();
    setIsOpen(false);
  }, [isOpen]);

  const toggle = useCallback(() => {
    const next = !isOpen;
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
    if (!next) playCloseSound();
    setIsOpen(next);
  }, [isOpen]);

  const revealAnswer = useCallback((answer: YashAnswer, sideEffects?: () => void) => {
    setIsTyping(false);
    sideEffects?.();
    setMessages((prev) => [
      ...prev,
      { id: nextId(), from: "yash", text: answer.text, followUps: answer.followUps },
    ]);
    runAction(answer.action);
  }, []);

  const ask = useCallback(
    (query: string) => {
      const normalized = query.trim().toLowerCase();
      setIsOpen(true);
      setMessages((prev) => [...prev, { id: nextId(), from: "user", text: query }]);
      setIsTyping(true);

      const isFollowCommand = normalized === "follow me";
      const isStopFollowCommand = ["stop following", "stop follow", "stay there", "go back"].includes(normalized);
      const isBreakCommand = /\bbreak\b/i.test(normalized);
      const isStopBreakCommand = ["stop break", "stop breaking", "revert", "undo break", "fix it", "fix the page"].includes(normalized);
      const isPriyaCommand = /\bpriya\b/i.test(normalized);
      const isMeanCommand = MEAN_PATTERN.test(normalized);

      if (isFollowCommand || isStopFollowCommand || isBreakCommand || isStopBreakCommand || isPriyaCommand || isMeanCommand) {
        const answer: YashAnswer = isFollowCommand
          ? {
              text: "Follow mode is on. Move your cursor and I will run after it from my little spot. You can also drag me anywhere to park me there. Type \"stop following\" if you want me to stop chasing the cursor.",
              action: { type: "none" },
              followUps: ["stop following", "What tech stack do you use?"],
            }
          : isStopFollowCommand
            ? {
                text: "Parking back in the corner. Type \"follow me\" anytime you want me to chase the cursor again.",
                action: { type: "none" },
                followUps: ["follow me", "Show me your AI projects"],
              }
            : isBreakCommand
              ? {
                  text: "Hammer mode armed. Click anywhere on the site and I will crack it more with every click. Say \"revert\" whenever you want it back to normal.",
                  action: { type: "none" },
                  followUps: ["revert", "Show me your AI projects"],
                }
              : isStopBreakCommand
                ? {
                    text: "Patched back up. The page is back to normal.",
                    action: { type: "none" },
                    followUps: ["break", "Show me your AI projects"],
                  }
                : isPriyaCommand
                  ? {
                      text: "Okay, that one gets the secret heart burst. I will keep it sweet and dramatic for a few seconds.",
                      action: { type: "none" },
                      followUps: ["break", "What tech stack do you use?"],
                    }
                  : {
                      text: "Ouch, that one stung a little. I'll bounce back though - ask me something else?",
                      action: { type: "none" },
                      followUps: ["What tech stack do you use?", "Show me your AI projects"],
                    };
        window.setTimeout(() => {
          revealAnswer(answer, () => {
            if (isFollowCommand) setIsFollowingCursor(true);
            if (isStopFollowCommand) setIsFollowingCursor(false);
            if (isBreakCommand) triggerEasterEgg("break");
            if (isStopBreakCommand) triggerEasterEgg("revert-break");
            if (isPriyaCommand) {
              triggerEasterEgg("hearts");
              triggerYashPose("blush");
            }
            if (isMeanCommand) triggerYashPose("cry");
          });
        }, 500);
        return;
      }

      // Fast path: known intents answer instantly from local data, same as
      // before. Anything that doesn't match confidently escalates to the AI
      // backend instead of landing straight on the static fallback - see
      // /api/yash-chat, which itself caches answers so a repeated question
      // (from anyone) comes back instantly next time too.
      const fast = matchIntent(query);
      if (fast) {
        window.setTimeout(() => revealAnswer(fast), 500);
        return;
      }

      askYashAI(query)
        .then((text) => revealAnswer({ text, action: { type: "none" } }))
        .catch(() => revealAnswer(fallback));
    },
    [revealAnswer]
  );

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
