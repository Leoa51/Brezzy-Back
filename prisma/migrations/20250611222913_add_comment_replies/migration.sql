/*
  Warnings:

  - You are about to drop the column `ID_1` on the `Comment_post_1` table. All the data in the column will be lost.
  - You are about to drop the column `author` on the `Comment_post_1` table. All the data in the column will be lost.
  - You are about to drop the column `author_1` on the `Comment_post_1` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `Comment_post_1` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[comment_id]` on the table `Comment_post_1` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `comment_id` to the `Comment_post_1` table without a default value. This is not possible if the table is not empty.
  - Added the required column `post_id` to the `Comment_post_1` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comment_post_1" DROP CONSTRAINT "Comment_post_1_ID_1_fkey";

-- DropForeignKey
ALTER TABLE "Comment_post_1" DROP CONSTRAINT "Comment_post_1_author_fkey";

-- AlterTable
ALTER TABLE "Comment_post_1" DROP COLUMN "ID_1",
DROP COLUMN "author",
DROP COLUMN "author_1",
DROP COLUMN "content",
ADD COLUMN     "comment_id" TEXT NOT NULL,
ADD COLUMN     "parent_id" TEXT,
ADD COLUMN     "post_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Comment_post_1_comment_id_key" ON "Comment_post_1"("comment_id");

-- AddForeignKey
ALTER TABLE "Comment_post_1" ADD CONSTRAINT "Comment_post_1_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "Post_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment_post_1" ADD CONSTRAINT "Comment_post_1_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment_post_1" ADD CONSTRAINT "Comment_post_1_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Comment_post_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;
