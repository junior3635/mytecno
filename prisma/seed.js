/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env to bootstrap the admin user.');
    process.exit(1);
  }

  const hashed = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({ where: { email }, data: { password: hashed } });
    console.log(`Updated admin user: ${email}`);
  } else {
    await prisma.user.create({ data: { email, password: hashed } });
    console.log(`Created admin user: ${email}`);
  }

  const defaultCategories = [
    { name: 'Technology', slug: 'technology', sortOrder: 10 },
    { name: 'Food', slug: 'food', sortOrder: 20 },
    { name: 'News', slug: 'news', sortOrder: 30 },
    { name: 'Guides', slug: 'guides', sortOrder: 40 },
    { name: 'Reviews', slug: 'reviews', sortOrder: 50 },
    { name: 'Trends', slug: 'trends', sortOrder: 60 },
    { name: 'Gadgets', slug: 'gadgets', sortOrder: 70 },
    { name: 'Deep Dives', slug: 'deep-dives', sortOrder: 80 },
  ];

  for (const cat of defaultCategories) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (existing) {
      await prisma.category.update({ where: { slug: cat.slug }, data: { name: cat.name, sortOrder: cat.sortOrder } });
      console.log(`Updated category: ${cat.name}`);
    } else {
      await prisma.category.create({ data: cat });
      console.log(`Created category: ${cat.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());