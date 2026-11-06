/* Production server for Node.js hosting (cPanel "Setup Node.js App", Render, Railway, a VPS).
   Serves the built site from /dist. Run `npm run build` first, then `npm start`. */
const path = require("path");
const fs = require("fs");
const express = require("express");
const compression = require("compression");

const app = express();
const PORT = process.env.PORT || 3000;
const DIST = path.join(__dirname, "dist");

if (!fs.existsSync(path.join(DIST, "index.html"))) {
  console.error("No build found. Run `npm run build` before `npm start`.");
  process.exit(1);
}

app.disable("x-powered-by");
app.use(compression());

// Hashed JS/CSS files can be cached for a year; HTML is always revalidated
app.use(
  express.static(DIST, {
    setHeaders(res, filePath) {
      if (filePath.includes(`${path.sep}assets${path.sep}`) && /\.(js|css)$/.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else if (filePath.endsWith(".html")) {
        res.setHeader("Cache-Control", "no-cache");
      }
    }
  })
);

// Any unknown path returns the portfolio page
app.use((req, res) => res.status(404).sendFile(path.join(DIST, "index.html")));

app.listen(PORT, () => console.log(`Portfolio running on http://localhost:${PORT}`));
