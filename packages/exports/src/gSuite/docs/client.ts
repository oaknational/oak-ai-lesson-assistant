import { auth, docs_v1 } from "@googleapis/docs";

import { credentials } from "../credentials";

export async function getDocsClient() {
  const authClient = await auth.getClient({
    credentials,
    scopes: ["https://www.googleapis.com/auth/documents"],
  });

  return new docs_v1.Docs({
    auth: authClient,
  });
}
