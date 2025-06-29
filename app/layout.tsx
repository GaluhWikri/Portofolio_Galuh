// app/layout.tsx

import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-primary", 
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Modern Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // --- PERBAIKAN WAJIB: Menambahkan suppressHydrationWarning pada <html> ---
    <html lang="en" suppressHydrationWarning>
      <body className={`${interTight.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}