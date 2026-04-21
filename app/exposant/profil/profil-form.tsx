"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { SECTEURS } from "@/lib/referentiel/secteurs";
import { ELEMENTS_STAND } from "@/lib/referentiel/elements-stand";
import { ANIMATIONS } from "@/lib/referentiel/animations";
import { FAMILLES_METIERS } from "@/lib/referentiel/metiers";
import {
  sauvegarderProfil,
  soumettreProfil,
  type ProfilState,
} from "./actions";
import type { Exposant } from "@prisma/client";

type ExposantProfil = Pick<
  Exposant,
  | "raisonSociale"
  | "siret"
  | "adresse"
  | "ville"
  | "codePostal"
  | "siteWeb"
  | "nomContact"
  | "telephoneContact"
  | "fonctionContact"
  | "description"
  | "secteurs"
  | "secteurAutre"
  | "offres"
  | "typesOpportunites"
  | "metiersProposes"
  | "elementsStand"
  | "elementsStandAutre"
  | "animations"
  | "innovationMiseEnAvant"
  | "descriptionInnovation"
  | "statutRecrutement"
  | "consentementCommunication"
  | "statut"
>;

const OFFRE_LABELS: Record<string, { label: string; hint: string }> = {
  DECOUVERTE_ENTREPRISE: {
    label: "Découverte entreprise",
    hint: "Présentation générale de votre entreprise, de ses sites et de son activité.",
  },
  DECOUVERTE_METIERS: {
    label: "Découverte métiers",
    hint: "Focus sur les métiers exercés en interne, témoignages de collaborateurs.",
  },
  OPPORTUNITES: {
    label: "Opportunités concrètes",
    hint: "Postes, stages, alternances à pourvoir sur site. Nécessite de préciser les types ci-dessous.",
  },
};

const OPPORTUNITE_LABELS: Record<string, string> = {
  STAGE_3E: "Stage de 3e",
  STAGE_SECONDE: "Stage de 2nde",
  STAGE_BTS: "Stage BTS",
  STAGE_LICENCE: "Stage Licence",
  STAGE_MASTER: "Stage Master / École d'ingé",
  APPRENTISSAGE: "Apprentissage",
  ALTERNANCE: "Alternance (pro/ingé)",
  CDD: "CDD",
  CDI: "CDI",
  JOB_ETE: "Job d'été",
  DECOUVERTE: "Stage découverte libre",
};

const STATUT_RECRUTEMENT_LABELS: Record<string, string> = {
  OUI: "Oui, nous recrutons",
  NON: "Non, pas de recrutement en cours",
  PROCHAINEMENT: "Pas pour l'instant mais bientôt",
};

