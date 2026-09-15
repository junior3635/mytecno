# MYTECHNEWS — Plan de mejora visual y UX

## 1. Objetivo

Rediseñar MYTECHNEWS para que evolucione de un sitio visualmente enfocado exclusivamente en tecnología hacia una **plataforma editorial moderna, agradable, accesible y preparada para incorporar nuevas verticales**, comenzando por **Food / Comida**.

El objetivo NO es copiar otros sitios. Se deben tomar buenas prácticas de diseño editorial, medios digitales, revistas de tecnología y sitios gastronómicos, creando una identidad propia.

---

# 2. Evaluación del diseño actual

## Lo que funciona

La versión actual ya tiene una identidad visual clara:

- Fondo oscuro.
- Tipografía serif con personalidad editorial.
- Navegación superior sencilla.
- Jerarquía clara entre artículo principal y artículos secundarios.
- Etiquetas de categoría con gradiente.
- Bordes redondeados y tarjetas consistentes.
- Ticker de noticias en la parte superior.
- Diseño que transmite tecnología/premium.

## Problemas principales observados

### 2.1. El diseño es demasiado oscuro

El negro ocupa prácticamente toda la pantalla.

Esto genera una estética premium, pero también puede:

- reducir la sensación de amplitud;
- cansar visualmente en páginas largas;
- hacer que fotografías y contenido general pierdan protagonismo;
- limitar la futura sección de comida.

### 2.2. El Hero depende demasiado del fondo gráfico

El artículo principal actualmente utiliza un patrón oscuro con símbolos.

Para tecnología puede funcionar, pero para un medio editorial general será mejor utilizar:

- fotografía;
- imagen editorial;
- ilustración;
- video/visual;
- o una composición híbrida.

La imagen debe convertirse en parte importante de la identidad del artículo.

### 2.3. Falta una diferenciación clara entre categorías

Actualmente casi todo se percibe como "Technology".

La nueva arquitectura debe permitir reconocer rápidamente:

- Technology
- Food
- News
- Trends
- Guides
- Reviews

sin crear diseños completamente diferentes.

### 2.4. Falta una portada editorial más completa

El Home actual empieza directamente con "Latest in Tech".

Se recomienda crear una verdadera portada:

1. Breaking / Featured story
2. Latest News
3. Technology
4. Food
5. Trending
6. Guides / Reviews
7. Newsletter
8. Footer

### 2.5. Las tarjetas pueden mejorar

Las tarjetas actuales tienen demasiado espacio negro y poco contenido visual.

Introducir:

- imágenes;
- metadata;
- autor;
- fecha;
- tiempo de lectura;
- categoría;
- hover states;
- artículos relacionados.

---

# 3. Nueva identidad visual recomendada

Mantener una identidad editorial premium, pero hacerla más cálida y flexible.

## Dirección visual

Keywords:

- Editorial
- Modern
- Premium
- Clean
- Human
- Accessible
- Sophisticated
- Responsive

Evitar:

- exceso de neón;
- exceso de gradientes;
- apariencia de dashboard;
- demasiadas tarjetas flotantes;
- exceso de efectos.

---

# 4. Sistema de colores

No eliminar completamente el dark mode.

Implementar dos modos:

## Light mode

Base:

- fondo blanco/off-white;
- texto casi negro;
- superficies ligeramente contrastadas;
- bordes suaves.

## Dark mode

Mantener:

- fondo negro/grafito;
- texto blanco;
- superficies ligeramente más claras que el fondo.

## Categorías

Usar colores de acento, no rediseños completos.

Ejemplo:

Technology:
- azul/cyan

Food:
- naranja/coral/rojo cálido

News:
- gris/neutral

Trends:
- púrpura

Reviews:
- verde/azul

El color debe aparecer principalmente en:

- badge;
- pequeños indicadores;
- links;
- iconos;
- estados activos.

No convertir toda la página en un festival de colores.

---

# 5. Tipografía

