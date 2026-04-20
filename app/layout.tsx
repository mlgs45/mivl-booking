import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

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
  title: "MIVL Booking — Made In Val de Loire 2026",
  description:
    "Plateforme de réservation des rendez-vous du salon Made In Val de Loire 2026 au CO'Met d'Orléans, le 15 octobre 2026.",
  metadataBase: new URL(
    process.env.NEXTAUTH_URL ?? "https://booking.mivl-orleans.fr"
  ),
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
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
