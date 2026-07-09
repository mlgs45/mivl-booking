"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  televerserLogo,
  supprimerLogo,
  type LogoState,
} from "./logo-actions";

export function LogoUpload({
  initialLogoUrl,
  disabled,
  exposantId,
  uploadAction: uploadActionProp = televerserLogo,
  deleteAction: deleteActionProp = supprimerLogo,
}: {
  initialLogoUrl: string | null;
  disabled: boolean;
  exposantId?: string;
  uploadAction?: typeof televerserLogo;
  deleteAction?: typeof supprimerLogo;
}) {
  const [uploadState, uploadAction] = useActionState<LogoState, FormData>(
    uploadActionProp,
    { ok: false },
  );
  const [deleteState, deleteAction] = useActionState<LogoState, FormData>(
    deleteActionProp,
    { ok: false },
  );
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const state = uploadState.message ? uploadState : deleteState;
  const currentLogo = initialLogoUrl;

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  }

  return (
    <section>
      <h2 className="font-heading text-lg font-bold text-neutral-900 mb-1">
        Logo de l'entreprise
      </h2>
      <p className="text-sm text-neutral-700 mb-4">
        Optionnel. Affiché sur l'annuaire public. PNG, JPG ou WEBP, 2 Mo max.
        Sélectionnez un fichier puis cliquez sur « Téléverser le logo » ci-dessous
        pour l'envoyer — cette étape est indépendante du reste du formulaire.
      </p>

      <div className="flex items-start gap-4">
        <div className="w-28 h-28 shrink-0 rounded-lg border border-neutral-100 bg-neutral-50 flex items-center justify-center overflow-hidden">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Aperçu du nouveau logo"
              className="max-w-full max-h-full object-contain"
            />
          ) : currentLogo ? (
            <Image
              src={currentLogo}
              alt="Logo actuel"
              width={112}
              height={112}
              className="max-w-full max-h-full object-contain"
              unoptimized
            />
          ) : (
            <span className="text-xs text-neutral-500 text-center px-2">
              Aucun logo
            </span>
          )}
        </div>

        <div className="flex-1 space-y-3">
          <form action={uploadAction} className="space-y-2">
            {exposantId && <input type="hidden" name="exposantId" value={exposantId} />}
            <input
              ref={fileInputRef}
              type="file"
              name="logo"
              accept="image/png,image/jpeg,image/webp"
              onChange={onFileChange}
              disabled={disabled}
              className="block text-sm text-neutral-900 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 file:cursor-pointer disabled:opacity-60"
            />
            <UploadButton disabled={disabled} />
          </form>

          {currentLogo && !disabled && (
            <form action={deleteAction}>
              {exposantId && <input type="hidden" name="exposantId" value={exposantId} />}
              <button
                type="submit"
                className="text-xs text-danger hover:underline underline-offset-2"
              >
                Supprimer le logo actuel
              </button>
            </form>
          )}

          {state.message && (
            <p
              className={`text-xs ${
                state.ok ? "text-success" : "text-danger"
              }`}
              role="status"
            >
              {state.message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function UploadButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-100 font-semibold px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? "Téléversement…" : "Téléverser le logo"}
    </button>
  );
}
