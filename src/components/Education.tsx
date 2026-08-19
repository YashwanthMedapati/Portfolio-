"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Award } from "lucide-react";
import { education, certifications, sectionIds } from "@/data/resume";
import { Section } from "./Section";
import { SectionHeader } from "./SectionHeader";
import { SectionWatermark } from "./SectionWatermark";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Hover flips the badge to the school mark. [perspective] on the outer
// box and [backface-visibility:hidden] on both faces is what keeps this a
// clean 3D flip instead of a mirrored smear mid-rotation. The logo <img>
// only mounts after the first real hover (not on page load), so there's no
// wasted request - and no console 404 - until someone actually flips it.
// Falls back to a plain "BU" monogram until the file exists.
function DegreeEmblem({ school }: { school: string }) {
  const [primed, setPrimed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <div className="group/flip shrink-0 [perspective:600px]" onMouseEnter={() => setPrimed(true)}>
      <div className="relative size-11 transition-transform duration-500 [transform-style:preserve-3d] group-hover/flip:[transform:rotateY(180deg)]">
        <div className="absolute inset-0 flex items-center justify-center rounded-xl border border-primary/30 bg-primary-soft [backface-visibility:hidden]">
          <GraduationCap size={20} className="text-primary" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl border border-primary/30 bg-white p-1.5 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {!primed || logoFailed ? (
            <span className="font-mono text-xs font-bold text-primary">BU</span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element -- tiny static school mark, not worth next/image's overhead
            <img
              src="/logos/binghamton.jpg"
              alt={`${school} logo`}
              className="size-full object-contain"
              onError={() => setLogoFailed(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

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
                <DegreeEmblem school={e.school} />
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
