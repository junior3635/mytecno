'use client';

import { useState } from 'react';

const LinkIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const CheckIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.026 1.792-4.697 4.533-4.697 1.312 0 2.686.235 2.686.235v2.971H15.83c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
  </svg>
);

export default function ShareControls({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  const xUrl = `https://twitter.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard unavailable; ignore.
    }
  }

  return (
    <div className="article-share">
      <span className="article-share__label">Share</span>
      <button
        type="button"
        className="share-btn"
        onClick={handleCopy}
        aria-label={copied ? 'Link copied' : 'Copy article link'}
        aria-pressed={copied}
        title={copied ? 'Link copied' : 'Copy link'}
      >
        {copied ? CheckIcon : LinkIcon}
      </button>
      <a className="share-btn" href={xUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on X" title="Share on X">
        {XIcon}
      </a>
      <a className="share-btn" href={fbUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" title="Share on Facebook">
        {FacebookIcon}
      </a>
    </div>
  );
}