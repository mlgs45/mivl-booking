import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { homePathForRole } from "@/lib/auth-redirect";
import { VerifierOtpForm } from "./verifier-otp-form";

export const metadata = {
  title: "Saisir votre code — MIVL Connect",
};

export default async function VerifierPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const session = await auth();
  if (session?.user) {
    redirect(homePathForRole(session.user.role));
  }

  const { email } = await searchParams;
  if (!email) {
    redirect("/connexion");
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
        </div>

        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-8">
          <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-2">
            Entrez votre code
          </h1>
          <p className="text-sm text-neutral-700 mb-6">
            Nous venons de vous envoyer un code à 6 chiffres par email.
          </p>

          <VerifierOtpForm email={email.toLowerCase()} />
        </div>

        <p className="mt-6 text-center text-sm text-neutral-700">
          Pas reçu le code ?{" "}
          <Link
            href="/connexion"
            className="text-primary font-medium hover:underline"
          >
            Changer d'adresse email
          </Link>
        </p>
      </div>
    </main>
  );
}
