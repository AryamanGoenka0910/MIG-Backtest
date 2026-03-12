import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MarketUpdateBanner from "@/components/MarketUpdateBanner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MIG Quant Competition",
  description:
    "University algorithmic trading competition hosted by the Michigan Investment Group. Submit your strategy, climb the leaderboard, compete for top honors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-100 min-h-screen flex flex-col`}
      >
        <MarketUpdateBanner
          message="Submission deadline: March 20, 2026 at 11:59 PM EST — 8 days remaining"
          dismissKey="banner-march-2026-deadline"
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
