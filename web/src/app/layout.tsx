import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LamarAI — Workshop Pencarian Kerja Pakai AI",
  description:
    "Bangun mesin lamaran kerja pakai AI dalam 3 jam. Evaluasi lowongan otomatis, CV tailored per lamaran, dan scan 45+ portal perusahaan. Workshop online, Sabtu 14 Juni 2026.",
  openGraph: {
    title: "LamarAI — Workshop Pencarian Kerja Pakai AI",
    description:
      "Bangun mesin lamaran kerja pakai AI dalam 3 jam. Evaluasi lowongan otomatis, CV tailored, scan 45+ portal.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
