import type { Metadata } from "next";
import { Outfit, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ 
  subsets: ["latin"], 
  variable: "--font-editorial" 
});

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans" 
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"], 
  variable: "--font-mono" 
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://pixels-to-products-cloudinary-ai-hackathon-2026-build-bros.vercel.app"),
  title: {
    default: "SecureFlow AI — Media Intelligence Platform",
    template: "%s — SecureFlow AI",
  },
  description:
    "Upload, analyze, transform, optimize and manage your media through one unified workspace powered by Cloudinary.",
  keywords: ["media", "AI", "image processing", "cloudinary", "smart crop", "background removal"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
