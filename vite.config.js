import { defineConfig } from 'vite';

export default defineConfig({
  // Set the base path to '/' for the custom domain
  base: '/',
  build: {
    outDir: 'dist',
  }
});