Mantener una serif editorial para titulares si funciona bien con la marca.

Combinarla con una sans-serif moderna para:

- navegación;
- metadata;
- botones;
- categorías;
- cuerpo de texto cuando corresponda.

Crear un sistema tipográfico consistente:

H1:
- muy grande;
- alto contraste;
- máximo 2–3 líneas.

H2:
- sección editorial.

H3:
- tarjetas.

Body:
- 16–19px aproximadamente;
- line-height cómodo.

Metadata:
- pequeña pero legible.

Evitar texto demasiado pequeño.

---

# 6. Header

Rediseñar el header para que sea más claro y escalable.

Propuesta:

```text
MYTECHNEWS

Home
News
Technology
Food
Guides
Reviews
Search
Theme
```

En desktop:

- logo a la izquierda;
- navegación central;
- acciones a la derecha.

En mobile:

```text
MYTECHNEWS                 ☰
```

El menú móvil debe ser simple y rápido.

## Header sticky

Considerar header sticky al hacer scroll.

No debe ocupar demasiado espacio.

---

# 7. Breaking News Ticker

Mantener el ticker porque aporta sensación de medio de noticias.

Pero mejorarlo:

- altura menor;
- velocidad moderada;
- pausa al pasar el mouse;
- accesible con teclado;
- posibilidad de ocultarlo en mobile;
- no mover demasiado rápido el contenido.

Ejemplo:

```text
BREAKING
Open-source models close the gap...
```

---

# 8. Nuevo Home

El Home debe dejar de parecer únicamente una lista de artículos.

Propuesta:

```text
HEADER
│
├── BREAKING NEWS
│
├── HERO
│   ├── Main Story
│   ├── Secondary Story
│   └── Secondary Story
│
├── LATEST NEWS
│
├── TECHNOLOGY
│
├── FOOD
│
├── TRENDING
│
├── GUIDES / REVIEWS
│
├── NEWSLETTER
│
└── FOOTER
```

---

# 9. Hero principal

Crear una composición editorial.

Ejemplo:

```text
┌─────────────────────────────────────────────┐
│                                             │
│              HERO IMAGE                     │
│                                             │
│  TECHNOLOGY                                 │
│                                             │
│  The future of AI is changing...            │
│                                             │
│  Short summary...                            │
│                                             │
│  Read article →                             │
└─────────────────────────────────────────────┘
```

La imagen debe ocupar una parte significativa del Hero.

Agregar overlay solamente cuando sea necesario para mantener legibilidad.

---

# 10. Sección Technology

Mantener Technology como una de las verticales principales.

Categorías sugeridas:

- AI
- Smartphones
- Gadgets
- Software
- Internet
- Science
- Cybersecurity

Diseño:

```text
TECHNOLOGY                         View all →

[ Large Article ]

[ Article ] [ Article ] [ Article ]
```

---

# 11. Nueva sección FOOD

La sección Food debe sentirse integrada a MYTECHNEWS, pero tener un carácter más humano y visual.

Categorías:

- Recipes
- Restaurants
- Food News
- Cooking
- Drinks
- Food Trends

## Diseño

Utilizar fotografías grandes.

Ejemplo:

```text
FOOD                                  View all →

┌──────────────────────┐ ┌───────────┐
│                      │ │   IMAGE   │
│    LARGE FOOD        │ ├───────────┤
│      PHOTO           │ │ Recipe    │
│                      │ │ Title     │
├──────────────────────┤ └───────────┘
│ Recipe / Restaurant  │
│ Title                │
└──────────────────────┘
```

---

# 12. Recetas

Las recetas deben tener una experiencia específica.

Página:

```text
Food / Recipes

Pasta Creamy Parmesan

Short introduction

★★★★★

30 min
4 servings
Easy

[Large image]

Ingredients

[ ] Pasta
[ ] Parmesan
[ ] Cream
[ ] Garlic

Instructions

1.
2.
3.

Nutrition

Calories
Protein
Carbs
Fat

Related Recipes
```

