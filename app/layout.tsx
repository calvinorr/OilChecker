import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Oil Price Tracker | Northern Ireland Heating Oil",
  description:
    "Track daily heating oil prices in Northern Ireland. Compare suppliers, monitor Brent crude correlation, and get buy signals.",
  keywords: [
    "heating oil",
    "oil prices",
    "Northern Ireland",
    "cheapest oil",
    "home heating",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-slate-950 text-slate-100`}
      >
        {children}
      </body>
    </html>
  );
}
