import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src', 'assets', 'images');
const publicDir = path.join(rootDir, 'public', 'images');
const distDir = path.join(rootDir, 'dist', 'images');

console.log('🔄 MUDRA Asset Sync: Syncing all images to public and dist directories...');

if (fs.existsSync(srcDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  fs.mkdirSync(distDir, { recursive: true });

  const files = fs.readdirSync(srcDir);
  let count = 0;

  for (const file of files) {
    if (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.webp')) {
      const srcFile = path.join(srcDir, file);
      const publicFile = path.join(publicDir, file);
      const distFile = path.join(distDir, file);

      fs.copyFileSync(srcFile, publicFile);
      fs.copyFileSync(srcFile, distFile);
      count++;
    }
  }

  console.log(`✅ MUDRA Asset Sync: Successfully synced ${count} images to /public/images and /dist/images.`);
} else {
  console.warn('⚠️ src/assets/images directory not found.');
}
