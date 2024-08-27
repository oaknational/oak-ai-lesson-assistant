-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_oak_user" BOOLEAN NOT NULL,
    "email_address" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Ensure only oak users have their email addresses stored
ALTER TABLE users
ADD CONSTRAINT internal_emails_only
CHECK (
    (is_oak_user = FALSE AND email_address IS NULL)
    OR
    (is_oak_user = TRUE AND email_address IS NOT NULL)
);
