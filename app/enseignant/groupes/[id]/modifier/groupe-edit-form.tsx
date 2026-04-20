"use client";

import { useActionState, useTransition } from "react";
import Link from "next/link";
import { modifierGroupe, supprimerGroupe, type GroupeFormState } from "../../actions";
import type { NiveauGroupe } from "@prisma/client";

const initialState: GroupeFormState = { ok: false };

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1.5 text-xs text-danger">{errors.join(" · ")}</p>;
}

const inputCls =
  "w-full rounded-lg border border-neutral-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-60";

export function GroupeEditForm({
  groupeId,
  parcoursActif,
  defaultValues,
}: {
  groupeId: string;
  parcoursActif: boolean;
  defaultValues: {
    nom: string;
    niveau: NiveauGroupe;
    tailleEffective: number;
    prenomsEleves: string[];
    creneauArrivee: string | null;
  };
}) {
  const [state, action, pending] = useActionState(
    modifierGroupe.bind(null, groupeId),
    initialState,
  );
  const [deletePending, startDeleteTransition] = useTransition();

  return (
    <form action={action} className="space-y-5" noValidate>
      {state.ok && state.message && (
        <div className="rounded-lg bg-success/10 border border-success/30 p-3 text-sm text-success">
          {state.message}
        </div>
      )}
      {!state.ok && state.message && (
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
            defaultValue={defaultValues.nom}
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
          <select
            id="niveau"
            name="niveau"
            required
            disabled={pending}
            className={inputCls}
            defaultValue={defaultValues.niveau}
          >
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
            defaultValue={defaultValues.tailleEffective}
            required
            disabled={pending}
            className={inputCls}
          />
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
            disabled={pending || parcoursActif}
            className={inputCls}
            defaultValue={defaultValues.creneauArrivee ?? ""}
          >
            <option value="">—</option>
            <option value="09:00">09:00</option>
            <option value="09:15">09:15</option>
            <option value="09:30">09:30</option>
          </select>
          {parcoursActif ? (
            <p className="mt-1.5 text-xs text-neutral-500">
              Verrouillé — annulez le parcours pour changer l'heure d'arrivée.
            </p>
          ) : null}
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
          rows={5}
          defaultValue={defaultValues.prenomsEleves.join("\n")}
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
          href={`/enseignant/groupes/${groupeId}`}
          className="flex-1 text-center bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-900 font-semibold py-3 rounded-lg transition-colors"
        >
          Annuler
        </Link>
        <button
          type="submit"
          disabled={pending || deletePending}
          className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-60"
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>

      {!parcoursActif && (
        <div className="pt-6 mt-6 border-t border-neutral-100">
          <h3 className="text-sm font-semibold text-neutral-900 mb-1">
            Supprimer ce groupe
          </h3>
          <p className="text-xs text-neutral-700 mb-3">
            Action définitive. Seuls les groupes sans parcours actif peuvent être supprimés.
          </p>
          <button
            type="button"
            disabled={deletePending || pending}
            onClick={() => {
              if (!confirm("Supprimer définitivement ce groupe ?")) return;
              startDeleteTransition(async () => {
                await supprimerGroupe(groupeId);
              });
            }}
            className="text-sm font-semibold text-danger hover:underline underline-offset-2 disabled:opacity-60"
          >
            {deletePending ? "Suppression…" : "Supprimer le groupe"}
          </button>
        </div>
      )}
    </form>
  );
}
