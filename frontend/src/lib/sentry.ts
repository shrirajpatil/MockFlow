/**
 * Sentry Error Tracking Configuration
 * Uncomment and configure when ready to add error tracking
 */

// import * as Sentry from "@sentry/nextjs";

// Sentry.init({
//   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

//   // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
//   // We recommend adjusting this value in production
//   tracesSampleRate: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' ? 0.1 : 1.0,

//   // Capture Replay for 10% of all sessions,
//   // plus for 100% of sessions with an error
//   replaysSessionSampleRate: 0.1,
//   replaysOnErrorSampleRate: 1.0,

//   // Note: if you want to override the automatic release value, do not set a
//   // `release` value here - use the environment variable `SENTRY_RELEASE`, so
//   // that it will also get attached to your source maps

//   environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',

//   // Filter out errors
//   beforeSend(event, hint) {
//     // Don't send errors in development
//     if (process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production') {
//       return null;
//     }

//     // Filter out specific errors
//     const error = hint.originalException;
//     if (error && error.message) {
//       // Ignore network errors
//       if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
//         return null;
//       }
//     }

//     return event;
//   },
// });

/**
 * To enable Sentry:
 * 1. Install dependencies:
 *    npm install @sentry/nextjs
 * 
 * 2. Set environment variable:
 *    NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
 * 
 * 3. Uncomment the code above
 * 
 * 4. Import this file in your root layout or _app.tsx
 */

export const sentryConfig = {
    enabled: false, // Set to true when Sentry is configured
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
};
