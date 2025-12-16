import { notFound, redirect } from "next/navigation";

const LEGAL_REDIRECTS: Record<string, string> = {
  privacy: "https://www.thenational.academy/legal/privacy-policy",
  cookies: "https://www.thenational.academy/legal/cookie-policy",
  terms: "https://www.thenational.academy/legal/terms-and-conditions",
};

export default async function LegalRedirectPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const redirectUrl = LEGAL_REDIRECTS[params.slug];

  if (redirectUrl) {
    redirect(redirectUrl);
  }

  // If no redirect found, return 404
  notFound();
}
