-- AlterTable
ALTER TABLE "User" ADD COLUMN     "otpAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "otpBlockedUntil" TIMESTAMP(3);
