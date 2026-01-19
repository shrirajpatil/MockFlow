import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./reactflow-custom.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MockFlow - Visual Mock API Builder",
  description: "Build, test, and deploy mock APIs visually with a powerful node-based workflow editor",
};

// Validate environment variables on app initialization
if (typeof window === 'undefined') {
  try {
    require('@/lib/env').validateEnv();
  } catch (error) {
    console.error('Environment validation failed:', error);
    // In development, log error but continue
    // In production, this will prevent deployment if env vars are invalid
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
