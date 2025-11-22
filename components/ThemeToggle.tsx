"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as "dark" | "light" | null;
    if (stored) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-slate-400" />
      )}
    </button>
  );
}
