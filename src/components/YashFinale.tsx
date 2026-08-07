"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Mail } from "lucide-react";
import { personal } from "@/data/resume";
import { useJrYash } from "@/components/JrYash/JrYashContext";
import { YashSprite } from "@/components/JrYash/YashSprite";
import { YASH_FRAMES } from "@/components/JrYash/yashFrames";
import { LetterHoverText } from "@/components/LetterHoverText";
import { VisitorCounter } from "@/components/VisitorCounter";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "@/components/icons";

const stars = Array.from({ length: 72 }, (_, index) => ({
  id: index,
  left: (index * 37) % 100,
  top: (index * 61) % 78,
  size: 1 + ((index * 13) % 4),
  delay: (index % 9) * 0.35,
}));

type FinaleIntroPhase = "waiting" | "run" | "jump" | "done";

function playPortfolioSound(type: "arcade-hit" | "grow") {
  window.dispatchEvent(new CustomEvent("portfolio:sound", { detail: { type } }));
}

function SocialButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex size-12 items-center justify-center rounded-full border border-white/35 bg-black/35 text-white backdrop-blur transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {children}
    </a>
  );
}

export function YashFinale() {
  const sectionRef = useRef<HTMLElement>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);
  const inView = useInView(sectionRef, { amount: 0.38, once: true });
  const reducedMotion = useReducedMotion();
  const { open } = useJrYash();
  const [introPhase, setIntroPhase] = useState<FinaleIntroPhase>("waiting");
  const pupilTargetRef = useRef({ x: 0, y: 0 });
  const pupilCurrentRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (event: PointerEvent | MouseEvent) => {
      const rect = avatarRef.current?.getBoundingClientRect();
      if (!rect) return;
      const centerX = rect.left + rect.width / 2;
      const eyeLineY = rect.top + rect.height * 0.503;
      const dx = (event.clientX - centerX) / Math.max(rect.width, 1);
      const dy = (event.clientY - eyeLineY) / Math.max(rect.height, 1);
      pupilTargetRef.current = {
        x: Math.max(-2.4, Math.min(2.4, dx * 7)),
        y: Math.max(-1.35, Math.min(1.35, dy * 4)),
      };
    };

    let frame = 0;
    const animatePupils = () => {
      const current = pupilCurrentRef.current;
      const target = pupilTargetRef.current;
      current.x += (target.x - current.x) * 0.22;
      current.y += (target.y - current.y) * 0.22;
      avatarRef.current?.style.setProperty("--pupil-x", `${current.x.toFixed(3)}px`);
      avatarRef.current?.style.setProperty("--pupil-y", `${current.y.toFixed(3)}px`);
      avatarRef.current?.style.setProperty("--body-x", `${(current.x * 0.42).toFixed(3)}px`);
      avatarRef.current?.style.setProperty("--body-y", `${(current.y * 0.36).toFixed(3)}px`);
      frame = window.requestAnimationFrame(animatePupils);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("mousemove", onMove);
    frame = window.requestAnimationFrame(animatePupils);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("mousemove", onMove);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!inView) return;
    if (reducedMotion) {
      const timer = window.setTimeout(() => setIntroPhase("done"), 0);
      return () => window.clearTimeout(timer);
    }

    const timers = [
      window.setTimeout(() => setIntroPhase("run"), 0),
      window.setTimeout(() => setIntroPhase("jump"), 1120),
      window.setTimeout(() => playPortfolioSound("arcade-hit"), 1280),
      window.setTimeout(() => playPortfolioSound("grow"), 1760),
      window.setTimeout(() => setIntroPhase("done"), 1760),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [inView, reducedMotion]);

  const avatarVisible = introPhase === "done";
  const littleYashVisible = introPhase === "run" || introPhase === "jump";
  const littleYashFrames = introPhase === "jump" ? YASH_FRAMES.jump : YASH_FRAMES.runRight;

  return (
    <section
      ref={sectionRef}
      aria-label="Interactive Yash avatar"
      className="relative min-h-[92svh] overflow-hidden bg-[#050608] px-6 py-24 text-white"
    >
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,#050608_0%,#07080c_54%,#401f48_100%)]" />
      <div aria-hidden className="absolute inset-0">
        {stars.map((star) => (
          <span
            key={star.id}
            className="absolute rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.75)] animate-star-twinkle"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: star.size,
              height: star.size,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(92svh-12rem)] max-w-5xl flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <LetterHoverText
            text={'"Learning, Living, and Leveling Up."'}
            className="mb-6 font-mono text-xl text-white/72 sm:text-3xl"
          />
        </motion.div>

        <motion.button
          type="button"
          onClick={open}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 rounded-full font-mono text-sm font-semibold text-primary transition hover:text-brand-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          GetInTouch();
        </motion.button>

        <div className="mb-10 flex items-center justify-center gap-4">
          <SocialButton href={personal.instagram} label="Instagram">
            <InstagramIcon size={20} />
          </SocialButton>
          <SocialButton href={personal.linkedin} label="LinkedIn">
            <LinkedinIcon size={20} />
          </SocialButton>
          <SocialButton href={personal.github} label="GitHub">
            <GithubIcon size={20} />
          </SocialButton>
          <SocialButton href={`mailto:${personal.email}`} label="Email">
            <Mail size={20} />
          </SocialButton>
        </div>

        <div className="relative flex min-h-[330px] w-full items-end justify-center sm:min-h-[410px]">
          <motion.div
            aria-hidden
            className="absolute bottom-3 left-1/2 z-20 flex h-24 w-32 -translate-x-1/2 items-end justify-center sm:h-28 sm:w-40"
            initial={false}
            animate={
              littleYashVisible
                ? {
                    x: introPhase === "jump" ? [52, 94, 86] : [-390, -210, -70, 52],
                    y: introPhase === "jump" ? [0, -110, -40, 0] : 0,
                    opacity: 1,
                    scale: introPhase === "jump" ? 1.02 : 1,
                  }
                : { x: 86, y: 0, opacity: 0, scale: 0.9 }
            }
            transition={
              introPhase === "jump"
                ? { duration: 0.66, ease: "easeOut" }
                : { duration: 1.12, ease: [0.22, 1, 0.36, 1] }
            }
          >
            <YashSprite
              frames={littleYashFrames}
              fps={introPhase === "jump" ? 10 : 11}
              mode={introPhase === "jump" ? "once" : "loop"}
              size={72}
              stageWidth={132}
              stageHeight={104}
              className="drop-shadow-[0_16px_24px_rgba(0,0,0,0.65)]"
            />
          </motion.div>

          <motion.div
            aria-hidden
            className="absolute bottom-[7.9rem] left-[calc(50%+4.2rem)] z-30 size-14 overflow-hidden rounded-[3px] shadow-[0_14px_28px_rgba(0,0,0,0.38)] sm:bottom-[8.65rem] sm:left-[calc(50%+4.4rem)] sm:size-16"
            initial={{ opacity: 0, y: 0 }}
            animate={
              introPhase === "run" || introPhase === "jump"
                ? {
                    opacity: 1,
                    y: introPhase === "jump" ? [0, -12, 0] : 0,
                  }
                : { opacity: 0, y: 0 }
            }
            transition={{ duration: introPhase === "jump" ? 0.22 : 0.2, ease: "easeOut" }}
          >
            <Image
              src="/avatar/question-block.jpg"
              alt=""
              width={736}
              height={736}
              className="h-full w-full object-cover"
            />
          </motion.div>

          {avatarVisible && (
            <button
              ref={avatarRef}
              type="button"
              onClick={open}
              aria-label="Open Yash chat"
              data-intro-phase={introPhase}
              className="relative aspect-square w-[min(78vw,430px)] origin-bottom bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <span
                aria-hidden
                className="absolute inset-0"
                style={{ transform: "translate3d(var(--body-x, 0px), var(--body-y, 0px), 0)" }}
              >
                <Image
                  src="/avatar/yash-3d-blank-eyes.png"
                  alt="3D Yash avatar"
                  width={1024}
                  height={1024}
                  priority={false}
                  className="relative z-10 h-full w-full select-none object-contain drop-shadow-[0_28px_50px_rgba(0,0,0,0.55)]"
                />
                {[
                  { key: "left", x: "40.68%", y: "50.51%" },
                  { key: "right", x: "60.02%", y: "49.88%" },
                ].map((eye) => (
                  <span
                    key={eye.key}
                    aria-hidden
                    className="pointer-events-none absolute z-20 h-[6.9%] w-[6.9%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full"
                    style={{ left: eye.x, top: eye.y }}
                  >
                    <span
                      className="absolute inset-0 flex items-center justify-center"
                      data-testid={`yash-pupil-${eye.key}`}
                      style={{ transform: "translate3d(var(--pupil-x, 0px), var(--pupil-y, 0px), 0)" }}
                    >
                      <Image
                        src="/avatar/yash-3d-pupil-real.png"
                        alt=""
                        width={256}
                        height={256}
                        className="size-[82%] object-contain"
                        draggable={false}
                      />
                    </span>
                  </span>
                ))}
              </span>
            </button>
          )}
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <VisitorCounter />
          <p className="font-mono text-xs text-white/45">Design and built by {personal.name}.</p>
        </div>
      </div>
    </section>
  );
}
