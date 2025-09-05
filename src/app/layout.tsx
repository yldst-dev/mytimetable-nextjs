import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PWAWrapper from "@/components/pwa/PWAWrapper";
import DevToolsPanel from "@/components/dev/DevToolsPanel";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "나의 시간표",
  description: "대학교 시간표를 편리하게 확인하고 수업 알림을 받아보세요",
  keywords: ["시간표", "대학교", "수업", "일정", "PWA", "알림"],
  authors: [{ name: "My Timetable Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "나의 시간표"
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "나의 시간표",
    title: "나의 시간표",
    description: "대학교 시간표를 편리하게 확인하고 수업 알림을 받아보세요",
  },
  twitter: {
    card: "summary",
    title: "나의 시간표",
    description: "대학교 시간표를 편리하게 확인하고 수업 알림을 받아보세요",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PWAWrapper>
          {children}
          <DevToolsPanel />
        </PWAWrapper>
      </body>
    </html>
  );
}
