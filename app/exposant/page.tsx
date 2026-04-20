import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";

export const metadata = { title: "Espace exposant — MIVL Booking" };

export default async function ExposantDashboard() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <>
      <AppHeader session={session} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-heading font-bold text-neutral-900">
          Espace exposant
        </h1>
        <p className="mt-2 text-neutral-700">
          Bienvenue {session.user.name}. La configuration de votre stand et la
          gestion des créneaux arrivent en Phase 2.
        </p>
        <div className="mt-8 rounded-xl border border-neutral-100 bg-neutral-50 p-6">
          <p className="text-sm text-neutral-700">
            Connecté en tant que <strong>{session.user.email}</strong>
          </p>
        </div>
      </main>
    </>
  );
}
