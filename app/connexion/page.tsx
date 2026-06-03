import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";
import { db } from "@/lib/db";
import { homePathForRole } from "@/lib/auth-redirect";
import { checkLoginRateLimit } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request-ip";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Connexion — MIVL Connect",
};

async function connexionAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const ip = await clientIp();
  const rate = await checkLoginRateLimit(email, ip);
  if (!rate.allowed) {
    redirect(`/connexion?erreur=rate`);
  }

  const user = await db.user.findUnique({ where: { email }, select: { role: true } });
  const redirectTo = user ? homePathForRole(user.role) : "/";

  try {
    await signIn("credentials", { email, password, redirectTo });
  } catch (error) {
    if (error instanceof AuthError) {
      await db.auditLog.create({
        data: { action: "auth.signin_failed", entite: "User", ip, payload: { email } },
      });
      redirect(`/connexion?erreur=true`);
    }
    throw error;
  }
}

const OK_MESSAGES: Record<string, string> = {
  "compte-cree":
    "Votre compte a été créé. Connectez-vous avec votre email et votre mot de passe.",
  "mot-de-passe-mis-a-jour":
    "Mot de passe mis à jour. Connectez-vous avec votre nouveau mot de passe.",
};

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string; ok?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect(homePathForRole(session.user.role));
  }
  const { erreur, ok } = await searchParams;
  const okMessage = ok ? OK_MESSAGES[ok] : null;

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
            Entrez votre email et votre mot de passe.
          </p>

          {okMessage && (
            <div className="mb-4 rounded-lg border border-success/30 bg-success/5 p-3 text-sm text-success">
              {okMessage}
            </div>
          )}

          {erreur && (
            <div className="mb-4 rounded-lg border-l-4 border-danger bg-danger/10 p-3 text-sm text-neutral-900">
              {erreur === "rate"
                ? "Trop de tentatives de connexion. Patientez quelques minutes avant de réessayer."
                : "Email ou mot de passe incorrect."}
            </div>
          )}

          <form action={connexionAction} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-900 mb-2"
              >
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-lg border border-neutral-100 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-900 mb-2"
              >
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-lg border border-neutral-100 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-6"
              size="lg"
            >
              Me connecter
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-100 text-center">
            <Link
              href="/mot-de-passe-oublie"
              className="text-sm text-primary hover:underline underline-offset-2"
            >
              Mot de passe oublié ?
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
