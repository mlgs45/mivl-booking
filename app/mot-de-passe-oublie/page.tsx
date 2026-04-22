import Link from "next/link";
import { ResetForm } from "./reset-form";

export const metadata = {
  title: "Mot de passe oublié — MIVL Connect",
};

export default function MotDePasseOubliePage() {
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
            Mot de passe oublié
          </h1>
          <p className="text-sm text-neutral-700 mb-6">
            Saisissez l'adresse email de votre compte administrateur. Un lien
            de réinitialisation vous sera envoyé si elle correspond à un compte
            valide.
          </p>

          <ResetForm />

          <div className="mt-6 pt-6 border-t border-neutral-100 text-center">
            <Link
              href="/connexion/admin"
              className="text-sm text-neutral-700 hover:text-primary underline-offset-2 hover:underline"
            >
              ← Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
