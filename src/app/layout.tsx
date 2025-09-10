import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PWAWrapper from "@/components/pwa/PWAWrapper";
import DevToolsPanel from "@/components/dev/DevToolsPanel";
import NotificationPermissionPrompt from "@/components/pwa/NotificationPermissionPrompt";
import CSSLoadingFallback from "@/components/utils/CSSLoadingFallback";
import DevRefreshHelper from "@/components/utils/DevRefreshHelper";

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
  icons: {
    icon: [
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-180x180.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "나의 시간표",
    startupImage: "/icons/icon-512x512.png"
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "나의 시간표",
    title: "나의 시간표",
    description: "대학교 시간표를 편리하게 확인하고 수업 알림을 받아보세요",
    images: "/icons/icon-512x512.png",
  },
  twitter: {
    card: "summary",
    title: "나의 시간표",
    description: "대학교 시간표를 편리하게 확인하고 수업 알림을 받아보세요",
    images: "/icons/icon-512x512.png",
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
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CSSLoadingFallback>
          <PWAWrapper>
            {children}
            <NotificationPermissionPrompt />
            <DevToolsPanel />
          </PWAWrapper>
          <DevRefreshHelper />
        </CSSLoadingFallback>
      </body>
    </html>
  );
}
