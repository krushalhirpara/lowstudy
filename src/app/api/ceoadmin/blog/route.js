import { NextResponse } from 'next/server';
import { verifyAuth, sanitizeInput } from '@/lib/security';
import { BLOG_ARTICLES, BLOG_CATEGORIES } from '@/data/blogData';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = verifyAuth(request, ['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = sanitizeInput(searchParams.get('search') || '').trim().toLowerCase();
    const category = sanitizeInput(searchParams.get('category') || 'all');
    const status = sanitizeInput(searchParams.get('status') || 'all');

    let filtered = [...BLOG_ARTICLES];

    if (search) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(search) ||
          a.slug.toLowerCase().includes(search) ||
          a.excerpt.toLowerCase().includes(search) ||
          (a.primaryKeyword && a.primaryKeyword.toLowerCase().includes(search))
      );
    }

    if (category && category !== 'all' && category !== 'All') {
      filtered = filtered.filter((a) => a.category === category);
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((a) => a.status === status.toUpperCase());
    }

    const total = BLOG_ARTICLES.length;
    const publishedCount = BLOG_ARTICLES.filter((a) => a.status === 'PUBLISHED').length;
    const draftCount = BLOG_ARTICLES.filter((a) => a.status === 'DRAFT').length;

    return NextResponse.json({
      success: true,
      stats: {
        total,
        publishedCount,
        draftCount,
        categoriesCount: BLOG_CATEGORIES.length - 1,
      },
      categories: BLOG_CATEGORIES,
      articles: filtered,
    });
  } catch (error) {
    console.error('Error in GET /api/ceoadmin/blog:', error);
    return NextResponse.json({ error: 'Failed to retrieve blog articles' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = verifyAuth(request, ['ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error || 'Unauthorized' }, { status: auth.status || 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { action, slug, status } = body;

    if (action === 'toggle_status' && slug) {
      const article = BLOG_ARTICLES.find((a) => a.slug === slug);
      if (article) {
        article.status = status || (article.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED');
        return NextResponse.json({ success: true, article });
      }
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Article state saved' });
  } catch (error) {
    console.error('Error in POST /api/ceoadmin/blog:', error);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}
