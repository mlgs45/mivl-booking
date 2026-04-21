import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { homePathForRole } from "@/lib/auth-redirect";
import { DemanderOtpForm } from "./demander-otp-form";

export const metadata = {
  title: "Connexion — MIVL Connect",
};

export default async function ConnexionPage() {
  const session = await auth();
  if (session?.user) {
    redirect(homePathForRole(session.user.role));
  }

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
          <p className="mt-2 text-sm text-neutral-700">
            Salon Made In Val de Loire · 15 octobre 2026
          </p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-8">
          <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-2">
            Connexion
          </h1>
          <p className="text-sm text-neutral-700 mb-6">
            Saisissez votre adresse email pour recevoir un code à 6 chiffres.
          </p>

          <DemanderOtpForm />

          <div className="mt-6 pt-6 border-t border-neutral-100 text-center">
            <Link
              href="/connexion/admin"
              className="text-sm text-neutral-700 hover:text-primary underline-offset-2 hover:underline"
            >
              Vous êtes administrateur ?
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-neutral-700">
          Pas encore inscrit ?{" "}
          <Link
            href="/#inscription"
            className="text-primary font-medium hover:underline"
          >
            Voir les inscriptions
          </Link>
        </p>
      </div>
    </main>
  );
}
