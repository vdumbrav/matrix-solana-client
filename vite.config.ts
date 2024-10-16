import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },

  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler', // Use the modern Sass API
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser global polyfills
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      crypto: 'empty-module',
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      plugins: [NodeModulesPolyfillPlugin()],
    },
  },
});
