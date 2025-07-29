import invariant from "tiny-invariant";

invariant(
  process.env.GCS_LATEX_SERVICE_ACCOUNT_EMAIL,
  "GCS_LATEX_SERVICE_ACCOUNT_EMAIL is required",
);
invariant(
  process.env.GCS_LATEX_SERVICE_ACCOUNT_PRIVATE_KEY,
  "GCS_LATEX_SERVICE_ACCOUNT_PRIVATE_KEY is required",
);
invariant(
  process.env.GCS_LATEX_BUCKET_NAME,
  "GCS_LATEX_BUCKET_NAME is required",
);

export const gcsLatexCredentials = {
  client_email: process.env.GCS_LATEX_SERVICE_ACCOUNT_EMAIL,
  private_key: process.env.GCS_LATEX_SERVICE_ACCOUNT_PRIVATE_KEY,
};

export const GCS_LATEX_BUCKET_NAME = process.env.GCS_LATEX_BUCKET_NAME;
