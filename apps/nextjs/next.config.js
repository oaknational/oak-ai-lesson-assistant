// This file should be in Common JS format to be compatible with Next.js
const {
  getAppVersion,
  getReleaseStage,
  RELEASE_STAGE_PRODUCTION,
  RELEASE_STAGE_TESTING,
} = require("./scripts/build_config_helpers.cjs");
const path = require("path");

const { PHASE_TEST } = require("next/constants");

const { withSentryConfig } = require("@sentry/nextjs");

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
// !process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

/** @type {(phase: string) => Promise<import("next").NextConfig>} */
const getConfig = async (phase) => {
  /** @type string */
  let releaseStage;
  /** @type string */
  let appVersion;
  let isProductionBuild = false;
  const isTestBuild = phase === PHASE_TEST || process.env.NODE_ENV === "test";

  if (isTestBuild) {
    releaseStage = RELEASE_STAGE_TESTING;
    appVersion = RELEASE_STAGE_TESTING;
  } else {
    releaseStage = getReleaseStage(
      process.env.OVERRIDE_RELEASE_STAGE ||
        process.env.VERCEL_ENV ||
        process.env.NEXT_PUBLIC_ENVIRONMENT,
    );

    isProductionBuild = releaseStage === RELEASE_STAGE_PRODUCTION;
    appVersion = getAppVersion({ isProductionBuild });
  }

  /** @type {import('next').NextConfig} */
  const config = {
    serverExternalPackages: [
      `require-in-the-middle`,
      `@resvg/resvg-js`,
      // Pino uses dynamic requires that Turbopack can't statically analyze
      // See: https://github.com/vercel/next.js/issues/86099
      `pino`,
      `thread-stream`,
    ],
    turbopack: {
      resolveAlias: {
        "next/navigation": {
          storybook: path.join(__dirname, "src", "mocks", "next", "navigation"),
          default: "next/navigation",
        },
        "@clerk/nextjs": {
          storybook: path.join(__dirname, "src", "mocks", "clerk", "nextjs"),
          default: "@clerk/nextjs",
        },
      },
    },
    reactStrictMode: true,
    swcMinify: true,
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "oaknationalacademy-res.cloudinary.com",
        },
        {
          protocol: "https",
          hostname: "*.googleusercontent.com",
        },
      ],
    },
    transpilePackages: ["@oakai/api", "@oakai/db", "@oakai/exports"],
    compiler: {
      styledComponents: true,
    },
    // We already do linting on GH actions
    eslint: {
      ignoreDuringBuilds: !!process.env.CI,
    },
    env: {
      NEXT_PUBLIC_APP_VERSION: appVersion,
      NEXT_PUBLIC_RELEASE_STAGE: releaseStage,
      NEXT_PUBLIC_DEBUG: process.env.DEBUG,
    },

    productionBrowserSourceMaps: true,
    async redirects() {
      return [
        {
          source: "/chat/:path*",
          destination: "/aila/:path",
          permanent: true,
        },
        {
          source: "/aila/share/:id",
          destination: "/aila/:id/share",
          permanent: true,
        },
        {
          source: "/aila/:id/share",
          destination: "/aila/lesson/:id/share",
          permanent: true,
        },
        {
          source: "/aila/download/:id",
          destination: "/aila/:id/download",
          permanent: true,
        },
        {
          source: "/aila/:id/download",
          destination: "/aila/lesson/:id/download",
          permanent: true,
        },

        // // This is for the link from OWA search results to AILA lessons, can be removed when we update the OWA link
        // // Redirect /aila to /aila/lesson if ANY of keyStage, subject, or searchExpression are present as query params
        {
          source: "/aila",
          destination: "/aila/lesson",
          permanent: true,
          has: [{ type: "query", key: "keyStage" }],
        },
        {
          source: "/aila",
          destination: "/aila/lesson",
          permanent: true,
          has: [{ type: "query", key: "subject" }],
        },
        {
          source: "/aila",
          destination: "/aila/lesson",
          permanent: true,
          has: [{ type: "query", key: "searchExpression" }],
        },
      ];
    },
  };

  return config;
};

module.exports = getConfig;

module.exports = withSentryConfig(module.exports, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
