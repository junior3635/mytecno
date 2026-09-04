import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MyTechNews | Future of Technology",
  description: "Stay ahead of the curve with in-depth tech reviews, breaking news, and comprehensive guides.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Glassmorphic Sticky Header */}
        <header style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <div className="container" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                fontSize: '1.5rem',
                fontWeight: 900,
                letterSpacing: '-0.05em',
                textTransform: 'uppercase',
                background: 'linear-gradient(90deg, #fff 30%, #00f2fe)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                MyTechNews
              </span>
            </a>

            <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              {['Reviews', 'Guides', 'Deep Dives', 'Gadgets'].map((item) => (
                <a key={item} href="/" style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--text-secondary)',
                  transition: 'color 0.2s',
                }}>
                  {item}
                </a>
              ))}
              <a href="/admin" style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '0.4rem 1.2rem',
                borderRadius: '9999px',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                transition: 'all 0.2s',
              }}>
                Admin
              </a>
            </nav>
          </div>
        </header>

        <main style={{ minHeight: '85vh' }}>
          {children}
        </main>

        <footer style={{
          borderTop: '1px solid var(--border-color)',
          padding: '3rem 0',
          marginTop: '4rem',
          backgroundColor: 'var(--surface-color)',
        }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.04em', textTransform: 'uppercase' }}>
              MyTechNews
            </span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              &copy; {new Date().getFullYear()} MyTechNews · AI-Powered Technology Media
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
