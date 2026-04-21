import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

export const metadata = {
  title: "Mentions légales — MIVL Connect",
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <PublicHeader />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 w-full">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-neutral-900 mb-2">
          Mentions légales
        </h1>
        <p className="text-sm text-neutral-700 mb-10">
          Dernière mise à jour&nbsp;: 21 avril 2026
        </p>

        <article className="prose-like space-y-8 text-neutral-900">
          <Section title="Éditeur du site">
            <p>
              <strong>CCI Centre-Val de Loire</strong>
              <br />
              Établissement public administratif
              <br />
              [Adresse complète à compléter]
              <br />
              Téléphone&nbsp;: [à compléter]
              <br />
              Email&nbsp;: [à compléter]
            </p>
            <p>
              SIRET&nbsp;: [à compléter]
              <br />
              Directeur de la publication&nbsp;: [nom et fonction à compléter]
            </p>
          </Section>

          <Section title="Hébergeur">
            <p>
              Hetzner Online GmbH
              <br />
              Industriestr. 25, 91710 Gunzenhausen — Allemagne
              <br />
              https://www.hetzner.com
            </p>
          </Section>

          <Section title="Propriété intellectuelle">
            <p>
              L'ensemble des contenus présents sur la plateforme MIVL Connect
              (textes, logos, visuels, structure du site) est protégé par le
              droit d'auteur. Toute reproduction, représentation ou diffusion,
              totale ou partielle, sans autorisation préalable écrite de la
              CCI Centre-Val de Loire est interdite.
            </p>
            <p>
              Les logos, marques et descriptions des entreprises exposantes
              restent la propriété de leurs titulaires respectifs. Les
              exposants autorisent la CCI à les utiliser dans le cadre de la
              communication du salon (cf. politique de confidentialité).
            </p>
          </Section>

          <Section title="Responsabilité">
            <p>
              La CCI Centre-Val de Loire s'efforce d'assurer l'exactitude des
              informations publiées sur la plateforme, mais ne saurait être
              tenue responsable des erreurs ou omissions. Les informations
              relatives aux exposants sont renseignées directement par les
              entreprises, qui en restent seules responsables.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Pour toute question relative à la plateforme ou à vos données
              personnelles&nbsp;: [email à compléter].
            </p>
          </Section>
        </article>
      </main>
      <PublicFooter />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-heading text-xl font-bold text-neutral-900 mb-3">
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-neutral-900">
        {children}
      </div>
    </section>
  );
}
