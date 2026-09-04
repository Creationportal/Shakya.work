import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getLang } from "@/lib/i18n/server";
import { LanguageProvider } from "@/lib/i18n";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import VoiceGuide from "@/components/voice-guide/VoiceGuide";
import VoiceAgent from "@/components/voice-agent/VoiceAgent";
import DesignSystemProvider from "@/components/DesignSystemProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shakya.work",
  description:
    "Shakya — Fintech & AI product management, technical and ecosystem expertise with China know-how. AI projects you can use, an interactive CV, and a private portal for recruiters and clients.",
  metadataBase: new URL("https://shakya.work"),
};

const THEME_SCRIPT = `
  (function() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  })();
`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getLang();

  return (
    <html lang={lang}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <LanguageProvider initialLang={lang}>
          <DesignSystemProvider>
            <div className="flex min-h-full flex-col">
              <SiteHeader />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <VoiceGuide />
            <VoiceAgent />
          </DesignSystemProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
