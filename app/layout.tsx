import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import Providers from "./Providers";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { AuthProvider } from "@/context/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0f172a", // Changes the very top status bar color on phones
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Prevents mobile zoom when clicking on input field
  viewportFit: 'cover'
};

export const metadata: Metadata = {
  title: "Todo App",
  description: "Stay organized and on schedule",
  appleWebApp: {
    capable: true, // This enables the fullscreen mode on iOS
    statusBarStyle: "default",
    title: "Todo App",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body 
        className="h-full flex flex-col overflow-hidden"
      >
        <AuthProvider>
          <AppRouterCacheProvider>
            <Providers>{children}</Providers>
          </AppRouterCacheProvider>
        </AuthProvider>
      </body>
    </html>
  );
}