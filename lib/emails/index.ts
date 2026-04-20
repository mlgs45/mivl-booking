/**
 * Service email abstrait.
 * - dev : provider "console" → log dans le terminal + fichier tmp/emails-dev.log
 * - prod : provider "brevo" → API Brevo (Phase 5)
 *
 * Toutes les envois sont loggés dans la table EmailLog pour traçabilité admin.
 */
import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { db } from "@/lib/db";
import { renderEmail, type EmailTemplate } from "./templates";

type TemplateData<K extends EmailTemplate> = Parameters<
  typeof renderEmail<K>
>[1];

interface SendEmailOptions<K extends EmailTemplate> {
  to: string;
  template: K;
  data: TemplateData<K>;
}

const FROM_EMAIL = process.env.BREVO_FROM_EMAIL ?? "noreply@mivl-orleans.fr";
const FROM_NAME = process.env.BREVO_FROM_NAME ?? "MIVL Connect";

export async function sendEmail<K extends EmailTemplate>(
  options: SendEmailOptions<K>
): Promise<void> {
  const { to, template, data } = options;
  const rendered = renderEmail(template, data);
  const provider = process.env.EMAIL_PROVIDER ?? "console";

  const log = await db.emailLog.create({
    data: {
      destinataire: to,
      sujet: rendered.subject,
      template,
      statut: "EN_ATTENTE",
    },
  });

  try {
    if (provider === "brevo") {
      await sendViaBrevo(to, rendered.subject, rendered.html, rendered.text);
    } else {
      await sendViaConsole(to, rendered);
    }

    await db.emailLog.update({
      where: { id: log.id },
      data: { statut: "ENVOYE", envoyeA: new Date() },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db.emailLog.update({
      where: { id: log.id },
      data: { statut: "ERREUR", erreur: message },
    });
    throw error;
  }
}

// ─── Providers ──────────────────────────────────────────────────────────────

async function sendViaConsole(
  to: string,
  rendered: { subject: string; html: string; text: string }
): Promise<void> {
  const separator = "─".repeat(72);
  const block = [
    `\n📧 [EMAIL CONSOLE] → ${to}`,
    separator,
    `Date   : ${new Date().toISOString()}`,
    `Sujet  : ${rendered.subject}`,
    `From   : ${FROM_NAME} <${FROM_EMAIL}>`,
    separator,
    rendered.text,
    separator + "\n",
  ].join("\n");

  console.log(block);

  try {
    const dir = join(process.cwd(), "tmp");
    await mkdir(dir, { recursive: true });
    await appendFile(join(dir, "emails-dev.log"), block + "\n");
  } catch {
    // Ne jamais faire échouer un envoi console à cause du FS
  }
}

async function sendViaBrevo(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<void> {
  // Phase 5 : intégration Brevo réelle via leur API REST.
  // Pour l'instant, on no-op si la clé n'est pas configurée.
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    throw new Error(
      "BREVO_API_KEY manquant. Configurez-le dans .env.local ou passez EMAIL_PROVIDER=console en dev."
    );
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Brevo API ${response.status} : ${body}`);
  }
}
