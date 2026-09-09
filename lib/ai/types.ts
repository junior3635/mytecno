export type ProviderId = 'gemini' | 'anthropic' | 'openai';

export type ProviderKeyField = 'geminiApiKey' | 'anthropicApiKey' | 'openaiApiKey';

export type ModelKind = 'text' | 'image';

export interface ModelOption {
  id: string;
  label: string;
  kind: ModelKind;
}

export interface GenerateTextOptions {
  apiKey: string;
  prompt: string;
  model?: string;
}

export interface GenerateImageOptions {
  apiKey: string;
  prompt: string;
  model?: string;
}

export interface Provider {
  id: ProviderId;
  label: string;
  description: string;
  defaultModel: string;
  envKey: string;
  dbKeyField: ProviderKeyField;
  models: ModelOption[];
  generateText(options: GenerateTextOptions): Promise<string>;
  generateImage?(options: GenerateImageOptions): Promise<string>;
}

export interface AiSettings {
  aiProvider: string;
  aiModel: string;
  geminiApiKey?: string | null;
  anthropicApiKey?: string | null;
  openaiApiKey?: string | null;
}