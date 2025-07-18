// app/layout.tsx

import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-primary", 
});

// --- PERUBAHAN UTAMA DI SINI ---
// Menambahkan properti 'icons' untuk menampilkan favicon.ico
export const metadata: Metadata = {
  title: "Portfolio",
  description: "Modern Portfolio",
  icons: {
    // Menunjuk ke file favicon.ico di direktori /public
    icon: '/favicon.ico', 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${interTight.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
