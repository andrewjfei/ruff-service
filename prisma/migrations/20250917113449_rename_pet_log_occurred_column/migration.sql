/*
  Warnings:

  - You are about to drop the column `occuredAt` on the `pet_log` table. All the data in the column will be lost.
  - Added the required column `occurredAt` to the `pet_log` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "pet_log" DROP COLUMN "occuredAt",
ADD COLUMN     "occurredAt" TIMESTAMP(3) NOT NULL;
