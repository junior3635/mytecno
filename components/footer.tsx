import Link from 'next/link';
import prisma from '@/lib/db';
import type { SiteSettings } from '@prisma/client';

const SOCIAL_NETWORKS: { label: string; color: string; get: (s: SiteSettings) => string | null }[] = [
  { label: 'X', color: 'var(--ink)', get: (s) => s.socialX },
  { label: 'FB', color: '#1877F2', get: (s) => s.socialFacebook },
  { label: 'IG', color: '#E4405F', get: (s) => s.socialInstagram },
  { label: 'YT', color: '#FF0000', get: (s) => s.socialYoutube },
  { label: 'TT', color: 'var(--ink)', get: (s) => s.socialTiktok },
  { label: 'LI', color: '#0A66C2', get: (s) => s.socialLinkedin },
];

export default async function SiteFooter() {
  const [categories, settings] = await Promise.all([
    prisma.category
      .findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }], take: 6 })
      .catch(() => []),
    prisma.siteSettings.findUnique({ where: { id: 'global' } }),
  ]);

  const socialItems: { url: string; label: string; color: string }[] = [];
  if (settings && settings.socialShowFooter !== false) {
    for (const { label, color, get } of SOCIAL_NETWORKS) {
      const url = get(settings)?.trim();
      if (url) socialItems.push({ url, label, color });
    }
  }

  return (
    <footer className="site-footer">
      <div className="container">
        <div className={`site-footer__grid${socialItems.length > 0 ? ' site-footer__grid--social' : ''}`}>
          <div className="site-footer__brand">
            <Link href="/" className="site-footer__logo">
              MyTechNews
            </Link>
            <p className="site-footer__tagline">
              A modern editorial publication covering technology, food, news and trends.
            </p>
          </div>

          <div>
            <span className="site-footer__heading">Sections</span>
            <ul className="site-footer__links">
              <li>
                <Link href="/">Home</Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/${cat.slug}`}>{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span className="site-footer__heading">Newsletter</span>
            <p className="site-footer__note">The best stories from technology, food and culture.</p>
          </div>

          {socialItems.length > 0 && (
            <div>
              <span className="site-footer__heading">Follow Us</span>
              <ul className="site-footer__links">
                {socialItems.map(({ url, label, color }) => (
                  <li key={label}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="site-footer__social-link"
                    >
                      <span
                        className="site-footer__social-badge"
                        style={{ backgroundColor: color, color: color === 'var(--ink)' ? 'var(--paper)' : '#fff' }}
                      >
                        {label}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="site-footer__bottom">
        <div className="container site-footer__bottom-inner">
          <span>© {new Date().getFullYear()} MyTechNews</span>
          <span>AI-powered editorial</span>
        </div>
      </div>
    </footer>
  );
}