import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/fishingwaters/',
  plugins: [react()],
  server: { port: 3000 },
  build: { outDir: 'build' }
});
