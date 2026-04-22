import Link from "next/link";
import { verifierAdminToken } from "@/lib/admin-tokens";
import { DefinirMdpForm } from "./definir-mdp-form";

export const metadata = {
  title: "Définir mon mot de passe — MIVL Connect",
};

export default async function DefinirMotDePassePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const info = token ? await verifierAdminToken(token) : null;

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block text-primary font-heading font-bold text-2xl"
          >
            MIVL Connect
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-8">
          {!info ? (
            <>
              <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-2">
                Lien invalide ou expiré
              </h1>
              <p className="text-sm text-neutral-700 mb-6">
                Ce lien n'est plus valable. Un lien d'invitation ou de
                réinitialisation de mot de passe expire au bout de 7 jours et
                ne peut être utilisé qu'une seule fois.
              </p>
              <div className="space-y-2 text-sm">
                <Link
                  href="/mot-de-passe-oublie"
                  className="block text-primary hover:underline underline-offset-2"
                >
                  → Redemander un lien de réinitialisation
                </Link>
                <Link
                  href="/connexion/admin"
                  className="block text-neutral-700 hover:text-primary hover:underline underline-offset-2"
                >
                  Retour à la connexion
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-2">
                {info.type === "INVITATION"
                  ? "Activer mon compte"
                  : "Choisir un nouveau mot de passe"}
              </h1>
              <p className="text-sm text-neutral-700 mb-6">
                {info.type === "INVITATION"
                  ? `Bienvenue ${info.name ?? info.email} ! Choisissez votre mot de passe pour accéder à MIVL Connect.`
                  : `Compte : ${info.email}`}
              </p>

              <DefinirMdpForm token={token ?? ""} type={info.type} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
