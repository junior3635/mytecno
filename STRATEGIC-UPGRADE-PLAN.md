# Strategic Upgrade Plan: MyTechNews AI News Generation System

> Version 1.0 — September 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Best Practices Framework](#2-best-practices-framework)
3. [Visual & UX Improvements (End-User)](#3-visual--ux-improvements-end-user)
4. [Admin Panel Enhancements](#4-admin-panel-enhancements)
5. [News Generation Methodology](#5-news-generation-methodology)
6. [Decoupled Image Generation Pipeline](#6-decoupled-image-generation-pipeline)
7. [Implementation Phases](#7-implementation-phases)
8. [Risk Mitigation](#8-risk-mitigation)

---

## 1. Executive Summary

MyTechNews is a Next.js 16 / Prisma / SQLite application that generates AI-written articles via a multi-provider pipeline (Gemini, Anthropic, OpenAI). The system already separates text generation from image generation but lacks rigor in editorial quality control, has a fragmented CSS architecture (globals.css + pervasive inline styles), a disconnected TipTap editor, and no fact-verification layer. This plan upgrades every dimension—ethical AI practices, visual design, admin tooling, and generation methodology—into a cohesive, production-grade system.

---

## 2. Best Practices Framework

### 2.1 Ethical AI & Bias Mitigation

| Practice | Current State | Target State |
|---|---|---|
| Bias detection | None | Post-generation bias scan via a lightweight classifier prompt that flags political, gender, or cultural slant |
| Source attribution | Prompt says "don't invent facts" | Mandatory inline citation slots in `StoredImageMeta`-style structure; each claim block carries a `source` or `confidence` field |
| Transparency | No disclosure | Visible "AI-generated" badge on every article; `meta` tag `<meta name="ai-generated" content="true">` |
| Content guardrails | Prompt-level only | Two-layer: (1) prompt instructions, (2) post-generation regex/pattern scan for hallucinated URLs, fake quotes, and unverifiable statistics |
| Sensitive topic escalation | None | Category-based flag: articles in politics/health/finance auto-queue for human review regardless of `autoPublish` |

**Implementation in `lib/ai/prompts.ts`:**
- Add a `"verification"` section to the structured JSON contract returned by the model, requiring `[{ claim, confidence: "high"|"medium"|"low", source? }]`.
- Add a post-generation function `verifyArticleClaims(article)` in `lib/ai/verification.ts` that:
  - Rejects claims with `confidence: "low"` and no `source`
  - Flags hallucinated URLs via a regex + HEAD-request check (non-blocking, background)
  - Writes results to a new `ClaimVerification` log for editorial review

### 2.2 Factual Accuracy Pipeline

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐     ┌──────────┐
│ AI Generate  │────▶│ Parse + Validate │────▶│ Claim Extractor │────▶│ DB/Queue │
│ (text only)  │     │ (existing)       │     │ (new)           │     │          │
└─────────────┘     └──────────────────┘     └─────────────────┘     └──────────┘
                                                                       │
                                                                       ▼
                                                              ┌─────────────────┐
                                                              │ Editorial Review │
                                                              │ (admin dashboard)│
                                                              └─────────────────┘
```

1. **Claim Extraction Prompt** — A second AI call (same provider, cheaper model) parses the article HTML and extracts factual claims into structured JSON.
2. **Confidence Scoring** — Each claim gets a confidence score. Low-confidence claims are highlighted in the admin editor with yellow/red indicators.
3. **URL Verification** — Background job uses `HEAD` requests to verify any URLs present in the article; broken links are flagged.
4. **Editorial Override** — Admin can mark claims as "verified", "corrected", or "removed" before publishing.

### 2.3 SEO Excellence

| Area | Enhancement | Files Affected |
|---|---|---|
| Sitemap | Fix hardcoded `example.com` in `robots.txt`; read from `SiteSettings.siteUrl` dynamically | `public/robots.txt`, `app/sitemap.ts` |
| Structured data | Add `FAQPage` schema for articles with FAQ sections; add `BreadcrumbList` schema | `app/(site)/article/[slug]/page.tsx` |
| Meta completeness | Auto-generate `og:video` for articles with embedded video; add `hreflang` for potential i18n | Layout metadata, article page |
| Internal linking | AI prompt instructs to reference 2–3 existing articles by slug (fetched from DB as context) | `lib/ai/prompts.ts`, `app/api/generate/route.ts` |
| Readability | Enforce Flesch-Kincaid grade 8–12 in post-generation check; flag overly complex sentences | New `lib/ai/readability.ts` |
| Image SEO | All generated images get descriptive `alt` text from the image metadata contract; WebP/AVIF via `next/image` | Already partially done; extend to body images |

### 2.4 Content Quality Standards

**Prompt Engineering Rigor (`lib/ai/prompts.ts`):**
- Replace freeform instructions with a versioned prompt template system
- Each prompt version is stored in `SiteSettings.promptVersion` for reproducibility
- Prompt includes: target word count range, required editorial blocks (intro, summary, H2s, FAQ, pros/cons), tone guidelines per category, mandatory anti-hallucination rules
- Output schema is enforced with a JSON Schema validator (e.g., `zod`) before parsing

---

## 3. Visual & UX Improvements (End-User)

### 3.1 Design System Overhaul

**Problem:** The codebase has a dual personality—a well-tokenized CSS custom property system in `globals.css` coexisting with hundreds of inline `style={{...}}` objects that bypass tokens entirely.

**Solution:** Migrate to CSS Modules with a shared token layer.

```
app/
├── globals.css          # Tokens only (~200 lines: colors, spacing, typography, shadows)
├── components/
│   ├── ArticleCard/
│   │   ├── ArticleCard.module.css
│   │   └── ArticleCard.tsx
│   ├── Header/
│   │   ├── Header.module.css
│   │   └── Header.tsx
│   └── ...
```

**Migration strategy:**
1. Extract all inline styles into co-located `.module.css` files, mapping values to existing CSS custom properties
2. Eliminate `style={{}}` from components in phases (start with highest-traffic: article cards, article page, header)
3. Add ESLint rule `@next/next/no-inline-styles` to prevent regression

### 3.2 Typography & Layout Refresh

| Element | Current | Proposed |
|---|---|---|
| Headings | Fraunces (serif), variable weight | Keep Fraunces; tighten letter-spacing on H1/H2; add optical size axis |
| Body | Space Grotesk | Keep Space Grotesk; increase line-height to 1.7 for readability; add `text-wrap: balance` on headings |
| Article width | Fixed max-width | Fluid: `max(65ch, min(90vw, 720px))` for optimal reading measure |
| Category accent | 6 static colors | Extend to gradient accents per category; use `color-mix()` for hover states |
| Dark mode | `data-theme="dark"` toggle | Refine contrast ratios; add `color-scheme: dark` for native scrollbar/form styling |

### 3.3 Mobile Responsiveness

**Current gaps identified:**
- Article page TOC is sticky but doesn't collapse on small screens
- Category nav in header overflows horizontally without scroll indication
- Home page lead + rail layout doesn't stack properly below 768px
- Admin panel sidebar doesn't have a hamburger toggle on mobile

**Proposed fixes:**
```
Breakpoints (CSS custom properties):
  --bp-sm: 480px    (phone landscape)
  --bp-md: 768px    (tablet)
  --bp-lg: 1024px   (desktop)
  --bp-xl: 1280px   (wide)
```

- **Header:** Hamburger menu below `--bp-md`; category nav becomes a horizontal scroll with fade indicators
- **Article page:** TOC collapses into a floating "Table of Contents" button that opens a slide-over panel below `--bp-lg`
- **Home layout:** Single-column feed below `--bp-md`; lead story takes full width; rail items become a horizontal scroll carousel
- **Images:** All `<img>` in article body wrapped in a responsive container with `aspect-ratio` preservation and lazy loading

### 3.4 Accessibility (WCAG 2.2 AA)

| Requirement | Action |
|---|---|
| Color contrast | Audit all token combinations; ensure 4.5:1 for body text, 3:1 for large text/UI components |
| Focus management | Visible focus rings on all interactive elements (already has `:focus-visible`; verify completeness) |
| Skip navigation | Add "Skip to main content" link in `app/layout.tsx` |
| ARIA landmarks | Ensure `<main>`, `<nav>`, `<aside>` are properly labeled; article page gets `article` landmark |
| Reduced motion | Extend `prefers-reduced-motion` to disable: ticker animation, reading progress bar, image hover effects |
| Keyboard navigation | TOC links navigable via arrow keys; share dropdown accessible without mouse |
| Alt text | All generated images have descriptive `alt` from metadata; decorative images get `alt=""` |
| Screen reader | Announce article load completion; live region for generation queue status in admin |

### 3.5 Dynamic Multimedia Integration

**Image optimization (article body):**
- Currently, body images are raw `<img>` inside `dangerouslySetInnerHTML` HTML strings
- **Solution:** Post-process article HTML to wrap `<img>` tags in a `<figure>` component rendered by a Reactrehook that parses the HTML and replaces `<img>` with optimized `<ArticleImage>` components using `next/image`
- Add blur placeholder generation for all uploaded images via `sharp` (build-time or on-upload)

**New multimedia features:**
- **Video embeds:** AI can request video placeholders in the image metadata contract (`kind: "video"`); admin can paste YouTube/Vimeo URLs into these slots
- **Image galleries:** Support `kind: "gallery"` metadata for multi-image sections (e.g., "Top 5 phones" → gallery of 5 images)
- **Interactive elements:** FAQ sections rendered with `<details>/<summary>` for progressive disclosure
- **Reading time dynamically:** Calculate from word count, not hardcoded; show "X min read" with a book icon

### 3.6 Engagement Boosters

| Feature | Implementation |
|---|---|
| Reading progress | Already exists; refine to show percentage + estimated time remaining |
| Related articles | Already exists; add "Based on your reading history" section using localStorage data |
| Newsletter CTA | Already exists; add exit-intent popup (client-side, cookie-gated to show once per session) |
| Social proof | "X readers today" counter on article pages (from `PageView` aggregate) |
| Article reactions | Emoji reaction bar (👍🔥💡) stored in localStorage + aggregated server-side for display |
| Estimated read time | Calculate dynamically from content word count |

---

## 4. Admin Panel Enhancements

### 4.1 Intuitive Content Moderation

**Current state:** Comments have approve/delete; articles are draft/published binary.

**Proposed moderation workflow:**

```
┌──────────┐    ┌───────────┐    ┌──────────────┐    ┌───────────┐
│ Generated │───▶│ AI Review  │───▶│ Human Review  │───▶│ Published │
│ (draft)   │    │ (auto)     │    │ (manual)      │    │           │
└──────────┘    └───────────┘    └──────────────┘    └───────────┘
                      │                   │
                      ▼                   ▼
                 ┌──────────┐      ┌───────────┐
                 │ Flagged   │      │ Rejected   │
                 │ (review)  │      │ (archived) │
                 └──────────┘      └───────────┘
```

**Admin moderation queue page (`/admin/moderation`):**
- Unified inbox showing: articles pending review, flagged comments, low-confidence claims
- Each item shows: AI confidence score, claim verification status, bias scan results
- Batch actions: approve all verified, reject all low-confidence, send back for regeneration
- Inline editing: fix a claim directly in the moderation view without entering the full editor

**Article states expansion:**
```typescript
type ArticleStatus = 
  | "draft"        // Generated but not reviewed
  | "in_review"    // Sent to moderation queue
  | "needs_edit"   // Flagged for specific fixes
  | "approved"     // Cleared for publishing
  | "published"    // Live on site
  | "archived"     // Removed from public view
```

### 4.2 Advanced Analytics

**Current state:** Basic 30-day view chart and most-read list in `/admin/growth`.

**Proposed analytics dashboard (`/admin/analytics`):**

| Metric | Visualization | Data Source |
|---|---|---|
| Page views over time | Interactive line chart (7/30/90/365 day ranges) | `PageView` table |
| Category performance | Stacked bar chart (views per category per day) | `PageView` + `Article.categorySlug` |
| AI generation stats | Success rate, average generation time, provider breakdown | `Log` table + new `GenerationMetric` model |
| Content quality | Average claim confidence, articles needing review | New `ClaimVerification` data |
| SEO health | Articles missing SEO title/desc, broken internal links | Computed from `Article` fields |
| Subscriber growth | Line chart with trend projection | `Subscriber.createdAt` |
| Top referrers | Horizontal bar chart | New `Referrer` field on `PageView` (from `Referer` header) |
| Reading completion | % of readers who reach the end (scroll depth tracking) | New client-side scroll depth beacon |

**New Prisma model for analytics:**
```prisma
model GenerationMetric {
  id          Int      @id @default(autoincrement())
  articleId   Int
  provider    String
  model       String
  textTokens  Int      @default(0)
  imageTokens Int      @default(0)
  durationMs  Int      @default(0)
  success     Boolean  @default(true)
  errorType   String?
  createdAt   DateTime @default(now())
}
```

### 4.3 Flexible Scheduling

**Current state:** Articles are either draft or published immediately. No scheduling.

**Proposed scheduling system:**

1. **Add `publishAt` field to `Article`:**
   ```prisma
   model Article {
     // ... existing fields
     publishAt  DateTime?
     publishedAt DateTime?
   }
   ```

2. **Scheduler service (`lib/scheduler.ts`):**
   - Runs as a Next.js background task (or a simple cron via `setInterval` on server start)
   - Every 60 seconds, checks for articles where `publishAt <= now() AND isPublished = false`
   - Auto-publishes them, revalidates paths, logs the action
   - Admin UI shows a calendar/time picker in the article editor for scheduling

3. **Bulk scheduling:** Admin can select multiple draft articles and assign publish times in sequence (e.g., "publish these 5 articles, one every 2 hours")

4. **Recurring content:** Template-based scheduled generation (e.g., "Generate a daily tech news roundup at 8 AM")

### 4.4 User Role Management

**Current state:** Single `User` model with no roles.

**Proposed RBAC:**

```prisma
enum UserRole {
  ADMIN       // Full access
  EDITOR      // Can edit, publish, moderate
  AUTHOR      // Can create drafts, edit own articles
  VIEWER      // Read-only dashboard access
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String
  name      String?
  role      UserRole @default(ADMIN)
  avatar    String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Permission matrix:**

| Action | ADMIN | EDITOR | AUTHOR | VIEWER |
|---|---|---|---|---|
| Generate articles | ✅ | ✅ | ✅ | ❌ |
| Publish articles | ✅ | ✅ | ❌ | ❌ |
| Edit any article | ✅ | ✅ | ❌ | ❌ |
| Edit own articles | ✅ | ✅ | ✅ | ❌ |
| Moderate comments | ✅ | ✅ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ | ❌ |
| Change settings | ✅ | ❌ | ❌ | ❌ |
| View analytics | ✅ | ✅ | ✅ (own) | ✅ (limited) |
| Delete articles | ✅ | ✅ | ❌ | ❌ |

**Middleware update:** Extend `middleware.ts` to check `user.role` against route-level permissions. Add a `withRole(roles: UserRole[])` HOC for API routes.

### 4.5 Customizable Templates

**Current state:** AI generation uses a single prompt template with category context.

**Proposed template system:**

1. **Template model:**
   ```prisma
   model ArticleTemplate {
     id          Int      @id @default(autoincrement())
     name        String
     slug        String   @unique
     category    String?
     promptExtra String   // Additional prompt instructions appended to base
     structure   String   // JSON: required blocks, word counts, tone
     imageStyle  String   @default("editorial")
     isActive    Boolean  @default(true)
     createdAt   DateTime @default(now())
     updatedAt   DateTime @updatedAt
   }
   ```

2. **Admin template editor (`/admin/templates`):**
   - Visual builder: drag-and-drop required sections (intro, stats box, FAQ, pros/cons, etc.)
   - Tone selector: formal, conversational, technical, listicle
   - Category binding: templates auto-selected based on article category
   - Preview: generate a sample article from the template before saving

3. **Template selection in generator:** Admin picks a template (or "auto") when generating; the template's `promptExtra` and `structure` are injected into `buildArticlePrompt`.

---

## 5. News Generation Methodology

### 5.1 AI Information Synthesis Architecture

**Current flow:**
```
User topic → Single AI call → JSON parse → Draft article
```

**Proposed enhanced flow:**
```
User topic + category + template
         │
         ▼
┌─────────────────────────┐
│ 1. CONTEXT GATHERING     │
│    - Fetch recent articles │
│      from same category   │
│    - Fetch trending topics │
│    - Fetch existing slugs  │
│      for internal linking  │
└─────────┬───────────────┘
          ▼
┌─────────────────────────┐
│ 2. OUTLINE GENERATION    │
│    - AI produces section  │
│      outline with H2s    │
│    - Admin reviews/approves│
│      (optional fast-track)│
└─────────┬───────────────┘
          ▼
┌─────────────────────────┐
│ 3. CONTENT GENERATION    │
│    - Full article from    │
│      approved outline     │
│    - Structured JSON with │
│      claims + citations   │
│    - Brand voice enforcement│
└─────────┬───────────────┘
          ▼
┌─────────────────────────┐
│ 4. QUALITY GATE           │
│    - Claim verification   │
│    - Bias scan            │
│    - Readability check    │
│    - SEO validation       │
└─────────┬───────────────┘
          ▼
┌─────────────────────────┐
│ 5. IMAGE GENERATION       │
│    (SEPARATE - see §6)    │
└─────────┬───────────────┘
          ▼
┌─────────────────────────┐
│ 6. EDITORIAL REVIEW       │
│    - Human approves/edits │
│    - Publish              │
└─────────────────────────┘
```

### 5.2 Brand Voice Maintenance

**Voice definition (stored in `SiteSettings`):**
```typescript
interface BrandVoice {
  tone: "professional" | "conversational" | "technical" | "authoritative";
  formality: number;        // 0-100 (0=casual, 100=formal)
  sentenceLength: "short" | "medium" | "long" | "varied";
  vocabulary: "simple" | "moderate" | "technical";
  personality: string[];    // e.g., ["informed", "balanced", "forward-looking"]
  avoidPhrases: string[];   // e.g., ["in conclusion", "it goes without saying"]
  exampleParagraphs?: string; // Few-shot examples for the AI
}
```

**Voice enforcement:**
1. Brand voice config is injected into every prompt as a "Writing Style" section
2. Post-generation voice audit: a second AI call scores the article against the voice profile (1-10 per dimension)
3. Articles scoring below 7/10 on any dimension are flagged for rewrite or manual editing
4. Admin can override voice per-article (e.g., breaking news = more urgent tone)

### 5.3 Prompt Engineering Framework

**Structured prompt architecture (`lib/ai/prompts.ts`):**

```typescript
interface PromptTemplate {
  version: string;                    // e.g., "v3.2"
  systemPrefix: string;               // Role + brand voice + rules
  contextSection: string;             // Existing articles, trending, category info
  structureSection: string;           // Required blocks, word count, format
  outputSchema: string;               // JSON contract with validation rules
  imageMetadataSchema: string;        // Image contract (separate from text)
  antiHallucination: string;          // Fact-checking instructions
  internalLinks?: string;             // Suggested articles to reference
}
```

**Key prompt engineering principles:**

1. **Chain-of-thought for complex topics:** For investigative/analytical articles, prompt includes "Think step by step about the key facts before writing"
2. **Structured output validation:** Use Zod schema to validate the AI's JSON response before processing; retry with error context if validation fails
3. **Dynamic context injection:** Recent articles from the same category are included as "context" to avoid repetition and enable internal linking
4. **Negative prompting:** Explicit list of what NOT to do (no invented quotes, no fake statistics, no clickbait headers)
5. **Temperature control:** Different temperature per article type (news = 0.3 for accuracy, opinion = 0.7 for creativity)
6. **Model selection intelligence:** Route to cheaper/faster models for simple listicles, premium models for deep analysis

### 5.4 Quality Assurance Pipeline

```typescript
// lib/ai/quality-gate.ts (new file)
interface QualityCheck {
  name: string;
  threshold: number;
  weight: number;
}

const QUALITY_CHECKS: QualityCheck[] = [
  { name: "claim_confidence", threshold: 0.7, weight: 3 },
  { name: "bias_score", threshold: 0.3, weight: 2 },
  { name: "readability_grade", threshold: 12, weight: 1 },
  { name: "seo_score", threshold: 80, weight: 2 },
  { name: "voice_match", threshold: 7, weight: 2 },
  { name: "word_count", threshold: 800, weight: 1 },
  { name: "heading_structure", threshold: 3, weight: 1 },  // min H2 count
];

async function runQualityGate(article: ParsedArticle): Promise<QualityResult> {
  const results = await Promise.all(QUALITY_CHECKS.map(check => runCheck(check, article)));
  const weightedScore = results.reduce((sum, r) => sum + r.normalizedScore * r.check.weight, 0);
  const maxWeight = QUALITY_CHECKS.reduce((sum, c) => sum + c.weight, 0);
  const overallScore = (weightedScore / maxWeight) * 100;
  
  return {
    overallScore,
    passed: overallScore >= 70,
    checks: results,
    flags: results.filter(r => !r.passed).map(r => r.check.name),
  };
}
```

---

## 6. Decoupled Image Generation Pipeline

### 6.1 Architecture: Text First, Images After

This is the **core architectural principle** of the system. Images are never generated during the initial article creation. This separation exists because:

1. **Content drives visuals:** The final text determines what images are needed, where they go, and what they should depict
2. **Cost efficiency:** Failed text generation doesn't waste image API credits
3. **Editorial control:** Humans can review/adjust text before spending image credits
4. **Retry independence:** Image generation can be retried per-image without re-generating text

**Current implementation (already partially in place):**
- `POST /api/generate` creates article with `imageMeta` containing prompts but no actual images
- `Article.featuredImage` is `null` on creation
- Body `<img>` srcs are set to `/pending-image.svg`
- `POST /api/articles/[id]/images` triggers image generation separately

**Proposed enhancements to solidify this pattern:**

### 6.2 Enhanced Image Metadata Contract

```typescript
interface ImageMetadata {
  imageId: string;          // Unique ID within the article
  section: string;          // Which H2 section this belongs to
  purpose: "hero" | "inline" | "diagram" | "comparison" | "gallery";
  alt: string;              // Descriptive alt text (required for accessibility)
  caption: string;          // Optional caption shown below image
  prompt: string;           // AI image generation prompt
  aspectRatio: "16:9" | "4:3" | "1:1" | "3:2";
  style: ImageStyle;        // Visual style preset
  status: "pending" | "generating" | "done" | "error" | "skipped";
  url?: string;             // Filled after generation
  error?: string;           // Error message if failed
  retries: number;          // Attempt count
  generatedAt?: DateTime;
}
```

### 6.3 Prompt Engineering for Image Generation

**The image prompt is the bridge between editorial content and visual output.** The quality of the image depends entirely on the prompt quality.

**Image prompt construction pipeline:**

```
┌──────────────────┐
│ Article context   │  ← Title, category, tone, section heading
└────────┬─────────┘
         ▼
┌──────────────────┐
│ Section analysis  │  ← What is this section about? What visual would help?
└────────┬─────────┘
         ▼
┌──────────────────┐
│ Prompt template   │  ← Category-specific base prompt + style suffix
└────────┬─────────┘
         ▼
┌──────────────────┐
│ Style application │  ← Neon/editorial/minimal/cinematic overlay
└────────┬─────────┘
         ▼
┌──────────────────┐
│ Final prompt      │  ← Ready for AI image model
└──────────────────┘
```

**Prompt engineering rules for images:**

1. **Contextual anchoring:** Every image prompt must reference the specific article section it accompanies
   ```
   Bad:  "A futuristic cityscape"
   Good: "A minimalist infographic showing cloud computing market growth,
          with ascending bar charts in teal and white, matching the
          article's section on cloud infrastructure expansion"
   ```

2. **Brand consistency:** All prompts include a style suffix from `IMAGE_STYLES` that enforces visual consistency:
   ```typescript
   const IMAGE_STYLES = {
     editorial: "clean editorial photography style, professional lighting, muted color palette with teal accents",
     neon: "cyberpunk neon aesthetic, dark background with glowing teal and purple highlights, tech illustration style",
     minimal: "flat design illustration, minimal detail, soft gradients, brand color palette",
     cinematic: "cinematic composition, dramatic lighting, shallow depth of field, warm tones",
   };
   ```

3. **Negative prompting:** Include what to avoid to prevent common AI image artifacts:
   ```
   "Do not include text, watermarks, or logos. Avoid photorealistic human faces.
    No blurry or distorted elements. Clean composition only."
   ```

4. **Aspect ratio awareness:** Prompt includes aspect ratio context:
   ```
   "Compose for a wide 16:9 format with the main subject offset to the left
    following the rule of thirds."
   ```

5. **Category-specific vocabulary:** Each category has a visual vocabulary map:
   ```typescript
   const CATEGORY_VISUALS = {
     technology: ["circuit boards", "data streams", "holographic displays", "server rooms"],
     food: ["fresh ingredients", "kitchen preparation", "plated dishes", "warm lighting"],
     finance: ["stock charts", "modern office", "digital currency", "analytical dashboards"],
     health: ["medical equipment", "wellness", "clinical setting", "nature + science"],
   };
   ```

### 6.4 Image Generation Workflow (Server-Side)

**Endpoint: `POST /api/articles/[id]/images`**

```
Request: { only?: string[], includeHero?: boolean }
Rate limit: 30/hour per admin

Pipeline:
1. Load article + imageMeta from DB
2. Filter to requested images (or all pending)
3. For each image (max 2 concurrent):
   a. Build prompt via buildImagePrompt(meta, article.category, style)
   b. Call configured provider (Imagen 3 / GPT-Image-1 / stock)
   c. On success:
      - Save to /public/uploads/{slug}-{index}.{ext}
      - Update imageMeta status to "done", set url
      - Replace corresponding <img src="/pending-image.svg"> in article HTML
   d. On failure:
      - Increment retries
      - If retries < 3, retry with a simplified prompt
      - If retries >= 3, try stock fallback (if enabled)
      - If all fail, set status to "error", keep placeholder
4. Update article in DB with modified content + imageMeta
5. Revalidate article page
6. Return updated article with image URLs
```

### 6.5 Editorial Visual Oversight

**Admin image review interface (enhanced edit page):**

| Feature | Description |
|---|---|
| Image preview grid | Shows all article images (hero + inline) in a grid with status badges |
| Regenerate per-image | Click any image to regenerate just that one with an editable prompt |
| Style override | Change the style preset per-image (e.g., hero = cinematic, inline = minimal) |
| Stock fallback toggle | Enable/disable stock image fallback per-image |
| Prompt editor | Edit the AI prompt before regeneration; see live preview of prompt changes |
| Bulk regenerate | "Regenerate all failed" and "Regenerate all" buttons |
| Image-gallery preview | See all images in article context (scroll the article with images overlaid) |

### 6.6 Image Quality Validation

After generation, each image is validated:

```typescript
interface ImageQualityCheck {
  minFileSizeKB: number;     // Reject tiny/broken images
  maxFileSizeMB: number;     // Cap file size
  requiredFormats: string[]; // jpg, png, webp
  aspectRatioTolerance: number; // Allow 5% deviation from requested
}
```

- Images below 50KB are rejected (likely corrupt/too simple)
- Images above 5MB are rejected (too large for web)
- Aspect ratio mismatch > 10% triggers a warning in admin

---

## 7. Implementation Phases

### Phase 1: Foundation (Weeks 1-3)
- [x] Fix `robots.txt` sitemap URL and add `NEXT_PUBLIC_SITE_URL` to `.env`
- [ ] Add `publishAt` / `publishedAt` fields to Article model + basic scheduler
- [ ] Add `UserRole` enum and extend User model
- [ ] Migrate inline styles to CSS Modules for top 5 highest-traffic components
- [ ] Add claim extraction and verification pipeline (`lib/ai/verification.ts`)
- [ ] Add quality gate scoring (`lib/ai/quality-gate.ts`)
- [x] Add `GenerationMetric` model for analytics

### Phase 2: Admin Power (Weeks 4-6)
- [ ] Build moderation queue page (`/admin/moderation`)
- [ ] Build advanced analytics dashboard (`/admin/analytics`)
- [ ] Build template editor (`/admin/templates`)
- [ ] Wire TipTap editor into article edit form (replace textarea)
- [ ] Add role-based middleware and permission checks
- [ ] Add user management page (`/admin/users`)
- [ ] Implement article scheduling with calendar UI

### Phase 3: Visual Overhaul (Weeks 7-9)
- [ ] Complete CSS Module migration for all components
- [ ] Implement responsive breakpoints across all pages
- [ ] Add skip navigation, ARIA landmarks, keyboard nav
- [ ] Optimize body images with `next/image` via HTML post-processing
- [ ] Add blur placeholders for all images
- [ ] Refine dark mode contrast and add `color-scheme: dark`
- [ ] Add reading time estimation and scroll-depth tracking

### Phase 4: Intelligence (Weeks 10-12)
- [ ] Implement outline generation step in pipeline
- [ ] Add brand voice scoring and enforcement
- [ ] Enhance image prompt engineering with category visuals and negative prompts
- [ ] Add internal linking via context injection
- [ ] Add Flesch-Kincaid readability checking
- [ ] Add FAQ and BreadcrumbList structured data
- [ ] Implement subscriber growth projections in analytics

### Phase 5: Polish & Scale (Weeks 13-16)
- [ ] Database migration from SQLite to PostgreSQL (Prisma schema + migration)
- [ ] External analytics integration (Plausible or similar, privacy-focused)
- [ ] Comment spam protection (rate limiting + CAPTCHA)
- [ ] Image gallery and video embed support
- [ ] Emoji reaction system
- [ ] Exit-intent newsletter popup
- [ ] API route revalidation for category/search/saved pages
- [ ] Repository cleanup (remove dev artifacts, add .gitignore entries)

---

## 8. Risk Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| AI provider outage | Generation halted | Multi-provider fallback chain already exists; add health checks and automatic provider switching |
| Image generation cost overrun | Budget exhaustion | Per-day image generation cap in SiteSettings; stock fallback reduces AI image dependency |
| Prompt injection via user topics | Malicious content | Sanitize topic input; add prompt-injection detection patterns; never use user input directly in system prompts |
| SQLite data loss in production | Article loss | Phase 5 migration to PostgreSQL; regular backups via `prisma db push` + file copy |
| CSS migration regressions | Visual breakage | Visual regression testing (screenshot comparison) for each migrated component |
| Role escalation | Unauthorized access | Server-side role check on every API route; never trust client-side role claims |
| AI-generated misinformation | Reputational damage | Claim verification pipeline + mandatory human review for sensitive categories |

---

*This plan is a living document. Update as implementation progresses.*
