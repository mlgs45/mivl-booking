"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  ouvrirRdvMaintenant,
  planifierOuvertureRdv,
  fermerRdv,
  type ConfigActionState,
} from "./actions";

export function OuvertureRdvForm({
  ouvertureRdvAt,
}: {
  ouvertureRdvAt: Date | null;
}) {
  const isOuvert = ouvertureRdvAt !== null && ouvertureRdvAt <= new Date();
  const isPlanifie = ouvertureRdvAt !== null && ouvertureRdvAt > new Date();

  const [ouvrirState, ouvrirAction] = useActionState<ConfigActionState, FormData>(
    ouvrirRdvMaintenant,
    { ok: false },
  );
  const [planifierState, planifierAction] = useActionState<ConfigActionState, FormData>(
    planifierOuvertureRdv,
    { ok: false },
  );
  const [fermerState, fermerAction] = useActionState<ConfigActionState, FormData>(
    fermerRdv,
    { ok: false },
  );

  const message =
    ouvrirState.message ?? planifierState.message ?? fermerState.message;
  const isOk = ouvrirState.ok || planifierState.ok || fermerState.ok;

  const defaultDatetimeValue = isPlanifie && ouvertureRdvAt
    ? toDatetimeLocal(ouvertureRdvAt)
    : "";

  return (
    <div className="space-y-6">
      {/* Statut actuel */}
      <div className={`flex items-center gap-3 rounded-xl border p-4 ${
        isOuvert
          ? "border-success/20 bg-success/5"
          : isPlanifie
            ? "border-warning/20 bg-warning/5"
            : "border-neutral-200 bg-neutral-50"
      }`}>
        <span className={`w-3 h-3 rounded-full shrink-0 ${
          isOuvert ? "bg-success animate-pulse" : isPlanifie ? "bg-warning animate-pulse" : "bg-neutral-400"
        }`} />
        <div>
          <p className="text-sm font-semibold text-neutral-900">
            {isOuvert
              ? "Réservations ouvertes"
              : isPlanifie
                ? `Ouverture planifiée le ${ouvertureRdvAt!.toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}`
                : "Réservations fermées"}
          </p>
          <p className="text-xs text-neutral-600 mt-0.5">
            {isOuvert
              ? `Depuis le ${ouvertureRdvAt!.toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })}`
              : isPlanifie
                ? "Les réservations s'ouvriront automatiquement à cette date."
                : "Personne ne peut réserver de RDV pour l'instant."}
          </p>
        </div>
      </div>

      {message && (
        <p className={`text-sm font-medium ${isOk ? "text-success" : "text-danger"}`}>
          {message}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Ouvrir maintenant */}
        {!isOuvert && (
          <form action={ouvrirAction}>
            <SubmitButton
              label="Ouvrir maintenant"
              pendingLabel="Ouverture…"
              className="w-full bg-success hover:bg-success/90 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
            />
          </form>
        )}

        {/* Fermer */}
        {(isOuvert || isPlanifie) && (
          <form action={fermerAction}>
            <SubmitButton
              label="Fermer les réservations"
              pendingLabel="Fermeture…"
              className="w-full border border-danger/30 text-danger hover:bg-danger/5 font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60"
            />
          </form>
        )}
      </div>

      {/* Planifier une date */}
      <form action={planifierAction} className="space-y-3">
        <label className="block text-sm font-medium text-neutral-700">
          {isPlanifie ? "Modifier la date d'ouverture planifiée" : "Planifier l'ouverture à une date précise"}
        </label>
        <div className="flex gap-3 flex-wrap">
          <input
            type="datetime-local"
            name="ouvertureRdvAt"
            defaultValue={defaultDatetimeValue}
            className="flex-1 min-w-0 rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <PlanifierButton />
        </div>
        {planifierState.message && !planifierState.ok && (
          <p className="text-xs text-danger">{planifierState.message}</p>
        )}
      </form>
    </div>
  );
}

function SubmitButton({
  label,
  pendingLabel,
  className,
}: {
  label: string;
  pendingLabel: string;
  className: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? pendingLabel : label}
    </button>
  );
}

function PlanifierButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 bg-primary hover:bg-primary/90 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
    >
      {pending ? "Enregistrement…" : "Planifier"}
    </button>
  );
}

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}
