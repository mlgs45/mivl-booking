import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { verify } from "@node-rs/argon2";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyOtp } from "@/lib/otp";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    // ─── Credentials : SUPER_ADMIN / GESTIONNAIRE ────────────────────────
    Credentials({
      name: "Administrateur",
      credentials: {
        email: { label: "Adresse email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = z
          .object({
            email: z.string().email(),
            password: z.string().min(1),
          })
          .safeParse(credentials);

        if (!parsed.success) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });

        if (!user?.hashedPassword) return null;
        if (user.role !== "SUPER_ADMIN" && user.role !== "GESTIONNAIRE") {
          return null;
        }

        const valid = await verify(user.hashedPassword, parsed.data.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),

    // ─── OTP email : EXPOSANT / ENSEIGNANT / JEUNE / DE ──────────────────
    Credentials({
      id: "otp",
      name: "Code par email",
      credentials: {
        email: { label: "Adresse email", type: "email" },
        code: { label: "Code à 6 chiffres", type: "text" },
      },
      authorize: async (credentials) => {
        const parsed = z
          .object({
            email: z.string().email(),
            code: z.string().regex(/^\d{6}$/),
          })
          .safeParse(credentials);

        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const result = await verifyOtp(email, parsed.data.code);
        if (!result.ok) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user) return null;
        if (user.role === "SUPER_ADMIN" || user.role === "GESTIONNAIRE") {
          return null;
        }

        if (!user.emailVerified) {
          await db.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() },
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  events: {
    signIn: async ({ user }) => {
      if (user.id) {
        await db.auditLog.create({
          data: {
            userId: user.id,
            action: "auth.signin",
            entite: "User",
            entiteId: user.id,
          },
        });
      }
    },
  },
});
