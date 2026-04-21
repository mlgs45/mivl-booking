import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";
import { CreerExposantForm } from "./creer-form";

export const metadata = { title: "Nouvel exposant — Admin MIVL" };

export default async function AdminNouvelExposantPage() {
  const session = await auth();
  const role = session?.user?.role;
  if (!session?.user || (role !== "SUPER_ADMIN" && role !== "GESTIONNAIRE")) {
    redirect("/admin");
  }

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6 flex items-center gap-2 text-sm text-neutral-700">
          <Link href="/admin" className="hover:text-primary">Admin</Link>
          <span>/</span>
          <Link href="/admin/exposants" className="hover:text-primary">
            Exposants
          </Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium">Nouveau</span>
        </div>

        <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-2">
          Nouvel exposant
        </h1>
        <p className="text-sm text-neutral-700 mb-8">
          Crée directement un exposant validé (utile pour les partenaires et
          institutionnels connus d&#39;avance). Le contact pourra se connecter
          via code email pour compléter son profil.
        </p>

        <div className="bg-white rounded-xl border border-neutral-100 p-6 sm:p-8">
          <CreerExposantForm />
        </div>
      </main>
    </>
  );
}
