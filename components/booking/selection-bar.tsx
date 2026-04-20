import Link from "next/link";

export function SelectionBar({
  count,
  target,
  minTarget,
  confirmHref,
  resetHref,
  labelSingular,
  labelPlural,
}: {
  count: number;
  target: number;
  minTarget?: number;
  confirmHref: string;
  resetHref: string;
  labelSingular: string;
  labelPlural: string;
}) {
  const reached = minTarget != null ? count >= minTarget : count === target;
  const remaining = target - count;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-neutral-100 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-neutral-900">
            {count} / {target} {count > 1 ? labelPlural : labelSingular}
          </p>
          <p className="text-xs text-neutral-500">
            {reached
              ? "Prêt à confirmer"
              : remaining > 0
                ? `Encore ${remaining} à choisir`
                : `${-remaining} en trop — retirez-en`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {count > 0 && (
            <Link
              href={resetHref}
              scroll={false}
              className="text-xs text-neutral-700 hover:text-neutral-900 px-3 py-2"
            >
              Réinitialiser
            </Link>
          )}
          <Link
            href={reached ? confirmHref : "#"}
            aria-disabled={!reached}
            className={`font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors ${
              reached
                ? "bg-primary hover:bg-primary/90 text-white"
                : "bg-neutral-100 text-neutral-500 pointer-events-none"
            }`}
          >
            Confirmer →
          </Link>
        </div>
      </div>
    </div>
  );
}
