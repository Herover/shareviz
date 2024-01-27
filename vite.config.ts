import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
    include: [
      'sharedb-client-browser/dist/sharedb-client-umd.cjs',
      'sharedb-client-browser/dist/ot-json1-presence-umd.cjs',
    ],
  },
});
