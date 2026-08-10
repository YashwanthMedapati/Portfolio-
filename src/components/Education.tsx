"use client";

import { motion } from "framer-motion";
import { GraduationCap, Award } from "lucide-react";
import { education, certifications, sectionIds } from "@/data/resume";
import { Section } from "./Section";
import { SectionHeader } from "./SectionHeader";
import { SectionWatermark } from "./SectionWatermark";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Education() {
  return (
    <Section id={sectionIds.education}>
      <SectionWatermark icon={GraduationCap} corner="bottom-right" rotate={8} />
      <SectionHeader sectionId={sectionIds.education} title="Education" />

      <div className="flex flex-col gap-5 mb-10">
        {education.map((e, i) => (
          <motion.div
            key={e.degree}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <Card className="ring-0 border border-border">
              <CardContent className="flex gap-4">
                <div className="shrink-0 w-11 h-11 rounded-xl bg-primary-soft border border-primary/30 flex items-center justify-center">
                  <GraduationCap size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="font-semibold">{e.degree}</h3>
                    <span className="text-xs text-muted-foreground font-mono">{e.dateRange}</span>
                  </div>
                  <p className="text-sm text-primary mb-1">{e.track}</p>
                  <p className="text-sm text-muted-foreground">
                    {e.school} &mdash; {e.college}
                  </p>
                  <Badge variant="secondary" className="mt-2 font-mono font-normal">
                    GPA: {e.gpa}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.4 }}
      >
        <Card className="ring-0 border border-border">
          <CardContent>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 tracking-wide uppercase flex items-center gap-2">
              <Award size={15} className="text-primary" />
              Certifications &amp; Honors
            </h3>
            <div className="flex flex-col gap-2.5">
              {certifications.map((c) => (
                <div
                  key={c.name}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 text-sm"
                >
                  <span>{c.name}</span>
                  <span className="text-xs text-muted-foreground font-mono shrink-0">{c.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Section>
  );
}
