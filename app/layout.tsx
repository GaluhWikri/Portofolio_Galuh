import type { Metadata } from "next";
// Hapus atau komentari import Cinzel
// import { Cinzel } from "next/font/google";
import { VT323 } from "next/font/google"; // <-- Ganti dengan font pixel
import "./globals.css";

// Konfigurasi font baru
const vt323 = VT323({
  subsets: ["latin"],
  weight: "400", // Font pixel biasanya hanya punya satu weight
  variable: "--font-primary",
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Pixelated Portfolio", // Deskripsi bisa diupdate
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* Terapkan variabel font baru ke body */}
      <body className={`${vt323.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}