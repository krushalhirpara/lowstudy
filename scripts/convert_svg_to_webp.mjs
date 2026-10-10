import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const dir = './public/images/blog';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));

console.log(`Found ${files.length} SVG files to convert to WebP...`);

for (const f of files) {
  const svgPath = path.join(dir, f);
  const webpPath = path.join(dir, f.replace(/\.svg$/, '.webp'));
  
  try {
    const svgBuffer = fs.readFileSync(svgPath);
    await sharp(svgBuffer)
      .resize(1200, 630)
      .webp({ quality: 90 })
      .toFile(webpPath);
    
    console.log(`Converted: ${f} -> ${path.basename(webpPath)}`);
  } catch (err) {
    console.error(`Error converting ${f}:`, err);
  }
}

// Also create blog-fallback.webp
const fallbackSvg = path.join(dir, 'how-to-read-an-llb-syllabus-and-build-study-plan.svg');
if (fs.existsSync(fallbackSvg)) {
  const fallbackWebp = path.join(dir, 'blog-fallback.webp');
  const fallbackSvgCopy = path.join(dir, 'blog-fallback.svg');
  
  await sharp(fs.readFileSync(fallbackSvg))
    .resize(1200, 630)
    .webp({ quality: 90 })
    .toFile(fallbackWebp);
  
  fs.copyFileSync(fallbackSvg, fallbackSvgCopy);
  console.log(`Created fallback assets: blog-fallback.webp & blog-fallback.svg`);
}

console.log('All image conversions finished successfully!');
