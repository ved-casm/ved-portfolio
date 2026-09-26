import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/*
 * Contact page scene: a lone tree in a field of grass inside a ring of
 * standing stones, two chairs under it, petals drifting down. Everything is
 * built in code except the chair model. Colours follow the site's
 * monochrome theme and blend between night (default) and day.
 *
 * Render path: scene -> half-float target -> one full-screen pass that does
 * the cursor lens trail, chromatic edges, the intro reveal, grain & vignette.
 */

type Palette = {
  skyTop: string;
  skyHorizon: string;
  fog: string;
  fogDensity: number;
  grassBase: string;
  grassTip: string;
  ground: string;
  leafLit: string;
  leafShade: string;
  trunk: string;
  rock: string;
  hemiSky: string;
  hemiGround: string;
  hemi: number;
  sun: string;
  sunI: number;
  glow: number;
  bloom: number;
  fireflies: number;
  mist: number;
  stars: number;
  exposure: number;
};

const NIGHT: Palette = {
  skyTop: "#030304",
  skyHorizon: "#1b1c21",
  fog: "#111216",
  fogDensity: 0.055,
  grassBase: "#030303",
  grassTip: "#34363c",
  ground: "#050506",
  leafLit: "#dcdce2",
  leafShade: "#1f2024",
  trunk: "#141416",
  rock: "#383a42",
  hemiSky: "#8d93a6",
  hemiGround: "#050505",
  hemi: 0.55,
  sun: "#c9d2ff",
  sunI: 1.4,
  glow: 1,
  bloom: 1.6,
  fireflies: 1,
  mist: 1,
  stars: 1,
  exposure: 1,
};

const DAY: Palette = {
  skyTop: "#b9b8b3",
  skyHorizon: "#efeee9",
  fog: "#c9c8c3",
  fogDensity: 0.026,
  grassBase: "#141512",
  grassTip: "#7f8078",
  ground: "#2a2b27",
  leafLit: "#f4f4f1",
  leafShade: "#5a5a56",
  trunk: "#232120",
  rock: "#6f6f6c",
  hemiSky: "#ffffff",
  hemiGround: "#4a4a44",
  hemi: 1.1,
  sun: "#fff4e2",
  sunI: 2.6,
  glow: 0.35,
  bloom: 0.4,
  fireflies: 0.3,
  mist: 0.25,
  stars: 0,
  exposure: 0.92,
};

const TRAIL = 10;

