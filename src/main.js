import "./style.css";
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

    $("#aboutBody").innerHTML = D.about.map((p) => `<p>${esc(p)}</p>`).join("");
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
              ${imgs.slice(0, 3).map((src, k) => `<button type="button" class="showcase__phone showcase__phone--${k}" data-proj="${i}" data-shot="${k}" aria-label="Open ${esc(p.title)} screen ${k + 1}"><img src="${esc(src)}" alt="${esc(p.title)} app screen ${k + 1}" loading="lazy" /></button>`).join("")}
              ${imgs.length > 3 ? `<button type="button" class="showcase__all btn" data-proj="${i}" data-shot="0">View all ${imgs.length} screens</button>` : ""}
            </div></div>`
          : "";
        const preview = p.device === "phone" ? phones : imgs.length || p.url
          ? `<div class="project__preview"><div class="frame">
              <div class="frame__bar"><i></i><i></i><i></i>${p.url ? `<span class="frame__url">${esc(p.urlLabel || p.url.replace(/^https?:\/\//, ""))}</span>` : ""}</div>
              ${imgs.length
                ? `<div class="frame__shots">${imgs.map((src, k) => `<button type="button" class="shot" data-proj="${i}" data-shot="${k}" aria-label="Enlarge ${esc(p.title)} screenshot ${k + 1}"><img src="${esc(src)}" alt="${esc(p.title)} screenshot ${k + 1}" loading="lazy" /></button>`).join("")}</div>`
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

    const mail = $("#mailLink");
    mail.href = `mailto:${D.email}`;
    mail.textContent = D.email;
    $("#contactLinks").innerHTML = D.links
      .map((l) => `<li><a class="btn magnetic" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`)
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

  render();

  /* ---------- Without GSAP or with reduced motion: static page ---------- */
  const loader = $(".loader");
  if (!hasGsap || reduced) {
    loader.remove();
    if (HeroScene) { HeroScene.setIntro(1); HeroScene.setProgress(1); HeroScene.setCrystals(1); }
    setupProjects(false);
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
      lenis ? lenis.scrollTo(el, { offset: 0, duration: 1.4 }) : window.scrollTo({ top: el ? el.offsetTop : 0, behavior: "smooth" });
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
    duration: 1.4,
    ease: "power2.inOut",
    onUpdate: () => {
      $("#loaderNum").textContent = Math.round(counter.v);
      $("#loaderBar").style.width = counter.v + "%";
    },
    onComplete: () => {
      const go = () => intro.play();
      document.readyState === "complete" ? go() : window.addEventListener("load", go, { once: true });
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
    .to(".hero__photo", { yPercent: -12, autoAlpha: 0, ease: "none", duration: 0.45 }, 0)
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

  /* ---------- Nav: solid after scroll, hides when scrolling down ---------- */
  const nav = $(".nav");
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (st) => {
      const y = st.scroll();
      nav.classList.toggle("is-solid", y > 40);
      nav.classList.toggle("is-hidden", st.direction === 1 && y > window.innerHeight * 0.8);
    }
  });

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

  /* ---------- Cursor bubble over projects ---------- */
  let cursorTarget = null;
  function updateCursorLabel() {
    if (!cursorTarget) return;
    $(".cursor span").textContent = cursorTarget.closest(".project").classList.contains("is-open") ? "Close" : "Open";
  }
  function setupCursor() {
    if (!finePointer) return;
    const cur = $(".cursor");
    const xTo = gsap.quickTo(cur, "x", { duration: 0.45, ease: "power3" });
    const yTo = gsap.quickTo(cur, "y", { duration: 0.45, ease: "power3" });
    window.addEventListener("pointermove", (e) => { xTo(e.clientX); yTo(e.clientY); }, { passive: true });
    document.querySelectorAll(".project__toggle").forEach((t) => {
      t.addEventListener("pointerenter", () => { cursorTarget = t; updateCursorLabel(); gsap.to(cur, { scale: 1, duration: 0.4, ease: "back.out(2)" }); });
      t.addEventListener("pointerleave", () => { cursorTarget = null; gsap.to(cur, { scale: 0, duration: 0.3 }); });
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
