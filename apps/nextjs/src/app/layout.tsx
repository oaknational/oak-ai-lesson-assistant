import React from "react";
import { Toaster } from "react-hot-toast";
import { Monitoring } from "react-scan/dist/core/monitor/params/next";

import { ClerkProvider } from "@clerk/nextjs";
import "@fontsource/lexend";
import "@fontsource/lexend/500.css";
import "@fontsource/lexend/600.css";
import "@fontsource/lexend/700.css";
import "@fontsource/lexend/800.css";
import "@fontsource/lexend/900.css";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import * as Sentry from "@sentry/nextjs";
import { GeistMono } from "geist/font/mono";
import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import "@/app/globals.css";
import "@/app/theme-config.css";
import { Providers } from "@/components/AppComponents/Chat//providers";
import { AnalyticsProvider } from "@/components/ContextProviders/AnalyticsProvider";
import { CookieConsentProvider } from "@/components/ContextProviders/CookieConsentProvider";
import { FeatureFlagProvider } from "@/components/ContextProviders/FeatureFlagProvider";
import FontProvider from "@/components/ContextProviders/FontProvider";
import { GleapProvider } from "@/components/ContextProviders/GleapProvider";
import { WebDebuggerPosition } from "@/lib/avo/Avo";
import { getBootstrappedFeatures } from "@/lib/feature-flags/bootstrap";
import { SentryIdentify } from "@/lib/sentry/SentryIdentify";
import { cn } from "@/lib/utils";
import { TRPCReactProvider } from "@/utils/trpc";

import StyledComponentsRegistry from "./styles-registry";

const provided_vercel_url =
  process.env.VERCEL_URL && process.env.VERCEL_URL?.length > 0
    ? process.env.VERCEL_URL
    : process.env.NEXT_PUBLIC_VERCEL_URL_FALLBACK;

const reactScanApiKey = process.env.NEXT_PUBLIC_REACT_SCAN_KEY;
const addReactScanMonitor =
  process.env.NEXT_PUBLIC_RENDER_MONITOR === "true" &&
  reactScanApiKey !== undefined;

const lexend = Lexend({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lexend",
});

export function generateMetadata(): Metadata {
  const vercel_url = `https://${provided_vercel_url}`;
  return {
    metadataBase: new URL(vercel_url),
    title: {
      default: "Oak AI Experiments",
      template: "%s - AI Lesson Planner",
    },
    description:
      "Oak AI experiments offers some experimental generative AI tools designed for and freely available to teachers. We are actively looking for your feedback to refine and optimise these tools, making them more effective and time-saving.",
    icons: {
      icon: "/favicon/favicon.ico",
      shortcut: "/favicon/favicon-16x16.png",
      apple: "/favicon/apple-touch-icon.png",
    },

    other: {
      ...Sentry.getTraceData(),
    },
  };
}

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({
  children,
}: Readonly<RootLayoutProps>) {
  const nonce = headers().get("x-nonce");

  if (!nonce) {
    // Our middleware path matching excludes static paths like /_next/static/...
    // If a static path becomes a 404, CSP headers aren't set
    // In this case, redirect to an explicit 404 page
    return redirect("/not-found");
  }

  const bootstrappedFeatures = await getBootstrappedFeatures(headers());

  return (
    <html lang="en" suppressHydrationWarning className={lexend.variable}>
      <StyledComponentsRegistry>
        <ClerkProvider>
          <body
            className={cn(
              "overflow-x-hidden font-sans antialiased",
              GeistMono.variable,
            )}
          >
            {addReactScanMonitor && (
              <Monitoring
                apiKey={reactScanApiKey}
                url={process.env.NEXT_PUBLIC_REACT_SCAN_URL}
              />
            )}
            <Theme
              accentColor="blue"
              grayColor="olive"
              scaling="110%"
              color="#22222"
              style={{ overflowX: "hidden" }}
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
                          webDebuggerOptions: {
                            position: WebDebuggerPosition.BottomRight({
                              bottom: 0,
                              right: 0,
                            }),
                          },
                        }}
                        bootstrappedFeatures={bootstrappedFeatures}
                      >
                        <GleapProvider>
                          <FeatureFlagProvider
                            bootstrappedFeatures={bootstrappedFeatures}
                          >
                            {children}
                          </FeatureFlagProvider>
                        </GleapProvider>
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
      </StyledComponentsRegistry>
    </html>
  );
}
