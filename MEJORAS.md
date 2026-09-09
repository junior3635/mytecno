# Mejoras MyTechNews

Lista de mejoras ordenadas por prioridad para el portal de noticias generado por IA.

## 🔴 Críticas (Seguridad y Funcionalidad rota)

- [x] **1. API `/api/generate` sin autenticación** — Cualquier persona puede generar artículos sin logearse. Agregar validación de sesión en el route handler. *(Aplicado: validación de sesión en `api/generate/route.ts`. Además corregí un bug pre-existente en `article/[slug]/page.tsx` que rompía el build por un div sin cerrar.)*
- [x] **2. Credenciales hardcodeadas en `.env`** — Cambiar a credenciales seguras, hashear la contraseña (o migrar al modelo `User` de Prisma que ya existe pero no se usa). *(Aplicado: auth migrada a la tabla `User` con contraseña hasheada vía bcryptjs. Bootstrap con `npm run db:seed`.)*
- [x] **3. Fallback inseguro de `SESSION_SECRET`** — `middleware.ts` y `lib/session.ts` usan un string predecible como fallback. Debería fallar explícitamente si no está configurado en producción. *(Aplicado: ambos archivos ahora lanzan error si `SESSION_SECRET` falta o es menor de 32 caracteres. Se generó un secreto aleatorio en `.env`.)*
- [x] **4. Página Settings no persiste datos** — `settings/page.tsx` solo muestra un mensaje de "guardado" sin llamar a ninguna API. Crear endpoint que actualice el modelo `SiteSettings`. *(Aplicado: API `GET/PUT /api/settings` protegida, modelo ampliado con `siteUrl`/`amazonTag`/`aiModel`, y la página ahora carga y guarda de verdad.)*
- [x] **5. Slug con colisiones** — `api/generate/route.ts` no maneja slugs duplicados. Agregar sufijo numérico o UUID corto. *(Aplicado: helper `generateUniqueSlug` que agrega `-2`, `-3`, etc. si el slug ya existe.)*

## 🟡 Importantes (Funcionalidad incompleta)

