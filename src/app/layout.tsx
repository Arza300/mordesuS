import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  DM_Sans,
  Manrope,
  Outfit,
  Syne,
} from "next/font/google";

import {
  ContactPopup,
  LoadingScreen,
  NoiseOverlay,
  SkipToContent,
} from "@/components/common";
import { Navbar } from "@/components/layout/navbar";
import { Toaster } from "@/components/ui/sonner";
import { defaultMetadata } from "@/config/seo";
import { JsonLd } from "@/lib/structured-data";
import { AppProviders } from "@/providers/app-providers";

import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-projects",
  subsets: ["latin"],
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-joy-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

const manrope = Manrope({
  variable: "--font-joy-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["200", "300", "400", "500"],
});

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${syne.variable} ${outfit.variable} ${cormorant.variable} ${manrope.variable} flex min-h-dvh flex-col antialiased`}
      >
        <AppProviders>
          <SkipToContent />
          <LoadingScreen />
          <NoiseOverlay />
          <Navbar />
          <ContactPopup />
          <main id="main-content" className="relative flex-1">
            {children}
          </main>
          <JsonLd />
          <Toaster richColors closeButton theme="dark" />
        </AppProviders>
      </body>
    </html>
  );
}
