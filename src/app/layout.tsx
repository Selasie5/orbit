import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/authContext";
import { SwipeProvider } from '@/context/SwipeContext';

const bricolage= Bricolage_Grotesque({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orbit - College Networking",
  description: "Connect with fellow students and expand your network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` ${bricolage.className} antialiased`}
      >
        <AuthProvider>
          <SwipeProvider>
            {children}
          </SwipeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}