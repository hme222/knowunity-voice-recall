import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// typography.primitive.fontFamily.default — Greed Standard, every text style except Display L.
// Weights map to typography.primitive.fontWeight.{regular, semibold, bold, heavy}.
const greed = localFont({
  variable: "--font-greed",
  src: [
    { path: "./fonts/GreedStandard-TRIAL-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/GreedStandard-TRIAL-SemiBold.otf", weight: "600", style: "normal" },
    { path: "./fonts/GreedStandard-TRIAL-Bold.otf", weight: "700", style: "normal" },
    { path: "./fonts/GreedStandard-TRIAL-Heavy.otf", weight: "800", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "Say It Back — Knowunity",
  description: "Voice active-recall prototype for Knowunity",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${greed.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
