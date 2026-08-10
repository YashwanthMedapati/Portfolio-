"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink, Play, Sparkles } from "lucide-react";
import { projects, sectionIds } from "@/data/resume";
import { GithubIcon } from "./icons";
import { Section } from "./Section";
import { SectionHeader } from "./SectionHeader";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardAction } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function ProjectProofPanel({ p }: { p: (typeof projects)[number] }) {
  return (
    <div className="border-t border-border bg-card px-5 py-5 sm:px-7 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <p className="code-label">project.metrics</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="code-chip font-normal" variant="outline">
            {p.type}
          </Badge>
          {p.mlFocused && (
            <Badge className="code-chip font-normal" variant="outline">
              ML workflow
            </Badge>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        {p.highlights.map((h) => (
          <div key={h.label} className="rounded-md border border-border bg-background/45 px-3 py-3">
            <p className="font-mono text-base font-semibold leading-tight text-foreground">{h.value}</p>
            <p className="code-label mt-1">{h.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ p, index }: { p: (typeof projects)[number]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
    >
      <Card className="editor-panel py-0 gap-5 overflow-hidden hover:border-primary/45 transition-colors">
        {p.image && (
          <div className="relative aspect-video w-full bg-secondary border-b border-border">
            <Image
              src={p.image}
              alt={`Screenshot of ${p.name}`}
              fill
              className="object-cover"
            />
          </div>
        )}
        <CardHeader className="px-5 pt-5 gap-1.5 sm:px-7 sm:pt-7">
          {p.mlFocused && (
            <CardAction>
              <Badge className="code-chip gap-1 font-normal" variant="outline">
                <Sparkles className="size-3" /> ML
              </Badge>
            </CardAction>
          )}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <CardTitle className="text-2xl font-semibold tracking-[-0.03em]">{p.name}</CardTitle>
                <span className="text-xs text-muted-foreground font-mono">{p.dateRange}</span>
              </div>
              <CardDescription className="text-primary text-sm mt-1">{p.tagline}</CardDescription>
            </div>
            <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
              {p.demoUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  nativeButton={false}
                  render={<a href={p.demoUrl} target="_blank" rel="noopener noreferrer" />}
                >
                  <ExternalLink size={15} />
                  Live Demo
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                className="gap-1.5 border border-border"
                nativeButton={false}
                render={<a href={p.github} target="_blank" rel="noopener noreferrer" />}
              >
                <GithubIcon size={15} />
                Code
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-5 sm:px-7">
          <ul className="space-y-2 mb-5 border-l border-border pl-4">
            {p.bullets.map((b) => (
              <li key={b} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap gap-1.5">
              {p.stack.map((s) => (
                <Badge key={s} variant="outline" className="code-chip h-auto px-2.5 py-1 font-normal">
                  {s}
                </Badge>
              ))}
            </div>
            {p.demoVideo && (
              <Button
                variant="outline"
                size="sm"
                className="ml-auto gap-1.5 border-primary/35 bg-primary-soft text-primary hover:bg-primary/15"
                nativeButton={false}
                render={<a href={p.demoVideo} target="_blank" rel="noopener noreferrer" />}
              >
                <Play className="size-3.5 fill-current" />
                Demo
              </Button>
            )}
          </div>
        </CardContent>
        <ProjectProofPanel p={p} />
      </Card>
    </motion.div>
  );
}

export default function Projects() {
  const [filter, setFilter] = useState<"all" | "ml">("all");
  const filtered = filter === "ml" ? projects.filter((p) => p.mlFocused) : projects;

  return (
    <Section id={sectionIds.projects}>
      <div className="flex flex-wrap items-end justify-between gap-6 mb-12">
        <SectionHeader
          sectionId={sectionIds.projects}
          title="Featured Projects"
          description="Full-stack systems that pair real engineering with real machine learning - each one shipped, not just prototyped."
          className="mb-0"
        />
        <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "ml")}>
          <TabsList>
            <TabsTrigger value="all">All ({projects.length})</TabsTrigger>
            <TabsTrigger value="ml">ML-Focused ({projects.filter((p) => p.mlFocused).length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-6">
        {filtered.map((p, i) => (
          <ProjectCard key={p.slug} p={p} index={i} />
        ))}
      </div>
    </Section>
  );
}
