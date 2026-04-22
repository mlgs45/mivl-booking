import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

export const metadata = {
  title: "Politique de confidentialité — MIVL Connect",
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <PublicHeader />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 w-full">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-neutral-900 mb-2">
          Politique de confidentialité
        </h1>
        <p className="text-sm text-neutral-700 mb-10">
          Dernière mise à jour&nbsp;: 21 avril 2026
        </p>

        <article className="space-y-8">
          <Section title="Responsable de traitement">
            <p>
              Le responsable du traitement des données collectées sur MIVL
              Connect est la <strong>CCI Centre-Val de Loire</strong>,
              organisatrice du salon Made In Val de Loire 2026.
            </p>
            <p>
              Déléguée à la protection des données (DPO)&nbsp;: Carine
              AIGRET —{" "}
              <a
                href="mailto:carine.aigret@centre.cci.fr"
                className="text-primary hover:underline underline-offset-2"
              >
                carine.aigret@centre.cci.fr
              </a>
              .
            </p>
          </Section>

          <Section title="Données collectées">
            <p>Selon votre profil, les données suivantes peuvent être collectées&nbsp;:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Exposants / partenaires</strong>&nbsp;: raison sociale,
                SIRET, adresse, site web, logo, description, secteurs
                d'activité, offres proposées, nom du référent, téléphone,
                fonction, membres de l'équipe stand.
              </li>
              <li>
                <strong>Enseignants</strong>&nbsp;: nom, prénom, email,
                établissement, niveau de classe, effectifs.
              </li>
              <li>
                <strong>Jeunes (lycéens, étudiants, diplômés)</strong>&nbsp;:
                nom, prénom, email, âge, niveau d'études, centres d'intérêt.
              </li>
              <li>
                <strong>Demandeurs d'emploi</strong>&nbsp;: nom, prénom,
                email, domaine recherché, expérience.
              </li>
              <li>
                <strong>Tous utilisateurs</strong>&nbsp;: adresse IP, date de
                connexion, logs techniques à des fins de sécurité.
              </li>
            </ul>
          </Section>

          <Section title="Finalités du traitement">
            <ul className="list-disc pl-5 space-y-1">
              <li>Organisation et gestion du salon MIVL 2026.</li>
              <li>Mise en relation entre exposants et visiteurs (matching, rendez-vous).</li>
              <li>Validation des candidatures exposants par la CCI.</li>
              <li>Communication avant, pendant et après l'événement.</li>
              <li>
                Promotion du salon (annuaire public, supports presse, photos et
                vidéos captées le jour J) — sous réserve de consentement
                explicite.
              </li>
              <li>Statistiques anonymisées d'utilisation de la plateforme.</li>
            </ul>
          </Section>

          <Section title="Bases légales">
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Exécution d'un contrat</strong> pour la participation
                au salon (inscription exposant, prise de rendez-vous).
              </li>
              <li>
                <strong>Consentement</strong> pour la communication publique
                (cases à cocher explicites lors de l'inscription).
              </li>
              <li>
                <strong>Intérêt légitime</strong> pour la sécurité de la
                plateforme et les statistiques anonymisées.
              </li>
            </ul>
          </Section>

          <Section title="Durée de conservation">
            <p>
              Les données sont conservées pendant 2 ans après la fin du salon,
              puis archivées ou supprimées conformément à la politique
              d'archivage de la CCI. Les logs de sécurité sont conservés 12
              mois.
            </p>
          </Section>

          <Section title="Destinataires">
            <p>
              Les données sont accessibles uniquement&nbsp;:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>aux équipes de la CCI Centre-Val de Loire en charge du salon,</li>
              <li>aux exposants pour les données des visiteurs qui ont pris rendez-vous avec eux,</li>
              <li>
                aux sous-traitants techniques (hébergement Hetzner,
                envoi d'emails Brevo) dans la limite strictement nécessaire à
                la prestation.
              </li>
            </ul>
            <p>Aucune donnée n'est transférée hors Union européenne.</p>
          </Section>

          <Section title="Vos droits">
            <p>
              Conformément au RGPD, vous disposez des droits suivants&nbsp;:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>droit d'accès, de rectification et d'effacement,</li>
              <li>droit à la limitation et à l'opposition au traitement,</li>
              <li>droit à la portabilité de vos données,</li>
              <li>droit de retirer votre consentement à tout moment.</li>
            </ul>
            <p>
              Pour exercer ces droits, contactez la DPO de la CCI à&nbsp;:{" "}
              <a
                href="mailto:carine.aigret@centre.cci.fr"
                className="text-primary hover:underline underline-offset-2"
              >
                carine.aigret@centre.cci.fr
              </a>
              . Une réponse vous sera apportée dans un délai d'un mois
              maximum.
            </p>
            <p>
              Vous disposez également d'un droit de réclamation auprès de la
              CNIL (www.cnil.fr).
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              MIVL Connect utilise uniquement des cookies strictement
              nécessaires au fonctionnement du service (authentification,
              session). Aucun cookie de mesure d'audience ou publicitaire
              n'est déposé sans votre consentement.
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
