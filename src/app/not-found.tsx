import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Home, SearchX, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteTitle } from "@/lib/site";

export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "The requested page was not found. Return to Yashwanth Medapati's portfolio.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className="min-h-svh bg-background text-foreground bg-grid px-5 py-20">
      <section className="mx-auto flex min-h-[calc(100svh-10rem)] max-w-3xl flex-col items-center justify-center text-center">
        <div className="mb-6 inline-flex size-14 items-center justify-center rounded-full border border-primary/35 bg-primary-soft text-primary">
          <SearchX className="size-7" />
        </div>

        <p className="mb-3 font-mono text-xs uppercase tracking-[0.24em] text-brand-cyan">
          404 / Route Not Found
        </p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-6xl">
          This page drifted off the map.
        </h1>
        <p className="mb-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          {siteTitle} is still here. Head back to the portfolio, jump into the
          projects, or ask Yash to point you around.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button className="gap-1.5 rounded-full" nativeButton={false} render={<Link href="/" />}>
            <Home className="size-4" />
            Back Home
          </Button>
          <Button
            variant="outline"
            className="gap-1.5 rounded-full"
            nativeButton={false}
            render={<Link href="/#projects" />}
          >
            <Sparkles className="size-4" />
            View Projects
          </Button>
          <Button
            variant="ghost"
            className="gap-1.5 rounded-full"
            nativeButton={false}
            render={<Link href="/#contact" />}
          >
            <ArrowLeft className="size-4" />
            Contact
          </Button>
        </div>
      </section>
    </main>
  );
}
