export type HeliconeChatMeta = {
  chatId: string;
  userId: string | undefined;
};

export function heliconeHeaders({
  chatMeta,
  app,
}: {
  chatMeta?: HeliconeChatMeta;
  app: string;
}) {
  if (
    !process.env.HELICONE_EU_API_KEY ||
    !process.env.HELICONE_EU_HOST?.includes("hconeai")
  ) {
    throw new Error("Missing required environment variables for Helicone");
  }

  const heliconeSecurityEnabled =
    process.env.HELICONE_LLM_SECURITY_ENABLED === "true";

  const userId = chatMeta?.userId;
  const chatId = chatMeta?.chatId;

  const headers = {
    "Helicone-Auth": `Bearer ${process.env.HELICONE_EU_API_KEY}`,
    "Helicone-Posthog-Key": `${process.env.HELICONE_POSTHOG_KEY}`,
    "Helicone-Posthog-Host": `${process.env.HELICONE_POSTHOG_HOST}`,
    "Helicone-Property-App": app,
    "Helicone-Property-Environment": `${process.env.NEXT_PUBLIC_SENTRY_ENV}`,
    ...(heliconeSecurityEnabled && {
      "Helicone-LLM-Security-Enabled": "true",
    }),
    ...(userId && {
      "Helicone-Property-User": userId,
      "Helicone-User-Id": userId,
    }),
    ...(chatId && {
      "Helicone-Property-Chat": chatId,
      "Helicone-Session-Id": chatId,
    }),
  };
  return headers;
}
