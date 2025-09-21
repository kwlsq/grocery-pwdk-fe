import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthInitializer } from "@/components/layout/AuthInitializer";
import { VerificationWrapper } from "@/components/layout/VerificationWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Grocereach",
  description: "Fresh groceries delivered to your door",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <VerificationWrapper protectedPaths={['/profile', '/cart', '/checkout', '/orders', '/address']}

        >
          <AuthInitializer />
          {children}
        </VerificationWrapper>
      </body>
    </html>
  );
}