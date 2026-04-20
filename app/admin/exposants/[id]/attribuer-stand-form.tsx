"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { attribuerStand, type AdminActionState } from "./actions";

export function AttribuerStandForm({
  exposantId,
  defaultNumStand,
  defaultEmplacement,
  defaultSuperficie,
}: {
  exposantId: string;
  defaultNumStand: string | null;
  defaultEmplacement: string | null;
  defaultSuperficie: number | null;
}) {
  const [state, action] = useActionState<AdminActionState, FormData>(
    attribuerStand,
    { ok: false },
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="exposantId" value={exposantId} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="N° stand" name="numStand" defaultValue={defaultNumStand} placeholder="ex: A01" />
        <Field label="Emplacement" name="emplacement" defaultValue={defaultEmplacement} placeholder="Hall A — Zone…" wide />
        <Field
          label="Superficie (m²)"
          name="superficie"
          defaultValue={defaultSuperficie != null ? String(defaultSuperficie) : null}
          placeholder="6"
          type="number"
        />
      </div>
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

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  type = "text",
  wide,
}: {
  label: string;
  name: string;
  defaultValue: string | null;
  placeholder?: string;
  type?: string;
  wide?: boolean;
}) {
  return (
    <label className={`block ${wide ? "sm:col-span-1" : ""}`}>
      <span className="text-xs font-medium text-neutral-700 block mb-1">{label}</span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
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
      {pending ? "Enregistrement…" : "Enregistrer le stand"}
    </button>
  );
}
