export function buildArticlePrompt(topic: string): string {
  return `Act as a senior technology journalist, SEO editor, and web content designer.

Create a complete, engaging, visually appealing, and SEO-optimized article about the following topic:

TOPIC: "${topic}"

OBJECTIVE:
Write a professional technology article that provides useful, accurate, and easy-to-understand information. The article must satisfy the reader's search intent and present the topic with a modern editorial structure.

GENERAL RULES:
- Write the entire article in clear, natural English.
- Use a professional but conversational tone.
- Do not invent facts, statistics, dates, product specifications, sources, names, or URLs.
- If information is uncertain or unavailable, avoid presenting it as a confirmed fact.
- Explain technical terms when necessary.
- Do not repeat the same ideas.
- Do not include an <h1> tag because the title will be handled separately.
- Return only the HTML body content.
- Do not include <html>, <head>, <body>, <title>, Markdown, JavaScript, or CSS.
- Do not include explanations outside the HTML.
- Make sure all HTML tags are properly opened and closed.

ARTICLE STRUCTURE:

1. Introduction

Start with an engaging introduction that:
- Explains what the topic is.
- Describes why it matters.
- Identifies the main problem, opportunity, product, technology, or trend.
- Naturally includes the primary keyword.

Use this structure:

<div class="article-intro">
  <p>[Engaging introduction]</p>
</div>

2. Quick Summary

Add a short summary near the beginning:

<div class="article-summary">
  <p><strong>In summary:</strong> [Summarize the main idea in two or three sentences.]</p>
</div>

3. Main Content

- Use between 4 and 7 descriptive <h2> headings.
- Use <h3> headings when additional organization is necessary.
- Make sure every section adds new information.
- Include practical examples, use cases, or real-world applications when relevant.
- Use short paragraphs of two to four sentences.
- Use <ul> or <ol> lists when they improve readability.
- Use an HTML table when comparing products, features, benefits, limitations, costs, or alternatives.
- Use <strong> sparingly to highlight important concepts.
- Maintain a logical flow from basic information to more advanced details.

4. Advantages and Limitations

Include a balanced section covering:
- Main advantages or benefits.
- Disadvantages, risks, or limitations.
- Who can benefit from the technology or topic.
- Situations where it may not be the best option.

Use this exact structure:

<div class="pros-cons">
  <div class="pros">
    <h3>Advantages</h3>
    <ul>
      <li>[Advantage]</li>
    </ul>
  </div>

  <div class="cons">
    <h3>Limitations</h3>
    <ul>
      <li>[Limitation]</li>
    </ul>
  </div>
</div>

5. Relevant Images

Include between 3 and 5 images placed naturally throughout the article.

Each image must be directly related to the section where it appears. Do not use generic technology images, unrelated people, random computer screens, or decorative stock photos.

For every image:
- Clearly represent a specific idea discussed in the article.
- Use a unique visual concept.
- Do not repeat the same composition.
- Include descriptive and natural alternative text.
- Include a concise caption.
- Include a detailed image-generation prompt.
- Do not include unreadable text inside the image.
- Do not include random logos, trademarks, or unrelated brand elements.
- Use a professional technology editorial style.
- Use a horizontal 16:9 aspect ratio unless another ratio is more appropriate.

Use this exact HTML structure:

<figure class="article-image">
  <img
    src="[IMAGE_URL_OR_GENERATED_IMAGE]"
    alt="[Precise description of the image]"
    loading="lazy">
  <figcaption>[Short caption explaining what the image represents]</figcaption>
</figure>

IMPORTANT: Do NOT embed image prompts inside the HTML. The HTML must only contain the figure element. For every image, register its metadata in the output JSON "images" array (see IMAGE METADATA section at the end).

Each image prompt must describe:
- The main subject.
- The relevant environment or context.
- The visual composition.
- Lighting and color palette.
- Camera angle or perspective when appropriate.
- Editorial or realistic visual style.
- A 16:9 aspect ratio.
- No unnecessary text.
- No unrelated objects.
- No watermarks.

IMPORTANT IMAGE RULE:
The image prompt must describe the exact idea discussed in the nearby section. For example, an article about cloud security should use images related to cloud infrastructure, data protection, authentication, or cybersecurity—not a generic laptop or random office scene.

6. Visual Content Elements

When appropriate, include one or more of the following:
- A key fact box.
- A step-by-step list.
- A comparison table.
- A highlighted quote.
- A recommendation box.
- A warning or important-notice box.

Example:

<div class="key-fact">
  <h3>Key Fact</h3>
  <p>[Relevant and specific information]</p>
</div>

For comparisons, use this structure:

<table class="comparison-table">
  <thead>
    <tr>
      <th>Feature</th>
      <th>Option A</th>
      <th>Option B</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>[Feature]</td>
      <td>[Information]</td>
      <td>[Information]</td>
    </tr>
  </tbody>
</table>

7. Frequently Asked Questions

Include between 3 and 5 relevant questions related to "${topic}".

Use this structure:

<section class="faq">
  <h2>Frequently Asked Questions</h2>

  <div class="faq-item">
    <h3>[Question]</h3>
    <p>[Clear and direct answer]</p>
  </div>
</section>

8. Conclusion

End with a useful conclusion that:
- Summarizes the main points.
- Explains what the reader should consider.
- Provides a practical final recommendation.
- Does not repeat the introduction word for word.

Use this structure:

<div class="article-conclusion">
  <h2>Final Thoughts</h2>
  <p>[Useful and concise conclusion]</p>
</div>

SEO REQUIREMENTS:
- Identify one primary keyword related to "${topic}".
- Identify several relevant secondary and semantic keywords.
- Use the primary keyword naturally in the introduction, at least one <h2>, one image alt attribute, and the conclusion.
- Do not use keyword stuffing.
- Write descriptive headings that match the reader's search intent.
- Use related terminology naturally.
- Do not invent links.
- Only include internal links if URLs are provided below:

INTERNAL LINK 1: [URL or leave empty]
INTERNAL LINK 2: [URL or leave empty]
INTERNAL LINK 3: [URL or leave empty]

DESIGN REQUIREMENTS:
Use the following CSS classes to support a modern article layout:

- article-intro
- article-summary
- article-image
- image-prompt
- key-fact
- pros-cons
- pros
- cons
- comparison-table
- faq
- faq-item
- article-conclusion

The article must:
- Have a clear visual hierarchy.
- Alternate paragraphs with lists, tables, highlighted boxes, and images.
- Avoid long uninterrupted blocks of text.
- Never place two images directly next to each other.
- Use consistent formatting.
- Avoid excessive bold text.
- Avoid emojis unless specifically requested.
- Be suitable for direct insertion into a website article container.

FINAL QUALITY CHECK:
Before returning the result, verify that:
- The entire article is written in English.
- The article focuses exclusively on "${topic}".
- Every image is directly related to the nearby section.
- Every image has accurate alt text.
- Every image has a specific and useful generation prompt.
- The HTML is valid and properly closed.
- No <h1> tag is included.
- No Markdown is included.
- No unsupported facts or invented URLs are included.
- The content is not repetitive.
- The layout is visually balanced.
- The images array contains one metadata object for every figure in the HTML, in the same order.

IMAGE METADATA SECTION:

Collect the metadata for every image of the article. Each metadata object MUST use exactly this JSON schema:

{
  "image_id": "image-1",
  "section": "Name of the section where the image appears",
  "purpose": "What concept from the article the image represents",
  "alt": "Descriptive alternative text for the <img> tag",
  "caption": "Short caption for the <figcaption> tag",
  "prompt": "Detailed prompt for the image-generation model",
  "aspect_ratio": "16:9",
  "style": "professional technology editorial"
}

Rules for this metadata:
- image_id values must be sequential, starting at "image-1".
- section must match the related <h2> heading.
- purpose must describe the exact idea from the nearby text.
- alt and caption must match the corresponding <figure> in the HTML.
- prompt must follow the image prompt rules described above.
- aspect_ratio must normally be "16:9".
- style must normally be "professional technology editorial".

FINAL OUTPUT FORMAT:

Return ONLY a single JSON object with this exact structure:

{
  "html": "[The complete article HTML body, with <img src="[IMAGE_URL_OR_GENERATED_IMAGE]"> placeholders for every image]",
  "images": [
    {
      "image_id": "image-1",
      "section": "...",
      "purpose": "...",
      "alt": "...",
      "caption": "...",
      "prompt": "...",
      "aspect_ratio": "16:9",
      "style": "..."
    }
  ]
}

The "html" value must contain only the article HTML (no <h1>, no Markdown, no comments). The "images" array must contain one object per image, in the same order the figures appear in "html". The image "prompt" fields must NOT appear inside the HTML.`;
}

export function buildArticleMetadataPrompt(topic: string, content: string): string {
  return `Based on the following article content, generate a catchy, click-worthy title (max 60 characters) and a compelling SEO meta description (max 155 characters). 
  Respond in strict JSON format like this: {"title": "The Title", "description": "The description"}.
  
  Topic: ${topic}
  
  Content:
  ${content.substring(0, 1000)}... (truncated)`;
}

export function buildArticleImagePrompt(topic: string, title: string): string {
  return `A stunning, high-tech, ultra-modern digital illustration for a technology news article titled "${title}" about "${topic}".
  Style: sleek dark background, vibrant neon accents (cyan and magenta), futuristic UI elements, abstract tech visualization, photorealistic render quality, 16:9 widescreen format, cinematic lighting.
  No text, no watermarks, no logos.`;
}