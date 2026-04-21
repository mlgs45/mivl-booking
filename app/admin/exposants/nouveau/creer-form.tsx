"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { creerExposant, type CreerExposantState } from "./actions";

export function CreerExposantForm() {
  const [state, action] = useActionState<CreerExposantState, FormData>(
    creerExposant,
    { ok: false },
  );

  return (
    <form action={action} className="space-y-5">
      <Field
        label="Email du contact"
        name="email"
        type="email"
        required
        help="Le compte sera créé avec cet email ; le contact pourra ensuite se connecter via un code à 6 chiffres envoyé par email."
        error={state.errors?.email?.[0]}
      />
      <Field
        label="Raison sociale"
        name="raisonSociale"
        required
        error={state.errors?.raisonSociale?.[0]}
      />
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-4">
        <Field
          label="Ville"
          name="ville"
          required
          error={state.errors?.ville?.[0]}
        />
        <Field
          label="Code postal"
          name="codePostal"
          inputMode="numeric"
          pattern="\d{5}"
          maxLength={5}
          error={state.errors?.codePostal?.[0]}
        />
      </div>
      <Field
        label="SIRET"
        name="siret"
        inputMode="numeric"
        pattern="\d{14}"
        maxLength={14}
        help="Optionnel, 14 chiffres."
        error={state.errors?.siret?.[0]}
      />
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-semibold text-neutral-900 mb-1.5"
        >
          Description <span className="text-danger">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          placeholder="Présentation courte de l'entreprise, visible sur la liste publique des exposants."
        />
        {state.errors?.description?.[0] && (
          <p className="mt-1 text-xs text-danger">
            {state.errors.description[0]}
          </p>
        )}
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-4 cursor-pointer has-[:checked]:border-accent has-[:checked]:bg-accent/10 transition-colors">
        <input
          type="checkbox"
          name="estPartenaire"
          className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-accent focus:ring-accent/30"
        />
        <span>
          <span className="block text-sm font-semibold text-neutral-900">
            Marquer comme partenaire
          </span>
          <span className="block text-xs text-neutral-700 mt-0.5">
            Affiche un badge « Partenaire » dans la liste publique et sur la fiche.
          </span>
        </span>
      </label>

      {state.message && (
        <p className="text-sm text-danger">{state.message}</p>
      )}

      <Submit />
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  help,
  error,
  inputMode,
  pattern,
  maxLength,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  help?: string;
  error?: string;
  inputMode?: "text" | "numeric";
  pattern?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-neutral-900 mb-1.5"
      >
        {label} {required && <span className="text-danger">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        inputMode={inputMode}
        pattern={pattern}
        maxLength={maxLength}
        className="w-full px-3 py-2 border border-neutral-200 rounded-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
      />
      {help && !error && (
        <p className="mt-1 text-xs text-neutral-500">{help}</p>
      )}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-3 rounded-lg transition-colors disabled:opacity-60"
    >
      {pending ? "Création…" : "Créer l'exposant"}
    </button>
  );
}
