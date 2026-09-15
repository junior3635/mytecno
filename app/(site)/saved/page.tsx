import type { Metadata } from 'next';
import SavedFeed from '@/components/saved-feed';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Saved stories | MyTechNews',
  robots: { index: false, follow: false },
};

export default function SavedPage() {
  return (
    <div className="search-page">
      <div className="container">
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb__sep" aria-hidden="true">/</span>
          <span aria-current="page">Saved</span>
        </nav>
        <h1 className="search-title">Saved stories</h1>
        <SavedFeed />
      </div>
    </div>
  );
}