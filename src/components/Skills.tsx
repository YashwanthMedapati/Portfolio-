"use client";

import { motion } from "framer-motion";
import { Binary, Blocks, Database, Brain } from "lucide-react";
import { skills, sectionIds } from "@/data/resume";
import { Section } from "./Section";
import { SectionHeader } from "./SectionHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const groupIcons: Record<string, typeof Binary> = {
  Languages: Binary,
  "Frameworks & Libraries": Blocks,
  "Databases, Cloud & Tools": Database,
  Concepts: Brain,
};

export default function Skills() {
  const groups = Object.entries(skills);

  return (
    <Section id={sectionIds.skills}>
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
              <Card className="editor-panel h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <Icon className="size-4 text-primary" />
                    {group}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {list.map((s) => (
                    <Badge
                      key={s}
                      variant="outline"
                      className="code-chip h-auto px-2.5 py-1 font-normal hover:border-primary/50 transition-colors"
                    >
                      {s}
                    </Badge>
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
