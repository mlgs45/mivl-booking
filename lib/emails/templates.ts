/**
 * Templates d'emails transactionnels.
 * V1 : HTML inline simple. V2 (Phase 5) : composants React Email.
 */

export type EmailTemplate =
  | "magic-link"
  | "confirmation-inscription-exposant"
  | "exposant-valide"
  | "exposant-refuse"
  | "confirmation-rdv-enseignant"
  | "confirmation-rdv-visiteur"
  | "rappel-j-moins-1"
  | "annulation-rdv";

interface TemplateData {
  "magic-link": { url: string; appUrl: string };
  "confirmation-inscription-exposant": { raisonSociale: string };
  "exposant-valide": { raisonSociale: string; appUrl: string };
  "exposant-refuse": { raisonSociale: string; motif: string };
  "confirmation-rdv-enseignant": {
    nomGroupe: string;
    planningUrl: string;
  };
  "confirmation-rdv-visiteur": {
    prenom: string;
    planningUrl: string;
  };
  "rappel-j-moins-1": { prenom: string; planningUrl: string };
  "annulation-rdv": {
    destinataire: string;
    creneau: string;
    exposant: string;
  };
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const baseLayout = (contenu: string) => `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>MIVL Booking</title></head>
<body style="font-family: -apple-system, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #2D2D2D;">
  <div style="border-top: 6px solid #1C2F5E; padding-top: 24px;">
    <h1 style="color: #1C2F5E; font-size: 24px; margin: 0 0 16px;">MIVL Booking</h1>
    ${contenu}
    <hr style="margin: 32px 0; border: none; border-top: 1px solid #E9EDF2;">
    <p style="color: #6B7280; font-size: 12px; line-height: 1.5;">
      Salon Made In Val de Loire — 15 octobre 2026 au CO'Met d'Orléans<br>
      CCI Centre-Val de Loire · <a href="https://mivl-orleans.fr" style="color: #1C2F5E;">mivl-orleans.fr</a>
    </p>
  </div>
</body>
</html>
`;

export function renderEmail<K extends EmailTemplate>(
  template: K,
  data: TemplateData[K]
): RenderedEmail {
  switch (template) {
    case "magic-link": {
      const d = data as TemplateData["magic-link"];
      return {
        subject: "Votre lien de connexion — MIVL Booking",
        html: baseLayout(`
          <p>Bonjour,</p>
          <p>Cliquez sur le bouton ci-dessous pour vous connecter à votre espace MIVL Booking :</p>
          <p style="margin: 32px 0;">
            <a href="${d.url}" style="background: #E63946; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Me connecter</a>
          </p>
          <p style="font-size: 14px; color: #6B7280;">Ce lien est valable 15 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.</p>
        `),
        text: `Connectez-vous à MIVL Booking : ${d.url} (valable 15 minutes)`,
      };
    }
    case "confirmation-inscription-exposant": {
      const d = data as TemplateData["confirmation-inscription-exposant"];
      return {
        subject: "Votre candidature a bien été reçue — MIVL Booking",
        html: baseLayout(`
          <p>Bonjour,</p>
          <p>Nous avons bien reçu la candidature de <strong>${d.raisonSociale}</strong> pour participer au salon Made In Val de Loire 2026.</p>
          <p>Votre dossier est en cours d'examen par l'équipe de la CCI Centre-Val de Loire. Vous recevrez un email de validation ou de demande de compléments sous 5 jours ouvrés.</p>
          <p>À bientôt,<br>L'équipe MIVL</p>
        `),
        text: `Candidature de ${d.raisonSociale} bien reçue. Validation sous 5 jours ouvrés.`,
      };
    }
    case "exposant-valide": {
      const d = data as TemplateData["exposant-valide"];
      return {
        subject: "Votre participation est validée 🎉 — MIVL Booking",
        html: baseLayout(`
          <p>Bonjour,</p>
          <p>Excellente nouvelle ! La candidature de <strong>${d.raisonSociale}</strong> a été validée.</p>
          <p>Vous pouvez dès à présent accéder à votre espace exposant pour compléter vos paramètres (créneaux, quotas, métiers proposés) :</p>
          <p style="margin: 32px 0;">
            <a href="${d.appUrl}/exposant" style="background: #E63946; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Accéder à mon espace</a>
          </p>
          <p>À très bientôt au CO'Met,<br>L'équipe MIVL</p>
        `),
        text: `Candidature validée. Accédez à votre espace : ${d.appUrl}/exposant`,
      };
    }
    case "exposant-refuse": {
      const d = data as TemplateData["exposant-refuse"];
      return {
        subject: "Suite donnée à votre candidature — MIVL Booking",
        html: baseLayout(`
          <p>Bonjour,</p>
          <p>Nous vous remercions pour l'intérêt porté au salon Made In Val de Loire 2026.</p>
          <p>Après examen, nous ne sommes malheureusement pas en mesure de retenir la candidature de <strong>${d.raisonSociale}</strong> pour cette édition.</p>
          <p><strong>Motif :</strong> ${d.motif}</p>
          <p>Pour toute question, n'hésitez pas à nous contacter par retour d'email.</p>
          <p>Cordialement,<br>L'équipe MIVL</p>
        `),
        text: `Candidature non retenue pour cette édition. Motif : ${d.motif}`,
      };
    }
    case "confirmation-rdv-enseignant": {
      const d = data as TemplateData["confirmation-rdv-enseignant"];
      return {
        subject: `Parcours du groupe ${d.nomGroupe} confirmé — MIVL`,
        html: baseLayout(`
          <p>Bonjour,</p>
          <p>Le parcours du groupe <strong>${d.nomGroupe}</strong> est confirmé pour le salon du 15 octobre 2026.</p>
          <p>Vous pouvez consulter, imprimer et partager le planning ici :</p>
          <p style="margin: 32px 0;">
            <a href="${d.planningUrl}" style="background: #E63946; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Voir le planning</a>
          </p>
          <p>N'oubliez pas d'imprimer le badge QR code du groupe le jour du salon.</p>
          <p>À bientôt,<br>L'équipe MIVL</p>
        `),
        text: `Parcours ${d.nomGroupe} confirmé. Planning : ${d.planningUrl}`,
      };
    }
    case "confirmation-rdv-visiteur": {
      const d = data as TemplateData["confirmation-rdv-visiteur"];
      return {
        subject: "Vos rendez-vous MIVL sont confirmés",
        html: baseLayout(`
          <p>Bonjour ${d.prenom},</p>
          <p>Vos rendez-vous du salon Made In Val de Loire sont confirmés.</p>
          <p>Retrouvez ici votre planning personnalisé avec votre badge QR code à présenter à l'entrée du salon et de chaque stand :</p>
          <p style="margin: 32px 0;">
            <a href="${d.planningUrl}" style="background: #E63946; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Voir mon planning</a>
          </p>
          <p>À mercredi 15 octobre,<br>L'équipe MIVL</p>
        `),
        text: `Planning : ${d.planningUrl}`,
      };
    }
    case "rappel-j-moins-1": {
      const d = data as TemplateData["rappel-j-moins-1"];
      return {
        subject: "C'est demain ! — MIVL Booking",
        html: baseLayout(`
          <p>Bonjour ${d.prenom},</p>
          <p>Petit rappel : le salon Made In Val de Loire 2026 a lieu <strong>demain, au CO'Met d'Orléans</strong>.</p>
          <p>Voici votre planning :</p>
          <p style="margin: 24px 0;">
            <a href="${d.planningUrl}" style="background: #1C2F5E; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Mon planning</a>
          </p>
          <p>À demain !</p>
        `),
        text: `Rappel salon demain. Planning : ${d.planningUrl}`,
      };
    }
    case "annulation-rdv": {
      const d = data as TemplateData["annulation-rdv"];
      return {
        subject: "Annulation d'un rendez-vous — MIVL Booking",
        html: baseLayout(`
          <p>Bonjour,</p>
          <p>Nous vous informons que le rendez-vous du <strong>${d.creneau}</strong> avec <strong>${d.exposant}</strong> a été annulé.</p>
          <p>Vous pouvez réserver un nouveau créneau depuis votre espace MIVL Booking.</p>
        `),
        text: `RDV ${d.creneau} avec ${d.exposant} annulé.`,
      };
    }
    default: {
      const _exhaustive: never = template;
      throw new Error(`Template inconnu : ${_exhaustive as string}`);
    }
  }
}
