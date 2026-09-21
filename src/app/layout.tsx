import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// typography.primitive.fontFamily.default / .display — Greed VF, one variable file.
// Axes in the file: wght 300–900, wdth 75 (Condensed) – 130 (Wide), slnt.
// The file's default width is 75, so globals.css pins the page to font-stretch 100% (Standard).
const greed = localFont({
  variable: "--font-greed",
  src: "./fonts/GreedCollectionVF-TRIAL.ttf",
  weight: "300 900",
  style: "normal",
  declarations: [{ prop: "font-stretch", value: "75% 130%" }],
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Helvetica Neue", "Arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Say It Back — Knowunity",
  description: "Voice active-recall prototype for Knowunity",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${greed.variable} h-full antialiased`}>
      <body className="h-full overflow-hidden flex flex-col">
        {/* 390px device frame, centred, filling the window. See globals.css. */}
        <div className="device-frame">{children}</div>
      </body>
    </html>
  );
}
