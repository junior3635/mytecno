import Link from 'next/link';
import { Suspense } from 'react';
import prisma from '@/lib/db';
import ThemeToggle from './theme-toggle';
import SearchBox from './search-box';
import MobileNav from '@/components/mobile-nav';

type HeaderCategory = { name: string; slug: string };

export default async function Header() {
  let categories: HeaderCategory[] = await prisma.category
    .findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }], take: 8 })
    .catch(() => []);

  if (categories.length === 0) {
    categories = [
      { name: 'Technology', slug: 'technology' },
      { name: 'Food', slug: 'food' },
      { name: 'News', slug: 'news' },
      { name: 'Guides', slug: 'guides' },
      { name: 'Reviews', slug: 'reviews' },
    ];
  }

  const navLinks = [{ name: 'Home', slug: '' }, ...categories.slice(0, 6)];

  return (
    <header className="site-header">
      <div className="container header-inner">
        {/* Masthead */}
        <Link href="/" className="header-logo" aria-label="MyTechNews home">
          MyTechNews
        </Link>

        {/* Desktop nav */}
        <nav className="header-desktop-nav" aria-label="Main navigation">
          {navLinks.map(({ name, slug }) => (
            <Link
              key={slug || '__home'}
              href={slug ? `/${encodeURIComponent(slug)}` : '/'}
              className="header-nav-link"
            >
              {name}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="header-desktop-actions">
          <Suspense fallback={null}>
            <SearchBox />
          </Suspense>
          <Link href="/saved" className="header-admin-link">
            Saved
          </Link>
          <ThemeToggle />
        </div>

        {/* Mobile: hamburger + overlay */}
        <MobileNav
          categories={navLinks.filter((l) => l.slug !== '')}
          searchSlot={
            <Suspense fallback={null}>
              <SearchBox />
            </Suspense>
          }
          themeSlot={<ThemeToggle />}
        />
      </div>
    </header>
  );
}