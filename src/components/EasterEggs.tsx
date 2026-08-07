"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

type Heart = {
  id: number;
  left: number;
  delay: number;
  size: number;
  drift: number;
};

type Crack = {
  id: number;
  left: number;
  top: number;
  rotate: number;
  height: number;
};

function makeHearts() {
  return Array.from({ length: 34 }, (_, index) => ({
    id: Date.now() + index,
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    size: 16 + Math.random() * 24,
    drift: -40 + Math.random() * 80,
  }));
}

function makeCracks(x: number, y: number) {
  return Array.from({ length: 16 }, (_, index) => ({
    id: Date.now() + index,
    left: x + (Math.random() - 0.5) * 240,
    top: y + (Math.random() - 0.5) * 180,
    rotate: Math.random() * 180,
    height: 60 + Math.random() * 170,
  }));
}

export function EasterEggs() {
  const [hammerMode, setHammerMode] = useState(false);
  const [hammerPoint, setHammerPoint] = useState({ x: -100, y: -100 });
  const [hearts, setHearts] = useState<Heart[]>([]);
  const [cracks, setCracks] = useState<Crack[]>([]);
  const hammerModeRef = useRef(false);

  useEffect(() => {
    hammerModeRef.current = hammerMode;
    if (hammerMode) {
      document.documentElement.dataset.easterCursor = "hammer";
    } else {
      delete document.documentElement.dataset.easterCursor;
    }
  }, [hammerMode]);

  useEffect(() => {
    const armBreak = () => setHammerMode(true);
    const burstHearts = () => {
      setHearts(makeHearts());
      window.setTimeout(() => setHearts([]), 5600);
    };
    const moveHammer = (event: PointerEvent) => {
      if (event.pointerType === "mouse") setHammerPoint({ x: event.clientX, y: event.clientY });
    };
    const breakSite = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !hammerModeRef.current) return;
      setHammerMode(false);
      setCracks(makeCracks(event.clientX, event.clientY));
      document.documentElement.dataset.siteBroken = "true";
    };

    window.addEventListener("portfolio:arm-break", armBreak);
    window.addEventListener("portfolio:hearts", burstHearts);
    window.addEventListener("pointermove", moveHammer);
    window.addEventListener("pointerdown", breakSite);

    return () => {
      window.removeEventListener("portfolio:arm-break", armBreak);
      window.removeEventListener("portfolio:hearts", burstHearts);
      window.removeEventListener("pointermove", moveHammer);
      window.removeEventListener("pointerdown", breakSite);
      delete document.documentElement.dataset.easterCursor;
      delete document.documentElement.dataset.siteBroken;
    };
  }, []);

  return (
    <>
      {hammerMode && (
        <div
          className="hammer-cursor"
          style={{ transform: `translate3d(${hammerPoint.x + 9}px, ${hammerPoint.y + 8}px, 0) rotate(-28deg)` }}
          aria-hidden
        >
          <span className="hammer-cursor-head" />
          <span className="hammer-cursor-handle" />
        </div>
      )}

      {hearts.length > 0 && (
        <div className="heart-burst-layer" aria-hidden>
          {hearts.map((heart) => (
            <span
              key={heart.id}
              className="heart-pop"
              style={
                {
                  left: `${heart.left}%`,
                  animationDelay: `${heart.delay}s`,
                  fontSize: `${heart.size}px`,
                  "--heart-drift": `${heart.drift}px`,
                } as CSSProperties
              }
            >
              ♥
            </span>
          ))}
        </div>
      )}

      {cracks.length > 0 && (
        <div className="website-crack-layer" aria-hidden>
          {cracks.map((crack) => (
            <span
              key={crack.id}
              className="website-crack"
              style={{
                left: crack.left,
                top: crack.top,
                height: crack.height,
                transform: `rotate(${crack.rotate}deg)`,
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}
