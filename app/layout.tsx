import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SNIPPET_MATOMO } from "@/lib/matomo";
import { MatomoPageViews } from "@/components/analytics/matomo-page-views";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: true,
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "MIVL Connect — Made In Val de Loire 2026",
  description:
    "Plateforme de réservation des rendez-vous du salon Made In Val de Loire 2026 au CO'Met d'Orléans, le 15 octobre 2026.",
  metadataBase: new URL(
    process.env.NEXTAUTH_URL ?? "https://connect.mivl-orleans.fr"
  ),
  appleWebApp: {
    capable: true,
    title: "MIVL Connect",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1B4DB5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={cn("h-full", inter.variable, poppins.variable)}
    >
      <body className="min-h-full flex flex-col antialiased">
        {/* Mesure d'audience : le script est rendu en clair dans le HTML —
            c'est ce que cherchent le vérificateur d'installation de Matomo et
            les audits RGPD — et il s'auto-limite au parcours public. */}
        <script dangerouslySetInnerHTML={{ __html: SNIPPET_MATOMO }} />
        <MatomoPageViews />
        {children}
      </body>
    </html>
  );
}
