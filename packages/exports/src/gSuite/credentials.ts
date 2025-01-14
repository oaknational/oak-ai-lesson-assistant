import invariant from "tiny-invariant";

invariant(
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  "GOOGLE_SERVICE_ACCOUNT_EMAIL is required",
);
invariant(
  process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY is required",
);

export const credentials = {
  client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
};
