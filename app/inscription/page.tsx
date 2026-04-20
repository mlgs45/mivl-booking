import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

export const metadata = {
  title: "Inscription — MIVL Booking",
};

const PROFILS = [
  {
    titre: "Je suis exposant",
    desc: "Entreprise industrielle qui souhaite participer au salon.",
    href: "/inscription/exposant",
    accent: true,
  },
  {
    titre: "Je suis enseignant",
    desc: "Je souhaite inscrire une classe ou un groupe au parcours du matin.",
    href: "/inscription/enseignant",
    accent: false,
  },
  {
    titre: "Je suis jeune ou diplômé",
    desc: "Je souhaite participer au speed dating de l'après-midi.",
    href: "/inscription/jeune",
    accent: false,
  },
  {
    titre: "Je suis demandeur d'emploi",
    desc: "Référé par France Travail pour le speed dating emploi.",
    href: "/inscription/demandeur-emploi",
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
                    ? "bg-primary border-primary text-white hover:bg-primary-dark"
                    : "bg-white border-neutral-100 hover:border-primary hover:shadow-sm"
                }`}
              >
                <h2
                  className={`font-heading font-bold text-lg mb-2 ${
                    p.accent ? "text-white" : "text-neutral-900"
                  }`}
                >
                  {p.titre}
                </h2>
                <p
                  className={`text-sm leading-relaxed ${
                    p.accent ? "text-white/80" : "text-neutral-700"
                  }`}
                >
                  {p.desc}
                </p>
                <div
                  className={`mt-4 inline-flex items-center text-sm font-semibold ${
                    p.accent ? "text-white" : "text-primary"
                  }`}
                >
                  S'inscrire →
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
