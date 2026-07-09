import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";
import { CreerPartenaireForm } from "./creer-partenaire-form";

export const metadata = { title: "Inviter un partenaire — MIVL Connect" };

export default async function NouveauPartenairePage() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user) redirect("/connexion/admin");
  if (role !== "SUPER_ADMIN" && role !== "GESTIONNAIRE") redirect("/admin");

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <Link
            href="/admin/partenaires"
            className="text-sm text-primary hover:underline underline-offset-2"
          >
            ← Retour à la liste
          </Link>
        </div>

        <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-2">
          Inviter un partenaire
        </h1>
        <p className="text-sm text-neutral-700 mb-8">
          Le partenaire reçoit un email avec un lien d'activation valable 7
          jours pour choisir son mot de passe. Une fois activé, il se connecte
          via <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-xs">/connexion</code>{" "}
          et accède en lecture seule à la liste des entreprises exposantes.
        </p>

        <CreerPartenaireForm />
      </main>
    </>
  );
}
