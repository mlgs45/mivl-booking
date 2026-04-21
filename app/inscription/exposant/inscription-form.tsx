"use client";

import { useActionState } from "react";
import Link from "next/link";
import { inscrireExposant, type InscriptionState } from "./actions";

const initialState: InscriptionState = { ok: false };

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) return null;
  return (
    <p className="mt-1.5 text-xs text-danger">
      {errors.join(" · ")}
    </p>
  );
}

export function InscriptionExposantForm() {
  const [state, formAction, isPending] = useActionState(
    inscrireExposant,
    initialState
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="prenom"
            className="block text-sm font-medium text-neutral-900 mb-1.5"
          >
            Prénom <span className="text-danger">*</span>
          </label>
          <input
            id="prenom"
            name="prenom"
            type="text"
            autoComplete="given-name"
            required
            disabled={isPending}
            className="w-full rounded-lg border border-neutral-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60"
          />
          <FieldError errors={state.errors?.prenom} />
        </div>

        <div>
          <label
            htmlFor="nom"
            className="block text-sm font-medium text-neutral-900 mb-1.5"
          >
            Nom <span className="text-danger">*</span>
          </label>
          <input
            id="nom"
            name="nom"
            type="text"
            autoComplete="family-name"
            required
            disabled={isPending}
            className="w-full rounded-lg border border-neutral-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60"
          />
          <FieldError errors={state.errors?.nom} />
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-neutral-900 mb-1.5"
        >
          Email professionnel <span className="text-danger">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isPending}
          className="w-full rounded-lg border border-neutral-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60"
        />
        <p className="mt-1.5 text-xs text-neutral-700">
          Vous recevrez un code de connexion à 6 chiffres à cette adresse.
        </p>
        <FieldError errors={state.errors?.email} />
      </div>

      <div>
        <label
          htmlFor="raisonSociale"
          className="block text-sm font-medium text-neutral-900 mb-1.5"
        >
          Raison sociale de l'entreprise <span className="text-danger">*</span>
        </label>
        <input
          id="raisonSociale"
          name="raisonSociale"
          type="text"
          autoComplete="organization"
          required
          disabled={isPending}
          className="w-full rounded-lg border border-neutral-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60"
        />
        <FieldError errors={state.errors?.raisonSociale} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-4">
        <div>
          <label
            htmlFor="ville"
            className="block text-sm font-medium text-neutral-900 mb-1.5"
          >
            Ville <span className="text-danger">*</span>
          </label>
          <input
            id="ville"
            name="ville"
            type="text"
            autoComplete="address-level2"
            required
            disabled={isPending}
            className="w-full rounded-lg border border-neutral-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60"
          />
          <FieldError errors={state.errors?.ville} />
        </div>

        <div>
          <label
            htmlFor="codePostal"
            className="block text-sm font-medium text-neutral-900 mb-1.5"
          >
            Code postal
          </label>
          <input
            id="codePostal"
            name="codePostal"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            disabled={isPending}
            className="w-full rounded-lg border border-neutral-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60"
          />
          <FieldError errors={state.errors?.codePostal} />
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-4 cursor-pointer">
        <input
          type="checkbox"
          name="rgpdConsent"
          required
          disabled={isPending}
          className="mt-0.5 h-4 w-4 rounded border-neutral-100 text-primary focus:ring-primary/30"
        />
        <span className="text-sm text-neutral-700">
          J'accepte que mes données soient traitées par la CCI Centre-Val de
          Loire pour la gestion de ma participation au salon Made In Val de
          Loire 2026. Voir notre{" "}
          <Link
            href="/confidentialite"
            className="text-primary underline underline-offset-2"
          >
            politique de confidentialité
          </Link>
          .
        </span>
      </label>
      <FieldError errors={state.errors?.rgpdConsent} />

      {state.errors?._ && (
        <div className="rounded-lg bg-danger/10 border border-danger/20 p-4 text-sm text-danger">
          {state.errors._.join(" · ")}
        </div>
      )}

      {state.message && !state.ok && (
        <div className="rounded-lg bg-danger/10 border border-danger/20 p-4 text-sm text-danger">
          {state.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? "Création en cours…" : "Créer mon compte exposant"}
      </button>

      <p className="text-center text-sm text-neutral-700">
        Déjà inscrit ?{" "}
        <Link
          href="/connexion"
          className="text-primary hover:underline underline-offset-2 font-medium"
        >
          Se connecter
        </Link>
      </p>
    </form>
  );
}
