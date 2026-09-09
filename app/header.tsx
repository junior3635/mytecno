import Link from 'next/link';
import { Suspense } from 'react';
import prisma from '@/lib/db';
import ThemeToggle from './theme-toggle';
import SearchBox from './search-box';

type HeaderCategory = { name: string; slug: string };

export default async function Header() {
  let categories: HeaderCategory[] = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    take: 6,
  }).catch(() => []);

  if (categories.length === 0) {
    categories = [
      { name: 'Reviews', slug: 'reviews' },
      { name: 'Guides', slug: 'guides' },
      { name: 'Deep Dives', slug: 'deep-dives' },
      { name: 'Gadgets', slug: 'gadgets' },
    ];
  }

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <div className="container" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {categories.map(({ name, slug }) => (
            <Link key={slug} href={`/?category=${encodeURIComponent(slug)}`} style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-secondary)',
              transition: 'color 0.2s',
            }}>
              {name}
            </Link>
          ))}
          <Suspense fallback={null}>
            <SearchBox />
          </Suspense>
          <Link href="/admin" style={{
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
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}