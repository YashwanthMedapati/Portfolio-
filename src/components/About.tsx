"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Cpu, Layers, Server } from "lucide-react";
import { personal, sectionIds, experience } from "@/data/resume";
import { Section } from "./Section";
import { SectionHeader } from "./SectionHeader";
import { SectionWatermark } from "./SectionWatermark";
import { Card, CardContent } from "@/components/ui/card";
import { GithubActivity } from "./GithubActivity";

const pillars = [
  {
    icon: Layers,
    title: "Full-Stack Applications",
    body: "React front ends backed by FastAPI services - designed, built, and shipped end to end, not just prototyped.",
  },
  {
    icon: Cpu,
    title: "Machine Learning Systems",
    body: "Models trained on real-world data (NHANES health records, resume corpora) and shipped inside production-grade applications, not left in notebooks.",
  },
  {
    icon: Server,
    title: "Distributed Data Pipelines",
    body: "APIs, queues, and databases wired together to collect, process, and analyze data at volume - from social platforms to sensor feeds.",
  },
];

export default function About() {
  return (
    <Section id={sectionIds.about}>
      <SectionWatermark icon={Layers} corner="top-right" rotate={-8} />
      <SectionHeader sectionId={sectionIds.about} title="About Me" className="mb-8" />

      <div className="mb-12 grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_240px]">
        <div className="max-w-3xl">
          <p className="text-muted-foreground text-lg leading-relaxed mb-5 text-pretty">
            {personal.summary}
          </p>
          <p className="text-muted-foreground text-base leading-relaxed text-pretty">
            Alongside my coursework and projects, I worked as a{" "}
            <span className="text-foreground">{experience[0].role}</span> at{" "}
            {experience[0].org}, managing real-time data across 36 campus parking
            lots serving 20,800+ students and staff - early, practical experience
            with operational data and reliability under real usage.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mx-auto md:mx-0"
        >
          <div className="group relative size-44 overflow-hidden rounded-full border border-primary/35 bg-card p-1 shadow-[0_18px_48px_rgba(0,0,0,0.28)] sm:size-52 md:size-60">
            <Image
              src="/profile/yash-profile.jpeg"
              alt="Profile photo of me, Yashwanth Reddy Medapati"
              fill
              sizes="(min-width: 768px) 240px, 208px"
              quality={100}
              unoptimized
              className="rounded-full object-cover transition-opacity duration-300 group-hover:opacity-0"
              style={{ objectPosition: "52% 42%", transform: "scale(1.16)" }}
            />
            {/* 3D Yash swaps in on hover - same flat hover asset the Nav
                logo already uses, so it's a plain crossfade, not the
                cursor-tracking pupil rig YashFinale's full-size avatar needs. */}
            <Image
              src="/avatar/yash-nav-hover.png"
              alt=""
              aria-hidden
              fill
              sizes="(min-width: 768px) 240px, 208px"
              className="scale-95 rounded-full object-cover opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100"
            />
          </div>
        </motion.div>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        {pillars.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <Card className="ring-0 border border-border h-full">
              <CardContent>
                <p.icon size={22} className="text-primary mb-4" />
                <h3 className="font-semibold mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <GithubActivity />
    </Section>
  );
}
