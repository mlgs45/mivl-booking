"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  /** Intervalle en secondes (défaut 30) */
  intervalSec?: number;
  /** Libellé court affiché (ex: "Rafraîchissement auto · 30s"). Désactive l'affichage si absent. */
  label?: string;
};

export function AutoRefresh({ intervalSec = 30, label }: Props) {
  const router = useRouter();
  const [secondsSince, setSecondsSince] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const tick = window.setInterval(() => {
      setSecondsSince((s) => {
        if (s + 1 >= intervalSec) {
          router.refresh();
          return 0;
        }
        return s + 1;
      });
    }, 1000);
    return () => window.clearInterval(tick);
  }, [intervalSec, paused, router]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  if (!label) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-neutral-500">
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inline-flex h-full w-full rounded-full ${paused ? "bg-neutral-400" : "bg-success opacity-75 animate-ping"}`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${paused ? "bg-neutral-400" : "bg-success"}`}
        />
      </span>
      <span>
        {label}
        {!paused && <> · maj il y a {secondsSince}s</>}
        {paused && <> · en pause (onglet masqué)</>}
      </span>
    </div>
  );
}
