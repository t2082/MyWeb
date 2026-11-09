import type { Metadata } from "next";
import { Press_Start_2P, Space_Mono, Pixelify_Sans, VT323 } from "next/font/google";
import "./globals.css";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press",
  display: "swap",
});

const pixelify = Pixelify_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-pixelify",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const vt323 = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-vt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LUONG LUU MINH TAN (Akuro) • Mobile Developer Pixel Portfolio",
  description:
    "Pixel-Art Portfolio of Luong Luu Minh Tan - Mobile Developer specializing in Flutter, React Native, Dart, Kotlin, Swift, Clean Architecture and AI Integration.",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/avatar_akuro.png", sizes: "any", type: "image/png" },
    ],
    shortcut: "/assets/avatar_akuro.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${pressStart.variable} ${pixelify.variable} ${spaceMono.variable} ${vt323.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#030c06] text-white font-pixelify selection:bg-emerald-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
