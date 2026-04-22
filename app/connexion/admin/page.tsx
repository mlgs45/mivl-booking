import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";
import { homePathForRole } from "@/lib/auth-redirect";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Connexion administrateur — MIVL Connect",
};

async function credentialsSignIn(formData: FormData) {
  "use server";
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? "").trim().toLowerCase(),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/connexion/admin?erreur=${encodeURIComponent(error.type)}`);
    }
    throw error;
  }
}

const OK_MESSAGES: Record<string, string> = {
  "compte-active":
    "Votre compte est activé. Connectez-vous avec votre email et votre nouveau mot de passe.",
  "mot-de-passe-mis-a-jour":
    "Mot de passe mis à jour. Connectez-vous avec votre nouveau mot de passe.",
};

export default async function ConnexionAdminPage({
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
          <p className="mt-2 text-sm text-neutral-700">Espace administrateur</p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-8">
          <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-2">
            Connexion administrateur
          </h1>
          <p className="text-sm text-neutral-700 mb-6">
            Réservée aux administrateurs et gestionnaires CCI.
          </p>

          {okMessage && (
            <div className="mb-4 rounded-lg border border-success/30 bg-success/5 p-3 text-sm text-success">
              {okMessage}
            </div>
          )}

          {erreur && (
            <div className="mb-4 rounded-lg border-l-4 border-danger bg-danger/10 p-3 text-sm text-neutral-900">
              Identifiants incorrects. Vérifiez votre adresse email et votre mot
              de passe.
            </div>
          )}

          <form action={credentialsSignIn} className="space-y-4">
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

          <div className="mt-6 pt-6 border-t border-neutral-100 flex flex-col items-center gap-2 text-center">
            <Link
              href="/mot-de-passe-oublie"
              className="text-sm text-primary hover:underline underline-offset-2"
            >
              Mot de passe oublié ?
            </Link>
            <Link
              href="/connexion"
              className="text-sm text-neutral-700 hover:text-primary underline-offset-2 hover:underline"
            >
              Connexion par code email
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
