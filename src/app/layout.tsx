import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import PasswordProtection from "@/components/PasswordProtection";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "우리 가계부",
  description: "A simple finance book for couples",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <PasswordProtection>
          {children}
          <Navbar />
        </PasswordProtection>
      </body>
    </html>
  );
}
