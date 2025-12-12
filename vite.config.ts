import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';
import fs from 'fs';

const copyExtensionFiles = () => {
  return {
    name: 'copy-extension-files',
    closeBundle: () => {
      const distDir = resolve(__dirname, 'dist');
      const extDir = resolve(__dirname, 'extension');
      const distExtDir = resolve(distDir, 'extension');

      if (!fs.existsSync(distDir)) return;
      
      // Create extension directory in dist
      if (!fs.existsSync(distExtDir)) {
        fs.mkdirSync(distExtDir, { recursive: true });
      }

      // Copy background.js to extension folder
      if (fs.existsSync(resolve(extDir, 'background.js'))) {
        fs.copyFileSync(resolve(extDir, 'background.js'), resolve(distExtDir, 'background.js'));
      }

      // Copy icon
      if (fs.existsSync(resolve(extDir, 'icon.svg'))) {
        fs.copyFileSync(resolve(extDir, 'icon.svg'), resolve(distExtDir, 'icon.svg'));
      }

      // Read and copy manifest.json with path adjustments
      const manifestPath = resolve(extDir, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        // Ensure popup points to correctly built file
        manifest.action.default_popup = 'extension/popup.html';
        fs.writeFileSync(resolve(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
      }

      console.log('✅ Extension files copied to dist/');
      console.log('📦 Load the extension from the dist/ folder in Chrome');
    }
  };
};

export default defineConfig({
  plugins: [react(), tailwindcss(), copyExtensionFiles()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        popup: resolve(__dirname, 'extension/popup.html'),
      },
    },
  },
  server: {
    port: 5173,
    host: true
  },
});