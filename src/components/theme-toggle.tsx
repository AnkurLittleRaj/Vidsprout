'use client';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [dark,setDark]=useState(false);
  useEffect(()=>{setDark(document.documentElement.dataset.theme==='dark');},[]);
  function toggle() {
    const next=!dark;
    document.documentElement.dataset.theme=next?'dark':'light';
    setDark(next);
    try {localStorage.setItem('vidsprout-theme',next?'dark':'light');} catch { /* Current session still works when storage is unavailable. */ }
  }
  return <button type="button" className="theme-toggle" onClick={toggle} aria-label="Dark theme" aria-pressed={dark} title={dark?'Switch to light theme':'Switch to dark theme'}>{dark?<Sun size={17}/>:<Moon size={17}/>}<span>{dark?'Light':'Dark'}</span></button>;
}
