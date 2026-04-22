import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";
import { CreerAdminForm } from "./creer-admin-form";

export const metadata = { title: "Inviter un administrateur — MIVL Connect" };

export default async function NouvelAdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/connexion/admin");
  if (session.user.role !== "SUPER_ADMIN") redirect("/admin");

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6">
          <Link
            href="/admin/utilisateurs"
            className="text-sm text-primary hover:underline underline-offset-2"
          >
            ← Retour à la liste
          </Link>
        </div>

        <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-2">
          Inviter un administrateur
        </h1>
        <p className="text-sm text-neutral-700 mb-8">
          L'invité recevra un email contenant un lien d'activation valable 7
          jours pour choisir son mot de passe. Une fois activé, il se connecte
          via <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-xs">/connexion/admin</code>.
        </p>

        <CreerAdminForm />
      </main>
    </>
  );
}
