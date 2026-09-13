import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import Providers from "./store/Providers";

/**
 * Self-hosted Google Sans — mirrors foodhub-frontend's setup exactly (same
 * font files, same fallback chain) so both apps render Khmer identically.
 *
 * This was previously loaded via a plain CSS `@import url(fonts.googleapis...)`
 * in globals.css. That import doesn't survive this project's Turbopack/
 * Tailwind v4 CSS pipeline — the compiled stylesheet never carried the
 * resulting `@font-face` rules through, so the font never actually
 * downloaded and every page silently rendered Khmer text in the browser's
 * fallback serif. `next/font/local` self-hosts the files instead of relying
 * on a runtime import, which is what actually fixes that. The files
 * themselves do cover Khmer (verified against their cmap tables: 110/128
 * codepoints in U+1780–17FF, the rest being unassigned slots in that block)
 * — it was never that this font lacked Khmer, only that it never loaded.
 */
const googleSans = localFont({
  src: [
    { path: "./fonts/GoogleSans_17pt-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/GoogleSans_17pt-Italic.ttf", weight: "400", style: "italic" },
    { path: "./fonts/GoogleSans_17pt-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/GoogleSans_17pt-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/GoogleSans_17pt-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
  fallback: [
    "Kantumruy Pro",
    "Noto Sans Khmer",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "sans-serif",
  ],
});

/** Reserved for tabular figures in KPIs and data tables. */
const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MhouBahar Admin",
  description: "MhouBahar admin dashboard",
  icons: {
    icon: "/assets/logo/mhoubahar.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      // The interface language is Khmer. Khmer is written without spaces
      // between words, so the correct `lang` is what lets the browser break
      // lines on syllable boundaries instead of overflowing or breaking
      // mid-cluster.
      lang="km"
      suppressHydrationWarning
      className={`${googleSans.variable} ${mono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="h-full overflow-hidden font-sans antialiased"
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
