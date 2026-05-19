import { defineConfig } from 'vite';

export default defineConfig({
  // Set the base path to '/' for custom domain support
  base: '/',
  build: {
    outDir: 'dist',
  }
});
