/**
 * Templates d'emails transactionnels.
 * V1 : HTML inline simple. V2 (Phase 5) : composants React Email.
 */

export type EmailTemplate =
  | "otp-code"
  | "invitation-exposant-admin"
  | "invitation-admin"
  | "reset-mdp-admin"
  | "confirmation-inscription-exposant"
  | "exposant-valide"
  | "exposant-refuse"
  | "confirmation-inscription-enseignant"
  | "enseignant-valide"
  | "enseignant-refuse"
  | "confirmation-rdv-enseignant"
  | "confirmation-rdv-visiteur"
  | "rappel-j-moins-1"
  | "annulation-rdv";

interface TemplateData {
  "otp-code": { code: string };
  "invitation-exposant-admin": {
    raisonSociale: string;
    appUrl: string;
    estPartenaire: boolean;
  };
  "invitation-admin": {
    nomInvite: string;
    role: "SUPER_ADMIN" | "GESTIONNAIRE";
    lienActivation: string;
    invitePar: string;
  };
  "reset-mdp-admin": {
    nomUtilisateur: string;
    lienReset: string;
  };
  "confirmation-inscription-exposant": { raisonSociale: string };
  "exposant-valide": { raisonSociale: string; appUrl: string };
  "exposant-refuse": { raisonSociale: string; motif: string };
  "confirmation-inscription-enseignant": { prenom: string; etablissement: string };
  "enseignant-valide": { prenom: string; appUrl: string };
  "enseignant-refuse": { prenom: string; motif: string };
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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://connect.mivl-orleans.fr";

const baseLayout = (contenu: string) => `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>MIVL Connect</title></head>
<body style="font-family: -apple-system, system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #2D2D2D;">
  <div style="border-top: 6px solid #1B4DB5; padding-top: 24px;">
    <img src="${APP_URL}/images/logo-mivl.png" alt="MIVL Connect" width="160" style="display: block; width: 160px; height: auto; margin: 0 0 20px;">
    ${contenu}
    <hr style="margin: 32px 0; border: none; border-top: 1px solid #E9EDF2;">
    <p style="color: #6B7280; font-size: 12px; line-height: 1.5;">
      Salon Made In Val de Loire — 15 octobre 2026 au CO'Met d'Orléans<br>
      CCI Centre-Val de Loire · <a href="https://mivl-orleans.fr" style="color: #1B4DB5;">mivl-orleans.fr</a>
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
    case "otp-code": {
      const d = data as TemplateData["otp-code"];
      return {
        subject: `Votre code de connexion : ${d.code} — MIVL Connect`,
        html: baseLayout(`
          <p>Bonjour,</p>
          <p>Voici votre code de connexion à votre espace MIVL Connect :</p>
          <p style="margin: 32px 0; text-align: center;">
            <span style="display: inline-block; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 32px; letter-spacing: 8px; font-weight: 700; color: #1B4DB5; background: #F3F6FC; padding: 18px 28px; border-radius: 10px; border: 1px solid #E9EDF2;">${d.code}</span>
          </p>
          <p style="font-size: 14px; color: #6B7280;">Saisissez ce code sur la page de connexion pour accéder à votre espace. Il est valable 10 minutes et ne peut être utilisé qu'une seule fois.</p>
          <p style="font-size: 14px; color: #6B7280;">Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.</p>
        `),
        text: `Votre code de connexion MIVL Connect : ${d.code}\n\nSaisissez-le sur la page de connexion. Valable 10 minutes.`,
      };
    }
    case "invitation-admin": {
      const d = data as TemplateData["invitation-admin"];
      const roleLabel =
        d.role === "SUPER_ADMIN" ? "Super administrateur" : "Administrateur";
      return {
        subject: `Invitation : administrer MIVL Connect`,
        html: baseLayout(`
          <p>Bonjour ${d.nomInvite},</p>
          <p>${d.invitePar} vous invite à rejoindre l'équipe d'administration de la plateforme <strong>MIVL Connect</strong> (salon Made In Val de Loire 2026), en tant que <strong>${roleLabel}</strong>.</p>
          <p>À ce titre, vous aurez accès au back-office pour consulter les inscrits, valider les candidatures exposants et enseignants, et suivre le déroulé du salon.</p>
          <p style="margin: 32px 0;">
            <a href="${d.lienActivation}" style="background: #1B4DB5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Activer mon compte</a>
          </p>
          <p style="font-size: 14px; color: #6B7280;">Ce lien est valable 7 jours. Il vous permettra de choisir votre mot de passe.</p>
          <p>Si vous n'attendiez pas cette invitation, ignorez simplement ce mail.</p>
          <p>À bientôt,<br>L'équipe MIVL</p>
        `),
        text: `${d.invitePar} vous invite comme ${roleLabel} sur MIVL Connect. Activez votre compte : ${d.lienActivation} (lien valable 7 jours).`,
      };
    }
    case "reset-mdp-admin": {
      const d = data as TemplateData["reset-mdp-admin"];
      return {
        subject: "Réinitialisation de votre mot de passe — MIVL Connect",
        html: baseLayout(`
          <p>Bonjour ${d.nomUtilisateur},</p>
          <p>Vous avez demandé à réinitialiser votre mot de passe administrateur MIVL Connect.</p>
          <p style="margin: 32px 0;">
            <a href="${d.lienReset}" style="background: #1B4DB5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Choisir un nouveau mot de passe</a>
          </p>
          <p style="font-size: 14px; color: #6B7280;">Ce lien est valable 7 jours et ne peut être utilisé qu'une seule fois.</p>
          <p style="font-size: 14px; color: #6B7280;">Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce mail : votre mot de passe actuel reste inchangé.</p>
        `),
        text: `Réinitialisez votre mot de passe MIVL Connect : ${d.lienReset} (valable 7 jours).`,
      };
    }
    case "invitation-exposant-admin": {
      const d = data as TemplateData["invitation-exposant-admin"];
      const titre = d.estPartenaire
        ? "Vous êtes invité en tant que partenaire"
        : "Votre compte exposant a été créé";
      const intro = d.estPartenaire
        ? `La CCI Centre-Val de Loire a créé votre compte partenaire pour <strong>${d.raisonSociale}</strong> en vue du salon Made In Val de Loire 2026.`
        : `La CCI Centre-Val de Loire a créé votre compte exposant pour <strong>${d.raisonSociale}</strong> en vue du salon Made In Val de Loire 2026.`;
      return {
        subject: `${titre} — MIVL Connect`,
        html: baseLayout(`
          <p>Bonjour,</p>
          <p>${intro}</p>
          <p>Pour <strong>finaliser votre inscription</strong>, connectez-vous à votre espace et complétez votre fiche (secteurs, offres, contact, équipe). Une fois soumise, la CCI la valide pour diffusion publique.</p>
          <p style="margin: 32px 0;">
            <a href="${d.appUrl}/connexion" style="background: #1B4DB5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Me connecter</a>
          </p>
          <p style="font-size: 14px; color: #6B7280;">La connexion se fait via un code à 6 chiffres envoyé par email (saisissez cette adresse sur la page de connexion).</p>
          <p>À bientôt,<br>L'équipe MIVL</p>
        `),
        text: `${intro}\n\nConnectez-vous sur ${d.appUrl}/connexion pour compléter votre fiche.`,
      };
    }
    case "confirmation-inscription-exposant": {
      const d = data as TemplateData["confirmation-inscription-exposant"];
      return {
        subject: "Votre candidature a bien été reçue — MIVL Connect",
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
        subject: "Votre participation est validée 🎉 — MIVL Connect",
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
        subject: "Suite donnée à votre candidature — MIVL Connect",
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
    case "confirmation-inscription-enseignant": {
      const d = data as TemplateData["confirmation-inscription-enseignant"];
      return {
        subject: "Votre inscription enseignant est enregistrée — MIVL Connect",
        html: baseLayout(`
          <p>Bonjour ${d.prenom},</p>
          <p>Nous avons bien reçu votre inscription en tant qu'enseignant référent pour <strong>${d.etablissement}</strong> au salon Made In Val de Loire 2026.</p>
          <p>Votre demande est en cours d'examen par l'équipe de la CCI Centre-Val de Loire. Vous recevrez un email dès que votre compte sera validé pour créer vos groupes et réserver leurs parcours.</p>
          <p>À bientôt,<br>L'équipe MIVL</p>
        `),
        text: `Inscription enseignant enregistrée pour ${d.etablissement}. Validation par la CCI à venir.`,
      };
    }
    case "enseignant-valide": {
      const d = data as TemplateData["enseignant-valide"];
      return {
        subject: "Votre inscription enseignant est validée 🎉 — MIVL Connect",
        html: baseLayout(`
          <p>Bonjour ${d.prenom},</p>
          <p>Bonne nouvelle ! Votre inscription enseignant a été validée par la CCI Centre-Val de Loire.</p>
          <p>Vous pouvez dès à présent créer vos groupes et réserver leur parcours de 4 rendez-vous :</p>
          <p style="margin: 32px 0;">
            <a href="${d.appUrl}/enseignant" style="background: #1B4DB5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Accéder à mon espace</a>
          </p>
          <p>À bientôt,<br>L'équipe MIVL</p>
        `),
        text: `Inscription validée. Accédez à votre espace : ${d.appUrl}/enseignant`,
      };
    }
    case "enseignant-refuse": {
      const d = data as TemplateData["enseignant-refuse"];
      return {
        subject: "Suite donnée à votre inscription — MIVL Connect",
        html: baseLayout(`
          <p>Bonjour ${d.prenom},</p>
          <p>Nous vous remercions de votre intérêt pour le salon Made In Val de Loire 2026.</p>
          <p>Après examen, nous ne sommes malheureusement pas en mesure de retenir votre inscription en tant qu'enseignant pour cette édition.</p>
          <p><strong>Motif :</strong> ${d.motif}</p>
          <p>Pour toute question, n'hésitez pas à nous contacter par retour d'email.</p>
          <p>Cordialement,<br>L'équipe MIVL</p>
        `),
        text: `Inscription enseignant non retenue. Motif : ${d.motif}`,
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
        subject: "C'est demain ! — MIVL Connect",
        html: baseLayout(`
          <p>Bonjour ${d.prenom},</p>
          <p>Petit rappel : le salon Made In Val de Loire 2026 a lieu <strong>demain, au CO'Met d'Orléans</strong>.</p>
          <p>Voici votre planning :</p>
          <p style="margin: 24px 0;">
            <a href="${d.planningUrl}" style="background: #1B4DB5; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Mon planning</a>
          </p>
          <p>À demain !</p>
        `),
        text: `Rappel salon demain. Planning : ${d.planningUrl}`,
      };
    }
    case "annulation-rdv": {
      const d = data as TemplateData["annulation-rdv"];
      return {
        subject: "Annulation d'un rendez-vous — MIVL Connect",
        html: baseLayout(`
          <p>Bonjour,</p>
          <p>Nous vous informons que le rendez-vous du <strong>${d.creneau}</strong> avec <strong>${d.exposant}</strong> a été annulé.</p>
          <p>Vous pouvez réserver un nouveau créneau depuis votre espace MIVL Connect.</p>
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
