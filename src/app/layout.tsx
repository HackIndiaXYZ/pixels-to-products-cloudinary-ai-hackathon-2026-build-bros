import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SecureFlow AI — Security Intelligence Engine",
    template: "%s — SecureFlow AI",
  },
  description:
    "Paste anything. SecureFlow AI automatically identifies the input type and applies the appropriate security analysis — from source code and cloud infrastructure to logs, policies, and configurations.",
  keywords: ["security", "AI", "vulnerability analysis", "cybersecurity", "SAST", "cloud security"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
