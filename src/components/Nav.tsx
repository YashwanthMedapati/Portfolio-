"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Menu, Download, Sparkles } from "lucide-react";
import { sectionIds, personal } from "@/data/resume";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { useJrYash } from "./JrYash/JrYashContext";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";

const links: { id: string; label: string }[] = [
  { id: sectionIds.about, label: "About" },
  { id: sectionIds.projects, label: "Projects" },
  { id: sectionIds.skills, label: "Skills" },
  { id: sectionIds.education, label: "Education" },
  { id: sectionIds.resume, label: "Resume" },
  { id: sectionIds.contact, label: "Contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>(sectionIds.hero);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const { open: openJrYash } = useJrYash();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const logoRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const rect = logoRef.current?.getBoundingClientRect();
      if (!rect) return;
      const padding = 4;
      setLogoHovered(
        event.clientX >= rect.left - padding &&
          event.clientX <= rect.right + padding &&
          event.clientY >= rect.top - padding &&
          event.clientY <= rect.bottom + padding
      );
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  useEffect(() => {
    const targets = [sectionIds.hero, ...links.map((l) => l.id)]
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    targets.forEach((t) => observerRef.current?.observe(t));
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-40 transition-colors",
        scrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <nav
        aria-label="Primary"
        className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16"
      >
        <button
          ref={logoRef}
          onClick={() => scrollTo(sectionIds.hero)}
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
          onFocus={() => setLogoHovered(true)}
          onBlur={() => setLogoHovered(false)}
          className="relative inline-flex h-12 w-[4.5rem] items-center justify-center overflow-hidden rounded-md font-mono text-sm font-semibold tracking-tight text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 flex items-center justify-center transition duration-200",
              logoHovered ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
            )}
          >
            <span className="text-brand-cyan">~/</span>yash
          </span>
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 flex items-center justify-center transition duration-200",
              logoHovered ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
            )}
          >
            <Image
              src="/avatar/yash-nav-hover.png"
              alt=""
              width={1024}
              height={1024}
              className="size-12 rounded-md object-cover"
              priority={false}
            />
          </span>
        </button>

        <ul className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.id}>
              <button
                onClick={() => scrollTo(l.id)}
                aria-current={active === l.id ? "page" : undefined}
                className={cn(
                  "inline-flex items-center px-3 py-2 font-mono text-sm rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active === l.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {l.label}
                <span
                  aria-hidden
                  className={cn(
                    "inline-block w-[5px] h-[1em] ml-1 bg-primary align-middle",
                    active === l.id ? "animate-caret" : "opacity-0"
                  )}
                />
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={openJrYash} className="gap-1.5">
            <Sparkles className="size-3.5 text-primary" />
            Ask Yash
          </Button>
          <Button
            size="sm"
            className="rounded-full gap-1.5"
            nativeButton={false}
            render={<a href={personal.resumeFile} download />}
          >
            <Download className="size-3.5" />
            Resume
          </Button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open navigation menu"
              />
            }
          >
            <Menu className="size-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72 flex flex-col">
            <SheetHeader>
              <SheetTitle className="font-mono">
                <span className="text-brand-cyan">~/</span>yash
              </SheetTitle>
            </SheetHeader>
            <ul className="flex flex-col gap-1 px-2">
              {links.map((l) => (
                <li key={l.id}>
                  <SheetClose
                    render={
                      <button
                        onClick={() => scrollTo(l.id)}
                        aria-current={active === l.id ? "page" : undefined}
                        className={cn(
                          "w-full text-left px-3 py-2.5 rounded-md font-mono text-sm transition-colors",
                          active === l.id
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                      />
                    }
                  >
                    {l.label}
                  </SheetClose>
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-col gap-2 p-4 border-t border-border">
              <SheetClose
                render={
                  <Button variant="secondary" className="gap-1.5 justify-start" onClick={openJrYash} />
                }
              >
                <Sparkles className="size-3.5 text-primary" />
                Ask Yash
              </SheetClose>
              <Button className="gap-1.5" nativeButton={false} render={<a href={personal.resumeFile} download />}>
                <Download className="size-3.5" />
                Download Resume
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
