"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { demanderOtp, type DemanderOtpState } from "./actions";

export function DemanderOtpForm() {
  const [state, action] = useActionState<DemanderOtpState, FormData>(
    demanderOtp,
    { ok: false },
  );

  return (
    <form action={action} className="space-y-4">
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
      {state.error && (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}
      <Submit />
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-accent hover:bg-accent-dark text-neutral-900 font-semibold py-6"
      size="lg"
    >
      {pending ? "Envoi…" : "Recevoir mon code de connexion"}
    </Button>
  );
}
