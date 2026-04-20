import Image from "next/image";
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="bg-primary text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/logo-mivl.png"
                alt="Made In Val de Loire"
                width={36}
                height={36}
                className="object-contain brightness-0 invert"
              />
              <span className="font-heading font-bold text-lg">MIVL Booking</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Plateforme officielle de réservation des rendez-vous du salon Made
              In Val de Loire 2026.
            </p>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-white/50 mb-4">
              L'événement
            </h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>15 octobre 2026</li>
              <li>CO'Met — Orléans</li>
              <li>9h – 18h</li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-sm uppercase tracking-wider text-white/50 mb-4">
              Liens
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/exposants"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Exposants participants
                </Link>
              </li>
              <li>
                <Link
                  href="/connexion"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Se connecter
                </Link>
              </li>
              <li>
                <Link
                  href="/mentions-legales"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  href="/confidentialite"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>© 2026 CCI Centre-Val de Loire — MIVL Booking</p>
          <p>Organisé par la CCI Centre-Val de Loire</p>
        </div>
      </div>
    </footer>
  );
}
