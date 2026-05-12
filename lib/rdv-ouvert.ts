import { db } from "@/lib/db";

export type RdvOuvertureConfig = {
  ouvertureRdvAt: Date | null;
};

export async function getRdvOuvertureConfig(): Promise<RdvOuvertureConfig> {
  const config = await db.configurationSalon.findUnique({
    where: { id: 1 },
    select: { ouvertureRdvAt: true },
  });
  return { ouvertureRdvAt: config?.ouvertureRdvAt ?? null };
}

export function isRdvOuvert(config: RdvOuvertureConfig): boolean {
  if (!config.ouvertureRdvAt) return false;
  return config.ouvertureRdvAt <= new Date();
}
