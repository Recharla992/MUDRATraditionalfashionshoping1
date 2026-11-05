import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

function copyImagesPlugin(): Plugin {
  const sync = (targetDirName: string) => {
    try {
      const srcDir = path.resolve(process.cwd(), 'src/assets/images');
      const targetDir = path.resolve(process.cwd(), targetDirName);
      if (fs.existsSync(srcDir)) {
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        const files = fs.readdirSync(srcDir);
        for (const file of files) {
          const srcPath = path.join(srcDir, file);
          const destPath = path.join(targetDir, file);
          if (fs.statSync(srcPath).isFile()) {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      }
    } catch (err) {
      console.warn('Image sync warning:', err);
    }
  };

  return {
    name: 'vite-plugin-sync-images',
    buildStart() {
      sync('public/images');
    },
    closeBundle() {
      sync('dist/images');
    },
    configureServer() {
      sync('public/images');
    },
  };
}

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss(), copyImagesPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