Preparar el frontend para datos estructurados de Recipe.

---

# 13. Página individual de artículo

Mejorar la lectura.

Estructura:

```text
Category

Article title

Subtitle / summary

Author · Date · Reading time

Hero image

Article content

Share

Related articles
```

Agregar:

- tabla de contenido cuando el artículo sea largo;
- progreso de lectura;
- imágenes dentro del artículo;
- captions;
- pull quotes;
- enlaces relacionados;
- artículos recomendados.

---

# 14. Article Cards

Crear componentes reutilizables.

Variantes:

### Featured Card

Imagen grande + título + resumen.

### Standard Card

Imagen + categoría + título + metadata.

### Compact Card

Título + fecha + categoría.

### Horizontal Card

Imagen izquierda + contenido derecha.

Esto permitirá construir distintas páginas sin duplicar componentes.

---

# 15. Navegación de contenido

Agregar:

- categorías;
- tags;
- búsqueda;
- artículos relacionados;
- más leídos;
- trending;
- latest.

Crear páginas:

```text
/news
/technology
/food
/guides
/reviews
/trending
```

Si existe una estructura SEO definida actualmente, conservar las URLs existentes o implementar redirects antes de cambiarlas.

---

# 16. Búsqueda

Mejorar el buscador actual.

Debe permitir buscar:

```text
Search articles, recipes, reviews...
```

Resultados con:

- imagen;
- título;
- categoría;
- fecha;
- resumen.

Agregar filtros:

```text
All
Technology
Food
Guides
Reviews
```

---

# 17. Responsive Design

El diseño debe ser mobile-first.

Desktop:

- layouts de 2–4 columnas;
- Hero grande;
- navegación completa.

Tablet:

- 2 columnas;
- navegación adaptada.

Mobile:

- una columna;
- imágenes grandes;
- títulos legibles;
- navegación compacta;
- ticker opcional;
- cards sin exceso de padding.

Nunca simplemente reducir el desktop.

Rediseñar la composición para cada breakpoint.

---

# 18. Accesibilidad

Implementar como requisito, no como extra.

Incluir:

- WCAG AA como objetivo;
- contraste adecuado;
- focus states;
- navegación por teclado;
- alt text;
- botones accesibles;
- labels para iconos;
- respetar `prefers-reduced-motion`;
- tamaños de texto legibles;
- no depender únicamente del color para comunicar categorías.

---

# 19. Microinteracciones

Usar animaciones discretas.

Permitido:

- hover suave;
- image zoom muy leve;
- underline animation;
- fade;
- cambio de elevación.

Evitar:

- animaciones constantes;
- parallax excesivo;
- elementos que distraigan;
- movimiento innecesario.

La velocidad debe sentirse editorial, no como una app de gaming.

---

# 20. Footer

Crear un footer profesional.

```text
MYTECHNEWS

Technology · Food · News · Guides · Reviews

About
Contact
Privacy
Terms
Advertise

Follow us

© MYTECHNEWS
```

Agregar newsletter:

```text
Stay informed.

The best stories from technology,
food and culture delivered to your inbox.

[ Your email ] [ Subscribe ]
```

---

# 21. Componentes que deberían existir

Crear un sistema reutilizable:

```text
Header
MobileMenu
BreakingNewsTicker
HeroArticle
ArticleCard
FeaturedArticleCard
HorizontalArticleCard
CompactArticleCard
CategoryBadge
ArticleMetadata
SearchBar
SearchResults
SectionHeader
TrendingList
Newsletter
Footer
ThemeToggle
ReadingProgress
TableOfContents
RecipeCard
RecipeIngredients
RecipeInstructions
```

No crear componentes independientes para cada página si la estructura puede reutilizarse.

---

# 22. Arquitectura visual de la marca

MYTECHNEWS puede evolucionar hacia:

