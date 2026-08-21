"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { YashSprite, YashPlaybackMode } from "./YashSprite";
import { YASH_FRAMES, preloadYashFrames } from "./yashFrames";
import { useJrYash } from "./JrYashContext";
import { useTheme } from "@/components/ThemeContext";
import { useActiveSectionIntro } from "@/lib/useActiveSectionIntro";
import { sectionIntros } from "@/lib/sectionIntros";
import {
  useCompanionPosition,
  clamp,
  CORNER_PADDING,
  DESKTOP_SPRITE_SIZE,
  MOBILE_SPRITE_SIZE,
  DESKTOP_STAGE_WIDTH,
  MOBILE_STAGE_WIDTH,
} from "./useCompanionPosition";

const IDLE_BACKFLIP_AFTER = 12000;
const WAVE_DURATION = 1350;
const DARK_AWAKE_IDLE_MS = 150000;
const DARK_START_AWAKE_MS = 14000;
const GOOD_NIGHT_LEAD_MS = 2600;
const GREETING_DURATION_MS = 6200;
const GREETING_DELAY_MS = 350;
const BUBBLE_MARGIN = 24;
const BUBBLE_RESERVED_HEIGHT = 82;

type Override =
  | { type: "wave" }
  | { type: "jump" }
  | { type: "emote"; emoteIdx: number }
  | { type: "blush" }
  | { type: "cry" }
  | { type: "backflip" };

function playPortfolioSound(type: "hi" | "goodnight" | "yash-click") {
  window.dispatchEvent(new CustomEvent("portfolio:sound", { detail: { type } }));
}

