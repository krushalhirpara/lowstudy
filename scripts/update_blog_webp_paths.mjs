import fs from 'fs';

let content = fs.readFileSync('src/data/blogData.js', 'utf8');
const updated = content.replaceAll('.svg"', '.webp"');
fs.writeFileSync('src/data/blogData.js', updated, 'utf8');

console.log('Successfully updated blogData.js featuredImage paths to .webp');
