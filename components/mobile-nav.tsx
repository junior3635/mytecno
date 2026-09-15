'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface NavCategory {
  name: string;
  slug: string;
}

interface MobileNavProps {
  categories: NavCategory[];
  searchSlot?: React.ReactNode;
  themeSlot?: React.ReactNode;
}

export default function MobileNav({ categories, searchSlot, themeSlot }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      close();
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open, close]);

  // Focus trap
  useEffect(() => {
    if (!open || !panelRef.current) return;
    const panel = panelRef.current;
    const focusable = panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    function trap(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first?.focus();
      }
    }
    panel.addEventListener('keydown', trap);
    return () => panel.removeEventListener('keydown', trap);
  }, [open]);

  // Lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      {/* Hamburger button — visible on mobile only via CSS */}
      <button
        ref={buttonRef}
        type="button"
        className="hamburger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        <span className="hamburger-line" />
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          id="mobile-menu"
          ref={panelRef}
          className="mobile-overlay"
          role="dialog"
          aria-label="Mobile navigation"
        >
          <nav className="mobile-nav" aria-label="Mobile navigation">
            <Link href="/" className="mobile-nav-link" onClick={close}>
              Home
            </Link>
            {categories.map(({ name, slug }) => (
              <Link
                key={slug}
                href={`/${encodeURIComponent(slug)}`}
                className="mobile-nav-link"
                onClick={close}
              >
                {name}
              </Link>
            ))}
            <Link href="/saved" className="mobile-nav-link" onClick={close}>
              Saved
            </Link>
          </nav>

          <div className="mobile-overlay-footer">
            {searchSlot}
            {themeSlot}
          </div>
        </div>
      )}
    </>
  );
}