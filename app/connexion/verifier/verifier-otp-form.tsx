"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  renvoyerOtp,
  verifierOtp,
  type RenvoyerOtpState,
  type VerifierOtpState,
} from "./actions";

export function VerifierOtpForm({ email }: { email: string }) {
  const [state, action] = useActionState<VerifierOtpState, FormData>(
    verifierOtp,
    { ok: false },
  );
  const [resendState, resendAction] = useActionState<RenvoyerOtpState, FormData>(
    renvoyerOtp,
    { ok: false },
  );
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const cleaned = input.value.replace(/\D/g, "").slice(0, 6);
    if (cleaned !== input.value) input.value = cleaned;
    if (cleaned.length === 6) {
      formRef.current?.requestSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <form ref={formRef} action={action} className="space-y-4">
        <input type="hidden" name="email" value={email} />
        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-neutral-900 mb-2"
          >
            Code à 6 chiffres
          </label>
          <input
            ref={inputRef}
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            onInput={handleInput}
            aria-describedby="code-help"
            className="w-full px-4 py-4 text-center text-3xl tracking-[0.5em] font-mono rounded-lg border border-neutral-200 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="••••••"
          />
          <p id="code-help" className="mt-2 text-xs text-neutral-500">
            Code envoyé à <strong className="text-neutral-900">{email}</strong>.
            Valable 10 minutes.
          </p>
        </div>
        {state.error && (
          <p className="text-sm text-danger" role="alert">
            {state.error}
          </p>
        )}
        <Submit />
      </form>

      <div className="pt-4 border-t border-neutral-100 text-center space-y-2">
        <form action={resendAction}>
          <input type="hidden" name="email" value={email} />
          <ResendButton />
        </form>
        {resendState.message && (
          <p className="text-xs text-success">{resendState.message}</p>
        )}
        {resendState.error && (
          <p className="text-xs text-danger">{resendState.error}</p>
        )}
      </div>
    </div>
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
      {pending ? "Vérification…" : "Valider"}
    </Button>
  );
}

function ResendButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-sm text-primary hover:underline underline-offset-2 disabled:opacity-60"
    >
      {pending ? "Envoi…" : "Renvoyer un code"}
    </button>
  );
}
