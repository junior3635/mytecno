import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "./header";
import AdSenseAutoAds from "@/components/adsense-auto-ads";
import SubscribeForm from "@/components/subscribe-form";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t;}catch(e){}`,
          }}
        />
        <AdSenseAutoAds />
      </head>
      <body className={inter.variable}>
        <Header />

        <main style={{ minHeight: '85vh' }}>
          {children}
        </main>

        <footer style={{
          borderTop: '1px solid var(--border-color)',
          padding: '3rem 0',
          marginTop: '4rem',
          backgroundColor: 'var(--surface-color)',
        }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.04em', textTransform: 'uppercase' }}>
                MyTechNews
              </span>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                &copy; {new Date().getFullYear()} MyTechNews · AI-Powered Technology Media
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '340px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Get the weekly brief
              </span>
              <SubscribeForm />
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
