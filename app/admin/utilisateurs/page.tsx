import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { AppHeader } from "@/components/layout/app-header";
import {
  changerRole,
  declencherReset,
  renvoyerInvitation,
  supprimerAdmin,
} from "./actions";

export const metadata = { title: "Administrateurs — MIVL Connect" };

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super administrateur",
  GESTIONNAIRE: "Administrateur",
};

const OK_MESSAGES: Record<string, string> = {
  "invitation-envoyee": "Invitation envoyée par email.",
  "invitation-renvoyee": "Invitation renvoyée par email.",
  "reset-envoye": "Lien de réinitialisation envoyé par email.",
  "role-change": "Rôle mis à jour.",
  supprime: "Administrateur supprimé.",
};

const ERREUR_MESSAGES: Record<string, string> = {
  introuvable: "Utilisateur introuvable.",
  "deja-active": "Ce compte est déjà activé, utilisez le reset de mot de passe.",
  "pas-admin": "Cet utilisateur n'est pas un administrateur.",
  "pas-soi-meme":
    "Vous ne pouvez pas modifier ou supprimer votre propre compte depuis cette page.",
  "role-invalide": "Rôle invalide.",
};

export default async function AdminUtilisateursPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erreur?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/connexion/admin");
  if (session.user.role !== "SUPER_ADMIN") redirect("/admin");

  const { ok, erreur } = await searchParams;

  const now = new Date();

  const admins = await db.user.findMany({
    where: { role: { in: ["SUPER_ADMIN", "GESTIONNAIRE"] } },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      hashedPassword: true,
      emailVerified: true,
      createdAt: true,
      adminTokens: {
        where: { type: "INVITATION", usedAt: null },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { expiresAt: true },
      },
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
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
              Administrateurs
            </h1>
            <p className="text-sm text-neutral-700 mt-1">
              Gérez les comptes ayant accès au back-office MIVL Connect.
            </p>
          </div>
          <Link
            href="/admin/utilisateurs/nouveau"
            className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-primary hover:bg-primary-dark text-white font-semibold text-sm px-4 py-2.5 transition-colors"
          >
            + Inviter un administrateur
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
                <th className="px-4 py-3 font-semibold">Nom / Email</th>
                <th className="px-4 py-3 font-semibold">Rôle</th>
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => {
                const estSoi = admin.id === session.user.id;
                const active = Boolean(admin.hashedPassword);
                const invitation = admin.adminTokens[0];
                const invitationActive =
                  !active && invitation && invitation.expiresAt > now;
                const invitationExpiree =
                  !active && invitation && !invitationActive;
                const jamaisInvite = !active && !invitation;

                return (
                  <tr
                    key={admin.id}
                    className="border-b border-neutral-100 last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-neutral-900">
                        {admin.name ?? "—"}
                        {estSoi && (
                          <span className="ml-2 text-xs font-normal text-neutral-500">
                            (vous)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-700">
                        {admin.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block text-xs font-medium text-neutral-900">
                        {ROLE_LABEL[admin.role] ?? admin.role}
                      </span>
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
                      {estSoi ? (
                        <span className="block text-right text-xs text-neutral-500">
                          —
                        </span>
                      ) : (
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {!active && (
                            <form
                              action={renvoyerInvitation.bind(null, admin.id)}
                            >
                              <button
                                type="submit"
                                className="text-xs px-2.5 py-1.5 rounded-md border border-neutral-200 text-neutral-900 hover:bg-neutral-50"
                              >
                                Renvoyer invitation
                              </button>
                            </form>
                          )}
                          {active && (
                            <form
                              action={declencherReset.bind(null, admin.id)}
                            >
                              <button
                                type="submit"
                                className="text-xs px-2.5 py-1.5 rounded-md border border-neutral-200 text-neutral-900 hover:bg-neutral-50"
                              >
                                Réinitialiser mdp
                              </button>
                            </form>
                          )}
                          <form
                            action={changerRole.bind(
                              null,
                              admin.id,
                              admin.role === "SUPER_ADMIN"
                                ? "GESTIONNAIRE"
                                : "SUPER_ADMIN",
                            )}
                          >
                            <button
                              type="submit"
                              className="text-xs px-2.5 py-1.5 rounded-md border border-neutral-200 text-neutral-900 hover:bg-neutral-50"
                            >
                              {admin.role === "SUPER_ADMIN"
                                ? "→ Administrateur"
                                : "→ Super admin"}
                            </button>
                          </form>
                          <form action={supprimerAdmin.bind(null, admin.id)}>
                            <button
                              type="submit"
                              className="text-xs px-2.5 py-1.5 rounded-md border border-danger/30 text-danger hover:bg-danger/5"
                            >
                              Supprimer
                            </button>
                          </form>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-xs text-neutral-500">
          Les actions destructives (suppression, changement de rôle) prennent
          effet immédiatement. Le lien d'invitation et le lien de
          réinitialisation sont valables 7 jours.
        </p>
      </main>
    </>
  );
}
