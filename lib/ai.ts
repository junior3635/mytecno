import prisma from '@/lib/db';
import type { AiSettings, Provider, ProviderId } from '@/lib/ai/types';
import { PROVIDERS, parseModelSpec } from '@/lib/ai/providers';
import { buildArticleImagePrompt, buildArticleMetadataPrompt, buildArticlePrompt } from '@/lib/ai/prompts';
import { PROVIDER_LABELS } from '@/lib/ai/models';

export { PROVIDERS, parseModelSpec } from '@/lib/ai/providers';
export type { Provider, ProviderId } from '@/lib/ai/types';

const DEFAULTS: AiSettings = {
  aiProvider: 'gemini',
  aiModel: 'gemini-3.6-flash',
  geminiApiKey: undefined,
  anthropicApiKey: undefined,
  openaiApiKey: undefined,
};

// API key is resolved at request time: SiteSettings.<provider>ApiKey wins, env var as fallback.
async function getSettings(): Promise<AiSettings> {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'global' } });
    if (!settings) return DEFAULTS;
    return {
      aiProvider: settings.aiProvider || DEFAULTS.aiProvider,
      aiModel: settings.aiModel || DEFAULTS.aiModel,
      geminiApiKey: settings.geminiApiKey,
      anthropicApiKey: settings.anthropicApiKey,
      openaiApiKey: settings.openaiApiKey,
    };
  } catch {
    return DEFAULTS;
  }
}

function resolveProvider(settings: AiSettings, modelSpec?: string | null): { provider: Provider; model: string } {
  const { providerId: prefixedProvider, model: specModel } = parseModelSpec(modelSpec);
  const provider =
    PROVIDERS[(prefixedProvider ?? settings.aiProvider) as ProviderId] ?? PROVIDERS.gemini;
  const model = specModel || settings.aiModel || provider.defaultModel;
  return { provider, model };
}

async function resolveApiKey(provider: Provider): Promise<string> {
  const settings = await getSettings();
  const dbKey = settings[provider.dbKeyField];
  const key = dbKey || process.env[provider.envKey];
  if (!key) {
    throw new Error(
      `${provider.label} API key not configured. Set ${provider.envKey} in .env or add it in Settings.`
    );
  }
  return key;
}

export function classifyError(error: unknown, providerId: ProviderId = 'gemini'): Error {
  const label = PROVIDER_LABELS[providerId] ?? 'AI';
  const message = error instanceof Error ? error.message : 'Unknown error';

  if (/API key not valid|API_KEY_INVALID|invalid api key|incorrect api key|authentication failed|invalid_api_key|401/i.test(message)) {
    return new Error(`Invalid ${label} API key. Check your key in Settings or .env.`);
  }
  if (/quota|rate limit|RESOURCE_EXHAUSTED|insufficient_quota|429/i.test(message)) {
    return new Error(`${label} rate limit hit. Wait a moment and try again.`);
  }
  if (/network|fetch failed|ECONNREFUSED|socket hang up|timeout/i.test(message)) {
    return new Error(`Network error while contacting the ${label} API. Try again.`);
  }
  return new Error(`${label} API error: ${message}`);
}

function placeholderImage(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#000000"/>
        <stop offset="50%" stop-color="#0a0a1a"/>
        <stop offset="100%" stop-color="#001a1a"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#g)"/>
    <circle cx="1100" cy="80" r="200" fill="#00f2fe" opacity="0.05"/>
    <circle cx="100" cy="550" r="150" fill="#fe0979" opacity="0.05"/>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// Generates the article HTML + structured image-metadata JSON payload.
export async function generateTechArticle(topic: string, model?: string) {
  const settings = await getSettings();
  const { provider, model: resolvedModel } = resolveProvider(settings, model);
  const apiKey = await resolveApiKey(provider);

  try {
    const raw = await provider.generateText({
      apiKey,
      model: resolvedModel,
      prompt: buildArticlePrompt(topic),
    });
    if (!raw || !raw.trim()) throw new Error('Empty response from the model');
    return raw;
  } catch (error) {
    throw classifyError(error, provider.id);
  }
}

export async function generateArticleMetadata(topic: string, content: string, model?: string) {
  const settings = await getSettings();
  const { provider, model: resolvedModel } = resolveProvider(settings, model);
  const apiKey = await resolveApiKey(provider);

  try {
    const raw = await provider.generateText({
      apiKey,
      model: resolvedModel,
      prompt: buildArticleMetadataPrompt(topic, content),
    });

    // Parse the JSON output (stripping any markdown code block formatting)
    const text = raw || '';
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: `Ultimate Guide to ${topic}`,
      description: `Read our comprehensive and engaging tech review on ${topic}. Learn everything you need to know today.`,
    };
  }
}

export async function generateImage(prompt: string): Promise<string> {
  const settings = await getSettings();
  const { provider } = resolveProvider(settings, null);
  const imageModel = provider.models.find((m) => m.kind === 'image');

  if (!provider.generateImage || !imageModel) {
    // Provider has no image generation (e.g. Claude) — use the placeholder.
    return placeholderImage();
  }

  const apiKey = await resolveApiKey(provider);
  try {
    return await provider.generateImage({ apiKey, prompt, model: imageModel.id });
  } catch (error) {
    console.warn('Image generation failed, using fallback:', error);
    return placeholderImage();
  }
}

export async function generateArticleImage(topic: string, title: string): Promise<string> {
  return generateImage(buildArticleImagePrompt(topic, title));
}