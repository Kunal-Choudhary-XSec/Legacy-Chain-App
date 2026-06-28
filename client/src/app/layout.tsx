import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Digital Inheritance - Stellar Soroban",
  description:
    "A digital inheritance smart contract on Stellar Soroban that triggers on inactivity, with beneficiary whitelist and executor confirmation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen`}>
        <Providers>
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
            {children}
          </main>
          <Toaster position="bottom-right" richColors />
          <footer className="border-t py-6 text-center text-sm text-muted-foreground">
            <p>Built on Stellar Soroban &middot; Digital Inheritance Contract</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
