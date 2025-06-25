import type { Metadata } from "next";
import { Inter_Tight } from "next/font/google"; // <-- Mengimpor Inter Tight
import "./globals.css";

// Konfigurasi untuk font Inter Tight
const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-primary", // Tetap menggunakan variabel CSS yang sama
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Modern Portfolio", // Deskripsi dapat diperbarui
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Menerapkan variabel font baru ke body */}
      <body className={`${interTight.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
