import "./globals.css";
import type { Metadata } from "next";
import { Kantumruy_Pro, Geist_Mono } from "next/font/google";
import Providers from "./store/Providers";

/**
 * The admin UI is written in Khmer, so the UI face has to cover the Khmer
 * block (U+1780–17FF). Kantumruy Pro is a UI-grade Khmer family that also
 * ships a matching Latin, which keeps mixed Khmer/Latin strings — most labels
 * here are mixed — on one set of proportions instead of two.
 */
const sans = Kantumruy_Pro({
  variable: "--font-sans",
  subsets: ["khmer", "latin"],
  display: "swap",
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
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
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
