"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { creerAdmin, type CreerAdminState } from "../actions";

const initialState: CreerAdminState = { ok: false };

export function CreerAdminForm() {
  const [state, action] = useActionState(creerAdmin, initialState);

  return (
    <form action={action} className="space-y-6 bg-white rounded-xl border border-neutral-100 p-6">
      {state.error && (
        <div className="rounded-lg border-l-4 border-danger bg-danger/10 p-3 text-sm text-neutral-900">
          {state.error}
        </div>
      )}

      <div>
        <label
          htmlFor="nom"
          className="block text-sm font-medium text-neutral-900 mb-2"
        >
          Nom complet
        </label>
        <input
          id="nom"
          name="nom"
          type="text"
          required
          minLength={2}
          maxLength={120}
          placeholder="Prénom Nom"
          className="w-full px-4 py-3 rounded-lg border border-neutral-100 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-neutral-900 mb-2"
        >
          Adresse email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="off"
          className="w-full px-4 py-3 rounded-lg border border-neutral-100 bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <p className="mt-1 text-xs text-neutral-700">
          Adresse utilisée pour la connexion et pour recevoir le lien
          d'activation.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-900 mb-2">
          Rôle
        </label>
        <div className="space-y-2">
          <label className="flex items-start gap-3 p-3 rounded-lg border border-neutral-100 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <input
              type="radio"
              name="role"
              value="GESTIONNAIRE"
              defaultChecked
              className="mt-0.5"
            />
            <div>
              <div className="font-medium text-sm text-neutral-900">
                Administrateur
              </div>
              <div className="text-xs text-neutral-700">
                Accès complet au back-office : validation des exposants et
                enseignants, consultation des inscrits, scan jour J.
              </div>
            </div>
          </label>
          <label className="flex items-start gap-3 p-3 rounded-lg border border-neutral-100 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <input type="radio" name="role" value="SUPER_ADMIN" className="mt-0.5" />
            <div>
              <div className="font-medium text-sm text-neutral-900">
                Super administrateur
              </div>
              <div className="text-xs text-neutral-700">
                Tout ce que fait un administrateur + gestion des autres
                administrateurs (inviter, changer rôle, supprimer).
              </div>
            </div>
          </label>
        </div>
      </div>

      <SubmitBtn />
    </form>
  );
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-6"
      size="lg"
    >
      {pending ? "Envoi de l'invitation…" : "Envoyer l'invitation"}
    </Button>
  );
}
