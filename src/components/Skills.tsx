"use client";

import { motion } from "framer-motion";
import { Binary, Blocks, Database, Brain } from "lucide-react";
import { skills, sectionIds } from "@/data/resume";
import { skillIcons } from "@/lib/skillIcons";
import { Section } from "./Section";
import { SectionHeader } from "./SectionHeader";
import { SectionWatermark } from "./SectionWatermark";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const groupIcons: Record<string, typeof Binary> = {
  Languages: Binary,
  "Frameworks & Libraries": Blocks,
  "Databases, Cloud & Tools": Database,
  Concepts: Brain,
};

function SkillBadge({ name }: { name: string }) {
  const Logo = skillIcons[name];
  return (
    <Badge
      variant="outline"
      className="group/skill h-auto border-border px-3 py-1.5 font-mono text-sm font-normal transition-colors hover:border-primary/50"
    >
      {/* Wrapped in a span (not a direct svg child) so Badge's forced
          `[&>svg]:size-3!` can't fight this hover-grow animation. */}
      {Logo && (
        <span className="-ml-1 inline-flex size-0 shrink-0 items-center justify-center overflow-hidden opacity-0 transition-all duration-200 ease-out group-hover/skill:ml-0 group-hover/skill:size-3.5 group-hover/skill:opacity-100">
          <Logo className="size-3.5 text-primary" aria-hidden />
        </span>
      )}
      {name}
    </Badge>
  );
}

export default function Skills() {
  const groups = Object.entries(skills);

  return (
    <Section id={sectionIds.skills}>
      <SectionWatermark icon={Binary} corner="top-left" rotate={-5} />
      <SectionHeader sectionId={sectionIds.skills} title="Skills" />

      <div className="grid sm:grid-cols-2 gap-5">
        {groups.map(([group, list], i) => {
          const Icon = groupIcons[group] ?? Binary;
          return (
            <motion.div
              key={group}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <Card className="ring-0 border border-border h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground tracking-wide uppercase">
                    <Icon className="size-4 text-primary" />
                    {group}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {list.map((s) => (
                    <SkillBadge key={s} name={s} />
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}
