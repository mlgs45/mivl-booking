import Image from "next/image";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { BandeauSalonComplet } from "@/components/ui/bandeau-salon-complet";
import { getSalonCompletExposants } from "@/lib/salon-complet";
import { InscriptionExposantForm } from "./inscription-form";

export const metadata = {
  title: "Inscription exposant — MIVL Connect",
};

// La bascule « salon complet » (back-office) revalide explicitement cette page ;
// ce délai n'est qu'un filet de sécurité.
export const revalidate = 300;

export default async function InscriptionExposantPage() {
  const salonComplet = await getSalonCompletExposants();

  return (
    <>
      <PublicHeader />

      <main className="bg-neutral-50 py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <nav className="mb-6 text-sm">
            <Link
              href="/inscription"
              className="text-neutral-700 hover:text-primary inline-flex items-center gap-1"
            >
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
              Inscription exposant
            </h1>
            <p className="text-neutral-700 mb-8">
              Créez votre compte en quelques secondes. Vous pourrez ensuite
              compléter votre profil entreprise, choisir vos offres et
              soumettre votre candidature à la CCI.
            </p>

            {salonComplet && <BandeauSalonComplet className="mb-8" />}

            <div className="mb-8 rounded-lg bg-primary/5 border border-primary/10 p-4 text-sm text-neutral-900">
              <strong className="font-semibold">Prochaines étapes :</strong>
              <ol className="mt-2 space-y-1 text-neutral-700 list-decimal list-inside">
                <li>Réception d'un code de connexion par email</li>
                <li>Complétion de votre fiche entreprise</li>
                <li>
                  {salonComplet
                    ? "Soumission à la CCI, qui vous placera en liste d'attente"
                    : "Soumission à la CCI pour validation"}
                </li>
                <li>
                  {salonComplet
                    ? "Retour de la CCI en priorité dès qu'un stand se libère"
                    : "Accès aux inscriptions visiteurs dès le 1er septembre"}
                </li>
              </ol>
            </div>

            <InscriptionExposantForm />
          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
