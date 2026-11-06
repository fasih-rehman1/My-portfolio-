import { defineConfig } from "vite";

export default defineConfig({
  // Relative paths: the built site works at a domain root, a subdomain or a sub-folder
  base: "./",
  server: { port: 5173, open: true },
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 900
  }
});
