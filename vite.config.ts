import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { webSocketDevServer } from './server/dev';

export default defineConfig({
	plugins: [sveltekit(), webSocketDevServer()],
  server: {
    hmr: { port: 5111 },
  }
});
