import Image from "next/image";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { InscriptionDEForm } from "./inscription-form";

export const metadata = {
  title: "Inscription demandeur d'emploi — MIVL Connect",
};

export default function InscriptionDemandeurEmploiPage() {
  return (
    <>
      <PublicHeader />
      <main className="bg-neutral-50 py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <nav className="mb-6 text-sm">
            <Link href="/inscription" className="text-neutral-700 hover:text-primary inline-flex items-center gap-1">
              ← Autres profils
            </Link>
          </nav>

          <div className="bg-white rounded-xl border border-neutral-100 p-8 sm:p-10">
            <Image
              src="/images/logo-mivl.png"
              alt="Made In Val de Loire"
              width={72}
              height={72}
              className="object-contain mb-5"
              priority
            />
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-neutral-900 mb-2">
              Inscription demandeur d'emploi
            </h1>
            <p className="text-neutral-700 mb-8">
              Inscrivez-vous pour le speed dating emploi de l'après-midi du 15 octobre 2026 et rencontrez jusqu'à 6 entreprises qui recrutent.
            </p>

            <div className="mb-8 rounded-lg bg-primary/5 border border-primary/10 p-4 text-sm text-neutral-900">
              <strong className="font-semibold">Prochaines étapes :</strong>
              <ol className="mt-2 space-y-1 text-neutral-700 list-decimal list-inside">
                <li>Réception d'un code de connexion par email</li>
                <li>Consultation des offres et recrutements</li>
                <li>Sélection de 1 à 6 rendez-vous</li>
                <li>Planning confirmé par email</li>
              </ol>
            </div>

            <InscriptionDEForm />
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
