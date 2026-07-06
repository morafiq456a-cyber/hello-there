import { useEffect } from "react";
import { useStore } from "./store";
import type { Settings } from "./types";

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "");
  if (m.length !== 6) return null;
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return [r, g, b];
}

function contrast(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return "#ffffff";
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.45 ? "#0f172a" : "#ffffff";
}

export function applyTheme(settings: Settings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const s = (k: string, v: string) => root.style.setProperty(k, v);

  s("--brand", settings.primaryColor);
  s("--brand-2", settings.secondaryColor);
  s("--primary", settings.buttonColor);
  s("--primary-foreground", contrast(settings.buttonColor));
  s("--ring", settings.primaryColor);
  s("--accent-brand", settings.primaryColor);
  s("--app-font", `"${settings.font}", ui-sans-serif, system-ui, sans-serif`);

  if (settings.darkMode) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
    s("--background", settings.backgroundColor);
    s("--foreground", settings.textColor);
  }

  root.classList.toggle("dark", settings.darkMode);
}

export function ThemeManager() {
  const { settings, hydrated } = useStore();
  useEffect(() => {
    applyTheme(settings);
  }, [settings, hydrated]);
  return null;
}
