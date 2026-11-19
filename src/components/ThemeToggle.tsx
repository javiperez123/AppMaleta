"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark" | "system";

function getStoredTheme(): Theme {
  try { return (localStorage.getItem("theme") as Theme) ?? "system"; } catch { return "system"; }
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") root.dataset.theme = "dark";
  else if (theme === "light") root.dataset.theme = "light";
  else delete root.dataset.theme;
  try { localStorage.setItem("theme", theme); } catch {}
}

export function ThemeScript() {
  // Inline script to avoid FOUC — runs before React hydration
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark')document.documentElement.dataset.theme='dark';else if(t==='light')document.documentElement.dataset.theme='light';}catch(e){}})()`,
      }}
    />
  );
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    setTheme(getStoredTheme());
  }, []);

  const cycle = () => {
    const next: Theme = theme === "system" ? "dark" : theme === "dark" ? "light" : "system";
    setTheme(next);
    applyTheme(next);
  };

  const label = theme === "dark" ? "Modo oscuro activo" : theme === "light" ? "Modo claro activo" : "Tema del sistema";

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={label}
      title={label}
      className={`btn btn-ghost p-2 ${className}`}
    >
      {theme === "dark" ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
    </button>
  );
}
