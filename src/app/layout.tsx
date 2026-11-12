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
  title: "LanAhora SystemCore — Sistema Central & Originación",
  description: "Plataforma central de crédito por vales, red de distribuidores y prospección en campo LanAhora",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" type="image/png" sizes="48x48" href="/icon.png?v=20261112b" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=20261112b" />
        <link rel="shortcut icon" href="/icon.png?v=20261112b" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=20261112b" />
      </head>
      <body className="min-h-full flex flex-col bg-[#f0f4fa] text-slate-900">{children}</body>
    </html>
  );
}
