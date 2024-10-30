import React from "react";
import { Toaster } from "react-hot-toast";

import { ClerkProvider } from "@clerk/nextjs";
import "@fontsource/lexend";
import "@fontsource/lexend/500.css";
import "@fontsource/lexend/600.css";
import "@fontsource/lexend/700.css";
import "@fontsource/lexend/800.css";
import "@fontsource/lexend/900.css";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import { GeistMono } from "geist/font/mono";
import { Lexend } from "next/font/google";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import "@/app/globals.css";
import "@/app/theme-config.css";
import { Providers } from "@/components/AppComponents/Chat//providers";
import { AnalyticsProvider } from "@/components/ContextProviders/AnalyticsProvider";
import { CookieConsentProvider } from "@/components/ContextProviders/CookieConsentProvider";
import FontProvider from "@/components/ContextProviders/FontProvider";
import { GleapProvider } from "@/components/ContextProviders/GleapProvider";
import { WebDebuggerPosition } from "@/lib/avo/Avo";
import { SentryIdentify } from "@/lib/sentry/SentryIdentify";
import { cn } from "@/lib/utils";
import { TRPCReactProvider } from "@/utils/trpc";

const provided_vercel_url =
  process.env.VERCEL_URL && process.env.VERCEL_URL?.length > 0
    ? process.env.VERCEL_URL
    : process.env.NEXT_PUBLIC_VERCEL_URL_FALLBACK;

const vercel_url = `https://${provided_vercel_url}`;

const lexend = Lexend({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lexend",
});

export const metadata = {
  metadataBase: new URL(vercel_url),
  title: {
    default: "Oak AI Experiments",
    template: `%s - AI Lesson Planner`,
  },
  description:
    "Oak AI experiments offers some experimental generative AI tools designed for and freely available to teachers. We are actively looking for your feedback to refine and optimise these tools, making them more effective and time-saving.",
  icons: {
    icon: "/favicon/favicon.ico",
    shortcut: "/favicon/favicon-16x16.png",
    apple: "/favicon/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  const nonce = headers().get("x-nonce");
  if (!nonce) {
    // Our middleware path matching excludes static paths like /_next/static/...
    // If a static path becomes a 404, CSP headers aren't set
    // In this case, redirect to an explicit 404 page
    return redirect("/not-found");
  }

  return (
    <html lang="en" suppressHydrationWarning className={lexend.variable}>
      <ClerkProvider>
        <body
          className={cn(
            "overflow-x-hidden font-sans antialiased",
            GeistMono.variable,
          )}
        >
          <Theme
            accentColor="blue"
            grayColor="olive"
            scaling="110%"
            color="#22222"
            style={{ overflowX: "hidden", color: "var(--base-color)" }}
          >
            <TRPCReactProvider>
              <FontProvider>
                <Toaster />
                <Providers>
                  <SentryIdentify />
                  <CookieConsentProvider>
                    <AnalyticsProvider
                      avoOptions={{
                        webDebugger: false,
                        inspector: undefined,
                        webDebuggerOptions: {
                          position: WebDebuggerPosition.BottomLeft({
                            bottom: 0,
                            left: 0,
                          }),
                        },
                      }}
                    >
                      <GleapProvider>{children}</GleapProvider>
                    </AnalyticsProvider>
                  </CookieConsentProvider>
                </Providers>
              </FontProvider>
            </TRPCReactProvider>
          </Theme>

          {/* react-hot-toast uses "goober" to set styles.
              Goober creates a _goober tag which would be blocked by CSP
              We can pre-create it with a nonce ourselves
              See https://github.com/cristianbote/goober/issues/471 */}
          <style
            id="_goober"
            nonce={nonce ?? undefined}
            suppressHydrationWarning
            // eslint-disable-next-line react/jsx-no-comment-textnodes
          >
            /* css comment for goober */
          </style>
        </body>
      </ClerkProvider>
    </html>
  );
}
