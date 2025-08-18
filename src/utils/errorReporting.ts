export async function reportError(error: Error, context?: Record<string, any>) {
  if (process.env.NODE_ENV === "production") {
    try {
      const Sentry = await import("@sentry/nextjs");

      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          Sentry.withScope((scope: any) => {
            scope.setExtra(key, value);
            Sentry.captureException(error);
          });
        });
      } else {
        Sentry.captureException(error);
      }
    } catch (e) {
      console.error("Failed to report error to Sentry:", e);
      console.error("Original error:", error);
    }
  } else {
    console.error("Error:", error);
    if (context) {
      console.error("Context:", context);
    }
  }
}

export async function trackEvent(
  eventName: string,
  data?: Record<string, any>
) {
  if (process.env.NODE_ENV === "production") {
    try {
      const Sentry = await import("@sentry/nextjs");
      Sentry.captureMessage(eventName, {
        level: "info",
        extra: data,
      });
    } catch (e) {
      console.info("Failed to track event in Sentry:", eventName, data);
    }
  } else {
    console.info("Event:", eventName, data);
  }
}

export default {
  reportError,
  trackEvent,
};
