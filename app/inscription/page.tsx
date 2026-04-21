import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

export const metadata = {
  title: "Inscription — MIVL Connect",
};

const PROFILS = [
  {
    titre: "Je suis une entreprise industrielle",
    desc: "Je présente mon entreprise, mes métiers et mes opportunités aux jeunes talents de la région.",
    href: "/inscription/exposant",
    cta: "Je veux un stand",
    accent: true,
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

export default function InscriptionPage() {
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
                <h2 className="font-heading font-bold text-lg mb-2 text-neutral-900">
                  {p.titre}
                </h2>
                <p
                  className={`text-sm leading-relaxed ${
                    p.accent ? "text-neutral-800" : "text-neutral-700"
                  }`}
                >
                  {p.desc}
                </p>
                <div className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                  {p.cta} →
                </div>
              </Link>
            ))}
          </div>

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
