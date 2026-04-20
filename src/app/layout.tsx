import type { Metadata } from "next";
import { Inter, Literata, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "iHateGrammarly — Grammarly rejected me, so I built this",
  description:
    "An open-source, local-first writing assistant. Grammar, style, and readability analysis — all offline, all private. No subscription, no data collection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${literata.variable} ${jetbrainsMono.variable} dark h-full`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full font-[family-name:var(--font-inter)] antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
