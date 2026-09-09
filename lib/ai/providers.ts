import { GoogleGenAI } from '@google/genai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import type { Provider, ProviderId } from './types';
import { AI_PROVIDERS, PROVIDER_DEFAULT_ENV_KEY, PROVIDER_DEFAULT_KEY_FIELD, PROVIDER_DEFAULT_TEXT_MODELS, PROVIDER_MODELS } from './models';

function meta(id: ProviderId) {
  const entry = AI_PROVIDERS.find((p) => p.id === id);
  return {
    label: entry?.label ?? id,
    description: entry?.description ?? '',
    defaultModel: PROVIDER_DEFAULT_TEXT_MODELS[id],
    envKey: PROVIDER_DEFAULT_ENV_KEY[id],
    dbKeyField: PROVIDER_DEFAULT_KEY_FIELD[id],
    models: PROVIDER_MODELS[id],
  };
}

export const geminiProvider: Provider = {
  id: 'gemini',
  ...meta('gemini'),
  async generateText({ apiKey, prompt, model }) {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: model ?? PROVIDER_DEFAULT_TEXT_MODELS.gemini,
      contents: prompt,
    });
    return response.text ?? '';
  },
  async generateImage({ apiKey, prompt, model }) {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateImages({
      model: model ?? 'imagen-3.0-generate-001',
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });
    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
    if (!imageBytes) throw new Error('No image data returned');
    return `data:image/jpeg;base64,${imageBytes}`;
  },
};

export const anthropicProvider: Provider = {
  id: 'anthropic',
  ...meta('anthropic'),
  async generateText({ apiKey, prompt, model }) {
    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: model ?? PROVIDER_DEFAULT_TEXT_MODELS.anthropic,
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    });
    return response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');
  },
};

export const openaiProvider: Provider = {
  id: 'openai',
  ...meta('openai'),
  async generateText({ apiKey, prompt, model }) {
    const client = new OpenAI({ apiKey });
    const response = await client.chat.completions.create({
      model: model ?? PROVIDER_DEFAULT_TEXT_MODELS.openai,
      messages: [{ role: 'user', content: prompt }],
    });
    return response.choices[0]?.message?.content ?? '';
  },
  async generateImage({ apiKey, prompt, model }) {
    const client = new OpenAI({ apiKey });
    const response = await client.images.generate({
      model: model ?? 'gpt-image-1',
      prompt,
      n: 1,
      size: '1536x1024',
    });
    const image = response.data?.[0];
    if (!image) throw new Error('No image data returned');

    if (image.b64_json) {
      return `data:image/png;base64,${Buffer.from(image.b64_json, 'base64').toString('base64')}`;
    }
    if (image.url) {
      const fetched = await fetch(image.url);
      const mime = fetched.headers.get('content-type') ?? 'image/png';
      const buffer = Buffer.from(await fetched.arrayBuffer());
      return `data:${mime};base64,${buffer.toString('base64')}`;
    }
    throw new Error('No image data returned');
  },
};

export const PROVIDERS: Record<ProviderId, Provider> = {
  gemini: geminiProvider,
  anthropic: anthropicProvider,
  openai: openaiProvider,
};

export function isProviderId(value: string): value is ProviderId {
  return value in PROVIDERS;
}

export function parseModelSpec(spec?: string | null): { providerId?: ProviderId; model: string } {
  if (!spec || spec.length === 0) return { model: '' };
  const separator = spec.indexOf(':');
  if (separator === -1) return { model: spec };
  const prefix = spec.slice(0, separator);
  if (isProviderId(prefix)) {
    return { providerId: prefix, model: spec.slice(separator + 1) };
  }
  return { model: spec };
}