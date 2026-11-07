import { defineConfig, loadEnv } from "vite";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

// Lets the contact form work in `npm run dev` too (same handler the real server uses)
function contactApi(env) {
  return {
    name: "contact-api",
    configureServer(server) {
      Object.assign(process.env, env);
      const handler = require("./lib/contact-handler.cjs");
      server.middlewares.use("/api/contact", (req, res) => {
        let raw = "";
        req.on("data", (c) => (raw += c));
        req.on("end", () => {
          try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; }
          res.status = (code) => { res.statusCode = code; return res; };
          res.json = (obj) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(obj)); };
          handler(req, res);
        });
      });
    }
  };
}

export default defineConfig(({ mode }) => ({
  // Relative paths: the built site works at a domain root, a subdomain or a sub-folder
  base: "./",
  plugins: [contactApi(loadEnv(mode, process.cwd(), ""))],
  server: { port: 5173, open: true },
  // Pre-bundle heavy libraries so `npm run dev` starts fast
  optimizeDeps: {
    include: [
      "three",
      "three/addons/environments/RoomEnvironment.js",
      "three/addons/geometries/RoundedBoxGeometry.js",
      "gsap",
      "gsap/ScrollTrigger",
      "lenis"
    ]
  },
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three")) return "three";
          if (id.includes("node_modules/gsap") || id.includes("node_modules/lenis")) return "motion";
        }
      }
    }
  }
}));
