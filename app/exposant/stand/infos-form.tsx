"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { mettreAJourInfosStand, type StandActionState } from "./actions";

export function InfosStandForm({
  defaultNom,
  defaultAccroche,
}: {
  defaultNom: string | null;
  defaultAccroche: string | null;
}) {
  const [state, action] = useActionState<StandActionState, FormData>(
    mettreAJourInfosStand,
    { ok: false },
  );

  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="text-xs font-medium text-neutral-700 block mb-1">
          Nom affiché sur le stand
        </span>
        <input
          name="nomStand"
          defaultValue={defaultNom ?? ""}
          maxLength={100}
          placeholder="ex: Thalès Mécanique — Usinage 5 axes"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-neutral-700 block mb-1">
          Accroche courte
        </span>
        <textarea
          name="accrocheStand"
          defaultValue={defaultAccroche ?? ""}
          maxLength={280}
          rows={2}
          placeholder="Une phrase qui donne envie de s'arrêter sur votre stand"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </label>
      {state.message && (
        <p
          className={`text-xs ${state.ok ? "text-success" : "text-danger"}`}
          role={state.ok ? "status" : "alert"}
        >
          {state.ok ? "✓ " : ""}
          {state.message}
        </p>
      )}
      <Submit />
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary hover:bg-primary/90 text-white font-semibold px-5 py-2 rounded-lg transition-colors disabled:opacity-60 text-sm"
    >
      {pending ? "Enregistrement…" : "Enregistrer"}
    </button>
  );
}
