-- AlterTable
ALTER TABLE "BlockedDate" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'blocked';
