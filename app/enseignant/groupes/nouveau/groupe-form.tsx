"use client";

import { useActionState } from "react";
import Link from "next/link";
import { creerGroupe, type GroupeFormState } from "../actions";

const initialState: GroupeFormState = { ok: false };

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1.5 text-xs text-danger">{errors.join(" · ")}</p>;
}

const inputCls =
  "w-full rounded-lg border border-neutral-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60";

export function GroupeForm() {
  const [state, action, pending] = useActionState(creerGroupe, initialState);

  return (
    <form action={action} className="space-y-5" noValidate>
      {state.message && !state.ok && (
        <div className="rounded-lg bg-danger/10 border border-danger/30 p-3 text-sm text-danger">
          {state.message}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_180px] gap-4">
        <div>
          <label htmlFor="nom" className="block text-sm font-medium text-neutral-900 mb-1.5">
            Nom du groupe <span className="text-danger">*</span>
          </label>
          <input
            id="nom"
            name="nom"
            placeholder="Ex: 4eB, 3eA groupe 1…"
            required
            disabled={pending}
            maxLength={20}
            className={inputCls}
          />
          <FieldError errors={state.errors?.nom} />
        </div>
        <div>
          <label htmlFor="niveau" className="block text-sm font-medium text-neutral-900 mb-1.5">
            Niveau <span className="text-danger">*</span>
          </label>
          <select id="niveau" name="niveau" required disabled={pending} className={inputCls} defaultValue="">
            <option value="">—</option>
            <option value="QUATRIEME">4e</option>
            <option value="TROISIEME">3e</option>
            <option value="SECONDE">2nde</option>
          </select>
          <FieldError errors={state.errors?.niveau} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="tailleEffective" className="block text-sm font-medium text-neutral-900 mb-1.5">
            Nombre d'élèves <span className="text-danger">*</span>
          </label>
          <input
            id="tailleEffective"
            name="tailleEffective"
            type="number"
            min={1}
            max={35}
            required
            disabled={pending}
            className={inputCls}
          />
          <p className="mt-1.5 text-xs text-neutral-700">1 à 35 élèves maximum.</p>
          <FieldError errors={state.errors?.tailleEffective} />
        </div>
        <div>
          <label htmlFor="creneauArrivee" className="block text-sm font-medium text-neutral-900 mb-1.5">
            Heure d'arrivée <span className="text-danger">*</span>
          </label>
          <select
            id="creneauArrivee"
            name="creneauArrivee"
            required
            disabled={pending}
            className={inputCls}
            defaultValue=""
          >
            <option value="">—</option>
            <option value="09:00">09:00</option>
            <option value="09:15">09:15</option>
            <option value="09:30">09:30</option>
          </select>
          <p className="mt-1.5 text-xs text-neutral-700">4 RDV consécutifs à partir de cette heure.</p>
          <FieldError errors={state.errors?.creneauArrivee} />
        </div>
      </div>

      <div>
        <label htmlFor="prenomsEleves" className="block text-sm font-medium text-neutral-900 mb-1.5">
          Prénoms des élèves <span className="text-neutral-500 font-normal">(optionnel)</span>
        </label>
        <textarea
          id="prenomsEleves"
          name="prenomsEleves"
          rows={4}
          placeholder="Un prénom par ligne, ou séparés par des virgules"
          disabled={pending}
          className={`${inputCls} resize-y`}
        />
        <p className="mt-1.5 text-xs text-neutral-700">
          RGPD : seuls les prénoms sont collectés. Utile pour les listes d'émargement le jour J.
        </p>
        <FieldError errors={state.errors?.prenomsEleves} />
      </div>

      <div className="flex gap-3 pt-4 border-t border-neutral-100">
        <Link
          href="/enseignant"
          className="flex-1 text-center bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-900 font-semibold py-3 rounded-lg transition-colors"
        >
          Annuler
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
        >
          {pending ? "Création…" : "Créer le groupe"}
        </button>
      </div>
    </form>
  );
}
