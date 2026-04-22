import type { NextAuthConfig } from "next-auth";

/**
 * Config Auth.js partagée — edge-safe (pas d'import Prisma/Node natif).
 * Utilisée par le middleware pour gérer l'autorisation sans initialiser la DB.
 * La config complète (providers + adapter) vit dans ./auth.ts.
 */
export const authConfig = {
  pages: {
    signIn: "/connexion",
    verifyRequest: "/connexion/verifier",
    error: "/connexion/erreur",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  callbacks: {
    authorized: ({ auth, request: { nextUrl } }) => {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const path = nextUrl.pathname;

      // Routes publiques
      const publicPaths = [
        "/",
        "/exposants",
        "/inscription",
        "/connexion",
        "/mot-de-passe-oublie",
        "/definir-mot-de-passe",
        "/mentions-legales",
        "/confidentialite",
      ];
      const isPublic = publicPaths.some(
        (p) => path === p || path.startsWith(`${p}/`)
      );
      if (isPublic) return true;

      if (!isLoggedIn) return false;

      // Protections par rôle
      if (path.startsWith("/admin")) {
        return role === "SUPER_ADMIN" || role === "GESTIONNAIRE";
      }
      if (path.startsWith("/exposant")) return role === "EXPOSANT";
      if (path.startsWith("/enseignant")) return role === "ENSEIGNANT";
      if (path.startsWith("/visiteur")) {
        return role === "JEUNE" || role === "DEMANDEUR_EMPLOI";
      }

      return true;
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.sub = user.id;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token.sub) session.user.id = token.sub;
      if (token.role) session.user.role = token.role as typeof session.user.role;
      return session;
    },
  },
  providers: [], // Remplis dans auth.ts (Node runtime)
} satisfies NextAuthConfig;
