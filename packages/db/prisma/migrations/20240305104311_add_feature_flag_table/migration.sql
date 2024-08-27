-- CreateTable
CREATE TABLE "users_allowed_to_view_new_features" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "email_address" TEXT NOT NULL,

    CONSTRAINT "users_allowed_to_view_new_features_pkey" PRIMARY KEY ("id")
);