export function ProfilForm({ exposant }: { exposant: ExposantProfil }) {
  const [saveState, saveAction] = useActionState<ProfilState, FormData>(
    sauvegarderProfil,
    { ok: false },
  );
  const [submitState, submitAction] = useActionState<ProfilState, FormData>(
    soumettreProfil,
    { ok: false },
  );

  const errors = submitState.errors ?? saveState.errors ?? {};
  const message = submitState.message ?? saveState.message;
  // SOUMIS : tout verrouillé (CCI en revue).
  // VALIDE : champs structurels verrouillés (identité, offres, stand…),
  //          champs "cosmétiques" modifiables (description, contact, site web,
  //          logo, innovation desc, statut recrutement).
  const fullLock = exposant.statut === "SOUMIS";
  const structuralLock = fullLock || exposant.statut === "VALIDE";
  const canSubmit =
    exposant.statut === "BROUILLON" || exposant.statut === "REFUSE";

  const [offresState, setOffresState] = useState<string[]>(exposant.offres);
  const [innovationState, setInnovationState] = useState<boolean>(
    exposant.innovationMiseEnAvant,
  );

  const showOpportunites = offresState.includes("OPPORTUNITES");

  function toggleOffre(code: string, checked: boolean) {
    setOffresState((prev) =>
      checked ? Array.from(new Set([...prev, code])) : prev.filter((c) => c !== code),
    );
  }

  return (
    <form className="space-y-10">
      {message && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            submitState.ok || saveState.ok
              ? "bg-success/10 border-success/30 text-success"
              : "bg-danger/10 border-danger/30 text-danger"
          }`}
          role="status"
        >
          {message}
        </div>
      )}

      {/* ── Section 1 : Identité entreprise ────────────────────────── */}
      <Section
        title="Identité de l'entreprise"
        description="Informations publiques affichées sur l'annuaire du salon."
      >
        <Field label="Raison sociale" name="raisonSociale" required errors={errors}>
          <input
            type="text"
            name="raisonSociale"
            defaultValue={exposant.raisonSociale ?? ""}
            disabled={structuralLock}
            className={inputClass}
          />
        </Field>

        <Field
          label="SIRET"
          name="siret"
          errors={errors}
          hint="14 chiffres sans espaces."
        >
          <input
            type="text"
            name="siret"
            defaultValue={exposant.siret ?? ""}
            disabled={structuralLock}
            inputMode="numeric"
            maxLength={14}
            className={inputClass}
          />
        </Field>

        <Field label="Adresse complète du site" name="adresse" required errors={errors}>
          <textarea
            name="adresse"
            defaultValue={exposant.adresse ?? ""}
            disabled={structuralLock}
            rows={2}
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-4">
          <Field label="Ville" name="ville" required errors={errors}>
            <input
              type="text"
              name="ville"
              defaultValue={exposant.ville ?? ""}
              disabled={structuralLock}
              className={inputClass}
            />
          </Field>
          <Field label="Code postal" name="codePostal" errors={errors}>
            <input
              type="text"
              name="codePostal"
              defaultValue={exposant.codePostal ?? ""}
              disabled={structuralLock}
              inputMode="numeric"
              maxLength={5}
              className={inputClass}
            />
          </Field>
        </div>

        <Field
          label="Site web"
          name="siteWeb"
          errors={errors}
          hint="Commence par https://"
        >
          <input
            type="url"
            name="siteWeb"
            defaultValue={exposant.siteWeb ?? ""}
            disabled={fullLock}
            placeholder="https://..."
            className={inputClass}
          />
        </Field>
      </Section>

      {/* ── Section 2 : Contact référent ───────────────────────────── */}
      <Section
        title="Référent présent sur le stand"
        description="La personne qui coordonne l'équipe le jour du salon."
      >
        <Field label="Prénom et nom" name="nomContact" required errors={errors}>
          <input
            type="text"
            name="nomContact"
            defaultValue={exposant.nomContact ?? ""}
            disabled={fullLock}
            placeholder="Marie Dupont"
            className={inputClass}
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Téléphone"
            name="telephoneContact"
            required
            errors={errors}
          >
            <input
              type="tel"
              name="telephoneContact"
              defaultValue={exposant.telephoneContact ?? ""}
              disabled={fullLock}
              className={inputClass}
            />
          </Field>
          <Field label="Fonction" name="fonctionContact" required errors={errors}>
            <input
              type="text"
              name="fonctionContact"
              defaultValue={exposant.fonctionContact ?? ""}
              disabled={fullLock}
              placeholder="DRH, dirigeant, responsable communication…"
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      {/* ── Section 3 : Secteurs & description ─────────────────────── */}
      <Section
        title="Secteurs d'activité"
        description="Sélectionnez toutes les catégories correspondant à votre activité."
      >
        <CheckboxGroup
          name="secteurs"
          options={SECTEURS.map((s) => ({ code: s.code, label: s.label }))}
          defaultValues={exposant.secteurs}
          disabled={structuralLock}
          errors={errors}
        />

        <Field
          label="Précisez (si autre ou sous-catégorie)"
          name="secteurAutre"
          errors={errors}
        >
          <input
            type="text"
            name="secteurAutre"
            defaultValue={exposant.secteurAutre ?? ""}
            disabled={structuralLock}
            placeholder="ex: fonderie, usinage CN…"
            className={inputClass}
          />
        </Field>

        <Field
          label="Présentation de votre entreprise"
          name="description"
          required
          errors={errors}
          hint="Ce texte sera affiché aux visiteurs. 50 caractères minimum, 2000 maximum."
        >
          <textarea
            name="description"
            defaultValue={exposant.description ?? ""}
            disabled={fullLock}
            rows={5}
            className={inputClass}
          />
        </Field>
      </Section>

      {/* ── Section 4 : Offres aux visiteurs ───────────────────────── */}
      <Section
        title="Ce que vous proposez aux visiteurs"
        description="Un ou plusieurs types d'offres pour matcher avec les profils (jeunes, scolaires, demandeurs d'emploi)."
      >
        <FieldErrors errors={errors} field="offres" />
        <div className="space-y-2">
          {Object.entries(OFFRE_LABELS).map(([code, { label, hint }]) => {
            const checked = offresState.includes(code);
            return (
              <label
                key={code}
                className="flex items-start gap-3 p-3 rounded-lg border border-neutral-100 hover:border-neutral-200 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <input
                  type="checkbox"
                  name="offres"
                  value={code}
                  defaultChecked={checked}
                  disabled={structuralLock}
                  onChange={(e) => toggleOffre(code, e.currentTarget.checked)}
                  className="mt-0.5"
                />
                <div>
                  <div className="font-semibold text-sm text-neutral-900">
                    {label}
                  </div>
                  <div className="text-xs text-neutral-700">{hint}</div>
                </div>
              </label>
            );
          })}
        </div>

        {showOpportunites && (
          <div className="mt-4">
            <Field
              label="Types d'opportunités proposées"
              name="typesOpportunites"
              required
              errors={errors}
            >
              <CheckboxGroup
                name="typesOpportunites"
                options={Object.entries(OPPORTUNITE_LABELS).map(
                  ([code, label]) => ({ code, label }),
                )}
                defaultValues={exposant.typesOpportunites}
                disabled={structuralLock}
                errors={errors}
                inline
              />
            </Field>
          </div>
        )}

        <div className="mt-4">
          <MetiersProposes
            defaultValues={exposant.metiersProposes}
            disabled={structuralLock}
          />
        </div>
      </Section>

      {/* ── Section 5 : Stand ───────────────────────────────────────── */}
      <Section
        title="Que présentez-vous sur le stand ?"
        description="Ce qui sera physiquement visible ou manipulable par les visiteurs."
      >
        <CheckboxGroup
          name="elementsStand"
          options={ELEMENTS_STAND.map((e) => ({ code: e.code, label: e.label }))}
          defaultValues={exposant.elementsStand}
          disabled={structuralLock}
          errors={errors}
        />

        <Field
          label="Autre élément présenté (optionnel)"
          name="elementsStandAutre"
          errors={errors}
        >
          <input
            type="text"
            name="elementsStandAutre"
            defaultValue={exposant.elementsStandAutre ?? ""}
            disabled={structuralLock}
            className={inputClass}
          />
        </Field>
      </Section>

      {/* ── Section 6 : Animations ─────────────────────────────────── */}
      <Section
        title="Animations et interventions"
        description="Laissez vide si vous n'en prévoyez pas."
      >
        <CheckboxGroup
          name="animations"
          options={ANIMATIONS.map((a) => ({ code: a.code, label: a.label }))}
          defaultValues={exposant.animations}
          disabled={structuralLock}
          errors={errors}
        />
      </Section>

      {/* ── Section 7 : Innovation ─────────────────────────────────── */}
      <Section
        title="Innovation à mettre en avant"
        description="Optionnel. Les innovations mises en avant pourront être relayées dans la communication presse CCI."
      >
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="innovationMiseEnAvant"
            defaultChecked={exposant.innovationMiseEnAvant}
            disabled={structuralLock}
            onChange={(e) => setInnovationState(e.currentTarget.checked)}
            className="mt-0.5"
          />
          <span className="text-sm text-neutral-900">
            Nous souhaitons mettre en avant une innovation, un prototype ou un
            savoir-faire particulier.
          </span>
        </label>

        {innovationState && (
          <div className="mt-4">
            <Field
              label="Décrivez cette innovation"
              name="descriptionInnovation"
              required
              errors={errors}
              hint="20 caractères min. Sera partagé avec l'équipe communication."
            >
              <textarea
                name="descriptionInnovation"
                defaultValue={exposant.descriptionInnovation ?? ""}
                disabled={fullLock}
                rows={3}
                className={inputClass}
              />
            </Field>
          </div>
        )}
      </Section>

      {/* ── Section 8 : Recrutement & consentement ─────────────────── */}
      <Section
        title="Recrutement et communication"
        description=""
      >
        <fieldset>
          <legend className="block text-sm font-medium text-neutral-900 mb-2">
            Êtes-vous en recrutement actuellement ?
          </legend>
          <FieldErrors errors={errors} field="statutRecrutement" />
          <div className="space-y-2">
            {Object.entries(STATUT_RECRUTEMENT_LABELS).map(([code, label]) => (
              <label
                key={code}
                className="flex items-center gap-3 p-3 rounded-lg border border-neutral-100 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <input
                  type="radio"
                  name="statutRecrutement"
                  value={code}
                  defaultChecked={exposant.statutRecrutement === code}
                  disabled={fullLock}
                />
                <span className="text-sm text-neutral-900">{label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="flex items-start gap-3 mt-6 p-3 rounded-lg border border-neutral-100 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
          <input
            type="checkbox"
            name="consentementCommunication"
            defaultChecked={exposant.consentementCommunication}
            disabled={structuralLock}
            className="mt-0.5"
          />
          <span className="text-sm text-neutral-900">
            J'autorise la CCI Centre-Val de Loire à utiliser le nom, logo et
            description de mon entreprise pour la communication du salon
            (annuaire public, supports presse, photos et vidéos tournées le jour
            J). <span className="text-danger">*</span>
          </span>
        </label>
        <FieldErrors errors={errors} field="consentementCommunication" />
      </Section>

      {/* ── Mention RGPD ────────────────────────────────────────────── */}
      <section className="rounded-lg border border-neutral-100 bg-neutral-50 p-4 text-xs text-neutral-700 leading-relaxed">
        <p className="mb-2">
          <strong className="text-neutral-900">Traitement de vos données.</strong>{" "}
          Les informations renseignées sont traitées par la CCI Centre-Val de
          Loire pour l'organisation du salon MIVL 2026, la validation de votre
          participation et la mise en relation avec les visiteurs. Base légale :
          exécution d'un contrat et consentement (case ci-dessus pour la
          communication). Conservation : 2 ans après la fin du salon.
        </p>
        <p>
          Vous pouvez exercer vos droits (accès, rectification, effacement,
          opposition) en contactant la CCI. Plus d'informations dans nos{" "}
          <a
            href="/mentions-legales"
            className="text-primary hover:underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            mentions légales
          </a>{" "}
          et notre{" "}
          <a
            href="/confidentialite"
            className="text-primary hover:underline underline-offset-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            politique de confidentialité
          </a>
          .
        </p>
      </section>

      {/* ── Actions ─────────────────────────────────────────────────── */}
      {!fullLock && (
        <div className="sticky bottom-0 bg-white border-t border-neutral-100 py-4 -mx-4 sm:-mx-6 px-4 sm:px-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <SubmitButton
            formAction={saveAction}
            variant={canSubmit ? "secondary" : "primary"}
            label={canSubmit ? "Enregistrer le brouillon" : "Enregistrer les modifications"}
            pendingLabel="Enregistrement…"
          />
          {canSubmit && (
            <SubmitButton
              formAction={submitAction}
              variant="primary"
              label="Soumettre à la CCI"
              pendingLabel="Envoi…"
            />
          )}
        </div>
      )}
    </form>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

const inputClass =
  "w-full rounded-lg border border-neutral-100 px-3 py-2 text-sm text-neutral-900 bg-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-neutral-50 disabled:text-neutral-700";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-heading text-lg font-bold text-neutral-900 mb-1">
        {title}
      </h2>
      {description && (
        <p className="text-sm text-neutral-700 mb-4">{description}</p>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  required,
  hint,
  errors,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  hint?: string;
  errors: Record<string, string[]>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-neutral-900 mb-1.5"
      >
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-neutral-700">{hint}</p>}
      <FieldErrors errors={errors} field={name} />
    </div>
  );
}

function FieldErrors({
  errors,
  field,
}: {
  errors: Record<string, string[]>;
  field: string;
}) {
  const msgs = errors[field];
  if (!msgs?.length) return null;
  return (
    <p className="mt-1 text-xs text-danger" role="alert">
      {msgs.join(" · ")}
    </p>
  );
}

function CheckboxGroup({
  name,
  options,
  defaultValues,
  disabled,
  errors,
  inline,
}: {
  name: string;
  options: Array<{ code: string; label: string }>;
  defaultValues: string[];
  disabled?: boolean;
  errors: Record<string, string[]>;
  inline?: boolean;
}) {
  return (
    <div>
      <FieldErrors errors={errors} field={name} />
      <div
        className={
          inline
            ? "flex flex-wrap gap-2"
            : "grid grid-cols-1 sm:grid-cols-2 gap-2"
        }
      >
        {options.map((opt) => (
          <label
            key={opt.code}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-100 cursor-pointer text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:disabled]:cursor-not-allowed ${
              inline ? "" : "hover:border-neutral-200"
            }`}
          >
            <input
              type="checkbox"
              name={name}
              value={opt.code}
              defaultChecked={defaultValues.includes(opt.code)}
              disabled={disabled}
            />
            <span className="text-neutral-900">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function MetiersProposes({
  defaultValues,
  disabled,
}: {
  defaultValues: string[];
  disabled?: boolean;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const selected = new Set(defaultValues);
  const countByFamille = FAMILLES_METIERS.map((f) => ({
    code: f.code,
    count: f.metiers.filter((m) => selected.has(m.code)).length,
  }));

  return (
    <div>
      <div className="block text-sm font-medium text-neutral-900 mb-1.5">
        Métiers représentés sur le stand{" "}
        <span className="text-xs font-normal text-neutral-700">
          (optionnel — aide au matching avec les visiteurs)
        </span>
      </div>
      <div className="border border-neutral-100 rounded-lg divide-y divide-neutral-100">
        {FAMILLES_METIERS.map((famille) => {
          const familleCount =
            countByFamille.find((c) => c.code === famille.code)?.count ?? 0;
          const isOpen = expanded === famille.code;
          return (
            <div key={famille.code}>
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-left hover:bg-neutral-50"
                onClick={() =>
                  setExpanded((prev) => (prev === famille.code ? null : famille.code))
                }
              >
                <span className="font-medium text-neutral-900">{famille.label}</span>
                <span className="flex items-center gap-2 text-xs text-neutral-700">
                  {familleCount > 0 && (
                    <span className="bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                      {familleCount}
                    </span>
                  )}
                  {isOpen ? "▾" : "▸"}
                </span>
              </button>
              {isOpen && (
                <div className="px-3 pb-3 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-neutral-50">
                  {famille.metiers.map((m) => (
                    <label
                      key={m.code}
                      className="flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer hover:bg-white"
                    >
                      <input
                        type="checkbox"
                        name="metiersProposes"
                        value={m.code}
                        defaultChecked={selected.has(m.code)}
                        disabled={disabled}
                      />
                      <span className="text-neutral-900">{m.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SubmitButton({
  formAction,
  variant,
  label,
  pendingLabel,
}: {
  formAction: (formData: FormData) => void;
  variant: "primary" | "secondary";
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  const classes =
    variant === "primary"
      ? "bg-primary hover:bg-primary-dark text-white"
      : "bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-100";
  return (
    <button
      type="submit"
      formAction={formAction}
      disabled={pending}
      className={`${classes} font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
