import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import PORTFOLIO from "./data.js";
import { initScene } from "./scene.js";

/* ==========================================================
   Page logic: render content, smooth scroll, motion.
   ========================================================== */
(function () {
  const D = PORTFOLIO;
  const HeroScene = initScene();
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = true;

  if (reduced) document.documentElement.classList.add("reduced");

  /* ---------- Render content ---------- */
  function render() {
    document.title = `${D.name} — ${D.role}`;
    $("#heroRole").textContent = `${D.role} · ${D.location}`;
    if (D.degree) $("#heroDegree").textContent = D.degree;
    if (D.photo) $("#heroPhoto").innerHTML = `<img src="${esc(D.photo)}" alt="Portrait of ${esc(D.name)}" width="760" height="1013" fetchpriority="high" />`;
    $("#heroIntro").textContent = D.intro;

    // Name split into lines and letters for the intro reveal
    const [first, ...rest] = D.name.split(" ");
    const name = $("#heroName");
    name.setAttribute("aria-label", D.name);
    name.innerHTML = [first, rest.join(" ")]
      .filter(Boolean)
      .map((w) => `<span class="line" aria-hidden="true">${[...w].map((c) => `<span class="ch">${c === " " ? "&nbsp;" : esc(c)}</span>`).join("")}</span>`)
      .join("");

    if (D.cv && D.cv.file) {
      const cv = $("#cvBtn");
      cv.href = D.cv.file;
      cv.setAttribute("download", D.cv.file.split("/").pop());
      cv.hidden = false;
      const view = $("#cvViewBtn");
      view.hidden = false;
      view.addEventListener("click", () =>
        openViewer({
          title: `${D.name} — CV`,
          sub: `${(D.cv.pages || []).length} pages`,
          images: D.cv.pages && D.cv.pages.length ? D.cv.pages : null,
          pdf: D.cv.file,
          download: null
        })
      );
    }

    if (D.whatIBuild) {
      $("#capList").innerHTML = D.whatIBuild
        .map((w) => `<li><strong>${esc(w.title)}</strong><span>${esc(w.text)}</span></li>`)
        .join("");
    }

    $("#aboutLead").textContent = D.aboutLead || "";
    $("#aboutBody").innerHTML = D.about.map((p) => `<p>${esc(p)}</p>`).join("");
    $("#aboutCards").innerHTML = (D.aboutCards || [])
      .map((c, i) => `<article class="acard"><span class="acard__n">${String(i + 1).padStart(2, "0")}</span><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></article>`)
      .join("");
    $("#facts").innerHTML = D.facts
      .map((f) => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`)
      .join("");

    $("#projects").innerHTML = D.projects
      .map((p, i) => {
        const id = `proj-${i}`;
        const link = p.link
          ? `<a class="project__link" href="${esc(p.link)}" target="_blank" rel="noopener">${esc(p.linkLabel || "View on GitHub")}</a>`
          : "";
        const imgs = p.images || [];
        const phones = p.device === "phone" && imgs.length
          ? `<div class="project__preview"><div class="showcase">
              ${imgs.slice(0, 3).map((src, k) => `<button type="button" class="showcase__phone showcase__phone--${k}" data-cursor="View" data-proj="${i}" data-shot="${k}" aria-label="Open ${esc(p.title)} screen ${k + 1}"><img src="${esc(src)}" alt="${esc(p.title)} app screen ${k + 1}" loading="lazy" /></button>`).join("")}
              ${imgs.length > 3 ? `<button type="button" class="showcase__all btn" data-proj="${i}" data-shot="0">View all ${imgs.length} screens</button>` : ""}
            </div></div>`
          : "";
        const preview = p.device === "phone" ? phones : imgs.length || p.url
          ? `<div class="project__preview"><div class="frame">
              <div class="frame__bar"><i></i><i></i><i></i>${p.url ? `<span class="frame__url">${esc(p.urlLabel || p.url.replace(/^https?:\/\//, ""))}</span>` : ""}</div>
              ${imgs.length
                ? `<div class="frame__shots">${imgs.map((src, k) => `<button type="button" class="shot" data-cursor="View" data-proj="${i}" data-shot="${k}" aria-label="Enlarge ${esc(p.title)} screenshot ${k + 1}"><img src="${esc(src)}" alt="${esc(p.title)} screenshot ${k + 1}" loading="lazy" /></button>`).join("")}</div>`
                : `<div class="frame__empty"><strong>${esc(p.title)}</strong>${p.url ? `<a class="btn btn--solid" href="${esc(p.url)}" target="_blank" rel="noopener">Open the live site</a>` : ""}</div>`}
            </div></div>`
          : "";
        return `
        <li class="project">
          <button class="project__toggle" aria-expanded="false" aria-controls="${id}">
            <span class="project__title">${esc(p.title)}</span>
            <span class="project__kind">${esc(p.kind)}</span>
            <span class="project__icon" aria-hidden="true"></span>
          </button>
          <div class="project__panel" id="${id}" role="region" aria-label="${esc(p.title)}">
            <div class="project__body">
              <div class="project__desc">
                <p class="project__summary">${esc(p.summary)}</p>
                ${p.overview ? `<p class="project__overview">${esc(p.overview)}</p>` : ""}
              </div>
              <ul class="project__points">${p.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
              ${preview}
              <div class="project__meta">
                <ul class="tags">${p.stack.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
                ${link}
              </div>
            </div>
          </div>
        </li>`;
      })
      .join("") +
      (D.moreWork
        ? `<li class="more">
            <div><h3 class="more__title">${esc(D.moreWork.title)}</h3><p class="more__text">${esc(D.moreWork.text)}</p></div>
            <div class="more__links">${D.moreWork.links.map((l, k) => `<a class="btn ${k === 0 ? "btn--solid" : ""} magnetic" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join("")}</div>
          </li>`
        : "");

    document.querySelectorAll(".shot, .showcase__phone, .showcase__all").forEach((b) =>
      b.addEventListener("click", () => {
        const p = D.projects[+b.dataset.proj];
        const k = +b.dataset.shot;
        const ordered = p.images.slice(k).concat(p.images.slice(0, k));
        openViewer({ title: p.title, sub: `${p.images.length} screens`, images: ordered, download: null, narrow: p.device === "phone" });
      })
    );

    $("#timeline").innerHTML =
      `<span class="timeline__progress" aria-hidden="true"></span>` +
      D.experience
        .map(
          (e) => `
        <li class="tl">
          <div class="tl__period">${esc(e.period)}</div>
          <div>
            <h3 class="tl__role">${esc(e.role)}</h3>
            <p class="tl__org">${esc(e.org)}</p>
            <p class="tl__text">${esc(e.text)}</p>
            ${e.points && e.points.length ? `<ul class="tl__points">${e.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
          </div>
        </li>`
        )
        .join("");

    const ICONS = {
      server: '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
      layout: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/>',
      database: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
      tools: '<circle cx="6" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="9" r="2.5"/><path d="M6 8.5v7M18 11.5c0 3-4 3.5-9.5 5"/>',
      code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
      spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
      people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.3-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14.5c2.4.2 4 1.8 4.6 4.5"/>'
    };
    if (D.skillsIntro) $("#skillsIntro").textContent = D.skillsIntro;
    $("#skillsGrid").innerHTML = D.skills
      .map(
        (g) => `<div class="skill-row">
          <div class="skill-row__head">
            <span class="skill-row__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[g.icon] || ICONS.code}</svg></span>
            <div>
              <h3 class="skill-row__title">${esc(g.group)}</h3>
              ${g.text ? `<p class="skill-row__text">${esc(g.text)}</p>` : ""}
            </div>
          </div>
          <ul class="skill-list">${g.items.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
        </div>`
      )
      .join("");

    $("#eduList").innerHTML = D.education
      .map(
        (e) => `<li${e.photo ? ' class="has-photo"' : ""}>
          <span class="edu__title">${esc(e.title)}</span>
          ${e.org ? `<span class="edu__org">${esc(e.org)}</span>` : ""}
          ${e.period ? `<span class="edu__period">${esc(e.period)}</span>` : ""}
          ${e.note ? `<span class="edu__note">${esc(e.note)}</span>` : ""}
          ${e.photo ? `<figure class="edu__photo"><img src="${esc(e.photo)}" alt="${esc(D.name)} at graduation" loading="lazy" /></figure>` : ""}
        </li>`
      )
      .join("");

    $("#certList").innerHTML = D.certificates
      .map(
        (c, i) => `<li class="cert">
          <div class="cert__text">
            <span class="edu__title">${esc(c.title)}</span>
            ${c.issuer ? `<span class="edu__org">${esc(c.issuer)}</span>` : ""}
            ${c.year ? `<span class="edu__period">${esc(c.year)}</span>` : ""}
            ${c.verifyId ? `<span class="cert__id">Verification ID ${esc(c.verifyId)}</span>` : ""}
            ${c.image || c.file ? `<button type="button" class="edu__view" data-cert="${i}">View certificate</button>` : ""}
          </div>
        </li>`
      )
      .join("");
    document.querySelectorAll("[data-cert]").forEach((b) =>
      b.addEventListener("click", () => {
        const c = D.certificates[+b.dataset.cert];
        openViewer({
          title: c.title,
          sub: [c.issuer, c.year].filter(Boolean).join(" · ") + (c.details ? ` — ${c.details}` : ""),
          images: c.image ? [c.image] : null,
          pdf: !c.image && c.file ? c.file : null,
          download: null
        });
      })
    );

    const ico = {
      mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/></svg>',
      phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg>'
    };
    const rows = [
      { i: ico.mail, label: "Personal email", text: D.email, href: `mailto:${D.email}` },
      D.workEmail && { i: ico.mail, label: "Work email", text: D.workEmail, href: `mailto:${D.workEmail}` },
      D.phone && { i: ico.phone, label: "Phone / WhatsApp", text: D.phone, href: `tel:${D.phoneIntl || D.phone}` }
    ].filter(Boolean);
    $("#contactList").innerHTML = rows
      .map((r) => `<li><a class="crow" href="${esc(r.href)}"><span class="crow__ico">${r.i}</span><span class="crow__txt"><small>${esc(r.label)}</small><b>${esc(r.text)}</b></span><i aria-hidden="true">↗</i></a></li>`)
      .join("");
    $("#menuFoot").textContent = `${D.workEmail || D.email} · ${D.phone || ""}`;
    $("#contactLinks").innerHTML = D.links
      .map((l) => `<li><a class="btn magnetic" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`)
      .join("");

    const si = {
      linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
      github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
      mail: ico.mail,
      phone: ico.phone
    };
    const social = [
      ...D.links.map((l) => ({ label: l.label, url: l.url, i: si[l.label.toLowerCase()] || "", ext: true })),
      { label: "Email", url: `mailto:${D.workEmail || D.email}`, i: si.mail },
      D.phone && { label: "Call", url: `tel:${D.phoneIntl || D.phone}`, i: si.phone }
    ].filter((x) => x && x.i);
    $("#footSocial").innerHTML = social
      .map((x) => `<li><a href="${esc(x.url)}" aria-label="${esc(x.label)}" title="${esc(x.label)}"${x.ext ? ' target="_blank" rel="noopener"' : ""}>${x.i}</a></li>`)
      .join("");
    $("#footName").textContent = D.name;
    $("#footLoc").textContent = D.location;
    $("#year").textContent = new Date().getFullYear();
  }

  /* ---------- In-page viewer for CV and certificates ---------- */
  let lenisRef = null;
  const viewer = $("#viewer");
  function openViewer({ title, sub, images, pdf, download, narrow }) {
    $("#viewerBody").classList.toggle("viewer__body--phones", !!narrow);
    $("#viewerTitle").textContent = title;
    $("#viewerSub").textContent = sub || "";
    const dl = $("#viewerDownload");
    dl.hidden = !download;
    if (download) {
      dl.href = download;
      dl.setAttribute("download", download.split("/").pop());
    }
    $("#viewerBody").innerHTML = images
      ? images.map((src, i) => `<img src="${esc(src)}" alt="${esc(title)}${images.length > 1 ? `, page ${i + 1}` : ""}" />`).join("")
      : `<iframe src="${esc(pdf)}" title="${esc(title)}"></iframe>`;
    $("#viewerBody").scrollTop = 0;
    if (typeof viewer.showModal === "function") viewer.showModal();
    else viewer.setAttribute("open", "");
    document.documentElement.classList.add("viewer-open");
    lenisRef && lenisRef.stop();
  }
  function closeViewer() {
    if (viewer.open) viewer.close();
  }
  /* Downloads go through a blob URL so download managers (e.g. IDM) can't hijack
     the link; if that fails, the file opens in a new tab instead. */
  async function downloadFile(url) {
    const name = url.split("/").pop();
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.status);
      const blobUrl = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = name;
      a.dataset.direct = "1";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);
    } catch (e) {
      window.open(url, "_blank", "noopener");
    }
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[download]");
    if (!a || a.dataset.direct === "1" || !a.getAttribute("href") || a.getAttribute("href") === "#") return;
    e.preventDefault();
    downloadFile(a.getAttribute("href"));
  });

  viewer.addEventListener("close", () => {
    document.documentElement.classList.remove("viewer-open");
    lenisRef && lenisRef.start();
  });
  $("#viewerClose").addEventListener("click", closeViewer);
  viewer.addEventListener("click", (e) => { if (e.target === viewer) closeViewer(); });

  /* ---------- Contact form (FormSubmit, free) ---------- */
  (function () {
    const form = $("#contactForm");
    if (!form) return;
    const status = $("#cformStatus");
    const btn = $("#cformSend");
    const set = (msg, kind) => { status.textContent = msg; status.dataset.kind = kind || ""; };
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = new FormData(form);
      const name = (f.get("name") || "").toString().trim();
      const email = (f.get("email") || "").toString().trim();
      const message = (f.get("message") || "").toString().trim();
      if (f.get("_honey")) return; // bots
      if (!name || !/^\S+@\S+\.\S+$/.test(email) || message.length < 10) {
        set("Please add your name, a valid email and a message (10+ characters).", "error");
        return;
      }
      btn.disabled = true;
      form.classList.add("is-sending");
      set("Sending…", "");
      const body = {
        name, email, message,
        subject: (f.get("subject") || "").toString().trim() || "New message from your portfolio",
        _subject: `Portfolio: ${(f.get("subject") || "New message").toString().trim() || "New message"} — ${name}`,
        _replyto: email,
        _template: "table",
        _captcha: "false"
      };
      try {
        let ok = false;
        try {
          // 1) our own server (Resend) — the API key stays on the server
          const r = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, message, subject: (f.get("subject") || "").toString().trim() })
          });
          const d = await r.json().catch(() => ({}));
          if (r.ok) ok = true;
          else if (r.status !== 404 && r.status !== 405) {
            // the server exists but refused: show its reason instead of hiding it
            throw Object.assign(new Error(d.message || "Could not send the message."), { final: true });
          }
        } catch (e) { if (e.final) throw e; }
        if (!ok && D.formEndpoint) {
          // 2) fallback for static hosting without a server
          const res = await fetch(D.formEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(body)
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || data.success === "false" || data.success === false) throw new Error(data.message || res.status);
          ok = true;
        }
        if (!ok) throw new Error("send failed");
        form.reset();
        form.classList.add("is-sent");
        set("Thank you — your message is on its way. I’ll reply soon.", "ok");
      } catch (err) {
        set(err.final ? err.message : `Couldn’t send right now. Please email me at ${D.workEmail || D.email}.`, "error");
      } finally {
        btn.disabled = false;
        form.classList.remove("is-sending");
      }
    });
  })();

  render();

  /* ---------- Without GSAP or with reduced motion: static page ---------- */
  const loader = $(".loader");
  if (!hasGsap || reduced) {
    loader.remove();
    if (HeroScene) { HeroScene.setIntro(1); HeroScene.setProgress(1); HeroScene.setCrystals(1); }
    setupProjects(false);
    const mc = $("#mirrorCanvas");
    if (mc) import("./robot.js").then((r) => { const rb = r.initRobot(mc, $("#mirror")); rb && rb.setProgress(1); }).catch(() => {});
    document.querySelectorAll("#navBurger").forEach((b) => b.addEventListener("click", () => { $("#menu").classList.toggle("is-open"); }));
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add("is-loading");

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
    lenisRef = lenis;
  }

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2 && id !== "#") return;
      const el = id === "#" || id === "#top" ? 0 : document.querySelector(id);
      if (el === null) return;
      e.preventDefault();
      // Mobile menu: close it first (it stops smooth-scroll and locks the page), then scroll
      if (document.documentElement.classList.contains("menu-open")) toggleMenu(false);
      requestAnimationFrame(() => {
        lenis ? lenis.scrollTo(el, { offset: 0, duration: 1.4, force: true }) : window.scrollTo({ top: el ? el.offsetTop : 0, behavior: "smooth" });
      });
    });
  });

  /* ---------- Loader → intro (the one orchestrated moment) ---------- */
  const counter = { v: 0 };
  const intro = gsap.timeline({ paused: true });
  gsap.set(".hero__name .ch", { yPercent: 110 });
  gsap.set([".hero__photo", ".hero__degree", ".hero__role", ".hero__intro", ".hero__actions", ".nav", ".hero__hint"], { autoAlpha: 0, y: 16 });

  intro
    .to(".loader", { yPercent: -100, duration: 1, ease: "expo.inOut" })
    .add(() => { document.body.classList.remove("is-loading"); lenis && lenis.start(); }, "-=0.4")
    .to(HeroScene ? HeroScene.uniforms.uIntro : {}, { value: 1, duration: 2.2, ease: "expo.out" }, "-=0.5")
    .to(".hero__name .ch", { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.035 }, "<")
    .to([".hero__photo", ".hero__role", ".hero__degree", ".nav", ".hero__intro", ".hero__actions", ".hero__hint"], { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.08 }, "-=0.7")
    .add(() => loader.remove());

  gsap.to(counter, {
    v: 100,
    duration: 0.9,
    ease: "power2.inOut",
    onUpdate: () => {
      $("#loaderNum").textContent = Math.round(counter.v);
      $("#loaderBar").style.width = counter.v + "%";
    },
    onComplete: () => {
      let started = false;
      const go = () => { if (!started) { started = true; intro.play(); } };
      document.readyState === "complete" ? go() : window.addEventListener("load", go, { once: true });
      setTimeout(go, 1500); // never wait on slow fonts or images
    }
  });

  /* ---------- Scroll: noise becomes a model ---------- */
  // The hero is pinned while the cloud converges, so the moment happens on screen
  const heroTl = gsap.timeline({
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "+=130%",
      pin: true,
      scrub: 0.6,
      onUpdate: (st) => {
        if (!HeroScene) return;
        HeroScene.setProgress(Math.min(st.progress / 0.8, 1));
        HeroScene.setScroll(st.progress);
      }
    }
  });
  heroTl
    .to(".hero__inner", { yPercent: -18, autoAlpha: 0, ease: "none", duration: 0.45 }, 0)
    .to(".hero__hint", { autoAlpha: 0, duration: 0.2 }, 0)
    .fromTo(".hero__photo", { autoAlpha: 1, scale: 1 }, { autoAlpha: 0, scale: 0.94, ease: "none", duration: 0.4, immediateRender: false }, 0)
    .fromTo(".hero__caption", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.3 }, 0.6)
    .to({}, { duration: 0.1 });

  if (HeroScene) {
    // The point cloud fades out and the crystals fade in as the content takes over
    ScrollTrigger.create({
      trigger: ".about",
      start: "top 70%",
      end: "top 10%",
      scrub: true,
      onUpdate: (st) => {
        HeroScene.setPointsFade(1 - st.progress);
        HeroScene.setCrystals(st.progress);
      },
      onLeaveBack: () => { HeroScene.setPointsFade(1); HeroScene.setCrystals(0); }
    });
  }

  /* ---------- Nav: solid pill, scroll progress, active link blob, mobile menu ---------- */
  const nav = $(".nav");
  const menu = $("#menu");
  const burger = $("#navBurger");
  const progressBar = $("#navProgress");
  const links = [...document.querySelectorAll("#navLinks a")];
  const blob = $(".nav__blob");
  let activeLink = null;
  function moveBlob(a) {
    if (!a) { blob.style.opacity = 0; return; }
    blob.style.opacity = 1;
    blob.style.width = a.offsetWidth + "px";
    blob.style.transform = `translateX(${a.offsetLeft}px)`;
  }
  links.forEach((a) => {
    a.addEventListener("pointerenter", () => moveBlob(a));
    a.addEventListener("pointerleave", () => moveBlob(activeLink));
  });
  function setActive(id) {
    activeLink = links.find((a) => a.getAttribute("href") === "#" + id) || null;
    links.forEach((a) => a.classList.toggle("is-active", a === activeLink));
    moveBlob(activeLink);
  }
  ["work", "experience", "skills", "education"].forEach((id) => {
    ScrollTrigger.create({
      trigger: "#" + id, start: "top 55%", end: "bottom 55%",
      onToggle: (st) => { if (st.isActive) setActive(id); else if (activeLink && activeLink.getAttribute("href") === "#" + id) setActive(""); }
    });
  });
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (st) => {
      const y = st.scroll();
      nav.classList.toggle("is-solid", y > 40);
      nav.classList.toggle("is-hidden", st.direction === 1 && y > window.innerHeight * 0.8 && !menu.classList.contains("is-open"));
      progressBar.style.transform = `scaleX(${st.progress})`;
    }
  });
  function toggleMenu(open) {
    menu.classList.toggle("is-open", open);
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    document.documentElement.classList.toggle("menu-open", open);
    open ? lenis && lenis.stop() : lenis && lenis.start();
  }
  burger.addEventListener("click", () => toggleMenu(!menu.classList.contains("is-open")));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") toggleMenu(false); });

  /* ---------- Mirror shatters, robot appears (pinned, scroll-scrubbed) ---------- */
  {
    const mirror = $("#mirror");
    const canvas = $("#mirrorCanvas");
    let robot = null;
    let last = 0;
    ScrollTrigger.create({
      trigger: mirror, start: "top top", end: "+=180%", pin: true, scrub: 0.6,
      onUpdate: (st) => { last = st.progress; robot && robot.setProgress(last); }
    });
    // Load the 3D robot only when the visitor gets near it
    ScrollTrigger.create({
      trigger: mirror, start: "top bottom+=1200", once: true,
      onEnter: () => import("./robot.js").then((m) => {
        robot = m.initRobot(canvas, mirror);
        robot && robot.setProgress(last);
      }).catch(() => {})
    });
  }

  /* ---------- Section headings reveal ---------- */
  document.querySelectorAll(".h2").forEach((h) => {
    gsap.from(h, {
      y: 40, autoAlpha: 0, duration: 1, ease: "expo.out",
      scrollTrigger: { trigger: h, start: "top 88%" }
    });
  });

  // Facts count up once
  document.querySelectorAll(".facts dt").forEach((dt) => {
    const raw = dt.textContent.trim();
    const match = raw.match(/^(\d+(?:\.\d+)?)(.*)$/);
    if (!match) return;
    const num = parseFloat(match[1]);
    const decimals = (match[1].split(".")[1] || "").length;
    const suffix = match[2];
    const o = { v: 0 };
    gsap.to(o, {
      v: num, duration: 1.4, ease: "power2.out",
      scrollTrigger: { trigger: dt, start: "top 90%" },
      onUpdate: () => (dt.textContent = o.v.toFixed(decimals) + suffix),
      onComplete: () => (dt.textContent = raw)
    });
  });

  // Timeline line fills as you read
  gsap.to(".timeline__progress", {
    scaleY: 1, ease: "none",
    scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 60%", scrub: true }
  });

  setupProjects(true);
  setupCursor();
  setupMagnetic();

  /* ---------- Projects accordion ---------- */
  function setupProjects(animate) {
    document.querySelectorAll(".project").forEach((item) => {
      const btn = $(".project__toggle", item);
      const panel = $(".project__panel", item);
      btn.addEventListener("click", () => {
        const open = !item.classList.contains("is-open");
        item.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", String(open));
        if (animate && hasGsap) {
          gsap.to(panel, {
            height: open ? "auto" : 0, duration: 0.7, ease: "expo.inOut",
            onComplete: () => ScrollTrigger.refresh()
          });
          if (open) gsap.from($(".project__body", item).children, { y: 20, autoAlpha: 0, duration: 0.6, stagger: 0.06, delay: 0.15, ease: "power3.out" });
        } else {
          panel.style.height = open ? "auto" : "0";
        }
        updateCursorLabel();
      });
    });
  }

  /* ---------- Cursor: dot + trailing ring, label bubble on projects and images ---------- */
  let cursorTarget = null;
  function updateCursorLabel() {
    if (!cursorTarget) return;
    const proj = cursorTarget.closest(".project");
    $(".cursor span").textContent = cursorTarget.dataset.cursor || (proj && proj.classList.contains("is-open") ? "Close" : "Open");
  }
  function setupCursor() {
    if (!finePointer) return;
    const root = document.documentElement;
    const bubble = $(".cursor");
    const ring = $(".cur-ring");
    const dot = $(".cur-dot");
    root.classList.add("has-cursor");
    const bx = gsap.quickTo(bubble, "x", { duration: 0.45, ease: "power3" });
    const by = gsap.quickTo(bubble, "y", { duration: 0.45, ease: "power3" });
    const rx = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3" });
    const ry = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3" });
    const dx = gsap.quickTo(dot, "x", { duration: 0.06, ease: "none" });
    const dy = gsap.quickTo(dot, "y", { duration: 0.06, ease: "none" });
    let seen = false;
    window.addEventListener("pointermove", (e) => {
      if (!seen) { seen = true; gsap.set([ring, dot], { x: e.clientX, y: e.clientY }); root.classList.add("cursor-on"); }
      bx(e.clientX); by(e.clientY); rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY);
    }, { passive: true });
    document.addEventListener("pointerleave", () => root.classList.remove("cursor-on"));
    document.addEventListener("pointerenter", () => seen && root.classList.add("cursor-on"));
    window.addEventListener("pointerdown", () => ring.classList.add("is-down"));
    window.addEventListener("pointerup", () => ring.classList.remove("is-down"));
    document.addEventListener("pointerover", (e) => {
      const t = e.target;
      const label = t.closest && t.closest("[data-cursor], .project__toggle");
      if (label !== cursorTarget) {
        cursorTarget = label;
        if (label) { updateCursorLabel(); gsap.to(bubble, { scale: 1, duration: 0.4, ease: "back.out(2)", overwrite: true }); }
        else gsap.to(bubble, { scale: 0, duration: 0.3, overwrite: true });
      }
      ring.classList.toggle("is-hidden", !!label || !!(t.closest && t.closest("input, textarea")));
      ring.classList.toggle("is-link", !label && !!(t.closest && t.closest("a, button, [role=button], label")));
    });
  }

  /* ---------- Magnetic buttons ---------- */
  function setupMagnetic() {
    if (!finePointer) return;
    document.querySelectorAll(".magnetic").forEach((el) => {
      const strength = el.classList.contains("contact__mail") ? 0.12 : 0.35;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * strength, y: (e.clientY - r.top - r.height / 2) * strength, duration: 0.5, ease: "power3.out" });
      });
      el.addEventListener("pointerleave", () => gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.4)" }));
    });
  }
})();