function prefersReducedMotionSync() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotionSync);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function YashCompanion() {
  const { theme } = useTheme();
  const { isOpen, isTyping, toggle, isFollowingCursor } = useJrYash();
  const reducedMotion = usePrefersReducedMotion();

  const [override, setOverride] = useState<Override | null>(() =>
    reducedMotion ? null : { type: "wave" }
  );
  const [showGreeting, setShowGreeting] = useState(false);
  const [dismissedGreeting, setDismissedGreeting] = useState(false);
  const [showSleepNotice, setShowSleepNotice] = useState(false);
  const [sleepPhase, setSleepPhase] = useState<"falling" | "asleep">("falling");
  const wasSleepingRef = useRef(false);
  const [darkAwakeUntil, setDarkAwakeUntil] = useState(() => Date.now() + DARK_START_AWAKE_MS);
  const [now, setNow] = useState(() => Date.now());
  const [showSectionIntro, setShowSectionIntro] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const lastIntroKeyRef = useRef<string | null>(null);

  const lastActivityRef = useRef(0);
  const overrideRef = useRef<Override | null>(null);
  const previousThemeRef = useRef(theme);
  const greetingSoundPlayedRef = useRef(false);
  const sleepSoundPlayedRef = useRef(false);
  const scrollStopTimerRef = useRef<number | null>(null);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    lastActivityRef.current = Date.now();
    preloadYashFrames();
  }, []);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const wakeDarkYash = useCallback(() => {
    if (theme !== "dark") return;
    const nextAwakeUntil = Date.now() + DARK_AWAKE_IDLE_MS;
    setDarkAwakeUntil(nextAwakeUntil);
    setNow(Date.now());
    setShowSleepNotice(false);
  }, [theme]);

  const handlePositionActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    wakeDarkYash();
  }, [wakeDarkYash]);

  const position = useCompanionPosition({
    isFollowingCursor,
    isOpen,
    reducedMotion,
    onActivity: handlePositionActivity,
  });
  const { x, y, isMobile, viewport, moveDir, hasCustomPosition, isDragging, isNearHero } = position;

  const sectionIntro = useActiveSectionIntro(sectionIntros, { enabled: !reducedMotion && !isMobile });

  useEffect(() => {
    let lastWakeCall = 0;
    const onActivity = (event: Event) => {
      const activityIsScroll = event.type === "scroll";
      lastActivityRef.current = Date.now();
      if (activityIsScroll) {
        setIsScrolling(true);
        setShowSectionIntro(false);
        if (window.scrollY > 24) {
          setShowGreeting(false);
          setDismissedGreeting(true);
        }
        if (scrollStopTimerRef.current) {
          window.clearTimeout(scrollStopTimerRef.current);
        }
        scrollStopTimerRef.current = window.setTimeout(() => {
          setIsScrolling(false);
          scrollStopTimerRef.current = null;
        }, 650);
      }
      const now = Date.now();
      if (now - lastWakeCall < 1000) return;
      lastWakeCall = now;
      wakeDarkYash();
    };
    window.addEventListener("scroll", onActivity, { passive: true });
    window.addEventListener("pointerdown", onActivity, { passive: true });
    window.addEventListener("keydown", onActivity);
    return () => {
      window.removeEventListener("scroll", onActivity);
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
      if (scrollStopTimerRef.current) {
        window.clearTimeout(scrollStopTimerRef.current);
      }
    };
  }, [wakeDarkYash]);

  useEffect(() => {
    overrideRef.current = override;
  }, [override]);

  useEffect(() => {
    if (reducedMotion || isMobile) {
      previousThemeRef.current = theme;
      return;
    }
    if (previousThemeRef.current === "dark" && theme === "light") {
      setOverride({ type: "wave" });
      const t = setTimeout(() => setOverride(null), WAVE_DURATION);
      previousThemeRef.current = theme;
      return () => clearTimeout(t);
    }
    previousThemeRef.current = theme;
  }, [theme, isMobile, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const t = setTimeout(() => setOverride(null), WAVE_DURATION);
    if (isMobile) return () => clearTimeout(t);
    const g = setTimeout(() => {
      setShowGreeting(true);
    }, GREETING_DELAY_MS);
    const hide = setTimeout(() => {
      setShowGreeting(false);
      setDismissedGreeting(true);
    }, GREETING_DELAY_MS + GREETING_DURATION_MS);
    return () => {
      clearTimeout(t);
      clearTimeout(g);
      clearTimeout(hide);
    };
  }, [reducedMotion, isMobile]);

  useEffect(() => {
    if (theme !== "dark" || darkAwakeUntil <= 0) return;
    const sleepDelay = Math.max(darkAwakeUntil - Date.now(), 0);
    const noticeDelay = Math.max(sleepDelay - GOOD_NIGHT_LEAD_MS, 0);
    const noticeTimer = isMobile ? undefined : setTimeout(() => setShowSleepNotice(true), noticeDelay);
    const sleepTimer = setTimeout(() => {
      setShowSleepNotice(false);
      setNow(Date.now());
    }, sleepDelay);
    return () => {
      clearTimeout(noticeTimer);
      clearTimeout(sleepTimer);
    };
  }, [theme, darkAwakeUntil, isMobile]);

  useEffect(() => {
    const sleeping = theme === "dark" && darkAwakeUntil <= now;
    if (sleeping && !wasSleepingRef.current) {
      setSleepPhase("falling");
    }
    wasSleepingRef.current = sleeping;
  }, [theme, darkAwakeUntil, now]);

  useEffect(() => {
    if (!showGreeting || dismissedGreeting || greetingSoundPlayedRef.current) return;
    greetingSoundPlayedRef.current = true;
    playPortfolioSound("hi");
  }, [dismissedGreeting, showGreeting]);

  useEffect(() => {
    if (!sectionIntro) return;
    if (lastIntroKeyRef.current === sectionIntro.id) return;
    if (showGreeting || showSleepNotice || isOpen || isScrolling) return;
    lastIntroKeyRef.current = sectionIntro.id;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reacting to an external IntersectionObserver-driven value, not derivable during render
    setShowSectionIntro(true);
    const hide = setTimeout(() => setShowSectionIntro(false), 4200);
    return () => clearTimeout(hide);
  }, [sectionIntro, showGreeting, showSleepNotice, isOpen, isScrolling]);

  useEffect(() => {
    if (showSleepNotice) {
      if (sleepSoundPlayedRef.current) return;
      sleepSoundPlayedRef.current = true;
      playPortfolioSound("goodnight");
    }
    sleepSoundPlayedRef.current = false;
  }, [showSleepNotice]);

  useEffect(() => {
    if (reducedMotion || isMobile) return;
    const iv = setInterval(() => {
      if (isOpenRef.current || overrideRef.current) return;
      if (theme === "dark" || isTyping || moveDir || isFollowingCursor) return;
      if (Date.now() - lastActivityRef.current < IDLE_BACKFLIP_AFTER) return;

      lastActivityRef.current = Date.now();
      setOverride({ type: "backflip" });
    }, 1000);
    return () => clearInterval(iv);
  }, [theme, isTyping, moveDir, isMobile, reducedMotion, isFollowingCursor]);

  useEffect(() => {
    const onPose = (e: Event) => {
      const pose = (e as CustomEvent<{ pose: "blush" | "cry" }>).detail?.pose;
      if (!pose || reducedMotion) return;
      setOverride({ type: pose });
    };
    window.addEventListener("portfolio:yash-pose", onPose);
    return () => window.removeEventListener("portfolio:yash-pose", onPose);
  }, [reducedMotion]);

  if (x === null || y === null) return null;
  const compactDock = !isNearHero && !isFollowingCursor && !isDragging && !hasCustomPosition && !isOpen;
  const spriteSize = isMobile ? MOBILE_SPRITE_SIZE : compactDock ? 68 : DESKTOP_SPRITE_SIZE;
  const stageWidth = isMobile ? MOBILE_STAGE_WIDTH : compactDock ? 136 : DESKTOP_STAGE_WIDTH;
  const lockedStageHeight = Math.round(spriteSize * 1.55);
  const stageHeight = lockedStageHeight;
  const isDarkAwake = theme === "dark" && darkAwakeUntil > now;
  const panelHeight = Math.min(viewport.height * 0.68, 540);
  const openX = clamp(viewport.width - stageWidth - 20, CORNER_PADDING, viewport.width - stageWidth - CORNER_PADDING);
  const openY = clamp(viewport.height - panelHeight - lockedStageHeight - 30, CORNER_PADDING, viewport.height - lockedStageHeight - CORNER_PADDING);
  const dockX = isMobile
    ? clamp(18, CORNER_PADDING, viewport.width - stageWidth - CORNER_PADDING)
    : clamp(viewport.width - stageWidth - 18, CORNER_PADDING, viewport.width - stageWidth - CORNER_PADDING);
  const dockY = clamp(viewport.height - lockedStageHeight - 12, CORNER_PADDING, viewport.height - lockedStageHeight - CORNER_PADDING);
  const renderX = isOpen && !isFollowingCursor ? openX : compactDock ? dockX : x;
  const renderY = isOpen && !isFollowingCursor ? openY : compactDock ? dockY : y;
  const companionTop = Math.max(renderY - BUBBLE_RESERVED_HEIGHT, CORNER_PADDING);
  const spriteTop = renderY - companionTop;
  const companionHeight = spriteTop + stageHeight;
  const bubbleMaxWidth = Math.min(isMobile ? 196 : 220, Math.max(140, viewport.width - BUBBLE_MARGIN * 2));
  const bubbleLeft = clamp(
    stageWidth / 2,
    BUBBLE_MARGIN + bubbleMaxWidth / 2 - renderX,
    viewport.width - BUBBLE_MARGIN - bubbleMaxWidth / 2 - renderX
  );
  const bubbleStyle = {
    left: bubbleLeft,
    bottom: stageHeight + 8,
    width: bubbleMaxWidth,
    maxWidth: bubbleMaxWidth,
  };

  const baseAction: "sleep" | "think" | "run-left" | "run-right" | "idle" =
    isTyping
      ? "think"
      : moveDir === "left"
        ? "run-left"
        : moveDir === "right"
          ? "run-right"
          : theme === "dark" && !isDarkAwake
            ? "sleep"
            : "idle";

  const displayAction = override?.type ?? baseAction;
  let frames = YASH_FRAMES.idle;
  let fps = 2;
  let mode: YashPlaybackMode = "loop";

  switch (displayAction) {
    case "wave":
      frames = YASH_FRAMES.wave;
      fps = 5;
      break;
    case "jump":
      frames = YASH_FRAMES.jump;
      fps = 10;
      mode = "once";
      break;
    case "emote":
      frames = [YASH_FRAMES.emotes[(override as Extract<Override, { type: "emote" }>).emoteIdx]];
      break;
    case "blush":
      frames = YASH_FRAMES.blush;
      fps = 4;
      mode = "once";
      break;
    case "cry":
      frames = YASH_FRAMES.cry;
      fps = 4;
      mode = "once";
      break;
    case "backflip":
      frames = YASH_FRAMES.backflip;
      fps = 11;
      mode = "once";
      break;
    case "sleep":
      if (sleepPhase === "falling") {
        frames = YASH_FRAMES.sleepFalling;
        fps = 3;
        mode = "once";
      } else {
        frames = YASH_FRAMES.sleep;
        fps = 1.5;
      }
      break;
    case "think":
      frames = YASH_FRAMES.think;
      break;
    case "run-left":
      frames = YASH_FRAMES.runLeft;
      fps = 9;
      break;
    case "run-right":
      frames = YASH_FRAMES.runRight;
      fps = 9;
      break;
    default:
      frames = YASH_FRAMES.idle;
      fps = 2.5;
  }

  const handleClick = () => {
    if (position.consumeDragMoved()) return;
    lastActivityRef.current = Date.now();
    wakeDarkYash();
    setShowGreeting(false);
    setDismissedGreeting(true);
    playPortfolioSound("yash-click");
    if (reducedMotion) {
      toggle();
      return;
    }
    if (override?.type === "jump") return;
    setOverride({ type: "jump" });
  };

  const handleSpriteComplete = () => {
    if (override?.type === "jump") {
      setOverride(null);
      toggle();
    } else if (override?.type === "wave") {
      setOverride(null);
    } else if (
      override?.type === "blush" ||
      override?.type === "cry" ||
      override?.type === "backflip"
    ) {
      setOverride(null);
    } else if (displayAction === "sleep" && sleepPhase === "falling") {
      setSleepPhase("asleep");
    }
  };

  return (
    <div
      className="fixed z-50"
      aria-hidden={isOpen}
      style={{
        left: renderX,
        top: companionTop,
        width: stageWidth,
        height: companionHeight,
        opacity: 1,
        pointerEvents: isOpen ? "none" : "auto",
        transition: reducedMotion || isDragging ? "opacity 150ms" : "left 140ms cubic-bezier(0.22, 1, 0.36, 1), top 140ms cubic-bezier(0.22, 1, 0.36, 1), opacity 150ms",
        willChange: reducedMotion ? undefined : "left, top, opacity",
      }}
    >
      <AnimatePresence>
        {showGreeting && !dismissedGreeting && !showSleepNotice && !isOpen && !isScrolling && (
          <motion.div
            key="yash-greeting"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="pointer-events-none absolute left-1/2 z-10 box-border whitespace-normal text-wrap max-w-[168px] -translate-x-1/2 bg-popover border border-border rounded-lg rounded-br-sm px-3 py-2 pr-6 text-xs leading-snug shadow-lg"
            style={bubbleStyle}
          >
            <span
              aria-hidden
              className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-b border-r border-border bg-popover"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowGreeting(false);
                setDismissedGreeting(true);
              }}
              aria-label="Dismiss greeting"
              className="pointer-events-auto absolute right-1 top-1 bg-secondary border border-border rounded-full p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X size={10} />
            </button>
            Hi, this is Yash. Tap me if you need anything.
          </motion.div>
        )}
        {showSleepNotice && !isOpen && theme === "dark" && !isScrolling && (
          <motion.div
            key="yash-sleep-notice"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="pointer-events-none absolute left-1/2 z-10 box-border whitespace-normal text-wrap max-w-[176px] -translate-x-1/2 bg-popover border border-border rounded-lg rounded-br-sm px-3 py-2 text-xs leading-snug shadow-lg"
            style={bubbleStyle}
          >
            <span
              aria-hidden
              className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-b border-r border-border bg-popover"
            />
            Good night. I&apos;ll be right here when you need me.
          </motion.div>
        )}
        {showSectionIntro && sectionIntro && !isOpen && !showGreeting && !showSleepNotice && !isScrolling && (
          <motion.div
            key={`yash-intro-${sectionIntro.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="pointer-events-none absolute left-1/2 z-10 box-border whitespace-normal text-wrap max-w-[200px] -translate-x-1/2 bg-popover border border-border rounded-lg rounded-br-sm px-3 py-2 text-xs leading-snug shadow-lg"
            style={bubbleStyle}
          >
            <span
              aria-hidden
              className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-b border-r border-border bg-popover"
            />
            {sectionIntro.text}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleClick}
        onPointerDown={(e) => position.startDrag(e, renderX, renderY)}
        onPointerMove={position.moveDrag}
        onPointerUp={position.endDrag}
        onPointerCancel={position.endDrag}
        onMouseEnter={wakeDarkYash}
        onFocus={wakeDarkYash}
        aria-label="Yash guide - click to chat"
        aria-haspopup="dialog"
        aria-controls="jr-yash-panel"
        tabIndex={isOpen ? -1 : 0}
        className="absolute left-0 flex touch-none items-end justify-center bg-transparent border-none p-0 cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
        style={{ top: spriteTop, width: stageWidth, height: stageHeight }}
      >
        <YashSprite
          frames={frames}
          fps={fps}
          mode={mode}
          size={spriteSize}
          stageWidth={stageWidth}
          stageHeight={stageHeight}
          onComplete={handleSpriteComplete}
          className="drop-shadow-[0_10px_18px_rgba(0,0,0,0.7)]"
          alt="Yash"
        />
      </button>
    </div>
  );
}
