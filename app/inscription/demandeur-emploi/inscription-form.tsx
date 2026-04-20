"use client";

import { useActionState } from "react";
import Link from "next/link";
import { inscrireDemandeurEmploi, type InscriptionDEState } from "./actions";

const initialState: InscriptionDEState = { ok: false };

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1.5 text-xs text-danger">{errors.join(" · ")}</p>;
}

const inputCls =
  "w-full rounded-lg border border-neutral-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60";

export function InscriptionDEForm() {
  const [state, action, pending] = useActionState(inscrireDemandeurEmploi, initialState);

  return (
    <form action={action} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Prénom" name="prenom" required errors={state.errors?.prenom} disabled={pending} />
        <Field label="Nom" name="nom" required errors={state.errors?.nom} disabled={pending} />
      </div>

      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        hint="Un lien de connexion sera envoyé à cette adresse."
        errors={state.errors?.email}
        disabled={pending}
      />

      <Field
        label="Agence France Travail (optionnel)"
        name="agencePoleEmploi"
        placeholder="Ex: Orléans Madeleine"
        hint="Votre agence référente, si vous êtes accompagné."
        errors={state.errors?.agencePoleEmploi}
        disabled={pending}
      />

      <label className="flex items-start gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-4 cursor-pointer">
        <input
          type="checkbox"
          name="rgpdConsent"
          required
          disabled={pending}
          className="mt-0.5 h-4 w-4 rounded border-neutral-100 text-primary focus:ring-primary/30"
        />
        <span className="text-sm text-neutral-700">
          J'accepte que mes données soient traitées par la CCI Centre-Val de Loire pour la gestion du salon Made In Val de Loire 2026.{" "}
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
        {pending ? "Création en cours…" : "Créer mon compte"}
      </button>

      <p className="text-center text-sm text-neutral-700">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="text-primary hover:underline underline-offset-2 font-medium">
          Se connecter
        </Link>
      </p>
    </form>
  );
}

function Field({
  label, name, type = "text", required, placeholder, hint, errors, disabled, autoComplete,
}: {
  label: string; name: string; type?: string; required?: boolean;
  placeholder?: string; hint?: string; errors?: string[]; disabled?: boolean; autoComplete?: string;
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
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        className={inputCls}
      />
      {hint && <p className="mt-1.5 text-xs text-neutral-700">{hint}</p>}
      <FieldError errors={errors} />
    </div>
  );
}
