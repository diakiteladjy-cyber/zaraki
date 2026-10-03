/* Apex Drive — moteur 3D (module ES).
   La carrosserie est extrudée à partir de la même silhouette que le rendu SVG,
   ce qui garantit que la vue 3D et les vignettes correspondent. */
import * as THREE from "../vendor/three.module.min.js";

const SCALE = 4.5 / 400;          // 400 unités de profil ≈ 4,5 m
const WIDTH = 168;                // largeur de caisse en unités de profil (≈ 1,9 m)

function profileShape(A, s) {
  const G = A.GROUND;
  const toY = y => G - y;
  const pts = A.samplePoints(s.top, s.tension, 10);
  const shape = new THREE.Shape();
  shape.moveTo(pts[0][0], toY(pts[0][1]));
  for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], toY(pts[i][1]));
  const last = s.top[s.top.length - 1], first = s.top[0];
  const cy = toY(A.wheelCenterY(s));
  const ar = s.r + 5;
  const sill = toY(s.sill);
  const dy = sill - cy;
  const hw = Math.sqrt(Math.max(ar * ar - dy * dy, 1));
  const ang = Math.atan2(dy, hw);           // angle du point d'attache de l'arche
  shape.lineTo(last[0], sill);
  const [wr, wf] = s.wheels;
  for (const wx of [wf, wr]) {
    shape.lineTo(wx + hw, sill);
    shape.absarc(wx, cy, ar, ang, Math.PI - ang, false);
  }
  shape.lineTo(first[0], sill);
  shape.closePath();
  return shape;
}

function glassShape(A, s) {
  const G = A.GROUND;
  const pts = A.samplePoints(s.glass.concat([s.glass[0]]), 0.6, 8);
  const shape = new THREE.Shape();
  shape.moveTo(pts[0][0], G - pts[0][1]);
  for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], G - pts[i][1]);
  return shape;
}

/* Petit studio procédural pour des reflets crédibles sans fichier HDR */
function studioEnvironment(renderer) {
  const scene = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(30, 14, 30), new THREE.MeshBasicMaterial({ color: 0x1a1d24, side: THREE.BackSide }));
  room.position.y = 6;
  scene.add(room);
  const panel = (w, h, x, y, z, ry, intensity) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(intensity, intensity, intensity) }));
    m.position.set(x, y, z); m.rotation.y = ry; m.lookAt(0, 1, 0);
    scene.add(m);
  };
  panel(14, 2.4, 0, 12.5, 0, 0, 6);          // softbox au plafond
  panel(8, 5, -14, 5, 0, 0, 2.2);
  panel(8, 5, 14, 5, 4, 0, 2.6);
  panel(10, 3, 0, 4, -14, 0, 1.4);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(scene, 0.04).texture;
  pmrem.dispose();
  return env;
}

