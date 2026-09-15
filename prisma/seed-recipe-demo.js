/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.findUnique({ where: { slug: 'food' } });
  if (!category) {
    console.error('Food category not found. Run `npm run db:seed` first.');
    process.exit(1);
  }

  const recipe = {
    id: 'demo-pasta-creamy-parmesan',
    title: 'Pasta Creamy Parmesan',
    slug: 'pasta-creamy-parmesan',
    category: 'Food',
    categorySlug: 'food',
    content: `
<div class="article-intro"><p>This creamy parmesan pasta comes together in about thirty minutes with a handful of everyday ingredients. The sauce is built from pasta water, butter and a generous pile of freshly grated Parmigiano-Reggiano, so it clings to every noodle without a single splash of cream.</p></div>
<h2>Why it works</h2>
<p>The key is starchy, salty pasta water. It turns a simple butter-and-cheese pan into an emulsified sauce that coats each strand evenly. Always grate the parmesan fresh; pre-shredded cheese contains anti-caking agents that can make the sauce grainy.</p>
<div class="article-conclusion"><p>Serve immediately while the sauce is glossy, with a twist of black pepper and a few basil leaves torn over the top. It is comfort food at its most honest.</p></div>`,
    seoTitle: 'Pasta Creamy Parmesan Recipe — 30 Minutes, No Cream',
    seoDesc:
      'A glossy, creamy parmesan pasta made with pasta water, butter and Parmigiano-Reggiano. Ready in 30 minutes, serves four.',
    featuredImage: '/uploads/pasta-creamy-parmesan.svg',
    isPublished: true,
    recipePrepMin: 15,
    recipeCookMin: 15,
    recipeServings: 4,
    recipeDifficulty: 'Easy',
    recipeCalories: 520,
    recipeIngredients: JSON.stringify([
      '400 g spaghetti or linguine',
      '200 g Parmigiano-Reggiano, finely grated',
      '80 g unsalted butter',
      '2 large cloves garlic, thinly sliced',
      'Freshly cracked black pepper',
      'A few basil leaves, to serve',
    ]),
    recipeInstructions: JSON.stringify([
      'Cook the pasta in well-salted water until just shy of al dente. Reserve one cup of pasta water.',
      'In a wide pan, melt the butter over medium heat and soften the garlic until fragrant, about two minutes.',
      'Add the pasta and a ladle of pasta water. Toss while adding the grated parmesan in small handfuls.',
      'Keep tossing and adding water until the sauce turns silky and clings to the noodles.',
      'Season with black pepper, rest for one minute and serve with basil leaves and a final shower of parmesan.',
    ]),
  };

  const existing = await prisma.article.findUnique({ where: { slug: recipe.slug } });
  if (existing) {
    await prisma.article.update({ where: { slug: recipe.slug }, data: recipe });
    console.log('Updated demo recipe:', recipe.title);
  } else {
    await prisma.article.create({ data: recipe });
    console.log('Created demo recipe:', recipe.title);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());