```text
MYTECHNEWS
│
├── Technology
│   ├── AI
│   ├── Gadgets
│   ├── Smartphones
│   ├── Software
│   └── Science
│
├── Food
│   ├── Recipes
│   ├── Restaurants
│   ├── Cooking
│   └── Food Trends
│
├── News
│
├── Guides
│
├── Reviews
│
└── Trending
```

La marca debe comunicar que tecnología y comida forman parte de un mismo medio moderno.

---

# 23. Tecnología + Food como diferenciador

No tratar Food como una sección completamente desconectada.

Crear eventualmente contenido transversal:

- AI + Cooking
- Smart Kitchen
- Food Technology
- Restaurant Technology
- Kitchen Gadgets
- Apps for Food
- Future of Food

Esto puede convertirse en una característica diferencial de MYTECHNEWS.

---

# 24. SEO y contenido

Preparar el diseño para SEO desde el inicio.

Usar:

- URLs limpias;
- breadcrumbs;
- metadata;
- Open Graph;
- Twitter/X cards;
- sitemap;
- canonical URLs;
- Article schema;
- NewsArticle schema;
- Recipe schema;
- categorías;
- tags.

No depender solamente de JavaScript para contenido crítico de SEO.

---

# 25. Performance

Las imágenes serán una parte importante del nuevo diseño.

Implementar:

- imágenes responsive;
- WebP/AVIF cuando sea apropiado;
- lazy loading;
- dimensiones explícitas para evitar layout shift;
- optimización de thumbnails;
- preload solamente de imágenes críticas;
- fuentes optimizadas.

Objetivo:

- buen Core Web Vitals;
- carga rápida;
- excelente experiencia móvil.

---

# 26. Qué NO hacer

No:

- copiar el diseño de LotteryUSA, USAmega, TheLotter u otros sitios;
- convertir cada categoría en un color diferente;
- utilizar demasiados gradientes;
- llenar la pantalla de tarjetas;
- usar fuentes excesivamente pequeñas;
- abusar del negro;
- colocar demasiados anuncios;
- utilizar animaciones constantes;
- hacer que Food parezca una página completamente diferente;
- sacrificar velocidad por efectos visuales.

---

# 27. Prioridad de implementación

## P0 — Fundamental

1. Nuevo sistema visual.
2. Header responsive.
3. Home editorial.
4. Hero con imágenes.
5. Article Cards.
6. Light/Dark mode.
7. Responsive mobile.
8. Accesibilidad básica.

## P1 — Contenido

9. Nueva sección Food.
10. Recipe Cards.
11. Technology sections.
12. Trending.
13. Search.
14. Related articles.
15. Newsletter.

## P2 — Experiencia avanzada

16. Reading progress.
17. Table of contents.
18. Recipe structured data.
19. Personal recommendations.
20. Advanced filtering.
21. Saved articles.

---

# 28. Prompt para el agente de desarrollo

## ROLE

Act as a Senior Product Designer, UX/UI Designer and Frontend Engineer specialized in modern editorial/news websites.

You are improving an existing website called MYTECHNEWS.

The current website is primarily focused on technology news and has a dark editorial visual style.

The product must evolve into a modern editorial platform that supports Technology, News, Guides, Reviews and a new Food vertical.

## PRIMARY OBJECTIVE

Redesign and improve the existing interface without destroying its current identity.

Preserve the strongest elements of the current design:

- editorial serif typography;
- premium dark aesthetic;
- clear hierarchy;
- category badges;
- clean navigation;
- strong headlines.

However, make the design:

- more visually balanced;
- more accessible;
- more welcoming;
- more image-driven;
- more editorial;
- more responsive;
- easier to navigate;
- ready for Food content.

## DESIGN DIRECTION

Create an original visual identity inspired by modern editorial publications, technology magazines and food magazines.

Do NOT clone any existing website.

The result should feel:

"Modern editorial + premium technology + human lifestyle."

Avoid excessive neon, gradients and dashboard-like UI.

