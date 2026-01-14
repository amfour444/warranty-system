import type { Metadata } from "next";
import { Inter } from "next/font/google"; // 1. เรียกใช้ Inter แทน Geist
import "./globals.css";

// 2. ตั้งค่าฟอนต์ Inter
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Warranty System",
  description: "Plasticbag 2015 Warranty Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 3. เรียกใช้ Class ของฟอนต์ที่ Body */}
      <body className={inter.className}>{children}</body>
    </html>
  );
}