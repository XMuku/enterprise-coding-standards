import { defineConfig } from 'vite';
import uniModule from '@dcloudio/vite-plugin-uni';

// This pinned plugin publishes CommonJS; ESM loaders can retain its default wrapper.
const uni = typeof uniModule === 'function' ? uniModule : (uniModule as { default: typeof uniModule }).default;
export default defineConfig({
  plugins: [uni()],
  server: { host: '127.0.0.1', cors: false },
  preview: { host: '127.0.0.1', cors: false },
});
