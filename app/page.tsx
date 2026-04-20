import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

export const metadata = {
  title: "Made In Val de Loire 2026 — MIVL Booking",
};

const STATS = [
  { value: "120", label: "exposants industriels" },
  { value: "2 000+", label: "visiteurs attendus" },
  { value: "1 journée", label: "15 octobre 2026" },
  { value: "CO'Met", label: "Orléans" },
];

const PARCOURS = [
  {
    heure: "9h – 12h",
    titre: "Groupes scolaires",
    desc: "4 rendez-vous de 20 min avec les exposants, organisés pour les classes de 4e, 3e, 2de et lycée.",
    public: "Enseignants & élèves",
    iconPath:
      "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
  {
    heure: "14h – 18h",
    titre: "Speed dating emploi",
    desc: "6 rendez-vous express de 5 min pour découvrir des entreprises et leurs offres (stages, alternances, CDI).",
    public: "Jeunes diplômés & demandeurs d'emploi",
    iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    heure: "9h – 18h",
    titre: "Visite libre",
    desc: "Déambulation libre sur les stands tout au long de la journée, sans rendez-vous préalable.",
    public: "Tout public",
    iconPath:
      "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  },
];

const CTAS = [
  {
    role: "Vous êtes exposant",
    desc: "Présentez votre entreprise, vos métiers et vos opportunités aux jeunes talents de la région.",
    href: "/inscription?role=exposant",
    cta: "Inscrire mon entreprise",
    accent: true,
    iconPath:
      "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
  },
  {
    role: "Vous êtes enseignant",
    desc: "Réservez des créneaux pour votre groupe et organisez la visite de votre classe sur le salon.",
    href: "/inscription?role=enseignant",
    cta: "Inscrire ma classe",
    accent: false,
    iconPath:
      "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  },
  {
    role: "Vous êtes jeune ou diplômé",
    desc: "Rencontrez les industriels de la région et découvrez les opportunités de stages et d'alternance.",
    href: "/inscription?role=jeune",
    cta: "Réserver mon parcours",
    accent: false,
    iconPath:
      "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z",
  },
  {
    role: "Vous êtes demandeur d'emploi",
    desc: "Participez au speed dating emploi de l'après-midi et rencontrez des entreprises qui recrutent.",
    href: "/inscription?role=demandeur",
    cta: "M'inscrire au speed dating",
    accent: false,
    iconPath:
      "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  },
];

export default function LandingPage() {
  return (
    <>
      <PublicHeader />

      {/* Hero */}
      <section className="bg-primary text-white py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 bg-accent rounded-full" />
              15 octobre 2026 · CO&#39;Met Orléans
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-6">
              Made In Val de Loire
              <span className="block text-white/70 text-3xl sm:text-4xl lg:text-5xl mt-2">
                Salon de l&#39;industrie régionale
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-10 max-w-2xl">
              120 entreprises industrielles du Centre-Val de Loire ouvrent leurs
              portes aux jeunes, aux enseignants et aux demandeurs d&#39;emploi
              pour une journée de découverte et de rencontres professionnelles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/exposants"
                className="inline-flex items-center justify-center bg-white text-primary font-semibold px-6 py-3 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                Voir les exposants
              </Link>
              <Link
                href="/inscription"
                className="inline-flex items-center justify-center bg-accent hover:bg-accent-dark text-neutral-900 font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Je m&#39;inscris
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-neutral-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-heading font-bold text-white mb-1">
                  {s.value}
                </div>
                <div className="text-sm text-white/60">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Parcours */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-heading font-bold text-neutral-900 mb-3">
              Trois parcours dans la journée
            </h2>
            <p className="text-neutral-700 max-w-xl mx-auto">
              Le salon s&#39;organise autour de formats différents selon votre
              profil.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PARCOURS.map((p) => (
              <div
                key={p.titre}
                className="rounded-xl border border-neutral-100 bg-neutral-50 p-7 flex flex-col"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-5">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={p.iconPath}
                    />
                  </svg>
                </div>
                <div className="inline-flex text-xs font-bold text-neutral-900 bg-accent px-2 py-0.5 rounded mb-3">
                  {p.heure}
                </div>
                <h3 className="text-lg font-heading font-bold text-neutral-900 mb-3">
                  {p.titre}
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed mb-4 flex-1">
                  {p.desc}
                </p>
                <div className="text-xs text-neutral-700 bg-white border border-neutral-100 rounded-md px-3 py-2">
                  <span className="font-medium">Pour : </span>
                  {p.public}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTAs par profil */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-heading font-bold text-neutral-900 mb-3">
              Vous êtes…
            </h2>
            <p className="text-neutral-700 max-w-xl mx-auto">
              Chaque profil dispose d&#39;un espace dédié pour préparer sa
              journée.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CTAS.map((c) => (
              <div
                key={c.role}
                className={`rounded-xl border p-7 flex flex-col ${
                  c.accent
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-neutral-900 border-neutral-100"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${
                    c.accent ? "bg-white/15 text-white" : "bg-primary/10 text-primary"
                  }`}
                >
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d={c.iconPath}
                    />
                  </svg>
                </div>
                <h3
                  className={`text-base font-heading font-bold mb-3 ${
                    c.accent ? "text-white" : "text-neutral-900"
                  }`}
                >
                  {c.role}
                </h3>
                <p
                  className={`text-sm leading-relaxed mb-6 flex-1 ${
                    c.accent ? "text-white/80" : "text-neutral-700"
                  }`}
                >
                  {c.desc}
                </p>
                <Link
                  href={c.href}
                  className={`inline-flex items-center justify-center text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors ${
                    c.accent
                      ? "bg-white text-primary hover:bg-neutral-100"
                      : "bg-primary text-white hover:bg-primary-dark"
                  }`}
                >
                  {c.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Infos pratiques */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-heading font-bold text-neutral-900 mb-3">
              Informations pratiques
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-neutral-900 mb-1">Date</h3>
              <p className="text-neutral-700 text-sm">Jeudi 15 octobre 2026</p>
              <p className="text-neutral-700 text-sm">9h – 18h</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-neutral-900 mb-1">Lieu</h3>
              <p className="text-neutral-700 text-sm">CO&#39;Met Orléans</p>
              <p className="text-neutral-700 text-sm">1 Bd de Verdun, Orléans</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-heading font-bold text-neutral-900 mb-1">Contact</h3>
              <p className="text-neutral-700 text-sm">CCI Centre-Val de Loire</p>
              <a
                href="mailto:mathieu.langlois@centre.cci.fr"
                className="text-primary text-sm hover:underline underline-offset-2"
              >
                mathieu.langlois@centre.cci.fr
              </a>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </>
  );
}
