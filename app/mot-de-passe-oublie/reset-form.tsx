"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { demanderResetMdp, type ResetMdpState } from "./actions";

const initialState: ResetMdpState = { ok: false };

export function ResetForm() {
  const [state, action] = useActionState(demanderResetMdp, initialState);

  if (state.ok) {
    return (
      <div className="rounded-lg border border-success/30 bg-success/5 p-4 text-sm text-success">
        {state.message}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <div className="rounded-lg border-l-4 border-danger bg-danger/10 p-3 text-sm text-neutral-900">
          {state.error}
        </div>
      )}

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

      <SubmitBtn />
    </form>
  );
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-6"
      size="lg"
    >
      {pending ? "…" : "Envoyer le lien de réinitialisation"}
    </Button>
  );
}
