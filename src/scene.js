/* ==========================================================
   3D hero: noisy data points that converge into a fitted
   surface ("signal from noise") as the visitor scrolls.
   ========================================================== */
import * as THREE from "three";

export function initScene() {
  const canvas = document.getElementById("scene");
  if (!canvas) return null;

  // Bail out gracefully when WebGL isn't available
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    canvas.remove();
    return null;
  }

  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(isMobile ? 62 : 45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 2.2, isMobile ? 15 : 13);

  // ---------- Build the point cloud ----------
  const COUNT = isMobile ? 4500 : 11000;
  const start = new Float32Array(COUNT * 3);
  const target = new Float32Array(COUNT * 3);
  const rand = new Float32Array(COUNT);
  const signal = new Float32Array(COUNT);

  // Box–Muller gaussian
  const gauss = () => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

  // The "model" the data converges to
  const surface = (x, z) => 1.15 * Math.sin(x * 0.55) * Math.cos(z * 0.62) + 0.12 * x;

  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    // Noise: a wide, flattened gaussian cloud
    start[i3] = gauss() * 6.5;
    start[i3 + 1] = gauss() * 3.4;
    start[i3 + 2] = gauss() * 5.0;

    // Model: samples on the surface with small residuals
    const x = (Math.random() - 0.5) * 14;
    const z = (Math.random() - 0.5) * 9;
    const residual = gauss() * 0.06;
    target[i3] = x;
    target[i3 + 1] = surface(x, z) + residual;
    target[i3 + 2] = z;

    rand[i] = Math.random();
    signal[i] = Math.random() < 0.045 ? 1 : 0; // a few highlighted "insight" points
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(start, 3));
  geo.setAttribute("aTarget", new THREE.BufferAttribute(target, 3));
  geo.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
  geo.setAttribute("aSignal", new THREE.BufferAttribute(signal, 1));

  const uniforms = {
    uTime: { value: 0 },
    uProgress: { value: 0 },   // 0 = noise, 1 = fitted model
    uIntro: { value: 0 },      // 0 = collapsed, 1 = visible
    uFade: { value: 1 },       // fades the cloud out after the hero
    uSize: { value: (isMobile ? 46 : 52) * dpr },
    uTeal: { value: new THREE.Color("#1F4E46") },
    uAmber: { value: new THREE.Color("#A8782E") }
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uProgress;
      uniform float uIntro;
      uniform float uFade;
      uniform float uSize;
      attribute vec3 aTarget;
      attribute float aRand;
      attribute float aSignal;
      varying float vSignal;
      varying float vAlpha;

      void main() {
        // Each point converges with its own slight delay
        float p = smoothstep(aRand * 0.45, aRand * 0.45 + 0.55, uProgress);

        // Noise drifts; the model breathes gently
        vec3 noisy = position;
        noisy.x += sin(uTime * 0.25 + aRand * 40.0) * 0.35;
        noisy.y += cos(uTime * 0.3 + aRand * 25.0) * 0.35;

        vec3 fitted = aTarget;
        fitted.y += sin(uTime * 0.6 + aTarget.x * 0.6) * 0.08;

        vec3 pos = mix(noisy, fitted, p);
        pos *= mix(0.2, 1.0, uIntro);

        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;

        float size = uSize * (aSignal > 0.5 ? 2.2 : 1.0) * (0.6 + aRand * 0.6);
        gl_PointSize = size / -mv.z;

        vSignal = aSignal;
        vAlpha = uIntro * uFade * mix(0.32, 0.6, p);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uTeal;
      uniform vec3 uAmber;
      varying float vSignal;
      varying float vAlpha;

      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float soft = smoothstep(0.5, 0.25, d);
        vec3 col = mix(uTeal, uAmber, vSignal);
        gl_FragColor = vec4(col, soft * vAlpha);
        #include <colorspace_fragment>
      }
    `
  });

  const points = new THREE.Points(geo, material);
  const group = new THREE.Group();
  group.add(points);
  group.rotation.set(0.35, -0.5, 0);
  group.position.x = isMobile ? 0 : -1.5;
  group.position.y = isMobile ? 1.6 : 0.6;
  scene.add(group);

  // ---------- Crystals: faceted shapes that drift through the rest of the page ----------
  const cScene = new THREE.Scene();
  const cCamera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 100);
  cCamera.position.set(0, 0, 12);
  cScene.add(new THREE.HemisphereLight(0xfff6e6, 0x2a3a36, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(4, 6, 8);
  cScene.add(key);
  const rim = new THREE.DirectionalLight(0xc9a46a, 1.4);
  rim.position.set(-6, -3, 2);
  cScene.add(rim);

  const palette = [
    { color: 0x1f4e46, edge: 0x7fb8ab },   // pine
    { color: 0xa8782e, edge: 0xf1d29c },   // brass
    { color: 0xd9cbb3, edge: 0x8a6327 }    // sand
  ];
  const shapes = [
    () => new THREE.OctahedronGeometry(1, 0),
    () => new THREE.IcosahedronGeometry(1, 0),
    () => { const g = new THREE.OctahedronGeometry(1, 0); g.scale(0.62, 1.35, 0.62); return g; },
    () => new THREE.DodecahedronGeometry(1, 0),
    () => { const g = new THREE.ConeGeometry(0.9, 2.2, 6, 1); g.translate(0, 0.2, 0); return g; }
  ];
  // side: -1 left edge, 1 right edge; y: starting height in viewport units; z: depth
  const layout = isMobile
    ? [[1, 0.25, 0, 0.42], [-1, -0.2, 1, 0.34], [1, -0.75, 2, 0.38], [-1, 0.75, 3, 0.3]]
    : [[1, 0.3, 0, 0.55], [-1, -0.15, 1, 0.45], [1, -0.7, 2, 0.38], [-1, 0.7, 3, 0.5], [1, 1.1, 4, 0.34], [-1, -1.1, 0, 0.36], [1, -1.5, 2, 0.48]];
  const crystals = layout.map(([side, y, shape, size], i) => {
    const pal = palette[i % palette.length];
    const geo = shapes[shape % shapes.length]();
    const mat = new THREE.MeshStandardMaterial({
      color: pal.color, flatShading: true, metalness: 0.35, roughness: 0.28,
      transparent: true, opacity: 0
    });
    const mesh = new THREE.Mesh(geo, mat);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(geo),
      new THREE.LineBasicMaterial({ color: pal.edge, transparent: true, opacity: 0 })
    );
    mesh.add(edges);
    mesh.scale.setScalar(size);
    mesh.rotation.set(Math.random() * 3, Math.random() * 3, 0);
    mesh.userData = { side, y, size, speed: 0.15 + Math.random() * 0.25, spin: (Math.random() - 0.5) * 0.6, phase: Math.random() * 6.28, parallax: 0.6 + Math.random() * 0.8 };
    cScene.add(mesh);
    return mesh;
  });
  let crystalFade = 0;
  let pageScroll = 0;
  window.addEventListener("scroll", () => { pageScroll = window.scrollY; }, { passive: true });

  function placeCrystals(t) {
    const visH = 2 * cCamera.position.z * Math.tan((cCamera.fov * Math.PI) / 360);
    const visW = visH * cCamera.aspect;
    // Keep crystals in the page margins, clear of the content column
    const pxPerUnit = window.innerWidth / visW;
    const margin = Math.max(0, (window.innerWidth - 1240) / 2);
    const edgeX = visW / 2 - (isMobile ? 0.2 : Math.max(0.5, Math.min(margin / pxPerUnit / 2, 1.6)));
    const range = visH * 1.6;
    crystals.forEach((m) => {
      const d = m.userData;
      // Scroll moves crystals up the screen at different speeds (parallax), wrapping around
      let y = d.y * visH * 0.5 + (pageScroll / window.innerHeight) * visH * 0.35 * d.parallax;
      y = ((((y + range / 2) % range) + range) % range) - range / 2;
      m.position.set(d.side * edgeX + Math.sin(t * d.speed + d.phase) * 0.25, y + Math.sin(t * 0.6 + d.phase) * 0.15, 0);
      m.rotation.y += reduced ? 0 : 0.004 + d.spin * 0.006;
      m.rotation.x += reduced ? 0 : 0.002;
      m.material.opacity = crystalFade * 0.92;
      m.children[0].material.opacity = crystalFade * 0.7;
    });
    cScene.rotation.y = mouse.x * 0.05;
    cScene.rotation.x = mouse.y * 0.03;
  }

  // ---------- Interaction ----------
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener("pointermove", (e) => {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  let scroll = 0; // 0..1 across the hero

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    cCamera.aspect = w / h;
    cCamera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);

  // Pause rendering when the tab is hidden or the canvas is fully faded
  let running = true;
  document.addEventListener("visibilitychange", () => { running = !document.hidden; if (running) tick(); });

  const t0 = performance.now();
  function tick() {
    if (!running) return;
    const t = (performance.now() - t0) / 1000;
    uniforms.uTime.value = reduced ? 0 : t;

    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    // Scroll turns the cloud into a 3/4 view of the fitted surface
    group.rotation.y = -0.5 + scroll * 0.9 + mouse.x * 0.18 + (reduced ? 0 : t * 0.02);
    group.rotation.x = 0.35 + scroll * 0.2 + mouse.y * 0.08;
    camera.position.y = 2.2 - scroll * 0.8;
    camera.lookAt(0, 0.4, 0);

    renderer.autoClear = false;
    renderer.clear();
    if (uniforms.uFade.value > 0.01) renderer.render(scene, camera);
    if (crystalFade > 0.01) { placeCrystals(t); renderer.render(cScene, cCamera); }
    requestAnimationFrame(tick);
  }
  tick();

  return {
    uniforms,
    setScroll(v) { scroll = v; },
    setProgress(v) { uniforms.uProgress.value = v; },
    setIntro(v) { uniforms.uIntro.value = v; },
    setPointsFade(v) { uniforms.uFade.value = v; },
    setCrystals(v) { crystalFade = v; }
  };
}
