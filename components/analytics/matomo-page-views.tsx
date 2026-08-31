"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { envoyerVuePage, estPageSuivie } from "@/lib/matomo";

/**
 * Next.js navigue côté client : sans ce composant, toute une session ne
 * compterait qu'une seule page vue, celle émise par le snippet du layout.
 */
export function MatomoPageViews() {
  const pathname = usePathname();
  // La page d'entrée est déjà comptée par le snippet, qui s'exécute avant
  // l'hydratation. On ne prend la main qu'à partir de la navigation suivante,
  // sinon elle compterait double.
  const pageEntree = useRef(true);

  useEffect(() => {
    if (pageEntree.current) {
      pageEntree.current = false;
      return;
    }
    if (!estPageSuivie(pathname)) return;
    envoyerVuePage(pathname);
  }, [pathname]);

  return null;
}
