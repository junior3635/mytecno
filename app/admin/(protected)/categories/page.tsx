'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Category = {
  id: string;
  name: string;
  slug: string;
  _count?: { articles: number };
};

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => setError('Could not load categories'));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError('');
    setNotice('');

    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/categories/${editing.id}` : '/api/categories';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save category');

      setNotice(editing ? 'Category updated.' : 'Category created.');
      setName('');
      setEditing(null);
      router.refresh();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setBusy(false);
    }
  }

  async function load() {
    const res = await fetch('/api/categories');
    const data = await res.json();
    if (res.ok) setCategories(data.categories || []);
  }

  async function remove(cat: Category) {
    if (!window.confirm(`Delete category "${cat.name}"? Articles in it will move to Technology.`)) return;
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/categories/${cat.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete category');
      router.refresh();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setBusy(false);
    }
  }

  function startEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name);
  }

  function cancelEdit() {
    setEditing(null);
    setName('');
  }

  return (
    <div className="admin-page" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="admin-heading">Categories</h1>
        <p className="admin-sub">Manage the categories used across the public site and the AI generator.</p>
      </div>

      {error && (
        <div style={{ padding: '0.875rem 1rem', backgroundColor: 'rgba(254,9,121,0.1)', border: '1px solid rgba(254,9,121,0.3)', borderRadius: '0.75rem', color: '#fe0979', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}
      {notice && (
        <div style={{ padding: '0.875rem 1rem', backgroundColor: 'rgba(0,242,254,0.1)', border: '1px solid rgba(0,242,254,0.3)', borderRadius: '0.75rem', color: '#00f2fe', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          ✓ {notice}
        </div>
      )}

      {/* Create / Edit form */}
      <form onSubmit={save} className="admin-card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label className="admin-label">
            {editing ? 'Rename category' : 'New category'}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. AI & ML"
            required
            className="admin-input"
          />
        </div>
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="admin-primary-btn"
          style={{ padding: '0.75rem 1.5rem', whiteSpace: 'nowrap' }}
        >
          {busy ? 'Saving…' : editing ? 'Save' : 'Add'}
        </button>
        {editing && (
          <button
            type="button"
            onClick={cancelEdit}
            className="admin-ghost-btn"
          >
            Cancel
          </button>
        )}
      </form>

      {/* List */}
      <div className="admin-card" style={{ overflow: 'hidden' }}>
        {categories.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#52525b' }}>
            No categories yet. Create your first one above.
          </div>
        ) : (
          categories.map((cat, i) => (
            <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: i < categories.length - 1 ? '1px solid #111' : 'none' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{cat.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#52525b', marginTop: '0.15rem' }}>
                  /{cat.slug} · {cat._count?.articles ?? 0} articles
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => startEdit(cat)}
                  className="admin-btn admin-btn-cyan"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(cat)}
                  className="admin-btn admin-btn-red"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}