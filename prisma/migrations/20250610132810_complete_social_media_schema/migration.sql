-- CreateTable
CREATE TABLE "User_1" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "bio" TEXT,
    "pp_path" TEXT,
    "username" TEXT NOT NULL,
    "language" TEXT,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post_1" (
    "id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment_post_1" (
    "id" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "ID_1" TEXT NOT NULL,
    "author_1" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_post_1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like_post_1" (
    "id" TEXT NOT NULL,
    "ID_1" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_post_1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report_post_1" (
    "id" TEXT NOT NULL,
    "ID_1" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_post_1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report_user_1" (
    "id" TEXT NOT NULL,
    "id_1" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_user_1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow_1" (
    "id" TEXT NOT NULL,
    "id_1" TEXT NOT NULL,
    "followed_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publish_1" (
    "id" TEXT NOT NULL,
    "ID_1" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "publish_1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_1" (
    "id" TEXT NOT NULL,
    "id_tag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tag_1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asso_11_1" (
    "id" TEXT NOT NULL,
    "id_tag" TEXT NOT NULL,
    "ID" TEXT NOT NULL,
    "author" TEXT NOT NULL,

    CONSTRAINT "Asso_11_1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image_1" (
    "id" TEXT NOT NULL,
    "cdn_path" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video_1" (
    "id" TEXT NOT NULL,
    "cdn_path" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Video_1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_img_1" (
    "id" TEXT NOT NULL,
    "ID" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "id_1" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "link_img_1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "link_vid_1" (
    "id" TEXT NOT NULL,
    "ID" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "id_1" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "link_vid_1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation_1" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participants_1" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "id_1" TEXT NOT NULL,
    "id_2" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Participants_1_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_1_email_key" ON "User_1"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_1_username_key" ON "User_1"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Like_post_1_ID_1_author_key" ON "Like_post_1"("ID_1", "author");

-- CreateIndex
CREATE UNIQUE INDEX "Report_user_1_id_1_reporter_id_key" ON "Report_user_1"("id_1", "reporter_id");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_1_id_1_followed_id_key" ON "Follow_1"("id_1", "followed_id");

-- CreateIndex
CREATE UNIQUE INDEX "tag_1_id_tag_key" ON "tag_1"("id_tag");

-- CreateIndex
CREATE UNIQUE INDEX "Asso_11_1_id_tag_ID_key" ON "Asso_11_1"("id_tag", "ID");

-- CreateIndex
CREATE UNIQUE INDEX "link_img_1_ID_author_key" ON "link_img_1"("ID", "author");

-- CreateIndex
CREATE UNIQUE INDEX "link_vid_1_ID_author_key" ON "link_vid_1"("ID", "author");

-- CreateIndex
CREATE UNIQUE INDEX "Participants_1_conversation_id_id_1_key" ON "Participants_1"("conversation_id", "id_1");

-- AddForeignKey
ALTER TABLE "Post_1" ADD CONSTRAINT "Post_1_author_fkey" FOREIGN KEY ("author") REFERENCES "User_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment_post_1" ADD CONSTRAINT "Comment_post_1_author_fkey" FOREIGN KEY ("author") REFERENCES "User_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment_post_1" ADD CONSTRAINT "Comment_post_1_ID_1_fkey" FOREIGN KEY ("ID_1") REFERENCES "Post_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like_post_1" ADD CONSTRAINT "Like_post_1_author_fkey" FOREIGN KEY ("author") REFERENCES "User_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like_post_1" ADD CONSTRAINT "Like_post_1_ID_1_fkey" FOREIGN KEY ("ID_1") REFERENCES "Post_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report_post_1" ADD CONSTRAINT "Report_post_1_author_fkey" FOREIGN KEY ("author") REFERENCES "User_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report_post_1" ADD CONSTRAINT "Report_post_1_ID_1_fkey" FOREIGN KEY ("ID_1") REFERENCES "Post_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report_user_1" ADD CONSTRAINT "Report_user_1_id_1_fkey" FOREIGN KEY ("id_1") REFERENCES "User_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report_user_1" ADD CONSTRAINT "Report_user_1_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "User_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow_1" ADD CONSTRAINT "Follow_1_id_1_fkey" FOREIGN KEY ("id_1") REFERENCES "User_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow_1" ADD CONSTRAINT "Follow_1_followed_id_fkey" FOREIGN KEY ("followed_id") REFERENCES "User_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publish_1" ADD CONSTRAINT "publish_1_author_fkey" FOREIGN KEY ("author") REFERENCES "User_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "publish_1" ADD CONSTRAINT "publish_1_ID_1_fkey" FOREIGN KEY ("ID_1") REFERENCES "Post_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asso_11_1" ADD CONSTRAINT "Asso_11_1_id_tag_fkey" FOREIGN KEY ("id_tag") REFERENCES "tag_1"("id_tag") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asso_11_1" ADD CONSTRAINT "Asso_11_1_ID_fkey" FOREIGN KEY ("ID") REFERENCES "Post_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asso_11_1" ADD CONSTRAINT "Asso_11_1_author_fkey" FOREIGN KEY ("author") REFERENCES "User_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image_1" ADD CONSTRAINT "Image_1_author_fkey" FOREIGN KEY ("author") REFERENCES "User_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video_1" ADD CONSTRAINT "Video_1_author_fkey" FOREIGN KEY ("author") REFERENCES "User_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_img_1" ADD CONSTRAINT "link_img_1_ID_fkey" FOREIGN KEY ("ID") REFERENCES "Image_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_img_1" ADD CONSTRAINT "link_img_1_author_fkey" FOREIGN KEY ("author") REFERENCES "Post_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_img_1" ADD CONSTRAINT "link_img_1_id_1_fkey" FOREIGN KEY ("id_1") REFERENCES "User_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_vid_1" ADD CONSTRAINT "link_vid_1_ID_fkey" FOREIGN KEY ("ID") REFERENCES "Video_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_vid_1" ADD CONSTRAINT "link_vid_1_author_fkey" FOREIGN KEY ("author") REFERENCES "Post_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_vid_1" ADD CONSTRAINT "link_vid_1_id_1_fkey" FOREIGN KEY ("id_1") REFERENCES "User_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participants_1" ADD CONSTRAINT "Participants_1_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "Conversation_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participants_1" ADD CONSTRAINT "Participants_1_id_1_fkey" FOREIGN KEY ("id_1") REFERENCES "User_1"("id") ON DELETE CASCADE ON UPDATE CASCADE;
