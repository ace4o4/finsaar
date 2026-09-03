import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import MouseEffects from "@/components/MouseEffects";
import SmoothScroll from "@/components/SmoothScroll";
import BackgroundWakeup from "@/components/BackgroundWakeup";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Finsaar — Your Embedded CFO Partner | Fractional CFO Services India",
  description:
    "Finsaar is a boutique CFO-as-a-service firm. We manage your accounting, compliance, and capital strategy so founders can focus strictly on business growth.",
  keywords: [
    "Fractional CFO",
    "CFO as a Service",
    "Financial Advisory India",
    "Startup Accounting",
    "GST Compliance",
    "Capital Advisory",
  ],
  openGraph: {
    title: "Finsaar — Your Embedded CFO Partner",
    description:
      "Boutique CFO-as-a-service for Indian startups and SMEs. Accounting, compliance, and capital strategy.",
    type: "website",
  },
  icons: {
    icon: "/imp/logo/d.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col antialiased" suppressHydrationWarning>
        <SmoothScroll>
          <MouseEffects />
          <BackgroundWakeup />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
