"use client";

import { motion } from "framer-motion";
import { Brain, CheckCircle2, Code2, Download, Sparkles } from "lucide-react";
import { personal, sectionIds } from "@/data/resume";
import { useJrYash } from "./JrYash/JrYashContext";
import { Section } from "./Section";
import { SectionHeader } from "./SectionHeader";
import { SectionWatermark } from "./SectionWatermark";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const resumeHighlights = [
  {
    icon: Code2,
    label: "Full-stack",
    value: "React, FastAPI, PostgreSQL",
  },
  {
    icon: Brain,
    label: "ML systems",
    value: "scikit-learn, NLP, model evaluation",
  },
  {
    icon: CheckCircle2,
    label: "Proof points",
    value: "3 shipped projects, tested workflows",
  },
];

export default function Resume() {
  const { ask } = useJrYash();

  return (
    <Section id={sectionIds.resume}>
      <SectionWatermark icon={Code2} corner="top-right" rotate={-6} />
      <div className="flex flex-wrap items-end justify-between gap-6 mb-8">
        <SectionHeader sectionId={sectionIds.resume} title="Resume" className="mb-0" />
        <div className="flex flex-wrap gap-3">
          <Button
            className="rounded-full gap-1.5"
            nativeButton={false}
            render={<a href={personal.resumeFile} download />}
          >
            <Download className="size-4" />
            Download PDF
          </Button>
          <Button
            variant="secondary"
            className="rounded-full gap-1.5 border border-primary/30 bg-primary-soft text-brand-cyan hover:bg-primary/20"
            onClick={() => ask("Why should we hire you?")}
          >
            <Sparkles className="size-4" />
            Have Yash explain it
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5 }}
        className="grid sm:grid-cols-3 gap-3 mb-5"
      >
        {resumeHighlights.map((item) => (
          <Card key={item.label} className="ring-0 border border-border">
            <div className="flex gap-3 p-4">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary-soft text-primary">
                <item.icon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        <Card className="ring-0 border border-border p-0 overflow-hidden bg-card">
          <iframe
            src={`${personal.resumeFile}#view=FitH&toolbar=1&navpanes=0`}
            title="Yashwanth Medapati resume PDF preview"
            className="hidden h-[70vh] w-full bg-card sm:block"
          />
          <div className="sm:hidden p-8 text-center text-sm text-muted-foreground">
            PDF preview isn&apos;t supported on this device.{" "}
            <a href={personal.resumeFile} download className="text-primary underline">
              Download the resume
            </a>{" "}
            to view it.
          </div>
        </Card>
      </motion.div>
    </Section>
  );
}
