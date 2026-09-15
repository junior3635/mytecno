import type { Metadata } from "next";
import Header from "../header";
import SiteFooter from "@/components/footer";
import AdSenseAutoAds from "@/components/adsense-auto-ads";

export const metadata: Metadata = {
  title: "MyTechNews | Future of Technology",
  description: "Stay ahead of the curve with in-depth tech reviews, breaking news, and comprehensive guides.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: "MyTechNews | Future of Technology",
    description: "Stay ahead of the curve with in-depth tech reviews, breaking news, and comprehensive guides.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MyTechNews | Future of Technology",
    description: "Stay ahead of the curve with in-depth tech reviews, breaking news, and comprehensive guides.",
  },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdSenseAutoAds />
      <Header />
      <main style={{ minHeight: "85vh" }}>{children}</main>
      <SiteFooter />
    </>
  );
}