/*
  Warnings:

  - The `type` column on the `VerificationCode` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[code]` on the table `VerificationCode` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "verificationCodeType" AS ENUM ('EMAILVERIFICATION', 'PASSWORD_RESET');

-- AlterTable
ALTER TABLE "VerificationCode" DROP COLUMN "type",
ADD COLUMN     "type" "verificationCodeType" NOT NULL DEFAULT 'EMAILVERIFICATION';

-- CreateIndex
CREATE UNIQUE INDEX "VerificationCode_code_key" ON "VerificationCode"("code");
