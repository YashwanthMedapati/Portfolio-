"use client";

import { motion } from "framer-motion";
import { ArrowDown, Brain, FileText, GraduationCap, Layers, Sparkles } from "lucide-react";
import { personal, projects, sectionIds } from "@/data/resume";
import { useJrYash } from "./JrYash/JrYashContext";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "./icons";
import { HeroBootLine, useHeroBoot } from "./HeroBoot";
import { LetterHoverText } from "./LetterHoverText";

const quickFacts = [
  { icon: GraduationCap, label: "M.S. + B.S. Computer Science" },
  { icon: Layers, label: `${projects.length} Full-Stack Projects Shipped` },
  { icon: Brain, label: "Production-Grade ML, Not Notebooks" },
];

export default function Hero() {
  const { open } = useJrYash();
  const { typed, resolved, done } = useHeroBoot();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id={sectionIds.hero}
      aria-label="Introduction"
      className="relative min-h-[100svh] flex flex-col items-center justify-center px-5 sm:px-6 overflow-hidden"
    >
      <div className="relative z-10 flex w-full max-w-5xl flex-col items-center text-center">
        <HeroBootLine typed={typed} done={done} />

        <motion.div
          initial={{ opacity: 0.22, y: 10 }}
          animate={resolved ? { opacity: 1, y: 0 } : { opacity: 0.22, y: 10 }}
          transition={{ duration: 0.32 }}
          className="flex flex-col items-center"
        >
          <LetterHoverText
            as="h1"
            text={personal.name}
            className="glow-text text-5xl font-semibold tracking-[-0.045em] leading-[0.93] text-balance text-foreground sm:text-7xl mb-4"
          />

          <p className="text-lg sm:text-xl text-primary font-medium mb-5">
            {personal.positioning}
          </p>

          <LetterHoverText
            text={personal.tagline}
            className="text-base sm:text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed text-pretty"
          />

          <div className="mb-10 flex w-full max-w-xs flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center">
            <Button size="lg" className="h-11 justify-center rounded-md px-6" onClick={() => scrollTo(sectionIds.projects)}>
              View Projects
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 justify-center rounded-md px-6 gap-1.5"
              onClick={() => scrollTo(sectionIds.resume)}
            >
              <FileText className="size-4" />
              Resume
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 justify-center rounded-md px-6 gap-1.5"
              nativeButton={false}
              render={
                <a href={personal.github} target="_blank" rel="noopener noreferrer" />
              }
            >
              <GithubIcon size={15} />
              GitHub
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="h-11 justify-center rounded-md px-6 gap-1.5 border border-primary/30 bg-primary-soft text-primary hover:bg-primary/20"
              onClick={open}
            >
              <Sparkles className="size-4" />
              Ask Yash
            </Button>
          </div>

          <dl className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs sm:text-sm text-muted-foreground">
            {quickFacts.map((f, i) => (
              <div key={f.label} className="flex items-center gap-2">
                {i > 0 && <span className="hidden sm:inline text-border" aria-hidden>|</span>}
                <f.icon className="size-3.5 text-primary shrink-0" />
                <dt className="sr-only">Quick fact</dt>
                <dd>{f.label}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
      </div>

      <button
        onClick={() => scrollTo(sectionIds.about)}
        aria-label="Scroll to About section"
        className="absolute bottom-8 text-muted-foreground hover:text-foreground transition-colors animate-float rounded-full p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowDown size={22} />
      </button>
    </section>
  );
}
