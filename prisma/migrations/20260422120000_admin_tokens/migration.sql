-- CreateEnum
CREATE TYPE "TypeAdminToken" AS ENUM ('INVITATION', 'RESET');

-- CreateTable
CREATE TABLE "AdminToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TypeAdminToken" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "creeParId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminToken_tokenHash_key" ON "AdminToken"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminToken_userId_idx" ON "AdminToken"("userId");

-- CreateIndex
CREATE INDEX "AdminToken_expiresAt_idx" ON "AdminToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "AdminToken" ADD CONSTRAINT "AdminToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
