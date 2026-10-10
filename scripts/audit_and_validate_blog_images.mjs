import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function auditBlogImages() {
  console.log('===============================================================');
  console.log('LOWSTUDY BLOG FEATURED IMAGES AUDIT & VALIDATION REPORT');
  console.log('===============================================================');

  const { BLOG_ARTICLES, getPublishedBlogArticles } = await import('../src/data/blogData.js');
  const articles = getPublishedBlogArticles();

  console.log(`Total Published Articles: ${articles.length}`);
  console.log('---------------------------------------------------------------');

  let passedCount = 0;
  let failedCount = 0;
  const results = [];

  const fallbackPath = path.join(process.cwd(), 'public', 'images', 'blog', 'blog-fallback.webp');
  const fallbackExists = fs.existsSync(fallbackPath) && fs.statSync(fallbackPath).size > 0;
  console.log(`Fallback Asset: /images/blog/blog-fallback.webp -> Exists: ${fallbackExists} (${fallbackExists ? fs.statSync(fallbackPath).size : 0} bytes)`);
  console.log('---------------------------------------------------------------');

  for (let i = 0; i < articles.length; i++) {
    const art = articles[i];
    const imageRelPath = art.featuredImage;
    const localFsPath = path.join(process.cwd(), 'public', imageRelPath.replace(/^\//, ''));
    
    let fileExists = fs.existsSync(localFsPath);
    let fileSize = fileExists ? fs.statSync(localFsPath).size : 0;
    let metadata = null;
    let errorMsg = null;

    if (fileExists && fileSize > 0) {
      try {
        metadata = await sharp(localFsPath).metadata();
      } catch (err) {
        errorMsg = err.message;
      }
    }

    const isNonZero = fileSize > 0;
    const hasValidExt = imageRelPath.endsWith('.webp');
    const isSharpValid = metadata && metadata.format === 'webp';
    const hasDimensions = metadata && metadata.width === 1200 && metadata.height === 630;
    const hasAlt = Boolean(art.imageAlt && art.imageAlt.trim().length > 10);
    const prodUrl = `https://lowstudy.com${imageRelPath}`;

    const isPass = fileExists && isNonZero && hasValidExt && isSharpValid && hasDimensions && hasAlt;

    if (isPass) {
      passedCount++;
    } else {
      failedCount++;
    }

    results.push({
      index: i + 1,
      title: art.title,
      slug: art.slug,
      featuredImage: imageRelPath,
      prodUrl: prodUrl,
      fileExists,
      fileSize: `${(fileSize / 1024).toFixed(1)} KB`,
      format: metadata ? metadata.format : 'invalid',
      dimensions: metadata ? `${metadata.width}x${metadata.height}` : 'N/A',
      altText: art.imageAlt,
      status: isPass ? 'PASS' : `FAIL (${errorMsg || 'Validation Error'})`
    });

    console.log(`[${i + 1}/30] ${art.slug}`);
    console.log(`      Path: ${imageRelPath}`);
    console.log(`      Size: ${(fileSize / 1024).toFixed(1)} KB | Dim: ${metadata ? metadata.width + 'x' + metadata.height : 'N/A'} | Format: ${metadata ? metadata.format : 'N/A'}`);
    console.log(`      Alt: "${art.imageAlt}"`);
    console.log(`      Status: ${isPass ? '✓ PASS' : '✗ FAIL'}`);
    console.log('---------------------------------------------------------------');
  }

  console.log(`\nAUDIT SUMMARY:`);
  console.log(`TOTAL ARTICLES: ${articles.length}`);
  console.log(`PASSED: ${passedCount} / ${articles.length}`);
  console.log(`FAILED: ${failedCount} / ${articles.length}`);
  console.log(`FALLBACK ASSET: ${fallbackExists ? 'READY' : 'MISSING'}`);

  if (failedCount > 0) {
    console.error('Validation failed for one or more articles.');
    process.exit(1);
  } else {
    console.log('ALL 30 BLOG FEATURED IMAGES VALIDATED 100% SUCCESSFULLY!');
  }
}

auditBlogImages().catch((err) => {
  console.error('Audit script error:', err);
  process.exit(1);
});
