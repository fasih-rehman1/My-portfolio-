# Fasih ur Rehman — Portfolio (Node.js)

3D animated portfolio built with **Node.js + Vite**, **Three.js** (custom shader point cloud), **GSAP + ScrollTrigger** and **Lenis** smooth scroll. An **Express** server is included for Node.js hosting.

---

## 1. One-time setup on your PC (Windows)

1. Install **Node.js LTS** from https://nodejs.org (version 20.19+ or 22+). Keep the default options.
2. Install **Git** from https://git-scm.com and **VS Code** from https://code.visualstudio.com.
3. Check it worked — open PowerShell and run:
   ```powershell
   node -v
   npm -v
   git --version
   ```

## 2. Run the project locally

```powershell
cd "E:\My portfolio"
npm install        # first time only — downloads packages into node_modules
npm run dev        # opens http://localhost:5173 with live reload
```
Edit any file and the browser updates instantly. Press `Ctrl + C` to stop.

## 3. Update your content

**Project screenshots:** save images in `public/assets/projects/` and list them in the project's `images`, e.g. `images: ["assets/projects/retreat-home.jpg"]`.


Edit **`src/data.js`** only — about, projects, experience, education, certificates, skills and links all come from it.

| What | Where to put the file | What to write in `src/data.js` |
|---|---|---|
| CV | `public/assets/Fasih-ur-Rehman-CV.pdf` | `cvFile: "assets/Fasih-ur-Rehman-CV.pdf"` |
| Certificate | `public/assets/certificates/my-certificate.pdf` | `file: "assets/certificates/my-certificate.pdf"` |

Leave `link: ""` on a project to show "Repository coming soon".

## 4. Build for production

```powershell
npm run build      # creates the dist/ folder — this is your finished website
npm run preview    # check the built site at http://localhost:4173
npm start          # or run it with the Node/Express server at http://localhost:3000
```

## 5. Put the code on GitHub

```powershell
cd "E:\My portfolio"
git init
git add .
git commit -m "Portfolio v2: Node.js + Vite + Three.js"
git branch -M main
git remote add origin https://github.com/fasih-rehman1/portfolio.git
git push -u origin main 
```
Create the empty repo `portfolio` on GitHub first (github.com/new).
`node_modules/` and `dist/` are not uploaded (see `.gitignore`).

---

## 6. Hosting — pick ONE option

### Option A — Vercel (recommended: free, automatic, fastest)
1. Sign in at https://vercel.com with your GitHub account.
2. **Add New → Project** → import `fasih-rehman1/portfolio`.
3. Vercel detects Vite automatically (build command `npm run build`, output `dist`). Click **Deploy**.
4. You get a live link like `portfolio-xxxx.vercel.app`. Every `git push` redeploys automatically.

(Netlify works the same way: build command `npm run build`, publish directory `dist`.)

### Option B — Your existing Namecheap hosting (cPanel), as a static site
No Node.js is needed on the server — you upload the built files.
1. On your PC: `npm run build`.
2. cPanel → **File Manager** → open `public_html` (or the folder of a subdomain, see section 7).
3. Upload **everything inside `dist/`** (not the `dist` folder itself). Zip it first, upload the zip, then **Extract**.
4. To update later: rebuild and upload again, replacing the old files.

### Option C — Node.js hosting (cPanel "Setup Node.js App", Render, Railway, VPS)
Use this if you specifically want the site served by Node/Express.

**cPanel (Namecheap Stellar plans include it):**
1. On your PC: `npm run build`.
2. Zip the project **without** `node_modules` (include `dist/`, `server.cjs`, `package.json`, `package-lock.json`) and upload it to a folder, e.g. `/home/USERNAME/portfolio`, then extract.
3. cPanel → **Setup Node.js App → Create Application**:
   - Node.js version: the newest available (20+)
   - Application mode: **Production**
   - Application root: `portfolio`
   - Application URL: your domain or subdomain
   - Application startup file: `server.cjs`
4. Click **Create**, then **Run NPM Install**, then **Start/Restart**.

**Render (free tier):** New → Web Service → connect the repo → Build command `npm install && npm run build` → Start command `npm start`.

**VPS (DigitalOcean, Hostinger VPS, AWS Lightsail):**
```bash
git clone https://github.com/fasih-rehman1/portfolio.git && cd Portfolio
npm install && npm run build
npm i -g pm2 && pm2 start server.cjs --name portfolio && pm2 save
```
Then put Nginx in front (proxy to port 3000) and add SSL with Certbot.

---

## 7. Connect a domain

**Which domain?**
- A personal domain such as `fasihurrehman.com` (buy at Namecheap → search → add to cart → checkout), or
- A free subdomain of the domain you already own: `fasih.technestnova.com`.

### Domain → Vercel (Option A)
1. Vercel → your project → **Settings → Domains** → add `fasihurrehman.com` and `www.fasihurrehman.com`.
2. Namecheap → **Domain List → Manage → Advanced DNS**, add the records Vercel shows. Usually:
   | Type | Host | Value |
   |---|---|---|
   | A Record | `@` | `76.76.21.21` |
   | CNAME | `www` | `cname.vercel-dns.com` |
   Delete any old "parking page" or URL-redirect records for `@` and `www`.
3. Wait 5 minutes to a few hours. Vercel adds HTTPS automatically.

For a subdomain on Vercel: add `fasih.technestnova.com` in Vercel, then a **CNAME** with host `fasih` → `cname.vercel-dns.com`.
If `technestnova.com` uses your Namecheap hosting's nameservers, add that record in **cPanel → Zone Editor** instead of Advanced DNS.

### Domain → Namecheap hosting (Options B and C)
- **Main domain:** a domain bought together with the hosting already points to it — upload to `public_html`.
- **Subdomain:** cPanel → **Domains** (or **Subdomains**) → create `fasih.technestnova.com` → note its document root folder → upload `dist/` contents there (or choose it as the Application URL in Option C).
- **A domain bought elsewhere:** set its nameservers to `dns1.namecheaphosting.com` and `dns2.namecheaphosting.com`, then add it in cPanel → **Domains**.

### HTTPS (the padlock)
- Vercel / Netlify / Render: automatic.
- cPanel: **SSL/TLS Status → Run AutoSSL**. Then turn on "Force HTTPS Redirect" in cPanel → **Domains**.

---

## 8. After launch
1. Open the site on your phone and on a slow connection.
2. Add it to **Google Search Console** (https://search.google.com/search-console) so it appears on Google.
3. Put the link on your LinkedIn, GitHub profile README, CV and Upwork profile.
4. Every update: edit `src/data.js` → `git push` (Vercel redeploys) or rebuild and re-upload (cPanel).

---

## Project structure
```
index.html          page structure (Vite entry)
src/data.js         ALL your content
src/main.js         rendering, smooth scroll, animations
src/scene.js        3D hero (noise → fitted surface)
src/style.css       design (colours and fonts at the top)
public/assets/      CV and certificates (copied as-is into the build)
server.cjs          Express server for Node.js hosting
vite.config.js      build settings
```
