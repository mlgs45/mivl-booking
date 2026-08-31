import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { getSalonCompletExposants } from "@/lib/salon-complet";

export const metadata = {
  title: "Inscription — MIVL Connect",
};

// La bascule « salon complet » (back-office) revalide explicitement cette page ;
// ce délai n'est qu'un filet de sécurité.
export const revalidate = 300;

type Profil = {
  titre: string;
  desc: string;
  href: string;
  cta: string;
  accent: boolean;
  /** Seul le profil exposant porte la mention « complet · liste d'attente ». */
  exposant?: boolean;
};

const PROFILS: Profil[] = [
  {
    titre: "Je suis une entreprise industrielle",
    desc: "Je présente mon entreprise, mes métiers et mes opportunités aux jeunes talents de la région.",
    href: "/inscription/exposant",
    cta: "Je veux un stand",
    accent: true,
    exposant: true,
  },
  {
    titre: "Je suis professeur en collège",
    desc: "Je réserve des créneaux pour mon groupe et j'organise la visite de ma classe sur le salon.",
    href: "/inscription/enseignant",
    cta: "Inscrire ma classe",
    accent: false,
  },
  {
    titre: "Je suis lycéen ou jeune diplômé",
    desc: "Je rencontre les industriels de la région et je découvre les opportunités de stages et d'alternance.",
    href: "/inscription/jeune",
    cta: "Réserver mon parcours",
    accent: false,
  },
  {
    titre: "Je suis demandeur d'emploi",
    desc: "Je participe au speed dating emploi de l'après-midi et je rencontre des entreprises qui recrutent.",
    href: "/inscription/demandeur-emploi",
    cta: "M'inscrire au speed dating",
    accent: false,
  },
];

const VISITEUR = {
  titre: "Je suis simple visiteur",
  desc: "Je viens découvrir librement les entreprises industrielles de la région et leurs métiers. Entrée libre et gratuite.",
  href: "/inscription/visiteur",
  cta: "M'inscrire comme visiteur",
};

export default async function InscriptionPage() {
  const salonComplet = await getSalonCompletExposants();

  return (
    <>
      <PublicHeader />

      <main className="bg-neutral-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-neutral-900 mb-3">
              Quel est votre profil ?
            </h1>
            <p className="text-neutral-700 max-w-xl mx-auto">
              Choisissez votre type d'inscription pour accéder au parcours
              adapté.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {PROFILS.map((p) => (
              <Link
                key={p.titre}
                href={p.href}
                className={`block rounded-xl border p-6 transition-all ${
                  p.accent
                    ? "bg-accent border-accent text-neutral-900 hover:bg-accent-dark"
                    : "bg-white border-neutral-100 hover:border-primary hover:shadow-sm"
                }`}
              >
                {p.exposant && salonComplet && (
                  <span className="inline-block mb-2 rounded-full bg-neutral-900 px-2.5 py-1 text-xs font-semibold text-white">
                    Complet · liste d&apos;attente
                  </span>
                )}
                <h2 className="font-heading font-bold text-lg mb-2 text-neutral-900">
                  {p.titre}
                </h2>
                <p
                  className={`text-sm leading-relaxed ${
                    p.accent ? "text-neutral-800" : "text-neutral-700"
                  }`}
                >
                  {p.desc}
                  {p.exposant && salonComplet && (
                    <>
                      {" "}
                      <strong className="font-semibold">
                        Les stands sont tous attribués : votre candidature sera
                        placée en liste d&apos;attente.
                      </strong>
                    </>
                  )}
                </p>
                <div className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                  {p.cta} →
                </div>
              </Link>
            ))}
          </div>

          <hr className="border-neutral-200 my-5" />

          <Link
            href={VISITEUR.href}
            className="block rounded-xl border border-neutral-100 bg-white p-6 transition-all hover:border-primary hover:shadow-sm"
          >
            <h2 className="font-heading font-bold text-lg mb-2 text-neutral-900">
              {VISITEUR.titre}
            </h2>
            <p className="text-sm leading-relaxed text-neutral-700">
              {VISITEUR.desc}
            </p>
            <div className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
              {VISITEUR.cta} →
            </div>
          </Link>

          <p className="mt-10 text-center text-sm text-neutral-700">
            Déjà inscrit ?{" "}
            <Link
              href="/connexion"
              className="text-primary hover:underline underline-offset-2 font-medium"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
