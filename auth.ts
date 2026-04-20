import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { verify } from "@node-rs/argon2";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/emails";
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

    // ─── Magic link : EXPOSANT / ENSEIGNANT / JEUNE / DE ─────────────────
    Nodemailer({
      // La config SMTP Nodemailer est ignorée car on override sendVerificationRequest
      server: { host: "localhost", port: 25, auth: { user: "", pass: "" } },
      from: process.env.BREVO_FROM_EMAIL ?? "noreply@mivl-orleans.fr",
      maxAge: 15 * 60, // 15 minutes
      sendVerificationRequest: async ({ identifier, url }) => {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
        await sendEmail({
          to: identifier,
          template: "magic-link",
          data: { url, appUrl },
        });
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
