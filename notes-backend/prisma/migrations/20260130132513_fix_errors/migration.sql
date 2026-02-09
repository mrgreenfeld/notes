/*
  Warnings:

  - You are about to drop the `note_tags` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,userId]` on the table `tags` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "note_tags" DROP CONSTRAINT "note_tags_noteId_fkey";

-- DropForeignKey
ALTER TABLE "note_tags" DROP CONSTRAINT "note_tags_tagId_fkey";

-- DropIndex
DROP INDEX "tags_name_key";

-- DropTable
DROP TABLE "note_tags";

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_userId_key" ON "tags"("name", "userId");
