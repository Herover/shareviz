import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { webSocketDevServer } from "./server/dev";

export default defineConfig({
  plugins: [sveltekit(), webSocketDevServer()],
  server: {
    hmr: { port: 5111 },
  },
  // Tell Vitest to use the `browser` entry points in `package.json` files, even though it's running in Node
  resolve: process.env.VITEST
    ? {
        conditions: ["browser"],
      }
    : undefined,
});