## COLOR SYSTEM

Support Light and Dark modes.

Use neutral colors as the foundation.

Use category accent colors sparingly:

Technology = cool accent
Food = warm accent
News = neutral
Trends = purple accent
Reviews = secondary accent

Do not redesign the entire interface for each category.

## HOME PAGE

Redesign the homepage with:

1. Header
2. Breaking news ticker
3. Featured hero
4. Latest News
5. Technology
6. Food
7. Trending
8. Guides / Reviews
9. Newsletter
10. Footer

The homepage should feel like an editorial publication, not a generic blog.

## HERO

Replace the current oversized abstract background as the primary visual with an editorial image-driven hero.

Support:

- large image;
- category;
- headline;
- summary;
- author;
- date;
- reading time;
- CTA.

## FOOD

Add Food as a first-class vertical.

Routes/components should support:

- Food
- Recipes
- Restaurants
- Cooking
- Food Trends

Food must be more visual than Technology.

Recipe cards should support:

- image;
- title;
- preparation time;
- difficulty;
- servings;
- category.

Prepare the article/recipe system for Schema.org Recipe structured data.

## ARTICLE PAGE

Improve article pages with:

- breadcrumb;
- category;
- title;
- subtitle;
- author;
- date;
- reading time;
- hero image;
- article body;
- inline images;
- captions;
- share controls;
- reading progress;
- table of contents for long articles;
- related articles.

## COMPONENT SYSTEM

Create reusable components:

Header
MobileMenu
BreakingNewsTicker
HeroArticle
ArticleCard
FeaturedArticleCard
HorizontalArticleCard
CompactArticleCard
CategoryBadge
ArticleMetadata
SectionHeader
SearchBar
TrendingList
Newsletter
Footer
ThemeToggle
ReadingProgress
TableOfContents
RecipeCard
RecipeIngredients
RecipeInstructions

Avoid duplicated UI code.

## RESPONSIVE

Use mobile-first responsive design.

Do not simply shrink the desktop layout.

Create intentional compositions for:

- mobile;
- tablet;
- desktop;
- large desktop.

## ACCESSIBILITY

Target WCAG AA.

Implement:

- keyboard navigation;
- visible focus states;
- accessible buttons;
- semantic HTML;
- alt text;
- sufficient contrast;
- reduced motion support;
- screen-reader labels.

## PERFORMANCE

Optimize image-heavy pages.

Use:

- responsive images;
- modern image formats;
- lazy loading;
- explicit dimensions;
- optimized thumbnails;
- optimized fonts.

Avoid unnecessary client-side JavaScript.

## SEO

Prepare pages for:

- Article schema;
- NewsArticle schema;
- Recipe schema;
- breadcrumbs;
- canonical URLs;
- Open Graph;
- metadata;
- sitemap;
- semantic HTML.

## IMPORTANT

Before modifying code:

1. Inspect the existing project.
2. Identify current routes.
3. Identify current components.
4. Identify current design tokens.
5. Identify current article data structure.
6. Reuse existing functionality where appropriate.
7. Do not remove working functionality without justification.

Then implement the redesign incrementally.

After each major change verify:

- desktop;
- mobile;
- accessibility;
- performance;
- existing functionality.

## SUCCESS CRITERIA

The final website should immediately communicate:

"MYTECHNEWS is a modern editorial publication covering technology, news, food and trends."

It should look professional without feeling corporate.

It should be visually rich without feeling overloaded.

It should feel premium without being difficult to use.

It should work equally well for Technology articles and Food/Recipe content.

---

# 29. Resultado esperado

La transformación visual debería ser aproximadamente:

ANTES:

```text
Dark technology blog
        ↓
Cards
        ↓
Tech articles
```

DESPUÉS:

