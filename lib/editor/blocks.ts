export type BlockType =
  | 'intro'
  | 'summary'
  | 'key-fact'
  | 'pros-cons'
  | 'comparison-table'
  | 'faq'
  | 'quote'
  | 'ad'
  | 'conclusion'
  | 'image';

export interface BlockDef {
  type: BlockType;
  tag: string;
  cls: string;
  label: string;
  hint?: string;
  template: string;
}

export const BLOCK_DEFS: BlockDef[] = [
  {
    type: 'intro',
    tag: 'div',
    cls: 'article-intro',
    label: 'Intro paragraph',
    hint: 'Opening hook for the article',
    template: '<div class="article-intro"><p>Enter the opening of the article here…</p></div>',
  },
  {
    type: 'summary',
    tag: 'div',
    cls: 'article-summary',
    label: 'Quick summary',
    hint: 'TL;DR box at the top',
    template:
      '<div class="article-summary"><p><strong>In summary:</strong> Summarize the main idea in two or three sentences.</p></div>',
  },
  {
    type: 'key-fact',
    tag: 'div',
    cls: 'key-fact',
    label: 'Key fact',
    hint: 'One number or stat worth highlighting',
    template: '<div class="key-fact"><h3>Key Fact</h3><p>Add a relevant and specific fact here.</p></div>',
  },
  {
    type: 'pros-cons',
    tag: 'div',
    cls: 'pros-cons',
    label: 'Pros / cons',
    hint: 'Side-by-side advantages and limitations',
    template:
      '<div class="pros-cons"><div class="pros"><h3>Advantages</h3><ul><li>Add an advantage</li></ul></div><div class="cons"><h3>Limitations</h3><ul><li>Add a limitation</li></ul></div></div>',
  },
  {
    type: 'comparison-table',
    tag: 'table',
    cls: 'comparison-table',
    label: 'Comparison table',
    hint: 'Feature-by-feature tabular comparison',
    template:
      '<table class="comparison-table"><thead><tr><th>Feature</th><th>Option A</th><th>Option B</th></tr></thead><tbody><tr><td>…</td><td>…</td><td>…</td></tr></tbody></table>',
  },
  {
    type: 'faq',
    tag: 'section',
    cls: 'faq',
    label: 'FAQ section',
    hint: 'Question-and-answer pairs',
    template:
      '<section class="faq"><h2>Frequently Asked Questions</h2><div class="faq-item"><h3>Question</h3><p>Clear and direct answer.</p></div></section>',
  },
  {
    type: 'quote',
    tag: 'figure',
    cls: 'pull-quote',
    label: 'Pull quote',
    hint: 'A line worth pulling out and highlighting',
    template:
      '<figure class="pull-quote"><blockquote>Write the line worth pulling out here…</blockquote></figure>',
  },
  {
    type: 'ad',
    tag: 'div',
    cls: 'ad-slot-insert',
    label: 'Ad placement',
    hint: 'Inline ad rendered by AdSlot on publish',
    template: '<div class="ad-slot-insert"></div>',
  },
  {
    type: 'conclusion',
    tag: 'div',
    cls: 'article-conclusion',
    label: 'Conclusion',
    hint: 'Wrap-up and final recommendation',
    template:
      '<div class="article-conclusion"><h2>Final Thoughts</h2><p>Summarize the main points and offer a practical final recommendation.</p></div>',
  },
  {
    type: 'image',
    tag: 'figure',
    cls: 'article-image',
    label: 'Image with caption',
    template:
      '<figure class="article-image"><img src="/uploads/placeholder.jpg" alt="Describe the image" loading="lazy"><figcaption>Short caption for the image.</figcaption></figure>',
  },
];

const byType = new Map<string, BlockDef>(BLOCK_DEFS.map((d) => [d.type, d]));

export function getBlockDef(type: string): BlockDef {
  return byType.get(type) ?? byType.get('conclusion')!;
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `blk-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}