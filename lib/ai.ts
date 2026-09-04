import { GoogleGenAI } from '@google/genai';
import prisma from '@/lib/db';

// The API key is resolved at request time: SiteSettings.geminiApiKey wins, env var as fallback.
async function resolveApiKey(): Promise<string | undefined> {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'global' } });
    if (settings?.geminiApiKey) return settings.geminiApiKey;
  } catch {
    // DB unavailable — fall back to env var below
  }
  return process.env.GEMINI_API_KEY || undefined;
}

async function getAi(): Promise<GoogleGenAI> {
  const apiKey = await resolveApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Set GEMINI_API_KEY in .env or add it in Settings.');
  }
  return new GoogleGenAI({ apiKey });
}

function classifyError(error: unknown): Error {
  const message = error instanceof Error ? error.message : 'Unknown error';

  if (/API key not valid|API_KEY_INVALID|invalid api key/i.test(message)) {
    return new Error('Invalid Gemini API key. Check your key in Settings or .env.');
  }
  if (/quota|rate limit|RESOURCE_EXHAUSTED|429/i.test(message)) {
    return new Error('Gemini rate limit hit. Wait a moment and try again.');
  }
  if (/network|fetch failed|ECONNREFUSED|socket hang up|timeout/i.test(message)) {
    return new Error('Network error while contacting the Gemini API. Try again.');
  }
  return new Error(`Gemini API error: ${message}`);
}

export async function generateTechArticle(topic: string, model = 'gemini-3.6-flash') {
  const prompt = `You are an expert technology journalist. Write a comprehensive, SEO-optimized article about "${topic}".
  The article should be engaging, well-structured, and use HTML formatting (e.g. <h2>, <p>, <strong>, <ul>).
  Do not include the <h1> tag, as the title will be handled separately.
  Return only the HTML content for the body of the article.`;

  try {
    const ai = await getAi();
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    throw classifyError(error);
  }
}

export async function generateArticleMetadata(topic: string, content: string, model = 'gemini-3.6-flash') {
  const prompt = `Based on the following article content, generate a catchy, click-worthy title (max 60 characters) and a compelling SEO meta description (max 155 characters). 
  Respond in strict JSON format like this: {"title": "The Title", "description": "The description"}.
  
  Topic: ${topic}
  
  Content:
  ${content.substring(0, 1000)}... (truncated)`;

  try {
    const ai = await getAi();
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    // Parse the JSON output (stripping any markdown code block formatting)
    const text = response.text || '';
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

export async function generateArticleImage(topic: string, title: string): Promise<string> {
  const prompt = `A stunning, high-tech, ultra-modern digital illustration for a technology news article titled "${title}" about "${topic}". 
  Style: sleek dark background, vibrant neon accents (cyan and magenta), futuristic UI elements, abstract tech visualization, photorealistic render quality, 16:9 widescreen format, cinematic lighting. 
  No text, no watermarks, no logos.`;

  try {
    const ai = await getAi();
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-001',
      prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '16:9',
      },
    });

    const imageData = response.generatedImages?.[0]?.image?.imageBytes;
    if (imageData) {
      return `data:image/jpeg;base64,${imageData}`;
    }
    throw new Error('No image data returned');
  } catch (error) {
    console.warn('Image generation failed, using fallback:', error);
    // Fallback: return an SVG data URL as a gradient placeholder
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
}