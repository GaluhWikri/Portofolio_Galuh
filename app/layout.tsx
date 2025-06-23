import type { Metadata } from "next";
import { Cinzel } from "next/font/google"; // Import font Cinzel
import "./globals.css";

// Konfigurasi font Cinzel
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-primary", // Gunakan nama variabel --font-primary
});

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Classic Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${cinzel.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}