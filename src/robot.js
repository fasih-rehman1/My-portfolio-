/* ==========================================================
   Robot behind a mirror. As the visitor scrolls, the mirror
   cracks from an impact point, the shards fly toward the
   camera, and a friendly robot is revealed.
   ========================================================== */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const rand = (a, b) => a + Math.random() * (b - a);

export function initRobot(canvas, section) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  } catch (e) {
    return null;
  }
  const isMobile = window.matchMedia("(max-width: 760px)").matches;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d1714);
  const FOV = 35;
  const CAM_Z = 10;
  const MIRROR_Z = 2;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 60);
  camera.position.set(0, 0, CAM_Z);

  // Reflections + lights
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.55;
  const key = new THREE.DirectionalLight(0xfff1dc, 2.2);
  key.position.set(3, 4, 6);
  scene.add(key);
  const rim = new THREE.PointLight(0x4df0c8, 18, 14);
  rim.position.set(-3.5, 1, -1.5);
  scene.add(rim);
  const warm = new THREE.PointLight(0xe0a54b, 10, 12);
  warm.position.set(3.5, -1.5, 1.5);
  scene.add(warm);

  /* ---------- Robot ---------- */
  const robot = new THREE.Group();
  scene.add(robot);
  const ceramic = new THREE.MeshPhysicalMaterial({ color: 0xf5f0e7, roughness: 0.2, metalness: 0.04, clearcoat: 1, clearcoatRoughness: 0.1 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x04090a, roughness: 0.04, metalness: 0.9, clearcoat: 1, clearcoatRoughness: 0.03 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x24332f, roughness: 0.32, metalness: 0.95 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd9a441, roughness: 0.22, metalness: 1, emissive: 0x5c3a08, emissiveIntensity: 0.5 });
  const neon = new THREE.MeshBasicMaterial({ color: 0x7dffe0 });

  // soft glow sprite behind the robot
  const gc = document.createElement("canvas");
  gc.width = gc.height = 128;
  const gx = gc.getContext("2d");
  const grd = gx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(109,255,217,0.55)");
  grd.addColorStop(0.4, "rgba(109,255,217,0.14)");
  grd.addColorStop(1, "rgba(109,255,217,0)");
  gx.fillStyle = grd;
  gx.fillRect(0, 0, 128, 128);
  const aura = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(gc), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.8 }));
  aura.scale.set(8, 8, 1);
  aura.position.set(0, 0, -1.6);
  robot.add(aura);

  // Torso
  const body = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 48), ceramic);
  body.scale.set(0.8, 0.98, 0.68);
  body.position.y = -1.05;
  robot.add(body);
  const waist = new THREE.Mesh(new THREE.TorusGeometry(0.76, 0.03, 16, 80), neon);
  waist.rotation.x = Math.PI / 2;
  waist.scale.set(1, 0.84, 1);
  waist.position.y = -0.78;
  robot.add(waist);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 24), neon);
  core.position.set(0, -1.0, 0.68);
  robot.add(core);
  const coreRing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 12, 40), gold);
  coreRing.position.set(0, -1.0, 0.66);
  robot.add(coreRing);

  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.3, 24), metal);
  neck.position.y = -0.12;
  robot.add(neck);

  // Head
  const head = new THREE.Group();
  head.position.y = 0.72;
  robot.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), ceramic);
  skull.scale.set(1.12, 0.92, 0.98);
  head.add(skull);
  const visor = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 48), glass);
  visor.scale.set(0.92, 0.62, 0.5);
  visor.position.z = 0.53;
  head.add(visor);
  const eyeGeo = new THREE.CapsuleGeometry(0.075, 0.17, 6, 14);
  const eyes = [];
  for (const x of [-0.34, 0.34]) {
    const e = new THREE.Mesh(eyeGeo, neon);
    e.position.set(x, 0.05, 1.0);
    head.add(e);
    eyes.push(e);
  }
  for (const x of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.2, 32), gold);
    ear.rotation.z = Math.PI / 2;
    ear.position.set(x * 1.1, 0, 0);
    head.add(ear);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 24), neon);
    cap.rotation.z = Math.PI / 2;
    cap.position.set(x * 1.1, 0, 0);
    head.add(cap);
  }
  const antenna = new THREE.Group();
  antenna.position.y = 0.88;
  head.add(antenna);
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.34, 10), metal);
  stick.position.y = 0.17;
  antenna.add(stick);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 20), neon);
  bulb.position.y = 0.38;
  antenna.add(bulb);

  // Arms (pivot at the shoulder)
  function makeArm(side) {
    const g = new THREE.Group();
    g.position.set(side * 0.92, -0.58, 0);
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 24), metal));
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.115, 0.5, 8, 18), ceramic);
    arm.position.y = -0.38;
    g.add(arm);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 24), ceramic);
    hand.position.y = -0.8;
    g.add(hand);
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.022, 10, 30), neon);
    band.rotation.x = Math.PI / 2;
    band.position.y = -0.66;
    g.add(band);
    robot.add(g);
    return g;
  }
  const armL = makeArm(-1);
  const armR = makeArm(1);

  // Hover base + glow ring
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.22, 0.16, 40), metal);
  disc.position.y = -2.2;
  robot.add(disc);
  const halo = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.62, 56), new THREE.MeshBasicMaterial({ color: 0x7dffe0, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = -2.32;
  robot.add(halo);

  // Orbiting ring with beads
  const orbit = new THREE.Group();
  orbit.position.y = -0.4;
  orbit.rotation.set(1.25, 0, 0.35);
  robot.add(orbit);
  orbit.add(new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.008, 8, 160), new THREE.MeshBasicMaterial({ color: 0x7dffe0, transparent: true, opacity: 0.45 })));
  const beads = [];
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(i === 0 ? 0.075 : 0.05, 14, 14), i === 0 ? gold : neon);
    orbit.add(m);
    beads.push(m);
  }

  /* ---------- Mirror shards ---------- */
  const mirrorMat = new THREE.MeshPhysicalMaterial({
    color: 0xdfece6, metalness: 1, roughness: 0.06, envMapIntensity: 2.4, side: THREE.DoubleSide, clearcoat: 1
  });
  const shardGroup = new THREE.Group();
  shardGroup.position.z = MIRROR_Z;
  scene.add(shardGroup);
  let shards = [];
  let maxDist = 1;

  function buildMirror(w, h) {
    shards.forEach((s) => s.mesh.geometry.dispose());
    shardGroup.clear();
    shards = [];
    const spokes = isMobile ? 10 : 16;
    const rings = isMobile ? 5 : 7;
    const impact = new THREE.Vector2(w * 0.08, h * 0.04);
    const R = Math.hypot(w, h);
    const ringR = [0];
    for (let i = 1; i <= rings; i++) ringR.push(R * Math.pow(i / rings, 1.9) * 1.05);
    const angles = [];
    for (let j = 0; j < spokes; j++) angles.push((j / spokes) * Math.PI * 2 + rand(-0.12, 0.12));
    const hw = w / 2, hh = h / 2;
    const P = (i, j) => {
      const a = angles[j % spokes];
      const r = ringR[i] * (i === 0 || i === rings ? 1 : 1 + rand(-0.12, 0.12));
      return new THREE.Vector2(
        clamp(impact.x + Math.cos(a) * r, -hw, hw),
        clamp(impact.y + Math.sin(a) * r, -hh, hh)
      );
    };
    const grid = [];
    for (let i = 0; i <= rings; i++) { grid.push([]); for (let j = 0; j < spokes; j++) grid[i].push(P(i, j)); }
    // the centre ring collapses to one point
    for (let j = 0; j < spokes; j++) grid[0][j] = impact.clone();

    for (let i = 0; i < rings; i++) {
      for (let j = 0; j < spokes; j++) {
        const q = [grid[i][j], grid[i][(j + 1) % spokes], grid[i + 1][(j + 1) % spokes], grid[i + 1][j]];
        const uniq = [];
        q.forEach((p) => { if (!uniq.some((u) => u.distanceTo(p) < 1e-4)) uniq.push(p); });
        if (uniq.length < 3) continue;
        const c = uniq.reduce((a, p) => a.add(p), new THREE.Vector2()).multiplyScalar(1 / uniq.length);
        // area check (skip slivers created by clamping)
        let area = 0;
        for (let k = 0; k < uniq.length; k++) { const a = uniq[k], b = uniq[(k + 1) % uniq.length]; area += a.x * b.y - b.x * a.y; }
        if (Math.abs(area) < 1e-3) continue;
        const pos = [];
        const idx = [];
        uniq.forEach((p) => pos.push(p.x - c.x, p.y - c.y, 0));
        for (let k = 1; k < uniq.length - 1; k++) idx.push(0, k, k + 1);
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        geo.setIndex(idx);
        geo.computeVertexNormals();
        const mesh = new THREE.Mesh(geo, mirrorMat);
        const tilt = new THREE.Euler(rand(-0.035, 0.035), rand(-0.035, 0.035), 0);
        mesh.rotation.copy(tilt);
        mesh.position.set(c.x, c.y, 0);
        shardGroup.add(mesh);
        const d = Math.hypot(c.x - impact.x, c.y - impact.y);
        const dir = new THREE.Vector2(c.x - impact.x, c.y - impact.y);
        if (dir.lengthSq() < 1e-6) dir.set(rand(-1, 1), rand(-1, 1));
        dir.normalize();
        shards.push({
          mesh, c, d, dir, tilt,
          spin: new THREE.Vector3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).multiplyScalar(rand(2, 6)),
          fly: rand(1.8, 4.2), speed: rand(2.5, 6), fall: rand(1.5, 4)
        });
        maxDist = Math.max(maxDist, d);
      }
    }
    maxDist = Math.max(...shards.map((s) => s.d), 1);
  }

  /* ---------- Size ---------- */
  let aspect = 1;
  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    aspect = w / h;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    const visH = 2 * (CAM_Z - MIRROR_Z) * Math.tan((FOV * Math.PI) / 360);
    buildMirror(visH * aspect * 1.04, visH * 1.04);
    const base = clamp(aspect / 1.15, 0.55, 1) * 0.86;
    robot.userData.base = base;
    apply(progress);
  }

  /* ---------- Scroll progress → state ---------- */
  let progress = 0;
  function apply(p) {
    const crack = smooth(0.04, 0.16, p);
    const burst = clamp((p - 0.2) / 0.5);
    shards.forEach((s) => {
      const t = clamp(burst * 1.5 - (s.d / maxDist) * 0.5);
      const e = t * t * (3 - 2 * t);
      const m = s.mesh;
      m.position.set(
        s.c.x + s.dir.x * e * s.speed,
        s.c.y + s.dir.y * e * s.speed - e * e * s.fall,
        e * s.fly
      );
      m.rotation.set(s.tilt.x + s.spin.x * e, s.tilt.y + s.spin.y * e, s.spin.z * e);
      const gap = 1 - 0.016 * crack;
      const sc = gap * (1 - smooth(0.72, 1, t));
      m.scale.setScalar(Math.max(sc, 0.0001));
      m.visible = sc > 0.001;
    });
    // slight camera shake at the moment of impact
    const shake = Math.sin(smooth(0.18, 0.3, p) * Math.PI) * 0.06;
    camera.position.x = (Math.random() - 0.5) * shake;
    camera.position.y = (Math.random() - 0.5) * shake;

    const reveal = smooth(0.18, 0.72, p);
    const base = robot.userData.base || 1;
    robot.scale.setScalar(base * (0.7 + 0.3 * reveal));
    robot.position.z = -2.5 * (1 - reveal);
    robot.position.y = 0.75 - (1 - reveal) * 0.4;
    section.style.setProperty("--p", p.toFixed(3));
  }
  function setProgress(p) { progress = p; apply(p); if (!running) renderer.render(scene, camera); }

  /* ---------- Pointer + idle animation ---------- */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener("pointermove", (e) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clock = new THREE.Clock();
  let blinkAt = 2;
  function frame() {
    const t = clock.getElapsedTime();
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    head.rotation.y = pointer.x * 0.5;
    head.rotation.x = pointer.y * 0.28;
    robot.rotation.y = pointer.x * 0.22 + Math.sin(t * 0.6) * 0.06;
    const bob = Math.sin(t * 1.6) * 0.08;
        body.position.y = -1.05 + bob * 0.6;
    head.position.y = 0.72 + bob;
    neck.position.y = -0.12 + bob * 0.8;
    antenna.rotation.z = Math.sin(t * 2.2) * 0.16;
    bulb.scale.setScalar(1 + Math.sin(t * 4) * 0.25);
    core.scale.setScalar(1 + Math.sin(t * 3) * 0.2);
    coreRing.rotation.z = t;
    orbit.rotation.z = 0.35 + t * 0.25;
    beads.forEach((m, i) => { const a = t * (0.9 + i * 0.25) + (i * Math.PI * 2) / 3; m.position.set(Math.cos(a) * 2.0, Math.sin(a) * 2.0, 0); });
    halo.scale.setScalar(1 + Math.sin(t * 2) * 0.08);
    // waves once revealed
    const w = smooth(0.7, 0.85, progress);
    armR.rotation.z = -(0.25 + w * (2.5 + Math.sin(t * 7) * 0.45));
    armL.rotation.z = 0.25 + Math.sin(t * 1.6) * 0.06;
    armL.position.y = armR.position.y = -0.58 + bob * 0.6;
    // blink
    if (t > blinkAt) { blinkAt = t + rand(2, 4.5); eyes.forEach((e) => (e.scale.y = 0.1)); setTimeout(() => eyes.forEach((e) => (e.scale.y = 1)), 120); }
    if (progress > 0.18 && progress < 0.3) apply(progress); // keeps the shake alive
    renderer.render(scene, camera);
  }

  let running = false;
  let raf = 0;
  function loop() { if (!running) return; frame(); raf = requestAnimationFrame(loop); }
  const io = new IntersectionObserver(([entry]) => {
    const on = entry.isIntersecting && !reduced;
    if (on && !running) { running = true; clock.start(); loop(); }
    if (!on && running) { running = false; cancelAnimationFrame(raf); }
  }, { rootMargin: "100px" });
  io.observe(section);

  resize();
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
  renderer.render(scene, camera);

  return { setProgress, resize };
}
