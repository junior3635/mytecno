'use client';

import { useState } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import DOMPurify from 'isomorphic-dompurify';
import { getBlockDef } from '@/lib/editor/blocks';

const SANITIZE_OPTS = { ADD_ATTR: ['loading'] };

export default function BlockView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const def = getBlockDef(node.attrs.type);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(node.attrs.html);

  function commit() {
    const clean = DOMPurify.sanitize(draft, SANITIZE_OPTS);
    updateAttributes({ html: clean });
    setEditing(false);
  }

  const displayHtml = DOMPurify.sanitize(node.attrs.html, SANITIZE_OPTS);

  return (
    <NodeViewWrapper
      data-block
      style={{
        margin: '1.25rem 0',
        borderRadius: '0.75rem',
        border: `1px solid ${selected ? '#00f2fe' : '#27272a'}`,
        background: '#0d0d0d',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          padding: '0.4rem 0.75rem',
          background: '#111',
          borderBottom: '1px solid #1f1f1f',
        }}
      >
        <span
          style={{
            fontSize: '0.65rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#00f2fe',
          }}
        >
          {def.label}
        </span>
        <span style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          {editing ? (
            <>
              <button
                type="button"
                onClick={commit}
                className="admin-btn admin-btn-cyan"
                style={{ textTransform: 'uppercase' }}
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(node.attrs.html);
                  setEditing(false);
                }}
                className="admin-btn admin-btn-grey"
                style={{ textTransform: 'uppercase' }}
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setDraft(node.attrs.html);
                setEditing(true);
              }}
              className="admin-btn admin-btn-grey"
              style={{ textTransform: 'uppercase' }}
            >
              Edit HTML
            </button>
          )}
          <button type="button" onClick={deleteNode} className="admin-btn admin-btn-red" title="Remove block">
            Remove
          </button>
        </span>
      </div>

      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={Math.max(6, draft.split('\n').length + 2)}
          spellCheck={false}
          className="admin-input"
          style={{
            margin: '0.75rem',
            width: 'calc(100% - 1.5rem)',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            lineHeight: 1.6,
            resize: 'vertical',
          }}
        />
      ) : (
        <div style={{ padding: '0.75rem', cursor: 'text' }}>
          <div
            className={def.cls}
            style={{ margin: 0 }}
            dangerouslySetInnerHTML={{ __html: displayHtml }}
          />
        </div>
      )}
    </NodeViewWrapper>
  );
}