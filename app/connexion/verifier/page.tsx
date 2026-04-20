import Link from "next/link";

export const metadata = {
  title: "Vérifiez votre email — MIVL Booking",
};

export default function VerifierPage() {
  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-success"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-heading font-bold text-neutral-900 mb-3">
            Vérifiez votre boîte mail
          </h1>
          <p className="text-neutral-700 mb-6">
            Un lien de connexion vous a été envoyé. Il est valable 15 minutes et
            ne peut être utilisé qu'une seule fois.
          </p>
          <p className="text-sm text-neutral-700 mb-6">
            Pensez à vérifier vos spams si vous ne le trouvez pas.
          </p>
          <Link
            href="/connexion"
            className="text-sm text-primary hover:underline underline-offset-2"
          >
            Renvoyer un lien
          </Link>
        </div>
      </div>
    </main>
  );
}
