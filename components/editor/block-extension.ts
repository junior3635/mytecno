import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { BLOCK_DEFS, uid, type BlockType } from '@/lib/editor/blocks';
import BlockView from './custom-block';

export const BlockExtension = Node.create({
  name: 'block',
  group: 'block',
  atom: true,
  defining: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-block-id'),
        renderHTML: (attributes) => ({ 'data-block-id': attributes.id }),
      },
      type: {
        default: 'conclusion',
        parseHTML: () => null,
        renderHTML: (attributes) => ({ 'data-block-type': attributes.type }),
      },
      html: {
        default: '',
        parseHTML: () => null,
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return BLOCK_DEFS.map((def) => ({
      tag: `${def.tag}.${def.cls}`,
      priority: 80,
      getAttrs: (element) => ({
        id: uid(),
        type: def.type as BlockType,
        html: (element as HTMLElement).innerHTML,
      }),
    }));
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BlockView);
  },
});