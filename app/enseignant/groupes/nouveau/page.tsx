import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";
import { GroupeForm } from "./groupe-form";

export const metadata = { title: "Nouveau groupe — MIVL Connect" };

export default async function NouveauGroupePage() {
  const session = await auth();
  if (!session?.user) return null;
  if (session.user.role !== "ENSEIGNANT") redirect("/");

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6 flex items-center gap-2 text-sm text-neutral-700">
          <Link href="/enseignant" className="hover:text-primary">Mes groupes</Link>
          <span>/</span>
          <span className="text-neutral-900 font-medium">Nouveau groupe</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-neutral-900 mb-1">
            Créer un groupe
          </h1>
          <p className="text-sm text-neutral-700">
            Chaque groupe suit un parcours de 4 rendez-vous de 20 min avec les exposants que vous choisirez.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-100 p-6 sm:p-8">
          <GroupeForm />
        </div>
      </main>
    </>
  );
}
