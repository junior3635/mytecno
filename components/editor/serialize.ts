import type { Editor } from '@tiptap/react';
import { DOMSerializer } from '@tiptap/pm/model';
import { getBlockDef } from '@/lib/editor/blocks';

// Serializes a TipTap editor back into the article's stored HTML.
// Custom blocks are rendered as placeholder <div> elements by renderHTML,
// so this walks the actual document (in document order) and rebuilds each
// placeholder into its real wrapper (<tag class="cls">innerHtml</tag>).
export function serializeEditorHtml(editor: Editor): string {
  const container = document.createElement('div');
  container.appendChild(DOMSerializer.fromSchema(editor.schema).serializeFragment(editor.state.doc.content));

  const byId = new Map<string, { type: string; html: string }>();
  editor.state.doc.descendants((node) => {
    if (node.type.name === 'block') {
      byId.set(node.attrs.id as string, {
        type: node.attrs.type as string,
        html: node.attrs.html as string,
      });
    }
  });

  container.querySelectorAll('[data-block-id]').forEach((element) => {
    const id = element.getAttribute('data-block-id');
    const attrs = id ? byId.get(id) : undefined;
    if (!attrs) return;

    const def = getBlockDef(attrs.type);
    const wrapper = document.createElement(def.tag);
    wrapper.setAttribute('class', def.cls);
    wrapper.appendChild(document.createRange().createContextualFragment(attrs.html));
    element.replaceWith(wrapper);
  });

  return container.innerHTML;
}