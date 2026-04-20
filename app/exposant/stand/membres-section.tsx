"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  ajouterMembreStand,
  supprimerMembreStand,
  type StandActionState,
} from "./actions";

export type MembreStandUI = {
  id: string;
  prenom: string;
  nom: string;
  email: string | null;
  telephone: string | null;
  fonction: string | null;
  qrToken: string;
};

export function MembresSection({
  membres,
  raisonSociale,
  numStand,
}: {
  membres: MembreStandUI[];
  raisonSociale: string;
  numStand: string | null;
}) {
  return (
    <div className="space-y-6">
      <AddForm />
      {membres.length === 0 ? (
        <p className="text-sm text-neutral-500 italic">
          Aucun membre d'équipe enregistré pour l'instant.
        </p>
      ) : (
        <>
          <ul className="space-y-3">
            {membres.map((m) => (
              <MembreRow key={m.id} membre={m} raisonSociale={raisonSociale} numStand={numStand} />
            ))}
          </ul>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="text-sm border border-neutral-200 hover:border-primary hover:text-primary text-neutral-700 font-medium px-4 py-2 rounded-lg transition-colors"
            >
              🖨️ Imprimer tous les badges
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function AddForm() {
  const [state, action] = useActionState<StandActionState, FormData>(
    ajouterMembreStand,
    { ok: false },
  );
  const [resetKey, setResetKey] = useState(0);

  return (
    <form
      key={resetKey}
      action={async (formData) => {
        await action(formData);
        setResetKey((k) => k + 1);
      }}
      className="rounded-xl border border-neutral-100 bg-white p-4 space-y-3"
    >
      <p className="text-sm font-semibold text-neutral-900">Ajouter un membre</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input name="prenom" placeholder="Prénom*" required />
        <Input name="nom" placeholder="Nom*" required />
        <Input name="fonction" placeholder="Fonction (optionnel)" />
        <Input name="email" type="email" placeholder="Email (optionnel)" />
        <Input name="telephone" placeholder="Téléphone (optionnel)" />
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
      <AddSubmit />
    </form>
  );
}

function Input({
  name,
  placeholder,
  type = "text",
  required,
}: {
  name: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
    />
  );
}

function AddSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-primary hover:bg-primary/90 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60 text-sm"
    >
      {pending ? "Ajout…" : "+ Ajouter"}
    </button>
  );
}

function MembreRow({
  membre,
  raisonSociale,
  numStand,
}: {
  membre: MembreStandUI;
  raisonSociale: string;
  numStand: string | null;
}) {
  const [, removeAction] = useActionState<StandActionState, FormData>(
    supprimerMembreStand,
    { ok: false },
  );

  return (
    <li className="membre-card flex flex-col sm:flex-row gap-4 rounded-xl border border-neutral-100 bg-white p-4 print:break-inside-avoid">
      <div className="shrink-0 flex flex-col items-center gap-1">
        <div className="bg-white p-2 rounded-md border border-neutral-100">
          <QRCodeSVG value={membre.qrToken} size={96} level="M" />
        </div>
        {numStand && (
          <span className="text-xs font-bold text-neutral-700">
            Stand {numStand}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-heading font-semibold text-neutral-900">
          {membre.prenom} {membre.nom}
        </p>
        {membre.fonction && (
          <p className="text-sm text-neutral-700">{membre.fonction}</p>
        )}
        <p className="text-xs text-neutral-500 mt-1">{raisonSociale}</p>
        <div className="text-xs text-neutral-500 mt-1 space-y-0.5">
          {membre.email && <p>✉ {membre.email}</p>}
          {membre.telephone && <p>☎ {membre.telephone}</p>}
        </div>
      </div>
      <form
        action={removeAction}
        className="shrink-0 self-start print:hidden"
        onSubmit={(e) => {
          if (!confirm(`Supprimer ${membre.prenom} ${membre.nom} ?`)) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="membreId" value={membre.id} />
        <button
          type="submit"
          className="text-xs text-danger hover:underline underline-offset-2"
        >
          Supprimer
        </button>
      </form>
    </li>
  );
}
