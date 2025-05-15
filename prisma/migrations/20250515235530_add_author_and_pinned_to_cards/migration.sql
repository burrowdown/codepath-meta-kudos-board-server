-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "author" TEXT,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false;
