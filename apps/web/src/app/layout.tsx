import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import { env } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: { default: "Green Nest", template: "%s | Green Nest" },
  description:
    "Online prodavnica ukrasnih biljaka, saksija i opreme za negu biljaka.",
  applicationName: "Green Nest",
  keywords: ["ukrasne biljke", "sobne biljke", "saksije", "nega biljaka"],
  openGraph: {
    type: "website",
    locale: "sr_RS",
    siteName: "Green Nest",
    title: "Green Nest",
    description: "Biljke i oprema za zeleniji dom.",
    images: [
      {
        url: "/green-nest-logo-transparent.png",
        width: 1229,
        height: 805,
        alt: "Green Nest",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/green-nest-logo-transparent.png"],
  },
  robots: { index: true, follow: true },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f6f0" },
    { media: "(prefers-color-scheme: dark)", color: "#15201b" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${cormorant.variable} min-h-screen antialiased`}
      >
        <a href="#main-content" className="skip-link">
          Pređi na glavni sadržaj
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
