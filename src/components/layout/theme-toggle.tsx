"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-9 w-9 shrink-0" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      aria-label="Toggle theme"
    >
      <span className="material-symbols-outlined text-[20px]">
        {theme === "dark" ? "light_mode" : "dark_mode"}
      </span>
    </button>
  );
}