export function mountCar3D(container, vehicle, color) {
  const A = window.Apex;
  const s = A.SHAPES[vehicle.shape];

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-label", `Vue 3D de la ${vehicle.brand} ${vehicle.model}. Glissez pour tourner autour du véhicule.`);
  renderer.domElement.setAttribute("role", "img");

  const scene = new THREE.Scene();
  scene.environment = studioEnvironment(renderer);

  const camera = new THREE.PerspectiveCamera(30, 16 / 10, 0.1, 100);
  camera.position.set(5.3, 1.8, 6.3);
  camera.lookAt(0, 0.5, 0);

  scene.add(new THREE.HemisphereLight(0xdfe7ff, 0x1a1410, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(4, 8, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 20 });
  key.shadow.radius = 6;
  scene.add(key);

  // Sol : seule l'ombre est visible, le fond reste celui de la « scène » CSS
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: 0.38 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const car = new THREE.Group();
  scene.add(car);

  /* Carrosserie */
  const paint = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color), metalness: 0.55, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.06
  });
  const bevel = 14;
  const bodyGeo = new THREE.ExtrudeGeometry(profileShape(A, s), {
    depth: WIDTH - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: 7, bevelSegments: 5, curveSegments: 18
  });
  bodyGeo.translate(-200, 0, -(WIDTH - bevel * 2) / 2);
  const body = new THREE.Mesh(bodyGeo, paint);
  body.castShadow = true;
  car.add(body);

  /* Vitrage latéral : deux faces posées sur les flancs de la caisse */
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0x0b0f16, metalness: 0.2, roughness: 0.05, clearcoat: 1, side: THREE.DoubleSide });
  for (const side of [-1, 1]) {
    const g = new THREE.ShapeGeometry(glassShape(A, s));
    g.translate(-200, 0, side * (WIDTH / 2 + 0.6));
    car.add(new THREE.Mesh(g, glassMat));
  }

  /* Pare-brise et lunette : fines coques qui épousent la ligne de toit */
  const topLine = A.samplePoints(s.top, s.tension, 10);
  const topY = x => {
    for (let i = 1; i < topLine.length; i++) {
      const p = topLine[i - 1], q = topLine[i];
      if (x >= p[0] && x <= q[0]) return p[1] + (q[1] - p[1]) * ((x - p[0]) / (q[0] - p[0] || 1));
    }
    return topLine[topLine.length - 1][1];
  };
  function roofGlass(x1, x2) {
    if (!(x2 > x1)) return;
    const n = 14, lift = 10.5, thick = 4, sh = new THREE.Shape();
    const pts = [];
    for (let i = 0; i <= n; i++) { const x = x1 + (x2 - x1) * i / n; pts.push([x, A.GROUND - topY(x)]); }
    pts.forEach((p, i) => (i ? sh.lineTo(p[0], p[1] + lift) : sh.moveTo(p[0], p[1] + lift)));
    for (let i = n; i >= 0; i--) sh.lineTo(pts[i][0], pts[i][1] + lift - thick);
    const depth = WIDTH - 40;
    const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false });
    g.translate(-200, 0, -depth / 2);
    car.add(new THREE.Mesh(g, glassMat));
  }
  const gl = s.glass;
  const midX = gl.reduce((a, p) => a + p[0], 0) / gl.length;
  const wsTop = gl.filter(p => p[0] > midX).reduce((a, p) => (p[1] < a[1] ? p : a));
  const wsBot = gl.reduce((a, p) => (p[0] > a[0] ? p : a));
  roofGlass(wsTop[0] - 2, wsBot[0] + 12);
  const rearX = gl.reduce((a, p) => Math.min(a, p[0]), Infinity);
  if (rearX - s.top[0][0] > 50) roofGlass(rearX - 34, rearX + 4);   // coupés et berlines : lunette inclinée

  /* Optiques */
  const lampMat = new THREE.MeshStandardMaterial({ color: 0xf4f7ff, emissive: 0xdfe8ff, emissiveIntensity: 1.4 });
  const tailMat = new THREE.MeshStandardMaterial({ color: 0x5a0710, emissive: 0xc0101f, emissiveIntensity: 1.6 });
  for (const z of [-1, 1]) {
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 34), lampMat);
    lamp.position.set(s.lamp[0] - 200 + 4, A.GROUND - s.lamp[1], z * (WIDTH / 2 - 30));
    car.add(lamp);
  }
  const tail = new THREE.Mesh(new THREE.BoxGeometry(5, 5, WIDTH - 30), tailMat);
  tail.position.set(s.tail[0] - 200 - 4, A.GROUND - s.tail[1], 0);
  car.add(tail);

  /* Roues */
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x0d0e10, roughness: 0.85 });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xc7ccd3, metalness: 1, roughness: 0.22 });
  const calMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(vehicle.caliper), roughness: 0.4 });
  const r = s.r, tw = 30, cyW = r;
  const wheels = [];
  for (const wx of s.wheels) {
    for (const side of [-1, 1]) {
      const w = new THREE.Group();
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(r, r, tw, 40), tireMat);
      tire.rotation.x = Math.PI / 2;
      tire.castShadow = true;
      w.add(tire);
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.66, r * 0.66, 2, 40), rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.z = side * (tw / 2 + 0.5);
      w.add(rim);
      for (let i = 0; i < 5; i++) {
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(r * 0.13, r * 0.62, 2.5), rimMat);
        spoke.rotation.z = (i / 5) * Math.PI * 2;
        spoke.position.z = side * (tw / 2 + 1.6);
        spoke.geometry.translate(0, r * 0.31, 0);
        w.add(spoke);
      }
      const cal = new THREE.Mesh(new THREE.BoxGeometry(r * 0.35, r * 0.7, 6), calMat);
      cal.position.set(r * 0.42, r * 0.1, side * (tw / 2 - 4));
      w.add(cal);
      w.position.set(wx - 200, cyW, side * (WIDTH / 2 - tw / 2 + 2));
      car.add(w);
      wheels.push(w);
    }
  }

  car.scale.setScalar(SCALE);
  car.rotation.y = -0.2;

  /* Interaction : glisser pour tourner, rotation lente au repos */
  let dragging = false, lastX = 0, velocity = 0, idle = 0, raf = 0, visible = true;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const el = renderer.domElement;
  el.addEventListener("pointerdown", e => { dragging = true; lastX = e.clientX; idle = 0; el.setPointerCapture(e.pointerId); });
  el.addEventListener("pointermove", e => {
    if (!dragging) return;
    const dx = e.clientX - lastX; lastX = e.clientX;
    velocity = dx * 0.008;
    car.rotation.y += velocity;
  });
  const end = () => { dragging = false; idle = 0; };
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);
  el.tabIndex = 0;
  el.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") { car.rotation.y -= 0.15; e.preventDefault(); }
    if (e.key === "ArrowRight") { car.rotation.y += 0.15; e.preventDefault(); }
  });

  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Recule la caméra sur écran étroit pour garder la voiture entière
    const dist = w / h < 1.3 ? 1.25 : 1;
    camera.position.set(5.3 * dist, 1.8 * dist, 6.3 * dist);
    camera.lookAt(0, 0.5, 0);
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  const io = new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && !raf) loop(); });
  io.observe(container);

  let t0 = performance.now();
  function loop() {
    raf = 0;
    if (!container.isConnected) { ro.disconnect(); io.disconnect(); renderer.dispose(); return; }
    if (!visible) return;
    const now = performance.now(), dt = Math.min((now - t0) / 1000, 0.05); t0 = now;
    if (!dragging) {
      velocity *= 0.92;
      car.rotation.y += velocity;
      idle += dt;
      if (!reduce && idle > 2.5) car.rotation.y += dt * 0.25;
    }
    renderer.render(scene, camera);
    raf = requestAnimationFrame(loop);
  }
  loop();

  return {
    setColor(hex) { paint.color.set(hex); },
    dispose() {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      renderer.dispose(); el.remove();
    }
  };
}
