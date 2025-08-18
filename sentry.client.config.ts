// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",

  // Conditionally enable integrations based on environment
  // Disable replay in production to reduce bundle size
  integrations:
    process.env.NODE_ENV !== "production" ? [Sentry.replayIntegration()] : [],

  // Reduce sampling rate in production to minimize performance impact
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Disable session replay in production, or use very low sampling
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.0 : 0.1,

  // Only sample a small percentage of errors in production
  replaysOnErrorSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Disable debugging in production
  debug: false,
});
