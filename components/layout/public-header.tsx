import Image from "next/image";
import Link from "next/link";
import { SITE_VITRINE } from "@/lib/liens";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo-mivl.png"
            alt="Made In Val de Loire"
            width={40}
            height={40}
            className="object-contain"
          />
          <span className="font-heading font-bold text-primary text-lg leading-tight hidden sm:block">
            MIVL Connect
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          {/* Retour vers le site du salon : masqué sur mobile pour ne pas
              serrer la barre, le pied de page prend le relais. */}
          <a
            href={SITE_VITRINE}
            className="hidden sm:block text-sm font-medium text-neutral-700 hover:text-primary transition-colors"
          >
            Site du salon
          </a>
          <Link
            href="/exposants"
            className="text-sm font-medium text-neutral-700 hover:text-primary transition-colors"
          >
            Exposants
          </Link>
          <Link
            href="/connexion"
            className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Se connecter
          </Link>
        </nav>
      </div>
    </header>
  );
}
