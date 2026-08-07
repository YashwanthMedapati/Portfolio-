"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";

export type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "yash-portfolio-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // The server always renders "dark" (see <html> in layout.tsx), so that's
  // the only hydration-safe initial value. A stored "light" preference is
  // applied via the effect below, right after mount - a brief, one-time
  // flash for that minority case beats fighting a pre-hydration script that
  // mutates the DOM class React itself owns.
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {}
    if (stored === "light") {
      document.documentElement.classList.remove("dark");
      // Correcting from localStorage (unknowable at SSR time) is exactly the
      // FOUC-avoidance exception; a lazy initializer here would reintroduce
      // the server/client mismatch this effect exists to avoid.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme("light");
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {}
      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