```text
                MYTECHNEWS
                     │
       ┌─────────────┼─────────────┐
       │             │             │
   TECHNOLOGY       FOOD          NEWS
       │             │             │
   AI/Gadgets     Recipes       Latest
   Reviews        Restaurants    Breaking
   Guides         Trends         Trending
       │             │             │
       └─────────────┼─────────────┘
                     │
              Editorial Home
                     │
             Articles / Guides
                     │
              Reader Experience
```

La prioridad no debe ser simplemente "hacerlo más bonito".

La prioridad es convertir MYTECHNEWS en un **sistema editorial visual coherente y escalable** que pueda crecer durante los próximos años.

---

# 30. Checklist de progreso

## P0 — Fundamental

- [x] 1. Nuevo sistema visual (tokens, tipografía Fraunces + Space Grotesk, 6 acentos de categoría)
- [x] 2. Header responsive (nav desktop, mobile nav con hamburger/focus-trap)
- [x] 3. Home editorial (ticker + lead + rail + latest + secciones por vertical)
- [x] 4. Hero con imágenes (lead story con imagen 16:9, fallback tipográfico)
- [x] 5. Article Cards (standard/horizontal/compact, CategoryBadge, ArticleMetadata)
- [x] 6. Light/Dark mode (tokens por tema, contraste AA, toggle funcional)
- [x] 7. Responsive mobile (breakpoints lead/rail/secciones, clamp titulares)
- [x] 8. Accesibilidad básica (`:focus-visible`, landmarks, reduced-motion, contraste verificado)

## P1 — Contenido

- [x] 9. Nueva sección Food (categoría + ruta `/food` + tratamiento visual de recetas) *(falta: contenidos Food por el generador AI)*
- [x] 10. Recipe Cards (componentes RecipeMeta/RecipeIngredients/RecipeInstructions + variant `recipe`)
- [x] 11. Sección Technology específica (1 large + 3 cards)
- [x] 12. Trending (lista ranked con contador de views en DB, revalidación on-demand, bloqueo de bots) *(bloqueado para "entrada manual": necesita acumular visitas)*
- [x] 13. Búsqueda mejorada (página de resultados, filtros por vertical)
- [x] 14. Artículos relacionados en la página de artículo
- [x] 15. Newsletter (sección dedicada en Home, diseño editorial de captación + footer profesional)

## P2 — Experiencia avanzada

- [x] 16. Reading progress (barra de progreso en artículo)
- [x] 17. Table of contents para artículos largos (rail sticky con h2, artículos ≥3 secciones)
- [x] 18. Recipe structured data (schema.org Recipe con ingredients/instructions/nutrition)
- [x] 19. Recomendaciones personales (basadas en historial de lectura local + API `/recommend`)
- [x] 20. Filtrado avanzado (combinación de filtros, ordenamiento por fecha, paginación) *(ordenamiento: newest only)*
- [x] 21. Artículos guardados / bookmarks (localStorage + página `/saved` + botón en artículo)

## Secciones específicas del plan

- [x] §10. Sección Technology (composición "1 large + 3 small")
- [x] §11. Sección Food completa (fotos grandes, recetas/restaurants/trends) *(visual listo; contenido demo sembrado, generación AI aún pendiente)*
- [x] §12. Recetas con ingredientes, instrucciones y datos nutricionales (campos en modelo + admin + página + schema)
- [x] §13. Página de artículo mejorada (breadcrumb, share, hero image, meta, related, JSON-LD Article + ReadingProgress #16 + TOC #17)
- [x] §15. Páginas de verticales (`/technology`, `/food`, `/guides`, `/reviews`, `/trends` — ruta dinámica `/[vertical]` con 404 cuando no existe)
- [x] §20. Footer profesional (links por categorías, copyright, newsletter CTA)
- [x] §24. SEO avanzado (breadcrumbs, Article/Recipe schema, canonical, OG/twitter, sitemap)
- [x] §25. Performance imágenes (next/image `fill` + `sizes`, formatos AVIF/WebP configurados, SVG permitido) *(imágenes legacy en base64/dataURL pasan sin optimizar)*
