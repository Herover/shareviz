import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { webSocketDevServer } from './server/server';

export default defineConfig({
	plugins: [sveltekit(), webSocketDevServer()],
	optimizeDeps: {
    include: [
      'sharedb-client-browser/dist/sharedb-client-umd.cjs',
      'sharedb-client-browser/dist/ot-json1-presence-umd.cjs',
    ],
  },
  server: {
    hmr: { port: 5111 },
  }
});
