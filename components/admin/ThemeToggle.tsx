"use client";
import { useEffect, useState } from "react";

const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("admin-theme") === "dark";
    setDark(saved);
    const el = document.querySelector(".admin-shell");
    if (saved) el?.setAttribute("data-theme", "dark");
    else el?.removeAttribute("data-theme");
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("admin-theme", next ? "dark" : "light");
    const el = document.querySelector(".admin-shell");
    if (next) el?.setAttribute("data-theme", "dark");
    else el?.removeAttribute("data-theme");
  }

  return (
    <button className="ew-theme-btn" onClick={toggle} aria-label="Theme wechseln">
      {dark === null ? null : dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