export type ContactScene = {
  /** 0..1 intro reveal (0 = hidden, 1 = fully clear) */
  setReveal: (v: number) => void;
  /** 0 = scene centred on the canvas, 1 = centred on the left column */
  setShift: (v: number) => void;
  /** 0 = night, 1 = day */
  setDay: (v: number) => void;
  setQuality: (high: boolean) => void;
  setActive: (on: boolean) => void;
  pointer: (x: number, y: number, inside: boolean) => void;
  resize: () => void;
  dispose: () => void;
  ready: Promise<void>;
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function leafTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  // blade: light at the edge, a touch darker toward the base
  const grd = g.createLinearGradient(0, 8, 0, 124);
  grd.addColorStop(0, "#ffffff");
  grd.addColorStop(1, "#bdbdbd");
  g.fillStyle = grd;
  g.beginPath();
  g.moveTo(64, 6);
  g.bezierCurveTo(104, 30, 108, 78, 64, 122);
  g.bezierCurveTo(20, 78, 24, 30, 64, 6);
  g.fill();
  // midrib and veins (dark lines read as detail in the shader)
  g.strokeStyle = "rgba(90,90,90,0.9)";
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(64, 14);
  g.lineTo(64, 120);
  g.stroke();
  g.lineWidth = 1.6;
  g.strokeStyle = "rgba(120,120,120,0.7)";
  for (let k = 0; k < 6; k++) {
    const y = 34 + k * 14;
    g.beginPath();
    g.moveTo(64, y + 10);
    g.quadraticCurveTo(76, y + 4, 88 - k * 2, y - 4);
    g.moveTo(64, y + 10);
    g.quadraticCurveTo(52, y + 4, 40 + k * 2, y - 4);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.NoColorSpace;
  t.anisotropy = 4;
  return t;
}

function softTexture(inner = 0.0) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(64, 64, inner * 64, 64, 64, 64);
  r.addColorStop(0, "rgba(255,255,255,1)");
  r.addColorStop(0.4, "rgba(255,255,255,0.35)");
  r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

const FOG_GLSL = /* glsl */ `
  float fogF(float d, float k) { return 1.0 - exp(-k * k * d * d); }
`;

export function createContactScene(canvas: HTMLCanvasElement, opts: { high: boolean; mobile: boolean }): ContactScene {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  let high = opts.high;
  const dprFor = () => Math.min(window.devicePixelRatio || 1, high ? 1.5 : 1);
  renderer.setPixelRatio(dprFor());

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 120);
  const camBase = new THREE.Vector3(0, 1.45, 7.6);
  const lookAt = new THREE.Vector3(0, 2.05, 0);
  camera.position.copy(camBase);

  const fog = new THREE.FogExp2(NIGHT.fog, NIGHT.fogDensity);
  scene.fog = fog;

  // live palette (lerped between night/day)
  const col = {
    skyTop: new THREE.Color(),
    skyHorizon: new THREE.Color(),
    fog: new THREE.Color(),
    grassBase: new THREE.Color(),
    grassTip: new THREE.Color(),
    ground: new THREE.Color(),
    leafLit: new THREE.Color(),
    leafShade: new THREE.Color(),
    trunk: new THREE.Color(),
    rock: new THREE.Color(),
    hemiSky: new THREE.Color(),
    hemiGround: new THREE.Color(),
    sun: new THREE.Color(),
  };
  const shared = {
    uTime: { value: 0 },
    uFog: { value: col.fog },
    uFogDensity: { value: NIGHT.fogDensity },
    uCursor: { value: new THREE.Vector3(0, 0, 0) },
  };

  // ---- sky ------------------------------------------------------------------
  const sunDir = new THREE.Vector3(0.55, 0.42, -0.72).normalize();
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uTop: { value: col.skyTop },
      uHorizon: { value: col.skyHorizon },
      uSunDir: { value: sunDir },
      uSun: { value: col.sun },
      uDay: { value: 0 },
      uStars: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop, uHorizon, uSun, uSunDir;
      uniform float uDay, uStars;
      varying vec3 vDir;
      float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
      void main() {
        vec3 d = normalize(vDir);
        vec3 c = mix(uHorizon, uTop, smoothstep(-0.02, 0.55, d.y));
        float s = max(dot(d, uSunDir), 0.0);
        // moon: small crisp disc; sun: broad warm bloom
        float disc = smoothstep(0.9994 - uDay * 0.0012, 0.9997 - uDay * 0.0010, s);
        float halo = pow(s, mix(90.0, 14.0, uDay)) * mix(0.35, 0.9, uDay);
        c += uSun * (disc * 1.6 + halo);
        // stars
        vec3 g = floor(d * 260.0);
        float st = step(0.9975, hash(g)) * smoothstep(0.05, 0.4, d.y) * uStars;
        c += vec3(st) * 0.9;
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(80, 32, 16), skyMat);
  scene.add(sky);

  // ---- lights ---------------------------------------------------------------
  const hemi = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 1);
  sun.position.copy(sunDir).multiplyScalar(20);
  scene.add(sun);
  // soft light inside the canopy that makes the leaves glow at night
  const canopyLight = new THREE.PointLight(0xffffff, 6, 7, 1.6);
  canopyLight.position.set(-0.4, 3.2, 0.6);
  scene.add(canopyLight);

  // ---- ground ---------------------------------------------------------------
  const groundMat = new THREE.MeshStandardMaterial({ color: col.ground, roughness: 1 });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(40, 48), groundMat);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // ---- grass ----------------------------------------------------------------
  const MAX_GRASS = opts.mobile ? 26000 : 70000;
  const blade = new THREE.BufferGeometry();
  {
    const w = 0.035;
    const pts = [-w, 0, w, 0, -w * 0.72, 0.4, w * 0.72, 0.4, -w * 0.38, 0.75, w * 0.38, 0.75, 0, 1];
    const pos: number[] = [];
    for (let i = 0; i < pts.length; i += 2) pos.push(pts[i], pts[i + 1], 0);
    blade.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    blade.setIndex([0, 1, 2, 2, 1, 3, 2, 3, 4, 4, 3, 5, 4, 5, 6]);
  }
  const gGeo = new THREE.InstancedBufferGeometry();
  gGeo.index = blade.index;
  gGeo.setAttribute("position", blade.getAttribute("position"));
  const offs = new Float32Array(MAX_GRASS * 3);
  const gData = new Float32Array(MAX_GRASS * 3); // scale, rot, shade
  for (let i = 0; i < MAX_GRASS; i++) {
    // denser toward the camera; keep a small clearing at the trunk
    const z = 7.5 - Math.pow(Math.random(), 0.8) * 20;
    const spread = 6 + (7.5 - z) * 0.7;
    let x = rand(-spread, spread);
    if (Math.abs(x) < 0.35 && Math.abs(z) < 0.35) x += 0.6;
    offs.set([x, 0, z], i * 3);
    gData.set([rand(0.28, 0.62), rand(0, Math.PI), Math.random()], i * 3);
  }
  gGeo.setAttribute("aOffset", new THREE.InstancedBufferAttribute(offs, 3));
  gGeo.setAttribute("aData", new THREE.InstancedBufferAttribute(gData, 3));
  gGeo.instanceCount = high ? MAX_GRASS : Math.round(MAX_GRASS * 0.5);
  const grassMat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
      ...shared,
      uBase: { value: col.grassBase },
      uTip: { value: col.grassTip },
      uGlowPos: { value: canopyLight.position },
      uGlow: { value: 1 },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aOffset;
      attribute vec3 aData;
      uniform float uTime;
      uniform vec3 uCursor;
      varying float vH;
      varying float vShade;
      varying float vDist;
      varying vec3 vWorld;
      void main() {
        vec3 p = position;
        float h = p.y;
        p.y *= aData.x;
        float c = cos(aData.y), s = sin(aData.y);
        p.xz = mat2(c, -s, s, c) * p.xz;
        vec3 w = p + aOffset;
        float n = sin(aOffset.x * 0.45 + uTime * 1.4) + 0.6 * sin(aOffset.z * 0.7 + uTime * 0.95 + aOffset.x * 0.2);
        float bend = (0.12 + 0.07 * n) * h * h;
        w.x += bend;
        w.z += bend * 0.35;
        // part the grass around the cursor
        vec2 d = w.xz - uCursor.xy;
        float dl = length(d);
        w.xz += (d / max(dl, 1e-3)) * uCursor.z * smoothstep(1.1, 0.0, dl) * h * h * 0.35;
        vWorld = w;
        vec4 mv = modelViewMatrix * vec4(w, 1.0);
        vDist = -mv.z;
        vH = h;
        vShade = aData.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uBase, uTip, uFog, uGlowPos;
      uniform float uFogDensity, uGlow;
      varying float vH;
      varying float vShade;
      varying float vDist;
      varying vec3 vWorld;
      ${FOG_GLSL}
      void main() {
        vec3 c = mix(uBase, uTip, vH * vH) * (0.7 + 0.6 * vShade);
        // pool of light under the tree
        float pool = exp(-0.35 * dot(vWorld.xz - uGlowPos.xz, vWorld.xz - uGlowPos.xz));
        c += uTip * pool * vH * 0.9 * uGlow;
        gl_FragColor = vec4(mix(c, uFog, fogF(vDist, uFogDensity)), 1.0);
      }`,
  });
  const grass = new THREE.Mesh(gGeo, grassMat);
  grass.frustumCulled = false;
  scene.add(grass);

  // ---- tree -----------------------------------------------------------------
  const trunkGeos: THREE.BufferGeometry[] = [];
  const tips: THREE.Vector3[] = [];
  const twigs: [THREE.Vector3, THREE.Vector3][] = [];
  const up = new THREE.Vector3(0, 1, 0);
  const branch = (start: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, depth: number) => {
    const end = start.clone().addScaledVector(dir, len);
    if (depth === 0) {
      tips.push(end);
      return;
    }
    // the finest twigs stay hidden inside the leaves
    if (depth === 1) {
      tips.push(end);
      branch(end, dir, len * 0.7, r * 0.6, 0);
      return;
    }
    const g = new THREE.CylinderGeometry(r * 0.66, r, len, 7, 1, true);
    g.translate(0, len / 2, 0);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(up, dir));
    g.translate(start.x, start.y, start.z);
    trunkGeos.push(g);
    if (depth <= 3) tips.push(end.clone());
    if (depth <= 3) twigs.push([start.clone(), end.clone()]);
    const kids = depth >= 4 ? 3 : 2 + (Math.random() > 0.45 ? 1 : 0);
    for (let i = 0; i < kids; i++) {
      const yaw = (i / kids) * Math.PI * 2 + rand(-0.5, 0.5) + depth;
      const tilt = rand(0.45, 0.85) + (5 - depth) * 0.08;
      const side = new THREE.Vector3(Math.cos(yaw), 0, Math.sin(yaw));
      const nd = dir.clone().multiplyScalar(Math.cos(tilt)).addScaledVector(side, Math.sin(tilt));
      nd.y = Math.max(nd.y, 0.12);
      nd.normalize();
      branch(end, nd, len * rand(0.68, 0.8), r * 0.6, depth - 1);
    }
  };
  // the trunk leans a touch, like the reference's
  branch(new THREE.Vector3(0.05, -0.1, -0.2), new THREE.Vector3(0.06, 1, 0).normalize(), 2.2, 0.24, 5);
  const trunkMat = new THREE.MeshStandardMaterial({ color: col.trunk, roughness: 0.95 });
  const trunk = new THREE.Mesh(mergeGeometries(trunkGeos), trunkMat);
  trunkGeos.forEach((g) => g.dispose());
  // the whole tree scales as one, keeping the canopy inside the frame
  const tree = new THREE.Group();
  tree.scale.setScalar(0.86);
  scene.add(tree);
  tree.add(trunk);

  // leaves: instanced cards, mostly on the outer shell of clumps at the
  // branch tips (so the canopy reads as a mass), the rest along the twigs so
  // no bare branch pokes out of the foliage
  const LEAVES = opts.mobile ? 9000 : 16000;
  const leafGeo = new THREE.InstancedBufferGeometry();
  const card = new THREE.PlaneGeometry(0.3, 0.3);
  leafGeo.index = card.index;
  leafGeo.setAttribute("position", card.getAttribute("position"));
  leafGeo.setAttribute("uv", card.getAttribute("uv"));
  const lPos = new Float32Array(LEAVES * 3);
  const lRot = new Float32Array(LEAVES * 4);
  const lData = new Float32Array(LEAVES * 2); // scale, occlusion (0 inner .. 1 outer)
  const canopyCenter = new THREE.Vector3();
  tips.forEach((t) => canopyCenter.add(t));
  canopyCenter.divideScalar(tips.length);
  const q = new THREE.Quaternion();
  const q2 = new THREE.Quaternion();
  const zAxis = new THREE.Vector3(0, 0, 1);
  const out = new THREE.Vector3();
  const pos = new THREE.Vector3();
  for (let i = 0; i < LEAVES; i++) {
    let ao: number;
    if (i % 4 !== 0) {
      // clump around a tip, weighted to the surface
      const t = tips[Math.floor(Math.random() * tips.length)];
      out.set(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize();
      const rr = THREE.MathUtils.lerp(0.35, 1, Math.sqrt(Math.random()));
      pos.set(t.x + out.x * rr * 0.95, t.y + out.y * rr * 0.55 + 0.12, t.z + out.z * rr * 0.9);
      ao = rr;
    } else {
      // along a twig
      const [a, b] = twigs[Math.floor(Math.random() * twigs.length)];
      pos.lerpVectors(a, b, Math.random());
      out.set(rand(-1, 1), rand(-0.4, 1), rand(-1, 1)).normalize();
      pos.addScaledVector(out, rand(0.08, 0.4));
      ao = 0.45;
    }
    // whole-canopy shading: the underside and the core sit in shadow
    const lift = THREE.MathUtils.clamp((pos.y - canopyCenter.y) / 1.6 + 0.55, 0, 1);
    ao = THREE.MathUtils.clamp(ao * 0.55 + lift * 0.55, 0, 1);
    lPos.set([pos.x, pos.y, pos.z], i * 3);
    // face roughly outward, with a random roll and tilt
    out.subVectors(pos, canopyCenter).normalize().add(new THREE.Vector3(rand(-0.7, 0.7), rand(-0.3, 0.9), rand(-0.7, 0.7))).normalize();
    q.setFromUnitVectors(zAxis, out);
    q2.setFromAxisAngle(zAxis, rand(0, Math.PI * 2));
    q.multiply(q2);
    lRot.set([q.x, q.y, q.z, q.w], i * 4);
    lData.set([rand(0.65, 1.35), ao], i * 2);
  }
  leafGeo.setAttribute("aPos", new THREE.InstancedBufferAttribute(lPos, 3));
  leafGeo.setAttribute("aQuat", new THREE.InstancedBufferAttribute(lRot, 4));
  leafGeo.setAttribute("aData", new THREE.InstancedBufferAttribute(lData, 2));
  const leafTex = leafTexture();
  const leafMat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
      ...shared,
      uMap: { value: leafTex },
      uLit: { value: col.leafLit },
      uShade: { value: col.leafShade },
      uSunDir: { value: sunDir },
      uGlow: { value: 1 },
      // a faint cool silver, so the glow reads as moonlight
      uGlowTint: { value: new THREE.Color("#e9eeff") },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aPos;
      attribute vec4 aQuat;
      attribute vec2 aData;
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vN;
      varying float vAO;
      varying float vDist;
      varying float vRnd;
      varying float vPatch;
      vec3 rot(vec3 v, vec4 q) { return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v); }
      void main() {
        vUv = uv;
        vRnd = fract(sin(dot(aPos.xz, vec2(12.9898, 78.233))) * 43758.5453);
        // flutter: each leaf twists a little on its stem, the clump sways
        float t = uTime * (1.4 + vRnd * 1.2) + vRnd * 6.28;
        vec3 local = position * aData.x;
        local.x += sin(t) * 0.02 * (local.y + 0.15);
        vec3 p = rot(local, aQuat) + aPos;
        float sway = sin(uTime * 0.9 + aPos.x * 1.3 + aPos.y * 0.7) * 0.045;
        p.x += sway;
        p.z += sway * 0.5;
        vN = rot(vec3(0.0, 0.0, 1.0), aQuat);
        vAO = aData.y;
        // big soft patches of light across the canopy that drift slowly
        float n = sin(aPos.x * 1.3 + uTime * 0.25) * sin(aPos.y * 1.9 - uTime * 0.18) * sin(aPos.z * 1.6 + aPos.x * 0.7 + 1.3);
        n += 0.5 * sin(aPos.x * 3.1 - aPos.z * 2.3 + uTime * 0.4);
        vPatch = smoothstep(0.05, 0.75, n * 0.5 + 0.35);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vDist = -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform vec3 uLit, uShade, uFog, uSunDir, uGlowTint;
      uniform float uFogDensity, uGlow, uTime;
      varying vec2 vUv;
      varying vec3 vN;
      varying float vAO;
      varying float vDist;
      varying float vRnd;
      varying float vPatch;
      ${FOG_GLSL}
      void main() {
        vec4 tex = texture2D(uMap, vUv);
        if (tex.a < 0.5) discard;
        vec3 n = normalize(gl_FrontFacing ? vN : -vN);
        vec3 L = normalize(uSunDir);
        float front = max(dot(n, L), 0.0);
        // light through the leaf when it's lit from behind
        float back = max(dot(-n, L), 0.0) * 0.5;
        float light = (0.1 + front * 0.72 + back * 0.8) * mix(0.22, 1.0, vAO * vAO);
        light *= 0.82 + 0.3 * vRnd;
        vec3 c = mix(uShade, uLit, clamp(light, 0.0, 1.0)) * tex.r;
        // divine glow: the outer, lit leaves go past white (HDR) so the bloom
        // pass haloes them; each leaf shimmers on its own slow beat
        float lit = clamp(light, 0.0, 1.0) * vAO;
        float shimmer = 0.75 + 0.25 * sin(uTime * (0.8 + vRnd * 1.6) + vRnd * 30.0);
        // glow gathers on the outer clusters that face the moon; the core stays
        // darker, which is what makes the highlights read as light
        // outer leaves inside a light patch glow past white; bloom haloes them
        float outer = smoothstep(0.35, 0.95, vAO);
        float g = vPatch * outer * (0.55 + 0.45 * clamp(light * 1.6, 0.0, 1.0));
        c = mix(c * 0.8, c, outer);
        c += uGlowTint * uGlow * (g * g * 5.0 + g * 0.35) * shimmer;
        gl_FragColor = vec4(mix(c, uFog, fogF(vDist, uFogDensity) * 0.85), 1.0);
      }`,
  });
  const leaves = new THREE.Mesh(leafGeo, leafMat);
  leaves.frustumCulled = false;
  tree.add(leaves);

  // glow sprites inside the canopy
  const soft = softTexture();
  const glowMat = new THREE.SpriteMaterial({
    map: soft,
    color: 0xffffff,
    transparent: true,
    opacity: 0.22,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
  });
  const glows: THREE.Sprite[] = [];
  for (let i = 0; i < 7; i++) {
    const s = new THREE.Sprite(glowMat);
    const t = tips[Math.floor(Math.random() * tips.length)];
    s.position.copy(t).lerp(canopyCenter, 0.35);
    s.scale.setScalar(rand(1.6, 2.8));
    tree.add(s);
    glows.push(s);
  }

  // ---- standing stones ------------------------------------------------------
  const rockMat = new THREE.MeshStandardMaterial({ color: col.rock, roughness: 1, flatShading: true });
  // lumpy stones: a merged icosphere with its corners pushed about
  const stone = () => {
    const base = new THREE.IcosahedronGeometry(1, 1);
    // drop normals/uvs so shared corners actually merge
    base.deleteAttribute("normal");
    base.deleteAttribute("uv");
    const g = mergeVertices(base);
    base.dispose();
    const p = g.getAttribute("position") as THREE.BufferAttribute;
    for (let v = 0; v < p.count; v++) {
      const k = rand(0.78, 1.12);
      p.setXYZ(v, p.getX(v) * k, Math.max(p.getY(v) * k, -0.6), p.getZ(v) * k);
    }
    g.computeVertexNormals();
    return g;
  };
  const stones = Array.from({ length: 5 }, stone);
  for (let i = 0; i < 17; i++) {
    const rockGeo = stones[i % stones.length];
    const a = THREE.MathUtils.lerp(-1.25, 1.25, i / 16) + rand(-0.04, 0.04);
    const rad = rand(9.5, 11.5);
    const m = new THREE.Mesh(rockGeo, rockMat);
    m.position.set(Math.sin(a) * rad, 0.4, -Math.cos(a) * rad - 1.5);
    m.scale.set(rand(0.8, 1.35), rand(1.2, 2.1), rand(0.6, 0.95));
    m.rotation.set(rand(-0.08, 0.08), rand(0, 6.28), rand(-0.08, 0.08));
    scene.add(m);
  }

  // ---- contact shadows ------------------------------------------------------
  const shadowTex = softTexture();
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    color: 0x000000,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
  });
  const addShadow = (x: number, z: number, s: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), shadowMat);
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.02, z);
    scene.add(m);
  };
  addShadow(0.05, -0.2, 2.2);

  // ---- chairs ---------------------------------------------------------------
  const draco = new DRACOLoader().setDecoderPath("/draco/");
  const loader = new GLTFLoader().setDRACOLoader(draco);
  const ready = loader
    .loadAsync("/models/chair.glb")
    .then((gltf) => {
      const base = gltf.scene;
      const box = new THREE.Box3().setFromObject(base);
      const size = box.getSize(new THREE.Vector3());
      const s = 1.0 / size.y;
      base.scale.setScalar(s);
      box.setFromObject(base);
      const c = box.getCenter(new THREE.Vector3());
      base.position.set(-c.x, -box.min.y, -c.z);
      const make = (x: number, z: number, ry: number) => {
        const g = new THREE.Group();
        g.add(base.clone(true));
        g.position.set(x, 0, z);
        g.rotation.y = ry;
        scene.add(g);
        addShadow(x, z, 1.6);
      };
      make(-1.2, 1.35, 0.55);
      make(1.2, 1.35, -0.55);
    })
    .catch(() => {})
    .finally(() => draco.dispose());

  // ---- petals ---------------------------------------------------------------
  const PETALS = opts.mobile ? 120 : 240;
  const petalMat = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
      uTime: shared.uTime,
      uMap: { value: leafTex },
      uColor: { value: new THREE.Color("#ffffff") },
      uGlow: { value: 1 },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying vec2 vUv;
      varying float vPulse;
      void main() {
        vUv = uv;
        float r = fract(sin(float(gl_InstanceID) * 12.9898) * 43758.5453);
        // flare up now and then, on a different beat per petal
        vPulse = pow(0.5 + 0.5 * sin(uTime * (1.2 + r * 2.4) + r * 40.0), 4.0);
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform vec3 uColor;
      uniform float uGlow;
      varying vec2 vUv;
      varying float vPulse;
      void main() {
        if (texture2D(uMap, vUv).a < 0.5) discard;
        vec3 c = uColor * (0.9 + uGlow * (0.6 + vPulse * 3.2));
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const petals = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.085, 0.085), petalMat, PETALS);
  const pState = Array.from({ length: PETALS }, () => ({
    x: rand(-3.5, 3.5),
    y: rand(0, 5),
    z: rand(-2.5, 3.5),
    v: rand(0.18, 0.4),
    ph: rand(0, 6.28),
    spin: rand(0.6, 2),
  }));
  scene.add(petals);
  const m4 = new THREE.Matrix4();
  const pq = new THREE.Quaternion();
  const pe = new THREE.Euler();
  const one = new THREE.Vector3(1, 1, 1);
  const pv = new THREE.Vector3();

  // ---- fireflies / dust -----------------------------------------------------
  const FLIES = opts.mobile ? 70 : 140;
  const fGeo = new THREE.BufferGeometry();
  const fPos = new Float32Array(FLIES * 3);
  const fSeed = new Float32Array(FLIES);
  for (let i = 0; i < FLIES; i++) {
    fPos.set([rand(-6, 6), rand(0.1, 3), rand(-4, 5)], i * 3);
    fSeed[i] = Math.random() * 100;
  }
  fGeo.setAttribute("position", new THREE.BufferAttribute(fPos, 3));
  fGeo.setAttribute("aSeed", new THREE.BufferAttribute(fSeed, 1));
  const fliesMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uTime: shared.uTime, uAmount: { value: 1 }, uPx: { value: 1 } },
    vertexShader: /* glsl */ `
      attribute float aSeed;
      uniform float uTime, uPx;
      varying float vA;
      void main() {
        vec3 p = position;
        p.x += sin(uTime * 0.3 + aSeed) * 0.6;
        p.y += sin(uTime * 0.5 + aSeed * 1.3) * 0.35;
        p.z += cos(uTime * 0.25 + aSeed) * 0.6;
        vA = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(uTime * 2.2 + aSeed * 7.0), 3.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uPx * 34.0 / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uAmount;
      varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vec3(1.0, 0.97, 0.9) * a * a * vA * uAmount, 1.0);
      }`,
  });
  const flies = new THREE.Points(fGeo, fliesMat);
  flies.frustumCulled = false;
  scene.add(flies);

  // ---- ground mist ----------------------------------------------------------
  const mistMat = new THREE.SpriteMaterial({
    map: soft,
    color: 0xffffff,
    transparent: true,
    opacity: 0.06,
    depthWrite: false,
  });
  const mists: { s: THREE.Sprite; x: number; sp: number }[] = [];
  for (let i = 0; i < 9; i++) {
    const s = new THREE.Sprite(mistMat);
    const x = rand(-5, 5);
    s.position.set(x, 0.35, rand(-1, 3.5));
    s.scale.set(rand(3.5, 6), 1.3, 1);
    scene.add(s);
    mists.push({ s, x, sp: rand(0.05, 0.12) });
  }

  // ---- post -----------------------------------------------------------------
  const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
  const trail = Array.from({ length: TRAIL }, () => new THREE.Vector2(-2, -2));
  const trailR = new Float32Array(TRAIL);
  const postMat = new THREE.ShaderMaterial({
    uniforms: {
      tScene: { value: rt.texture },
      uRes: { value: new THREE.Vector2(1, 1) },
      uTime: shared.uTime,
      uReveal: { value: 0 },
      uAspect: { value: 1 },
      uTrail: { value: trail },
      uTrailR: { value: trailR },
      uLens: { value: 0 },
      uBg: { value: new THREE.Color("#0f0f0f") },
      uExposure: { value: 1 },
      tBloom: { value: null as THREE.Texture | null },
      uBloom: { value: 1 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D tScene, tBloom;
      uniform vec2 uRes;
      uniform float uTime, uReveal, uAspect, uLens, uExposure, uBloom;
      uniform vec2 uTrail[${TRAIL}];
      uniform float uTrailR[${TRAIL}];
      uniform vec3 uBg;
      varying vec2 vUv;
      float field(vec2 p) {
        float f = 0.0;
        for (int i = 0; i < ${TRAIL}; i++) {
          vec2 d = p - uTrail[i];
          d.x *= uAspect;
          float r = uTrailR[i];
          f += r * r / (dot(d, d) + 1e-5);
        }
        return f;
      }
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
      }
      void main() {
        vec2 uv = vUv;
        // ---- liquid lens trail following the cursor
        float f = field(uv) * uLens;
        vec2 e = vec2(2.0 / uRes.x, 0.0);
        vec2 g = vec2(field(uv + e.xy) - field(uv - e.xy), field(uv + e.yx) - field(uv - e.yx)) * uLens;
        float inside = smoothstep(0.85, 1.15, f);
        float rim = smoothstep(0.55, 1.0, f) * (1.0 - smoothstep(1.0, 1.9, f));
        vec2 dir = g / (length(g) + 1e-4);
        vec2 off = -dir * (rim * 0.018 + inside * 0.006);
        // ---- base chromatic split, stronger toward the edges and in the lens
        vec2 cc = uv - 0.5;
        float ca = 0.0015 + dot(cc, cc) * 0.006 + rim * 0.006;
        // ---- reveal: blurred & washed out while the blob grows
        float clear = smoothstep(0.55, 1.0, uReveal);
        float blur = (1.0 - clear) * 0.012;
        vec3 col = vec3(0.0);
        for (int k = 0; k < 6; k++) {
          float a = float(k) * 1.0472 + uTime;
          vec2 bo = vec2(cos(a), sin(a)) * blur * (k == 0 ? 0.0 : 1.0);
          vec2 u = uv + off + bo;
          col.r += texture2D(tScene, u + cc * ca).r;
          col.g += texture2D(tScene, u).g;
          col.b += texture2D(tScene, u - cc * ca).b;
        }
        col /= 6.0;
        col += texture2D(tBloom, uv + off).rgb * uBloom * 1.35;
        col *= uExposure;
        col += rim * 0.035 + inside * 0.015;
        col = mix(col, vec3(0.9), (1.0 - clear) * 0.55 * step(0.001, uReveal));
        // vignette & grain
        col *= 1.0 - dot(cc, cc) * 0.55;
        col += (hash(uv * uRes + uTime) - 0.5) * 0.025;
        // blob mask with a noisy, living edge
        vec2 pc = (uv - 0.5) * vec2(uAspect, 1.0);
        float ang = atan(pc.y, pc.x);
        float n = noise(vec2(ang * 2.2, uTime * 0.8)) * 0.12 + noise(vec2(ang * 6.0, uTime * 1.6)) * 0.05;
        float R = uReveal * (0.8 + 0.5 * uAspect) * 1.25;
        float m = 1.0 - smoothstep(R - 0.035, R + 0.005, length(pc) + n * (1.0 - clear));
        float edge = (1.0 - clear) * smoothstep(0.06, 0.0, abs(length(pc) + n - R));
        gl_FragColor = vec4(mix(uBg, col + edge * 0.35, m), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  // bloom: bright parts at quarter resolution, blurred twice, added back
  const bloomA = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
  const bloomB = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
  const QUAD_VS = /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
  const brightMat = new THREE.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: { tInput: { value: rt.texture }, uThreshold: { value: 0.82 } },
    vertexShader: QUAD_VS,
    fragmentShader: /* glsl */ `
      uniform sampler2D tInput;
      uniform float uThreshold;
      varying vec2 vUv;
      void main() {
        vec3 c = texture2D(tInput, vUv).rgb;
        float l = max(max(c.r, c.g), c.b);
        gl_FragColor = vec4(c * smoothstep(uThreshold, uThreshold + 0.7, l), 1.0);
      }`,
  });
  const blurMat = new THREE.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: { tInput: { value: null as THREE.Texture | null }, uDir: { value: new THREE.Vector2() } },
    vertexShader: QUAD_VS,
    fragmentShader: /* glsl */ `
      uniform sampler2D tInput;
      uniform vec2 uDir;
      varying vec2 vUv;
      void main() {
        vec3 c = texture2D(tInput, vUv).rgb * 0.2270270270;
        c += texture2D(tInput, vUv + uDir * 1.3846153846).rgb * 0.3162162162;
        c += texture2D(tInput, vUv - uDir * 1.3846153846).rgb * 0.3162162162;
        c += texture2D(tInput, vUv + uDir * 3.2307692308).rgb * 0.0702702703;
        c += texture2D(tInput, vUv - uDir * 3.2307692308).rgb * 0.0702702703;
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const postScene = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat);
  quad.frustumCulled = false;
  postScene.add(quad);
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const bloomTexel = new THREE.Vector2(1, 1);
  const pass = (mat: THREE.ShaderMaterial, target: THREE.WebGLRenderTarget | null) => {
    quad.material = mat;
    renderer.setRenderTarget(target);
    renderer.render(postScene, postCam);
  };

  // ---- state ----------------------------------------------------------------
  let W = 1;
  let H = 1;
  let shift = 0;
  const applyView = () => {
    // move the projection so the scene sits in the middle of the visible column
    const visible = W * 0.506;
    const ox = ((W - visible) / 2) * shift;
    camera.setViewOffset(W, H, ox, 0, W, H);
  };
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width));
    H = Math.max(1, Math.round(r.height));
    renderer.setPixelRatio(dprFor());
    renderer.setSize(W, H, false);
    const dpr = renderer.getPixelRatio();
    rt.setSize(Math.round(W * dpr), Math.round(H * dpr));
    const bw = Math.max(1, Math.round((W * dpr) / 4));
    const bh = Math.max(1, Math.round((H * dpr) / 4));
    bloomA.setSize(bw, bh);
    bloomB.setSize(bw, bh);
    bloomTexel.set(1 / bw, 1 / bh);
    camera.aspect = W / H;
    // keep the tree framed on tall (mobile) canvases
    camera.fov = W / H < 0.9 ? 60 : 50;
    camera.updateProjectionMatrix();
    applyView();
    postMat.uniforms.uRes.value.set(W * dpr, H * dpr);
    postMat.uniforms.uAspect.value = W / H;
    fliesMat.uniforms.uPx.value = H * dpr * 0.0012;
  };
  resize();

  const setDay = (t: number) => {
    const lerp = (k: keyof Palette) => {
      const a = NIGHT[k];
      const b = DAY[k];
      return typeof a === "number" ? THREE.MathUtils.lerp(a, b as number, t) : 0;
    };
    (Object.keys(col) as (keyof typeof col)[]).forEach((k) => {
      col[k].set(NIGHT[k] as string).lerp(new THREE.Color(DAY[k] as string), t);
    });
    fog.color.copy(col.fog);
    groundMat.color.copy(col.ground);
    trunkMat.color.copy(col.trunk);
    rockMat.color.copy(col.rock);
    fog.density = lerp("fogDensity");
    shared.uFogDensity.value = fog.density;
    hemi.color.copy(col.hemiSky);
    hemi.groundColor.copy(col.hemiGround);
    hemi.intensity = lerp("hemi");
    sun.color.copy(col.sun);
    sun.intensity = lerp("sunI");
    const glow = lerp("glow");
    canopyLight.intensity = 6 * glow;
    grassMat.uniforms.uGlow.value = glow;
    leafMat.uniforms.uGlow.value = glow;
    glowMat.opacity = 0.22 * glow;
    fliesMat.uniforms.uAmount.value = lerp("fireflies");
    mistMat.opacity = 0.07 * lerp("mist");
    skyMat.uniforms.uDay.value = t;
    skyMat.uniforms.uStars.value = lerp("stars");
    postMat.uniforms.uExposure.value = lerp("exposure");
    petalMat.uniforms.uColor.value.copy(col.leafLit);
    petalMat.uniforms.uGlow.value = glow;
    postMat.uniforms.uBloom.value = lerp("bloom");
    // the sun climbs higher than the moon
    sunDir.set(0.55, THREE.MathUtils.lerp(0.28, 0.6, t), -0.72).normalize();
    sun.position.copy(sunDir).multiplyScalar(20);
  };
  setDay(0);

  // ---- pointer --------------------------------------------------------------
  const mouse = new THREE.Vector2(0.5, 0.5);
  const smooth = new THREE.Vector2(0.5, 0.5);
  let inside = false;
  let speed = 0;
  let lens = 0;
  const ray = new THREE.Raycaster();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hit = new THREE.Vector3();
  const pointer = (x: number, y: number, isInside: boolean) => {
    const r = canvas.getBoundingClientRect();
    const nx = (x - r.left) / r.width;
    const ny = 1 - (y - r.top) / r.height;
    speed = Math.min(1, speed + Math.hypot(nx - mouse.x, ny - mouse.y) * 6);
    mouse.set(nx, ny);
    inside = isInside;
  };

  // ---- loop -----------------------------------------------------------------
  let active = true;
  let raf = 0;
  let last = performance.now();
  const clock = { t: 0 };
  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    if (!active) {
      last = now;
      return;
    }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    clock.t += dt;
    shared.uTime.value = clock.t;

    // trail: head follows the cursor, the rest chase each other
    smooth.lerp(mouse, 1 - Math.exp(-dt * 14));
    trail[0].copy(smooth);
    for (let i = 1; i < TRAIL; i++) trail[i].lerp(trail[i - 1], 1 - Math.exp(-dt * (22 - i * 1.2)));
    speed *= Math.exp(-dt * 2.2);
    lens += ((inside ? 0.45 + speed * 0.9 : 0) - lens) * (1 - Math.exp(-dt * 5));
    for (let i = 0; i < TRAIL; i++) trailR[i] = 0.055 * (1 - i / TRAIL) * (0.7 + speed * 0.6);
    postMat.uniforms.uLens.value = lens;

    // camera drifts with the pointer
    const px = (smooth.x - 0.5) * 2;
    const py = (smooth.y - 0.5) * 2;
    camera.position.set(camBase.x + px * 0.35, camBase.y + py * 0.18, camBase.z);
    camera.lookAt(lookAt);

    // cursor on the ground parts the grass
    ray.setFromCamera(new THREE.Vector2(smooth.x * 2 - 1, smooth.y * 2 - 1), camera);
    if (ray.ray.intersectPlane(groundPlane, hit)) {
      shared.uCursor.value.set(hit.x, hit.z, inside ? 0.6 + speed : 0);
    }

    // petals
    for (let i = 0; i < PETALS; i++) {
      const p = pState[i];
      p.y -= p.v * dt;
      p.ph += dt * p.spin;
      if (p.y < 0.02) {
        p.y = rand(3.5, 5.2);
        p.x = rand(-3.5, 3.5);
        p.z = rand(-2.5, 3.5);
      }
      pv.set(p.x + Math.sin(p.ph) * 0.35, p.y, p.z + Math.cos(p.ph * 0.7) * 0.25);
      pq.setFromEuler(pe.set(p.ph, p.ph * 0.6, p.ph * 0.3));
      petals.setMatrixAt(i, m4.compose(pv, pq, one));
    }
    petals.instanceMatrix.needsUpdate = true;

    mists.forEach((m, i) => {
      m.s.position.x = m.x + Math.sin(clock.t * m.sp + i) * 1.2;
    });
    glows.forEach((g, i) => {
      g.material.rotation = clock.t * 0.05 + i;
    });

    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    // bloom: bright pass, then two widening separable blurs
    pass(brightMat, bloomA);
    for (const spread of [1, 2]) {
      blurMat.uniforms.tInput.value = bloomA.texture;
      blurMat.uniforms.uDir.value.set(bloomTexel.x * spread, 0);
      pass(blurMat, bloomB);
      blurMat.uniforms.tInput.value = bloomB.texture;
      blurMat.uniforms.uDir.value.set(0, bloomTexel.y * spread);
      pass(blurMat, bloomA);
    }
    postMat.uniforms.tBloom.value = bloomA.texture;
    pass(postMat, null);
  };
  raf = requestAnimationFrame(tick);

  return {
    ready,
    setReveal: (v) => {
      postMat.uniforms.uReveal.value = v;
    },
    setShift: (v) => {
      shift = v;
      applyView();
    },
    setDay,
    setQuality: (h) => {
      high = h;
      gGeo.instanceCount = h ? MAX_GRASS : Math.round(MAX_GRASS * 0.5);
      resize();
    },
    setActive: (on) => {
      active = on;
    },
    pointer,
    resize,
    dispose: () => {
      cancelAnimationFrame(raf);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose?.();
      });
      leafTex.dispose();
      soft.dispose();
      shadowTex.dispose();
      rt.dispose();
      bloomA.dispose();
      bloomB.dispose();
      brightMat.dispose();
      blurMat.dispose();
      postMat.dispose();
      renderer.dispose();
    },
  };
}
