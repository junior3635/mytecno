'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import ImageUploader from '@/components/image-uploader';
import { BlockExtension } from './block-extension';
import { serializeEditorHtml } from './serialize';
import { BLOCK_DEFS, getBlockDef, uid, type BlockType } from '@/lib/editor/blocks';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  label,
  title,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      style={{
        minWidth: '2rem',
        height: '2rem',
        padding: '0 0.5rem',
        background: active ? 'rgba(0, 242, 254, 0.15)' : 'transparent',
        border: `1px solid ${active ? '#00f2fe' : '#27272a'}`,
        borderRadius: '0.5rem',
        color: active ? '#00f2fe' : '#a1a1aa',
        fontWeight: 700,
        fontSize: '0.85rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {label}
    </button>
  );
}

const accentTitle = (t: string) => t.toUpperCase();

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [uploaderOpen, setUploaderOpen] = useState(false);
  const [insertOpen, setInsertOpen] = useState(false);
  const insertWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!insertOpen) return;
    function onClick(e: MouseEvent) {
      if (!insertWrapRef.current?.contains(e.target as Node)) setInsertOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setInsertOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [insertOpen]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, autolink: false }),
      BlockExtension,
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(serializeEditorHtml(editor)),
    onSelectionUpdate: () => forceUpdate(),
    onTransaction: () => forceUpdate(),
  });

  useEffect(() => {
    if (!editor) return;
    const handler = () => forceUpdate();
    editor.on('transaction', handler);
    return () => {
      editor.off('transaction', handler);
    };
  }, [editor]);

  if (!editor) {
    return (
      <div
        style={{
          height: '320px',
          border: '1px solid #1f1f1f',
          borderRadius: '0.75rem',
          background: '#0d0d0d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#52525b',
          fontSize: '0.85rem',
        }}
      >
        Loading editor…
      </div>
    );
  }

  const ed = editor;

  function insertBlock(type: string) {
    const def = getBlockDef(type);
    ed.chain().focus().insertContent({ type: 'block', attrs: { id: uid(), type, html: def.template } }).run();
  }

  function handleUploaded(files: { url: string; alt?: string }[]) {
    setUploaderOpen(false);
    if (files.length === 0) return;
    for (const file of files) {
      const html =
        `<figure class="article-image"><img src="${file.url}" alt="${(file.alt ?? '').replace(/"/g, '&quot;')}" loading="lazy"><figcaption></figcaption></figure>`;
      ed.chain().focus().insertContent({ type: 'block', attrs: { id: uid(), type: 'image' as BlockType, html } }).run();
    }
  }

  function openSource() {
    setSourceText(serializeEditorHtml(ed));
    setSourceOpen(true);
  }

  function applySource() {
    ed.chain().focus().setContent(sourceText).run();
    setSourceOpen(false);
  }

  function setLink() {
    const prev = ed.getAttributes('link').href as string | undefined;
    const href = window.prompt('Link URL', prev ?? 'https://');
    if (href === null) return;
    if (href.trim() === '') {
      ed.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    ed
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: href.trim(), target: '_blank', rel: 'noopener noreferrer' })
      .run();
  }

  const blockOptions = BLOCK_DEFS.filter((b) => b.type !== 'image');

  return (
    <div
      style={{
        border: '1px solid #1f1f1f',
        borderRadius: '0.75rem',
        background: '#0d0d0d',
        overflow: 'hidden',
      }}
    >
      {/* Toolbar */}
      {!sourceOpen && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            flexWrap: 'wrap',
            padding: '0.5rem 0.75rem',
            background: '#111',
            borderBottom: '1px solid #1f1f1f',
          }}
        >
          <ToolbarButton
            title={accentTitle('Bold')}
            label="B"
            active={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            title={accentTitle('Italic')}
            label="I"
            active={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            title={accentTitle('Underline')}
            label="U"
            active={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          />
          <ToolbarButton
            title={accentTitle('Strikethrough')}
            label="S"
            active={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          />
          <span style={{ width: '1px', height: '1.25rem', background: '#27272a', margin: '0 0.25rem' }} />
          <ToolbarButton
            title={accentTitle('Heading 2')}
            label="H2"
            active={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          />
          <ToolbarButton
            title={accentTitle('Heading 3')}
            label="H3"
            active={editor.isActive('heading', { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          />
          <span style={{ width: '1px', height: '1.25rem', background: '#27272a', margin: '0 0.25rem' }} />
          <ToolbarButton
            title={accentTitle('Bullet list')}
            label="•◦"
            active={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            title={accentTitle('Numbered list')}
            label="1."
            active={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
          <ToolbarButton
            title={accentTitle('Blockquote')}
            label="❝"
            active={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          />
          <ToolbarButton
            title={accentTitle('Link')}
            label="⛓"
            active={editor.isActive('link')}
            onClick={setLink}
          />
          <span style={{ width: '1px', height: '1.25rem', background: '#27272a', margin: '0 0.25rem' }} />
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="admin-btn admin-btn-grey"
            title="Undo"
          >
            ↶
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="admin-btn admin-btn-grey"
            title="Redo"
          >
            ↷
          </button>
          <span style={{ marginLeft: 'auto', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <button type="button" onClick={() => setUploaderOpen(true)} className="admin-ghost-btn">
              Upload image
            </button>
            <div ref={insertWrapRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setInsertOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={insertOpen}
                className="admin-ghost-btn"
              >
                ＋ Insert
              </button>
              {insertOpen && (
                <ul
                  aria-label="Insert block"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.4rem)',
                    right: 0,
                    width: '300px',
                    maxHeight: '360px',
                    overflowY: 'auto',
                    margin: 0,
                    padding: '0.35rem',
                    listStyle: 'none',
                    background: '#111',
                    border: '1px solid #27272a',
                    borderRadius: '0.75rem',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.55)',
                    zIndex: 40,
                  }}
                >
                  {blockOptions.map((b) => (
                    <li key={b.type}>
                      <button
                        type="button"
                        onClick={() => {
                          insertBlock(b.type);
                          setInsertOpen(false);
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          background: 'transparent',
                          border: 'none',
                          borderLeft: '3px solid transparent',
                          borderRadius: '0.5rem',
                          padding: '0.55rem 0.75rem',
                          cursor: 'pointer',
                          transition: 'background-color .15s, border-color .15s',
                        }}
                        className="block-menu-option"
                      >
                        <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#e4e4e7' }}>
                          {b.label}
                        </span>
                        {b.hint && (
                          <span style={{ display: 'block', fontSize: '0.72rem', color: '#71717a', marginTop: '0.1rem' }}>
                            {b.hint}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button type="button" onClick={openSource} className="admin-ghost-btn">
              Source
            </button>
          </span>
        </div>
      )}

      {/* Source mode */}
      {sourceOpen ? (
        <div style={{ padding: '0.75rem' }}>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            rows={22}
            spellCheck={false}
            className="admin-input"
            style={{ fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: 1.6, resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button type="button" onClick={applySource} className="admin-btn admin-btn-cyan" style={{ textTransform: 'uppercase' }}>
              Apply HTML
            </button>
            <button type="button" onClick={() => setSourceOpen(false)} className="admin-btn admin-btn-grey" style={{ textTransform: 'uppercase' }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <EditorContent
          editor={editor}
          style={{
            padding: '1.25rem',
            minHeight: '320px',
            outline: 'none',
          }}
        />
      )}

      {uploaderOpen && <ImageUploader onUploaded={handleUploaded} onClose={() => setUploaderOpen(false)} multiple />}
    </div>
  );
}