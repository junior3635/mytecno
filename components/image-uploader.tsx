'use client';

import { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export interface UploadedImage {
  url: string;
  alt?: string;
}

interface UploadItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'uploading' | 'done' | 'error';
  url?: string;
  alt: string;
}

const MAX_SIZE = 8 * 1024 * 1024;

interface ImageUploaderProps {
  onUploaded: (files: UploadedImage[]) => void;
  onClose: () => void;
  multiple?: boolean;
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ImageUploader({ onUploaded, onClose, multiple = true }: ImageUploaderProps) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const valid = accepted.filter((f) => f.type.startsWith('image/') && f.size <= MAX_SIZE);
      if (accepted.length !== valid.length) {
        setError('Some files were skipped (must be images up to 8 MB).');
      }
      if (valid.length === 0) return;

      const entries: UploadItem[] = valid.map((file) => ({
        id: makeId(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'uploading',
        alt: '',
      }));
      setItems(entries);
      setUploading(true);
      setError(null);

      const form = new FormData();
      valid.forEach((f) => form.append('files', f));

      try {
        const res = await fetch('/api/uploads', { method: 'POST', body: form });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body?.error || 'Upload failed');

        const urls: string[] = body.files.map((f: { url: string }) => f.url);
        setItems((prev) =>
          prev.map((item, i) => ({
            ...item,
            status: 'done',
            url: urls[i],
            alt: item.file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
          }))
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Upload failed. Try again.');
        setItems((prev) => prev.map((item) => ({ ...item, status: 'error' as const })));
      } finally {
        setUploading(false);
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple,
    maxSize: MAX_SIZE,
  });

  const selected = useMemo(() => items.filter((i) => i.status === 'done'), [items]);

  function insertAll() {
    onUploaded(selected.map((i) => ({ url: i.url!, alt: i.alt })));
  }

  function updateAlt(id: string, alt: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, alt } : i)));
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        zIndex: 100,
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: 'min(680px, 100%)',
          maxHeight: '86vh',
          overflow: 'auto',
          background: '#0a0a0a',
          border: '1px solid #1a1a1a',
          borderRadius: '1rem',
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Upload images</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close uploader"
            className="admin-btn admin-btn-grey"
            style={{ fontSize: '1rem', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        <div
          {...getRootProps()}
          style={{
            border: `1.5px dashed ${isDragActive ? '#00f2fe' : '#27272a'}`,
            borderRadius: '0.75rem',
            padding: '2rem 1rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: isDragActive ? 'rgba(0, 242, 254, 0.05)' : 'transparent',
            transition: 'border-color 0.15s',
          }}
        >
          <input {...getInputProps()} />
          <div style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
            {isDragActive ? 'Drop the images here…' : 'Drag & drop images, or click to browse'}
          </div>
          <div style={{ color: '#52525b', fontSize: '0.75rem', marginTop: '0.4rem' }}>JPG, PNG, GIF or WebP · up to 8 MB each</div>
        </div>

        {error && (
          <div style={{ color: '#fe0979', fontSize: '0.8rem', marginTop: '0.75rem' }}>{error}</div>
        )}

        {items.length > 0 && (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {items.map((item) => (
              <div key={item.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.status === 'done' ? item.url : item.previewUrl}
                  alt={item.alt || 'Preview'}
                  style={{
                    width: '72px',
                    height: '48px',
                    objectFit: 'cover',
                    borderRadius: '0.5rem',
                    border: '1px solid #27272a',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  {item.status === 'done' ? (
                    <input
                      className="admin-input"
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                      value={item.alt}
                      onChange={(e) => updateAlt(item.id, e.target.value)}
                      placeholder="Alternative text (alt)"
                    />
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: item.status === 'error' ? '#fe0979' : '#a1a1aa' }}>
                      {item.status === 'uploading' ? `Uploading ${item.file.name}…` : `Failed: ${item.file.name}`}
                    </div>
                  )}
                </div>
                {item.status === 'done' && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-cyan"
                    onClick={() => onUploaded([{ url: item.url!, alt: item.alt }])}
                  >
                    Insert
                  </button>
                )}
              </div>
            ))}

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              {selected.length > 1 && (
                <button type="button" onClick={insertAll} className="admin-primary-btn" style={{ fontSize: '0.75rem', padding: '0.6rem 1.25rem' }}>
                  Insert all ({selected.length})
                </button>
              )}
            </div>
          </div>
        )}

        {items.length === 0 && <div style={{ height: '0.5rem' }} />}
        {uploading && (
          <div style={{ color: '#00f2fe', fontSize: '0.8rem', marginTop: '0.75rem' }}>Uploading…</div>
        )}
      </div>
    </div>
  );
}