- [x] **6. CRUD completo de artículos** — Actualmente solo hay listado. Agregar edición, borrado y cambio de estado publicado/borrador. *(Aplicado: API `PUT/DELETE /api/articles/[id]`, página de edición `/admin/articles/[id]/edit`, y acciones Editar/Publicar/Eliminar en el listado.)*
- [x] **8. Modelo `User` sin usar** — Migrar la auth de variables de entorno a la tabla `User` de Prisma con contraseña hasheada *(bcrypt)*. *(Cubierto por la mejora #2: la auth ya consulta la tabla `User` con contraseñas hasheadas via bcryptjs.)*
- [x] **8. Modelo `User` sin usar** — Migrar la auth de variables de entorno a la tabla `User` de Prisma con contraseña hasheada (bcrypt). *(Duplicado del #8 de arriba — cubierto por la mejora #2.)*
- [x] **9. Featured image como base64 en SQLite** — Mover imágenes a sistema de archivos o storage externo. *(Aplicado: helper `lib/images.ts` que guarda la imagen en `public/uploads/<slug>.<ext>` y guarda la ruta en la DB en vez del base64. `public/uploads/` agregado al `.gitignore`.)*
- [x] **10. Gemini API Key desde DB** — `lib/ai.ts` solo lee la env var. Unificar para usar la key de `SiteSettings` si está configurada. *(Aplicado: `getAi()` resuelve la key de `SiteSettings.geminiApiKey` con fallback a `GEMINI_API_KEY`.)*
- [x] **11. Auto-publish no respeta setting** — `api/generate/route.ts` siempre publica ignorando el campo `autoPublish`. *(Aplicado: el route lee `SiteSettings` y usa `autoPublish` para `isPublished`, y respeta `aiModel` configurado. El generador muestra "draft" si no se publicó.)*

## 🟢 Mejoras de UX y Frontend

- [x] **12. Home sin artículos muestra placeholders hardcoded** — Considerar un CTA para generar el primer artículo en vez de contenido ficticio. *(Aplicado: se muestran los artículos reales o un empty state honesto "No stories published yet".)*
- [x] **13. Ticker de noticias hardcoded** — Hacerlo dinámico basado en artículos reales. *(Aplicado: el ticker usa títulos de los artículos más recientes con fallback de portada.)*
- [x] **14. Navegación del header sin funcionalidad** — Los links "Reviews", "Guides", "Deep Dives", "Gadgets" apuntan todos a `/`. *(Aplicado: ahora filtran por categoría vía `/?category=X`, con botón "Clear filter".)*
- [x] **15. Dark mode sin toggle manual** — Agregar switch de tema oscuro/claro. *(Aplicado: botón ☀/☾ en el header, persiste en `localStorage`, script inline para evitar flash, y las variables CSS ahora soportan `data-theme`.)*
- [x] **16. Ad slots placeholders** — Integrar AdSense real o ocultarlos si no está configurado. *(Aplicado: si no hay `adsenseClientId` en settings no se muestra nada; si hay, se carga auto-ads de AdSense en el layout y se muestran los contenedores.)*
- [x] **17. Spinner CSS no definido** — `generator/page.tsx` usa `animation: 'spin'` sin `@keyframes spin` en `globals.css`. *(Aplicado: se agregó `@keyframes spin`.)*

## 🔵 Calidad de Código y Arquitectura

- [ ] **18. Estilos inline masivos** — Migrar a CSS modules o Tailwind. *(Aplicado: utilidades `.admin-*` en `globals.css` (cards, badges, botones, inputs, rows) y refactor de dashboards, listados, editor, generator, categorías, comentarios, suscriptores y logs; se mantienen pocos estilos inline puntuales.)*
- [x] **19. `dangerouslySetInnerHTML` sin sanitización** — Agregar DOMPurify para prevenir XSS. *(Aplicado: `isomorphic-dompurify` sanitiza el HTML de Gemini antes de renderizar.)*
- [x] **20. Error handling débil** — Distinguir rate limits, API key inválida, y errores de red en Gemini. *(Aplicado: `classifyError` en `lib/ai.ts` y error claro si no hay API key; el route devuelve el mensaje específico.)*
- [x] **21. Sin logging estructurado** — Integrar logger tipo Pino o formato JSON. *(Aplicado: `lib/logger.ts` emite entradas JSON; usado en `/api/generate`.)*
- [x] **22. Imágenes no optimizadas** — Falta `loading="lazy"`, `next/image`, y dimensiones. *(Aplicado: `next/image` en el artículo con dimensiones y `unoptimized` para data URLs legadas.)*

## 🟣 SEO y Rendimiento

- [x] **23. Sin sitemap.xml** — Generar dinámicamente desde artículos publicados. *(Aplicado: `app/sitemap.ts` con todos los artículos publicados.)*
- [x] **24. Sin robots.txt** — Crear en `public/`. *(Aplicado.)*
- [x] **25. Sin Open Graph dinámico** — Agregar `og:image`, `og:type`, `twitter:card`. *(Aplicado en `generateMetadata` del artículo + defaults en layout.)*
- [x] **26. Faltan canonical URLs** — Los artículos no declaran URL canónica. *(Aplicado: `alternates.canonical` + `metadataBase`.)*
- [x] **27. Google Fonts vía CDN** — Usar `next/font/google`. *(Aplicado: `Inter` via `next/font` con self-host y `display: swap`.)*
- [x] **28. Revalidate genérico** — Considerar ISR por artículo o invalidación on-demand. *(Aplicado: `revalidate = 3600` por artículo y `revalidatePath` al generar/editar/borrar.)*

## ⚪ Nice-to-have

- [x] **29. Rate limiting** en `/api/generate`. *(Aplicado: máx. 5 generaciones por hora por usuario con `lib/rate-limit.ts`.)*
- [x] **30. Cola de generación** — Control de concurrencia. *(Aplicado: `lib/generation-queue.ts` con cola serial in-memory, `MAX_CONCURRENCY=1` y `QUEUE_LIMIT=3`; `/api/generate` envuelto en `submitJob` y estado expuesto en `/api/generate/queue`; el generator muestra banner de estado con polling.)*
- [x] **31. Búsqueda de artículos** — Search en admin y público. *(Aplicado: `SearchBox` en el header (filtra `/?q=` en home) y `admin-search-box` en el listado de artículos; busca en título, slug, categoría y descripción.)*
- [x] **32. Categorías dinámicas** — Modelo `Category` gestionable desde admin. *(Aplicado: modelo + seed, CRUD en `/api/categories`, página `/admin/categories`, header navega por categoría y el generator asigna categoría.)*
- [x] **33. Comentarios o reacciones** de usuarios. *(Aplicado: modelo `Comment` con moderación; POST público vía `/api/comments` (queda `isApproved=false`), listado público aprobado por artículo, y moderación Aprobar/Eliminar en `/admin/comments`.)*
- [x] **34. Newsletter / suscripciones** — Captura de email. *(Aplicado: modelo `Subscriber`, form en el footer, suscripción idempotente en `/api/subscribers`, baja con token en `/unsubscribe/[token]`, y admin en `/admin/subscribers` con link de baja copiable.)*
- [x] **35. Tests** — Unitarios para `lib/ai.ts`, `lib/session.ts` e integración de API routes. *(Aplicado: suite Vitest con 19 tests en `lib/` para `ai.ts`, `session.ts`, `article-content.ts` y `rate-limit.ts`; `npm test`.)*
- [x] **36. Prompt SEO + imágenes por sección** — Nuevo prompt editorial en `generateTechArticle` que genera el artículo estructurado (intro, resumen, pros/cons, tablas, FAQ, conclusión) con prompts de imagen embebidos (`data-image-prompt`). `lib/article-content.ts` extrae cada prompt, genera las imágenes con Imagen 3 en paralelo, las incrusta en el HTML y elimina los bloques de instrucciones. CSS añadido para todas las clases.
- [x] **37. Metadatos de imagen en formato JSON** — El modelo ya no incrusta los prompts en el HTML: responde con un objeto `{"html": ..., "images": [...]}` donde cada imagen tiene `image_id`, `section`, `purpose`, `alt`, `caption`, `prompt`, `aspect_ratio` y `style`. `parseArticlePayload` lo valida y normaliza (con fallback legacy); la app envía cada `prompt` a Imagen 3 en paralelo y sustituye `[IMAGE_URL_OR_GENERATED_IMAGE]` por el URL real.