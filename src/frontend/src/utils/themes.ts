export type ThemeId =
  | "bone-white"
  | "cyber-dark"
  | "forest-earth"
  | "navy-electric";

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  vars: Record<string, string>;
  previewBg: string;
  previewPrimary: string;
  previewAccent: string;
}

export const THEMES: Theme[] = [
  {
    id: "bone-white",
    name: "Bone White",
    description: "Light & elegant",
    previewBg: "#F8F9FA",
    previewPrimary: "#333333",
    previewAccent: "#D4A373",
    vars: {
      "--background": "0.97 0.002 260",
      "--foreground": "0.20 0.005 0",
      "--card": "0.99 0.001 260",
      "--card-foreground": "0.20 0.005 0",
      "--popover": "0.99 0.001 260",
      "--popover-foreground": "0.20 0.005 0",
      "--primary": "0.72 0.08 60",
      "--primary-foreground": "0.99 0 0",
      "--secondary": "0.92 0.02 80",
      "--secondary-foreground": "0.28 0.005 0",
      "--muted": "0.92 0.01 260",
      "--muted-foreground": "0.50 0.005 0",
      "--accent": "0.94 0.05 80",
      "--accent-foreground": "0.20 0 0",
      "--border": "0.85 0.01 80",
      "--input": "0.92 0.01 80",
      "--ring": "0.72 0.08 60",
    },
  },
  {
    id: "cyber-dark",
    name: "Cyber Dark",
    description: "Dark & futuristic",
    previewBg: "#0B0C10",
    previewPrimary: "#66FCF1",
    previewAccent: "#45A29E",
    vars: {
      "--background": "0.09 0.004 230",
      "--foreground": "0.80 0.005 230",
      "--card": "0.12 0.005 235",
      "--card-foreground": "0.80 0.005 230",
      "--popover": "0.14 0.006 235",
      "--popover-foreground": "0.80 0.005 230",
      "--primary": "0.93 0.14 192",
      "--primary-foreground": "0.09 0.004 230",
      "--secondary": "0.18 0.006 235",
      "--secondary-foreground": "0.80 0.005 230",
      "--muted": "0.16 0.005 235",
      "--muted-foreground": "0.55 0.005 250",
      "--accent": "0.63 0.09 192",
      "--accent-foreground": "0.09 0.004 230",
      "--border": "0.28 0.015 192",
      "--input": "0.18 0.006 235",
      "--ring": "0.93 0.14 192",
    },
  },
  {
    id: "forest-earth",
    name: "Forest Earth",
    description: "Natural & warm",
    previewBg: "#FEFAE0",
    previewPrimary: "#2D4030",
    previewAccent: "#BC6C25",
    vars: {
      "--background": "0.98 0.04 95",
      "--foreground": "0.25 0.04 145",
      "--card": "0.96 0.03 90",
      "--card-foreground": "0.25 0.04 145",
      "--popover": "0.97 0.03 90",
      "--popover-foreground": "0.25 0.04 145",
      "--primary": "0.60 0.12 55",
      "--primary-foreground": "0.98 0.01 90",
      "--secondary": "0.94 0.02 95",
      "--secondary-foreground": "0.25 0.04 145",
      "--muted": "0.92 0.02 95",
      "--muted-foreground": "0.50 0.03 130",
      "--accent": "0.70 0.05 130",
      "--accent-foreground": "0.98 0.01 90",
      "--border": "0.82 0.04 80",
      "--input": "0.92 0.02 90",
      "--ring": "0.60 0.12 55",
    },
  },
  {
    id: "navy-electric",
    name: "Navy Electric",
    description: "Bold & professional",
    previewBg: "#1A2238",
    previewPrimary: "#4E67EB",
    previewAccent: "#FF6B35",
    vars: {
      "--background": "0.20 0.05 250",
      "--foreground": "0.96 0.002 0",
      "--card": "0.24 0.05 250",
      "--card-foreground": "0.96 0.002 0",
      "--popover": "0.26 0.05 250",
      "--popover-foreground": "0.96 0.002 0",
      "--primary": "0.55 0.20 270",
      "--primary-foreground": "0.98 0 0",
      "--secondary": "0.28 0.05 250",
      "--secondary-foreground": "0.96 0.002 0",
      "--muted": "0.25 0.04 250",
      "--muted-foreground": "0.70 0.005 250",
      "--accent": "0.68 0.18 40",
      "--accent-foreground": "0.98 0 0",
      "--border": "0.35 0.06 250",
      "--input": "0.28 0.05 250",
      "--ring": "0.55 0.20 270",
    },
  },
];

export function applyTheme(themeId: ThemeId) {
  const theme = THEMES.find((t) => t.id === themeId);
  if (!theme) return;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value);
  }
  localStorage.setItem("meet-theme", themeId);
}

export function loadSavedTheme() {
  const saved = localStorage.getItem("meet-theme") as ThemeId | null;
  if (saved) {
    applyTheme(saved);
  }
}
