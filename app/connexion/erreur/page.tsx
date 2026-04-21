import Link from "next/link";

export const metadata = {
  title: "Erreur de connexion — MIVL Connect",
};

const MESSAGES: Record<string, string> = {
  Configuration:
    "Le serveur a rencontré un problème de configuration. Merci de contacter le support.",
  AccessDenied:
    "L'accès vous a été refusé. Vérifiez que votre compte est activé.",
  Verification:
    "Le code de connexion est expiré ou a déjà été utilisé. Demandez-en un nouveau.",
  Default: "Une erreur s'est produite. Merci de réessayer dans un instant.",
};

export default async function ErreurPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const message =
    (error && MESSAGES[error]) ?? MESSAGES.Default ?? "Une erreur est survenue.";

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-danger"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-3">
            Problème de connexion
          </h1>
          <p className="text-neutral-700 mb-6">{message}</p>
          <Link
            href="/connexion"
            className="inline-block bg-accent hover:bg-accent-dark text-neutral-900 font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </main>
  );
}
