import type { Metadata } from "next";
import { Be_Vietnam_Pro, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin", "vietnamese"],
  style: ["italic"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "StudyTok Studio",
  description: "AI study pack workspace for Vietnamese notes.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${beVietnam.variable} ${sourceSerif.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
