"use client";

import { useActionState } from "react";
import Link from "next/link";
import { inscrireVisiteur, type InscriptionVisiteurState } from "./actions";

const initialState: InscriptionVisiteurState = { ok: false };

const inputCls =
  "w-full rounded-lg border border-neutral-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1.5 text-xs text-danger">{errors.join(" · ")}</p>;
}

function Field({
  label, name, type = "text", required, autoComplete, errors, disabled,
}: {
  label: string; name: string; type?: string; required?: boolean;
  autoComplete?: string; errors?: string[]; disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-neutral-900 mb-1.5">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        className={inputCls}
      />
      <FieldError errors={errors} />
    </div>
  );
}

export function InscriptionVisiteurForm() {
  const [state, action, pending] = useActionState(inscrireVisiteur, initialState);

  if (state.ok) {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center">
        <p className="text-lg font-semibold text-green-800 mb-1">Inscription enregistrée !</p>
        <p className="text-sm text-green-700">
          Un email de confirmation vous a été envoyé. Rendez-vous le 15 octobre 2026 au CO&apos;Met d&apos;Orléans.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Prénom" name="prenom" required errors={state.errors?.prenom} disabled={pending} autoComplete="given-name" />
        <Field label="Nom" name="nom" required errors={state.errors?.nom} disabled={pending} autoComplete="family-name" />
      </div>

      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        errors={state.errors?.email}
        disabled={pending}
      />

      <hr className="border-neutral-100" />

      <label className="flex items-start gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-4 cursor-pointer">
        <input
          type="checkbox"
          name="rgpdConsent"
          required
          disabled={pending}
          className="mt-0.5 h-4 w-4 rounded border-neutral-100 text-primary focus:ring-primary/30"
        />
        <span className="text-sm text-neutral-700">
          J&apos;accepte que mes données soient traitées par la CCI Centre-Val de Loire pour la gestion du salon Made In Val de Loire 2026.{" "}
          <Link href="/confidentialite" className="text-primary underline underline-offset-2">
            Politique de confidentialité
          </Link>
          .
        </span>
      </label>
      <FieldError errors={state.errors?.rgpdConsent} />

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
      >
        {pending ? "Enregistrement…" : "Je m'inscris comme visiteur"}
      </button>
    </form>
  );
}
