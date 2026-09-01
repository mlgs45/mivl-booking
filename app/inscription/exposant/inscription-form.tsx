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
        <FieldError errors={state.errors?.email} />
      </div>

      <hr className="border-neutral-100" />

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

      <hr className="border-neutral-100" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="motDePasse"
            className="block text-sm font-medium text-neutral-900 mb-1.5"
          >
            Mot de passe <span className="text-danger">*</span>
          </label>
          <input
            id="motDePasse"
            name="motDePasse"
            type="password"
            autoComplete="new-password"
            required
            disabled={isPending}
            className="w-full rounded-lg border border-neutral-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60"
          />
          <p className="mt-1.5 text-xs text-neutral-700">12 caractères minimum, avec une majuscule, une minuscule, un chiffre et un caractère spécial.</p>
          <FieldError errors={state.errors?.motDePasse} />
        </div>
        <div>
          <label
            htmlFor="confirmation"
            className="block text-sm font-medium text-neutral-900 mb-1.5"
          >
            Confirmation <span className="text-danger">*</span>
          </label>
          <input
            id="confirmation"
            name="confirmation"
            type="password"
            autoComplete="new-password"
            required
            disabled={isPending}
            className="w-full rounded-lg border border-neutral-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60"
          />
          <FieldError errors={state.errors?.confirmation} />
        </div>
      </div>

      <hr className="border-neutral-100" />

      {/* Mention d'information fournie par la DPO de la CCI. Le traitement
          repose sur l'exécution du contrat de participation, pas sur le
          consentement : la case ci-dessous vaut prise de connaissance et non
          autorisation, et sert de trace datée. */}
      <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 text-xs leading-relaxed text-neutral-700">
        <p className="font-semibold text-neutral-900 mb-1.5">
          Traitement de vos données personnelles
        </p>
        <p>
          Les données recueillies via ce formulaire font l'objet, par la CCI
          Centre-Val de Loire, d'un traitement informatisé destiné à la création
          de votre compte sur la plateforme MIVL Connect à des fins de gestion
          de votre inscription en tant qu'exposant au salon Made In Val de
          Loire. Vos données seront conservées 10 ans selon l'instruction
          d'archivage des CCI DPACI/RES/2005. La CCI Centre-Val de Loire est
          susceptible de réutiliser vos données pour vous adresser une enquête
          de satisfaction et/ou un bilan de l'évènement (optionnel).
        </p>
        <p className="mt-2">
          Conformément au Règlement Général sur la Protection des Données
          (RGPD) 2016/679 et à la loi informatique et libertés du 6 janvier
          1978 modifiée, vous bénéficiez d'un droit d'accès, de rectification,
          d'effacement, de portabilité et de limitation du traitement de vos
          données, que vous pouvez exercer auprès du délégué à la protection
          des données personnelles de la CCI Centre-Val de Loire par mail à{" "}
          <a
            href="mailto:dpo@centre.cci.fr"
            className="text-primary underline underline-offset-2"
          >
            dpo@centre.cci.fr
          </a>
          . Vous avez le droit d'introduire une réclamation auprès de la
          Commission Nationale de l'Informatique et des Libertés (
          <a
            href="https://www.cnil.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2"
          >
            www.cnil.fr
          </a>
          ). Voir aussi notre{" "}
          <Link
            href="/confidentialite"
            className="text-primary underline underline-offset-2"
          >
            politique de confidentialité
          </Link>
          .
        </p>
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-neutral-100 p-4 cursor-pointer">
        <input
          type="checkbox"
          name="rgpdConsent"
          required
          disabled={isPending}
          className="mt-0.5 h-4 w-4 rounded border-neutral-100 text-primary focus:ring-primary/30"
        />
        <span className="text-sm text-neutral-700">
          J'ai pris connaissance des informations ci-dessus.
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
