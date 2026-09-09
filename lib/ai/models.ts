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