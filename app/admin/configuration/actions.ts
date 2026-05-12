"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export type ConfigActionState = {
  ok: boolean;
  message?: string;
};

async function getAdminSession() {
  const session = await auth();
  const role = session?.user?.role;
  if (role !== "SUPER_ADMIN" && role !== "GESTIONNAIRE") return null;
  return session;
}

export async function ouvrirRdvMaintenant(
  _prev: ConfigActionState,
  _formData: FormData,
): Promise<ConfigActionState> {
  const session = await getAdminSession();
  if (!session?.user) return { ok: false, message: "Non autorisé." };

  await db.configurationSalon.update({
    where: { id: 1 },
    data: { ouvertureRdvAt: new Date() },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "rdv.ouverture.immediate",
      entite: "ConfigurationSalon",
      entiteId: "1",
    },
  });

  revalidatePath("/admin/configuration");
  return { ok: true, message: "Les réservations sont maintenant ouvertes." };
}

export async function planifierOuvertureRdv(
  _prev: ConfigActionState,
  formData: FormData,
): Promise<ConfigActionState> {
  const session = await getAdminSession();
  if (!session?.user) return { ok: false, message: "Non autorisé." };

  const raw = formData.get("ouvertureRdvAt");
  if (typeof raw !== "string" || !raw) {
    return { ok: false, message: "Date invalide." };
  }

  const date = new Date(raw);
  if (isNaN(date.getTime())) {
    return { ok: false, message: "Date invalide." };
  }

  await db.configurationSalon.update({
    where: { id: 1 },
    data: { ouvertureRdvAt: date },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "rdv.ouverture.planifiee",
      entite: "ConfigurationSalon",
      entiteId: "1",
      payload: { ouvertureRdvAt: date.toISOString() },
    },
  });

  revalidatePath("/admin/configuration");
  return { ok: true, message: "Ouverture planifiée." };
}

export async function fermerRdv(
  _prev: ConfigActionState,
  _formData: FormData,
): Promise<ConfigActionState> {
  const session = await getAdminSession();
  if (!session?.user) return { ok: false, message: "Non autorisé." };

  await db.configurationSalon.update({
    where: { id: 1 },
    data: { ouvertureRdvAt: null },
  });

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "rdv.fermeture",
      entite: "ConfigurationSalon",
      entiteId: "1",
    },
  });

  revalidatePath("/admin/configuration");
  return { ok: true, message: "Les réservations sont fermées." };
}
