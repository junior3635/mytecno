import { NextResponse } from 'next/server';
import { generateTechArticle, generateArticleMetadata, generateArticleImage } from '@/lib/ai';
import prisma from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // 1. Generate Article Content
    const content = await generateTechArticle(topic) || '';

    // 2. Generate Metadata
    const metadata = await generateArticleMetadata(topic, content);

    const title = metadata.title || 'Untitled';

    // 3. Generate Slug from Title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // 4. Generate Featured Image (runs in parallel with DB save to speed things up)
    const featuredImage = await generateArticleImage(topic, title);

    // 5. Save to Database
    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content,
        category: 'Technology',
        seoTitle: title,
        seoDesc: metadata.description || '',
        featuredImage,
        isPublished: true,
      },
    });

    await prisma.log.create({
      data: {
        action: 'generate_article',
        message: `Successfully generated article with image: ${title}`,
        success: true,
      },
    });

    return NextResponse.json({ success: true, article });
  } catch (error: any) {
    console.error('Error in generate API:', error);

    await prisma.log.create({
      data: {
        action: 'generate_article',
        message: `Failed to generate article: ${error.message || 'Unknown error'}`,
        success: false,
      },
    });

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
