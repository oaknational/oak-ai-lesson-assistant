import { notFound, redirect } from "next/navigation";

const LEGAL_REDIRECTS: Record<string, string> = {
  privacy: "https://www.thenational.academy/legal/privacy-policy",
  cookies: "https://www.thenational.academy/legal/cookie-policy",
  terms: "https://www.thenational.academy/legal/terms-and-conditions",
  "accessibility-statement":
    "https://www.thenational.academy/legal/accessibility-statement",
};

export default function LegalRedirectPage({
  params,
}: {
  params: { slug: string };
}) {
  const redirectUrl = LEGAL_REDIRECTS[params.slug];

  if (redirectUrl) {
    redirect(redirectUrl);
  }

  // If no redirect found, return 404
  notFound();
}
