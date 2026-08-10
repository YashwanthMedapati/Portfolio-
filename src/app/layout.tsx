import type { Metadata } from "next";
import { Geist, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { JrYashProvider } from "@/components/JrYash/JrYashContext";
import JrYashWidget from "@/components/JrYash/JrYashWidget";
import { YashCompanion } from "@/components/JrYash/YashCompanion";
import { EasterEggs } from "@/components/EasterEggs";
import { PortfolioSoundProvider } from "@/components/PortfolioSound";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeContext";
import {
  absoluteUrl,
  siteDescription,
  siteKeywords,
  siteTitle,
  siteUrl,
} from "@/lib/site";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const title = siteTitle;
const description = siteDescription;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: `%s | ${title}`,
  },
  description,
  applicationName: title,
  manifest: "/manifest.json",
  keywords: siteKeywords,
  authors: [{ name: "Yashwanth Reddy Medapati" }],
  creator: "Yashwanth Reddy Medapati",
  publisher: "Yashwanth Reddy Medapati",
  category: "technology",
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title,
    description,
    url: absoluteUrl("/"),
    siteName: title,
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Yashwanth Medapati portfolio preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [absoluteUrl("/twitter-image")],
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${geist.variable} ${plexMono.variable} h-full antialiased`}
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
