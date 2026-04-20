import type { Role } from "@prisma/client";

/** Retourne la home path pour un rôle donné. */
export function homePathForRole(role: Role): string {
  switch (role) {
    case "SUPER_ADMIN":
    case "GESTIONNAIRE":
      return "/admin";
    case "EXPOSANT":
      return "/exposant";
    case "ENSEIGNANT":
      return "/enseignant";
    case "JEUNE":
    case "DEMANDEUR_EMPLOI":
      return "/visiteur";
    default: {
      const _exhaustive: never = role;
      void _exhaustive;
      return "/";
    }
  }
}
