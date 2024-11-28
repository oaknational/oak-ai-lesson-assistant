const {
  getAppVersion,
  getReleaseStage,
  RELEASE_STAGE_PRODUCTION,
  RELEASE_STAGE_TESTING,
} = require("./scripts/build_config_helpers.js");
const path = require("path");

const { PHASE_PRODUCTION_BUILD, PHASE_TEST } = require("next/constants");

const { sentryWebpackPlugin } = require("@sentry/webpack-plugin");
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
  const isNextjsProductionBuildPhase = phase === PHASE_PRODUCTION_BUILD;
  const isTestBuild = phase === PHASE_TEST || process.env.NODE_ENV === "test";

  if (isTestBuild) {
    releaseStage = RELEASE_STAGE_TESTING;
    appVersion = RELEASE_STAGE_TESTING;
  } else {
    releaseStage = getReleaseStage(
      process.env.OVERRIDE_RELEASE_STAGE ||
        process.env.VERCEL_ENV ||
        process.env.NEXT_PUBLIC_ENVIRONMENT ||
        // Netlify
        process.env.CONTEXT,
    );

    isProductionBuild = releaseStage === RELEASE_STAGE_PRODUCTION;
    appVersion = getAppVersion({ isProductionBuild });
  }

  /** @type {import('next').NextConfig} */
  const config = {
    experimental: {
      /**
       * For instrumentation.ts
       * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/migration/v7-to-v8/#updated-sdk-initialization
       */
      instrumentationHook: true,
      serverComponentsExternalPackages: [`require-in-the-middle`],
      turbo: {
        resolveAlias: {
          "next/navigation": {
            storybook: path.join(
              __dirname,
              "src",
              "mocks",
              "next",
              "navigation",
            ),
            default: "next/navigation",
          },
          "@clerk/nextjs": {
            storybook: path.join(__dirname, "src", "mocks", "clerk", "nextjs"),
            default: "@clerk/nextjs",
          },
        },
      },
    },
    reactStrictMode: true,
    swcMinify: true,
    images: {
      domains: [
        "oaknationalacademy-res.cloudinary.com",
        "live.staticflickr.com",
        "images.unsplash.com",
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
    publicRuntimeConfig: {
      appVersion,
      releaseStage,
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
          source: "/aila/download/:id",
          destination: "/aila/:id/download",
          permanent: true,
        },
      ];
    },
    serverRuntimeConfig: {
      // These netlify env variables are only available at build-time
      // unless we explicitly copy them to serverRuntimeConfig, unlike
      // those which come from the env we configure ourselves
      BRANCH: process.env.BRANCH,
      DEPLOY_CONTEXT: process.env.CONTEXT,
    },
    webpack: (config, { dev, isServer }) => {
      if (!dev && isProductionBuild && isNextjsProductionBuildPhase) {
        config.devtool = "source-map";
        config.plugins.push(
          sentryWebpackPlugin({
            release: appVersion,
            org: "oak-national-academy",
            project: "ai-experiments",
            authToken: process.env.SENTRY_AUTH_TOKEN,
          }),
        );
      }

      // dd-trace outputs the following warning in the browser console:
      // Critical dependency: the request of a dependency is an expression
      // This is due to the use of `require` in the dd-trace codebase.
      // This can be safely ignored.
      // Start of dd-trace fix
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          "dd-trace": false,
        };
      }
      config.module = config.module || {};
      config.module.exprContextCritical = false;
      // End of dd-trace fix

      return config;
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
