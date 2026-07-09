import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import {
  renvoyerInvitationPartenaire,
  declencherResetPartenaire,
  supprimerPartenaire,
} from "./actions";

export const metadata = { title: "Partenaires — MIVL Connect" };

const OK_MESSAGES: Record<string, string> = {
  "invitation-envoyee": "Invitation envoyée par email.",
  "invitation-renvoyee": "Invitation renvoyée par email.",
  "reset-envoye": "Lien de réinitialisation envoyé par email.",
  supprime: "Partenaire supprimé.",
};

const ERREUR_MESSAGES: Record<string, string> = {
  introuvable: "Utilisateur introuvable.",
  "deja-active": "Ce compte est déjà activé, utilisez le reset de mot de passe.",
  "pas-partenaire": "Cet utilisateur n'est pas un partenaire.",
};

export default async function AdminPartenairesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erreur?: string }>;
}) {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user) redirect("/connexion/admin");
  if (role !== "SUPER_ADMIN" && role !== "GESTIONNAIRE") redirect("/admin");

  const { ok, erreur } = await searchParams;
  const now = new Date();

  const partenaires = await db.user.findMany({
    where: { role: "PARTENAIRE" },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerified: true,
      createdAt: true,
      partenaire: { select: { nomOrganisation: true, prenomContact: true, nomContact: true } },
      adminTokens: {
        where: { type: "INVITATION", usedAt: null },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { expiresAt: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <Link
            href="/admin"
            className="text-sm text-primary hover:underline underline-offset-2"
          >
            ← Retour au tableau de bord
          </Link>
        </div>

        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-neutral-900">
              Partenaires
            </h1>
            <p className="text-sm text-neutral-700 mt-1">
              Comptes donnant accès en lecture à la liste des entreprises
              exposantes inscrites au salon.
            </p>
          </div>
          <Link
            href="/admin/partenaires/nouveau"
            className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold text-sm px-4 py-2.5 transition-colors"
          >
            + Inviter un partenaire
          </Link>
        </div>

        {ok && OK_MESSAGES[ok] && (
          <div className="mb-4 rounded-lg border border-success/30 bg-success/5 p-3 text-sm text-success">
            {OK_MESSAGES[ok]}
          </div>
        )}
        {erreur && ERREUR_MESSAGES[erreur] && (
          <div className="mb-4 rounded-lg border-l-4 border-danger bg-danger/10 p-3 text-sm text-neutral-900">
            {ERREUR_MESSAGES[erreur]}
          </div>
        )}

        <div className="bg-white rounded-xl border border-neutral-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr className="text-left text-xs uppercase tracking-wider text-neutral-500">
                <th className="px-4 py-3 font-semibold">Partenaire</th>
                <th className="px-4 py-3 font-semibold">Contact</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {partenaires.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-neutral-500">
                    Aucun partenaire pour le moment.
                  </td>
                </tr>
              )}
              {partenaires.map((p) => {
                const active = Boolean(p.emailVerified);
                const invitation = p.adminTokens[0];
                const invitationActive =
                  !active && invitation && invitation.expiresAt > now;
                const invitationExpiree =
                  !active && invitation && !invitationActive;
                const jamaisInvite = !active && !invitation;

                return (
                  <tr key={p.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium text-neutral-900">
                        {p.partenaire?.nomOrganisation ?? p.name ?? "—"}
                      </div>
                      <div className="text-xs text-neutral-700">{p.email}</div>
                    </td>
                    <td className="px-4 py-3 text-neutral-700">
                      {p.partenaire
                        ? `${p.partenaire.prenomContact} ${p.partenaire.nomContact}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {active ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-success">
                          <span className="w-1.5 h-1.5 rounded-full bg-success" />
                          Actif
                        </span>
                      ) : invitationActive ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-primary">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          Invitation envoyée
                        </span>
                      ) : invitationExpiree ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                          Invitation expirée
                        </span>
                      ) : jamaisInvite ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                          Pas d'invitation
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {!active && (
                          <form action={renvoyerInvitationPartenaire.bind(null, p.id)}>
                            <button
                              type="submit"
                              className="text-xs px-2.5 py-1.5 rounded-md border border-neutral-200 text-neutral-900 hover:bg-neutral-50"
                            >
                              Renvoyer invitation
                            </button>
                          </form>
                        )}
                        {active && (
                          <form action={declencherResetPartenaire.bind(null, p.id)}>
                            <button
                              type="submit"
                              className="text-xs px-2.5 py-1.5 rounded-md border border-neutral-200 text-neutral-900 hover:bg-neutral-50"
                            >
                              Réinitialiser mdp
                            </button>
                          </form>
                        )}
                        <form action={supprimerPartenaire.bind(null, p.id)}>
                          <button
                            type="submit"
                            className="text-xs px-2.5 py-1.5 rounded-md border border-danger/30 text-danger hover:bg-danger/5"
                          >
                            Supprimer
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs text-neutral-500">
          Un partenaire ne voit que la liste des entreprises exposantes — aucune
          donnée personnelle de visiteur ne lui est accessible. Le lien
          d'invitation et le lien de réinitialisation sont valables 7 jours.
        </p>
      </main>
    </>
  );
}
