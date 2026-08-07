import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { JrYashProvider } from "@/components/JrYash/JrYashContext";
import JrYashWidget from "@/components/JrYash/JrYashWidget";
import { YashCompanion } from "@/components/JrYash/YashCompanion";
import { EasterEggs } from "@/components/EasterEggs";
import { PortfolioSoundProvider } from "@/components/PortfolioSound";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const title = "Yashwanth Reddy Medapati - Software Engineer / ML Engineer";
const description =
  "Portfolio of Yashwanth Reddy Medapati - full-stack AI systems, machine learning, and distributed data pipelines. Featuring Yash, an AI guide that answers questions about his work.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    "Yashwanth Reddy Medapati",
    "Software Engineer",
    "Machine Learning Engineer",
    "Full-Stack Developer",
    "Portfolio",
    "React",
    "FastAPI",
    "Python",
  ],
  authors: [{ name: "Yashwanth Reddy Medapati" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Yashwanth Reddy Medapati - Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="skip-link bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-md"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <TooltipProvider delay={200}>
            <PortfolioSoundProvider>
              <JrYashProvider>
                {children}
                <EasterEggs />
                <JrYashWidget />
                <YashCompanion />
              </JrYashProvider>
            </PortfolioSoundProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
