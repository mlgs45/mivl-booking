import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";
import { homePathForRole } from "@/lib/auth-redirect";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Connexion — MIVL Connect",
};

async function sendMagicLink(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return;
  await signIn("nodemailer", {
    email,
    redirect: true,
    redirectTo: "/connexion/verifier",
  });
}

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
            Saisissez votre adresse email pour recevoir un lien de connexion.
          </p>

          <form action={sendMagicLink} className="space-y-4">
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
                placeholder="vous@exemple.fr"
                className="w-full px-4 py-3 rounded-lg border border-neutral-100 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-accent hover:bg-accent-dark text-neutral-900 font-semibold py-6"
              size="lg"
            >
              Recevoir mon lien de connexion
            </Button>
          </form>

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
