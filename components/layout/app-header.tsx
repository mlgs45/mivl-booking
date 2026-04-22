import Image from "next/image";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/signout-button";
import type { Session } from "next-auth";

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super administrateur",
  GESTIONNAIRE: "Gestionnaire CCI",
  EXPOSANT: "Exposant",
  ENSEIGNANT: "Enseignant",
  JEUNE: "Jeune / Diplômé",
  DEMANDEUR_EMPLOI: "Demandeur d'emploi",
};

export function AppHeader({ session }: { session: Session }) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-100 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo-mivl.png"
            alt="Made In Val de Loire"
            width={40}
            height={40}
            className="object-contain"
          />
          <span className="font-heading font-bold text-primary text-lg leading-tight hidden sm:block">
            MIVL Connect
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-neutral-900">
              {session.user.name ?? session.user.email}
            </div>
            <div className="text-xs text-neutral-700">
              {ROLE_LABELS[session.user.role] ?? session.user.role}
            </div>
          </div>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
