import type { Article } from '@prisma/client';

type RecipeFields = Pick<
  Article,
  'recipePrepMin' | 'recipeCookMin' | 'recipeServings' | 'recipeDifficulty' | 'recipeCalories'
>;

export function recipeTotalMinutes(article: RecipeFields): number {
  return (article.recipePrepMin ?? 0) + (article.recipeCookMin ?? 0);
}

export function RecipeMeta({ article }: { article: RecipeFields }) {
  const items: string[] = [];
  const total = recipeTotalMinutes(article);
  if (total > 0) items.push(`${total} min`);
  if (article.recipeServings) items.push(`${article.recipeServings} servings`);
  if (article.recipeDifficulty) items.push(article.recipeDifficulty);
  if (article.recipeCalories) items.push(`${article.recipeCalories} kcal`);

  if (items.length === 0) return null;

  return (
    <div className="recipe-meta" aria-label="Recipe details">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </div>
  );
}

function parseList(json: string | string[] | null | undefined): string[] {
  if (Array.isArray(json)) return json.filter((s) => typeof s === 'string');
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

export function RecipeIngredients({ article }: { article: { recipeIngredients?: string | string[] | null } }) {
  const items = parseList(article.recipeIngredients);
  if (items.length === 0) return null;
  return (
    <section className="recipe-panel" aria-label="Ingredients">
      <h2 className="recipe-panel__title">Ingredients</h2>
      <ul className="recipe-ingredients">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function RecipeInstructions({ article }: { article: { recipeInstructions?: string | string[] | null } }) {
  const steps = parseList(article.recipeInstructions);
  if (steps.length === 0) return null;
  return (
    <section className="recipe-panel" aria-label="Instructions">
      <h2 className="recipe-panel__title">Instructions</h2>
      <ol className="recipe-steps">
        {steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
    </section>
  );
}