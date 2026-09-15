import type { ModelOption, ProviderId } from './types';

// Pure client-safe metadata shared with the admin UI. No SDK imports here.

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  gemini: 'Gemini',
  anthropic: 'Anthropic Claude',
  openai: 'OpenAI',
};

export const AI_PROVIDERS: { id: ProviderId; label: string; description: string }[] = [
  { id: 'gemini', label: 'Google Gemini', description: 'Gemini text models with Imagen 3 image generation.' },
  { id: 'anthropic', label: 'Anthropic Claude', description: 'Claude for long-form writing. No native image generation.' },
  { id: 'openai', label: 'OpenAI GPT', description: 'GPT text models with gpt-image-1 image generation.' },
];

export const PROVIDER_DEFAULT_KEY_FIELD: Record<ProviderId, 'geminiApiKey' | 'anthropicApiKey' | 'openaiApiKey'> = {
  gemini: 'geminiApiKey',
  anthropic: 'anthropicApiKey',
  openai: 'openaiApiKey',
};

export const PROVIDER_DEFAULT_ENV_KEY: Record<ProviderId, string> = {
  gemini: 'GEMINI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
};

export const PROVIDER_DEFAULT_TEXT_MODELS: Record<ProviderId, string> = {
  gemini: 'gemini-3.6-flash',
  anthropic: 'claude-sonnet-4-5',
  openai: 'gpt-5.2',
};

export const PROVIDER_MODELS: Record<ProviderId, ModelOption[]> = {
  gemini: [
    { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash', kind: 'text' },
    { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', kind: 'text' },
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', kind: 'text' },
    { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', kind: 'text' },
    { id: 'imagen-3.0-generate-001', label: 'Imagen 3', kind: 'image' },
  ],
  anthropic: [
    { id: 'claude-sonnet-4-5', label: 'Claude 4.5 Sonnet', kind: 'text' },
    { id: 'claude-haiku-4-5', label: 'Claude 4.5 Haiku', kind: 'text' },
    { id: 'claude-opus-4-1', label: 'Claude 4.1 Opus', kind: 'text' },
  ],
  openai: [
    { id: 'gpt-5.2', label: 'GPT-5.2', kind: 'text' },
    { id: 'gpt-5.2-mini', label: 'GPT-5.2 mini', kind: 'text' },
    { id: 'gpt-4.1', label: 'GPT-4.1', kind: 'text' },
    { id: 'gpt-image-1', label: 'GPT Image 1', kind: 'image' },
  ],
};

export function imageModelFor(providerId: ProviderId): string | null {
  const model = PROVIDER_MODELS[providerId]?.find((m) => m.kind === 'image');
  return model?.id ?? null;
}

// Image-generation pipeline options (client-safe metadata).
// provider ids: auto | gemini | openai | stock | none
export const IMAGE_PROVIDER_OPTIONS: { id: string; label: string; description: string }[] = [
  {
    id: 'auto',
    label: 'Auto',
    description: 'Use the article provider when it can generate images; otherwise try Gemini (Imagen), then OpenAI (GPT Image).',
  },
  {
    id: 'gemini',
    label: 'Gemini (Imagen)',
    description: 'Always use Imagen 3 for article images, regardless of the text provider.',
  },
  {
    id: 'openai',
    label: 'OpenAI (GPT Image)',
    description: 'Always use GPT Image for article images, regardless of the text provider.',
  },
  {
    id: 'stock',
    label: 'Stock photos',
    description: 'Serve curated photos from the bundled library. No AI or API key needed.',
  },
  {
    id: 'none',
    label: 'None',
    description: 'Disable image generation entirely; only the fallback is used.',
  },
];

export type ImageStyleKey = 'editorial' | 'neon' | 'minimal' | 'cinematic';

export const IMAGE_STYLES: { key: ImageStyleKey; label: string; hint: string; tail: string }[] = [
  {
    key: 'editorial',
    label: 'Editorial neutral',
    hint: 'Balanced, realistic, professional news photography.',
    tail:
      'Clean editorial photography for a professional news site. Balanced natural light, realistic subjects, muted yet sophisticated palette, shallow depth of field, no decorative clutter.',
  },
  {
    key: 'neon',
    label: 'Neon tech',
    hint: 'Dark surfaces with cyan and magenta accents.',
    tail:
      'High-tech digital aesthetic. Dark background, vibrant cyan and magenta neon accents, futuristic UI elements and abstract tech visualizations, cinematic lighting, photorealistic render quality.',
  },
  {
    key: 'minimal',
    label: 'Minimal',
    hint: 'One clear subject, lots of negative space.',
    tail:
      'Minimalist composition. Lots of negative space, a single clear subject, soft studio lighting, neutral pastel palette, extremely clean and uncluttered.',
  },
  {
    key: 'cinematic',
    label: 'Cinematic',
    hint: 'Dramatic lighting and filmic color grade.',
    tail:
      'Cinematic editorial look. Dramatic key lighting, filmic color grade, strong contrast, detailed realistic environments.',
  },
];

export function imageStyleTail(key: string | null | undefined): string {
  return IMAGE_STYLES.find((s) => s.key === key)?.tail ?? IMAGE_STYLES[0].tail;
}

export function imageStyleLabel(key: string | null | undefined): string {
  return IMAGE_STYLES.find((s) => s.key === key)?.label ?? IMAGE_STYLES[0].label;
}