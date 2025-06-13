/*
  Warnings:

  - You are about to drop the `Asso_11_1` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Comment_post_1` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Conversation_1` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Follow_1` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Image_1` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Like_post_1` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Participants_1` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post_1` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Report_post_1` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Report_user_1` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User_1` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Video_1` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `link_img_1` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `link_vid_1` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `publish_1` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tag_1` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Asso_11_1" DROP CONSTRAINT "Asso_11_1_ID_fkey";

-- DropForeignKey
ALTER TABLE "Asso_11_1" DROP CONSTRAINT "Asso_11_1_author_fkey";

-- DropForeignKey
ALTER TABLE "Asso_11_1" DROP CONSTRAINT "Asso_11_1_id_tag_fkey";

-- DropForeignKey
ALTER TABLE "Comment_post_1" DROP CONSTRAINT "Comment_post_1_comment_id_fkey";

-- DropForeignKey
ALTER TABLE "Comment_post_1" DROP CONSTRAINT "Comment_post_1_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "Comment_post_1" DROP CONSTRAINT "Comment_post_1_post_id_fkey";

-- DropForeignKey
ALTER TABLE "Follow_1" DROP CONSTRAINT "Follow_1_followed_id_fkey";

-- DropForeignKey
ALTER TABLE "Follow_1" DROP CONSTRAINT "Follow_1_id_1_fkey";

-- DropForeignKey
ALTER TABLE "Image_1" DROP CONSTRAINT "Image_1_author_fkey";

-- DropForeignKey
ALTER TABLE "Like_post_1" DROP CONSTRAINT "Like_post_1_ID_1_fkey";

-- DropForeignKey
ALTER TABLE "Like_post_1" DROP CONSTRAINT "Like_post_1_author_fkey";

-- DropForeignKey
ALTER TABLE "Participants_1" DROP CONSTRAINT "Participants_1_conversation_id_fkey";

-- DropForeignKey
ALTER TABLE "Participants_1" DROP CONSTRAINT "Participants_1_id_1_fkey";

-- DropForeignKey
ALTER TABLE "Post_1" DROP CONSTRAINT "Post_1_author_fkey";

-- DropForeignKey
ALTER TABLE "Report_post_1" DROP CONSTRAINT "Report_post_1_ID_1_fkey";

-- DropForeignKey
ALTER TABLE "Report_post_1" DROP CONSTRAINT "Report_post_1_author_fkey";

-- DropForeignKey
ALTER TABLE "Report_user_1" DROP CONSTRAINT "Report_user_1_id_1_fkey";

-- DropForeignKey
ALTER TABLE "Report_user_1" DROP CONSTRAINT "Report_user_1_reporter_id_fkey";

-- DropForeignKey
ALTER TABLE "Video_1" DROP CONSTRAINT "Video_1_author_fkey";

-- DropForeignKey
ALTER TABLE "link_img_1" DROP CONSTRAINT "link_img_1_ID_fkey";

-- DropForeignKey
ALTER TABLE "link_img_1" DROP CONSTRAINT "link_img_1_author_fkey";

-- DropForeignKey
ALTER TABLE "link_img_1" DROP CONSTRAINT "link_img_1_id_1_fkey";

-- DropForeignKey
ALTER TABLE "link_vid_1" DROP CONSTRAINT "link_vid_1_ID_fkey";

-- DropForeignKey
ALTER TABLE "link_vid_1" DROP CONSTRAINT "link_vid_1_author_fkey";

-- DropForeignKey
ALTER TABLE "link_vid_1" DROP CONSTRAINT "link_vid_1_id_1_fkey";

-- DropForeignKey
ALTER TABLE "publish_1" DROP CONSTRAINT "publish_1_ID_1_fkey";

-- DropForeignKey
ALTER TABLE "publish_1" DROP CONSTRAINT "publish_1_author_fkey";

-- DropTable
DROP TABLE "Asso_11_1";

-- DropTable
DROP TABLE "Comment_post_1";

-- DropTable
DROP TABLE "Conversation_1";

-- DropTable
DROP TABLE "Follow_1";

-- DropTable
DROP TABLE "Image_1";

-- DropTable
DROP TABLE "Like_post_1";

-- DropTable
DROP TABLE "Participants_1";

-- DropTable
DROP TABLE "Post_1";

-- DropTable
DROP TABLE "Report_post_1";

-- DropTable
DROP TABLE "Report_user_1";

-- DropTable
DROP TABLE "User_1";

-- DropTable
DROP TABLE "Video_1";

-- DropTable
DROP TABLE "link_img_1";

-- DropTable
DROP TABLE "link_vid_1";

-- DropTable
DROP TABLE "publish_1";

-- DropTable
DROP TABLE "tag_1";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "bio" TEXT,
    "ppPath" TEXT,
    "username" TEXT NOT NULL,
    "language" TEXT,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentPost" (
    "id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LikePost" (
    "id" TEXT NOT NULL,
    "ID_1" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LikePost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportPost" (
    "id" TEXT NOT NULL,
    "idPost" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportUser" (
    "id" TEXT NOT NULL,
    "reportedId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publish" (
    "id" TEXT NOT NULL,
    "idPost" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Publish_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "idTag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asso11" (
    "id" TEXT NOT NULL,
    "idTag" TEXT NOT NULL,
    "idPost" TEXT NOT NULL,
    "author" TEXT NOT NULL,

    CONSTRAINT "Asso11_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "cdnPath" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" TEXT NOT NULL,
    "cdnPath" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkImg" (
    "id" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "postAuthor" TEXT NOT NULL,
    "linkAuthor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkImg_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkVid" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "postAuthor" TEXT NOT NULL,
    "linkAuthor" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkVid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participants" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId1" TEXT NOT NULL,
    "userId2" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "CommentPost_comment_id_key" ON "CommentPost"("comment_id");

-- CreateIndex
CREATE UNIQUE INDEX "LikePost_ID_1_author_key" ON "LikePost"("ID_1", "author");

-- CreateIndex
CREATE UNIQUE INDEX "ReportUser_reportedId_reporterId_key" ON "ReportUser"("reportedId", "reporterId");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followerId_followedId_key" ON "Follow"("followerId", "followedId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_idTag_key" ON "Tag"("idTag");

-- CreateIndex
CREATE UNIQUE INDEX "Asso11_idTag_idPost_key" ON "Asso11"("idTag", "idPost");

-- CreateIndex
CREATE UNIQUE INDEX "LinkImg_imageId_postAuthor_key" ON "LinkImg"("imageId", "postAuthor");

-- CreateIndex
CREATE UNIQUE INDEX "LinkVid_videoId_postAuthor_key" ON "LinkVid"("videoId", "postAuthor");

-- CreateIndex
CREATE UNIQUE INDEX "Participants_conversationId_userId1_key" ON "Participants"("conversationId", "userId1");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_author_fkey" FOREIGN KEY ("author") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentPost" ADD CONSTRAINT "CommentPost_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentPost" ADD CONSTRAINT "CommentPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentPost" ADD CONSTRAINT "CommentPost_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CommentPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikePost" ADD CONSTRAINT "LikePost_ID_1_fkey" FOREIGN KEY ("ID_1") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikePost" ADD CONSTRAINT "LikePost_author_fkey" FOREIGN KEY ("author") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportPost" ADD CONSTRAINT "ReportPost_idPost_fkey" FOREIGN KEY ("idPost") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportPost" ADD CONSTRAINT "ReportPost_author_fkey" FOREIGN KEY ("author") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportUser" ADD CONSTRAINT "ReportUser_reportedId_fkey" FOREIGN KEY ("reportedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportUser" ADD CONSTRAINT "ReportUser_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followedId_fkey" FOREIGN KEY ("followedId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publish" ADD CONSTRAINT "Publish_idPost_fkey" FOREIGN KEY ("idPost") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publish" ADD CONSTRAINT "Publish_author_fkey" FOREIGN KEY ("author") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asso11" ADD CONSTRAINT "Asso11_idPost_fkey" FOREIGN KEY ("idPost") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asso11" ADD CONSTRAINT "Asso11_author_fkey" FOREIGN KEY ("author") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asso11" ADD CONSTRAINT "Asso11_idTag_fkey" FOREIGN KEY ("idTag") REFERENCES "Tag"("idTag") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_author_fkey" FOREIGN KEY ("author") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_author_fkey" FOREIGN KEY ("author") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkImg" ADD CONSTRAINT "LinkImg_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkImg" ADD CONSTRAINT "LinkImg_postAuthor_fkey" FOREIGN KEY ("postAuthor") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkImg" ADD CONSTRAINT "LinkImg_linkAuthor_fkey" FOREIGN KEY ("linkAuthor") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkVid" ADD CONSTRAINT "LinkVid_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkVid" ADD CONSTRAINT "LinkVid_postAuthor_fkey" FOREIGN KEY ("postAuthor") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinkVid" ADD CONSTRAINT "LinkVid_linkAuthor_fkey" FOREIGN KEY ("linkAuthor") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participants" ADD CONSTRAINT "Participants_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participants" ADD CONSTRAINT "Participants_userId1_fkey" FOREIGN KEY ("userId1") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
