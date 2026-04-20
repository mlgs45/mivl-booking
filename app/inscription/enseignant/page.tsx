import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

export const metadata = { title: "Inscription enseignant — MIVL Booking" };

export default function InscriptionEnseignantPage() {
  return (
    <>
      <PublicHeader />
      <main className="bg-neutral-50 py-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-white rounded-xl border border-neutral-100 p-10">
            <span className="inline-block bg-accent text-neutral-900 text-xs font-bold px-3 py-1 rounded-full mb-4">
              Bientôt disponible
            </span>
            <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-3">
              Inscription enseignant
            </h1>
            <p className="text-neutral-700 mb-6">
              Les inscriptions enseignants ouvrent le{" "}
              <strong>1er septembre 2026</strong>, une fois les exposants
              validés. Vous pourrez alors inscrire votre groupe et réserver des
              créneaux pour la matinée du 15 octobre.
            </p>
            <Link
              href="/"
              className="inline-block bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
