"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { definirMotDePasse, type DefinirMdpState } from "./actions";

const initialState: DefinirMdpState = { ok: false };

export function DefinirMdpForm({
  token,
  type,
}: {
  token: string;
  type: "INVITATION" | "RESET";
}) {
  const [state, action] = useActionState(definirMotDePasse, initialState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />

      {state.error && (
        <div className="rounded-lg border-l-4 border-danger bg-danger/10 p-3 text-sm text-neutral-900">
          {state.error}
        </div>
      )}

      <div>
        <label
          htmlFor="motDePasse"
          className="block text-sm font-medium text-neutral-900 mb-2"
        >
          Mot de passe
        </label>
        <input
          id="motDePasse"
          name="motDePasse"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          className="w-full px-4 py-3 rounded-lg border border-neutral-100 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <p className="mt-1 text-xs text-neutral-700">
          10 caractères minimum.
        </p>
      </div>

      <div>
        <label
          htmlFor="confirmation"
          className="block text-sm font-medium text-neutral-900 mb-2"
        >
          Confirmer le mot de passe
        </label>
        <input
          id="confirmation"
          name="confirmation"
          type="password"
          required
          minLength={10}
          autoComplete="new-password"
          className="w-full px-4 py-3 rounded-lg border border-neutral-100 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <SubmitBtn label={type === "INVITATION" ? "Activer mon compte" : "Enregistrer"} />
    </form>
  );
}

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-6"
      size="lg"
    >
      {pending ? "…" : label}
    </Button>
  );
}
