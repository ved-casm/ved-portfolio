"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./FeatherCTA.module.css";
import { CommonLoadFade } from "@/components/animations/CommonLoadAnimation";
import SmoothAnchorLink from "@/components/common/SmoothAnchorLink";
import TextScramble from "@/components/animations/TextScramble";
import { onWidthResize } from "@/lib/widthResize";

gsap.registerPlugin(ScrollTrigger);

/*
 * Scroll-driven CTA: a feather (pre-rendered turntable frames) flies in,
 * opens towards the viewer beside the headline, then turns edge-on and comes
 * to rest above a hand, trailing three.js dust particles.
 *
 * Time axis `u` is in viewport heights: u = -1 when the section's top meets
 * the viewport bottom, u = 0 when it reaches the top (pin starts), u = PIN
 * when the pin ends. All motion is keyframed on u.
 */

const PIN = 2.2;

// Turntable frames in /img/feather-leaf: 0 = facing the viewer, 242 = edge-on.
// Spacing is uneven, so frames are picked by number, not by index.
const FRAME_NUMBERS = [
  0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 77, 80, 83, 85,
  86, 89, 90, 92, 95, 98, 100, 101, 104, 105, 107, 110, 113, 115, 116, 119, 120,
  122, 125, 128, 130, 131, 134, 135, 137, 140, 143, 145, 146, 149, 150, 152, 155,
  158, 160, 161, 164, 165, 167, 170, 173, 175, 176, 179, 180, 182, 185, 188, 190,
  191, 194, 195, 197, 200, 203, 205, 206, 209, 210, 212, 215, 218, 220, 221, 224,
  225, 227, 230, 233, 235, 236, 239, 240, 242,
];
const LAST_FRAME = 242;
const frameSrc = (n: number) =>
  `/img/feather-leaf/frame-${String(n).padStart(5, "0")}.avif`;

// Hand image (2000x280): the feather comes to rest floating above the hand,
// centred over the palm/fingers (x 53%), a clear gap above the fingertips
// (y -18%), as on the reference, not lying on the palm.
const LAND_X = 0.53;
const LAND_Y = -0.18;

/** Keyframe: x/y as fractions of the section, rot in deg, s = scale of base
 *  size, f = openness (0 edge-on .. 1 facing). `land` marks the resting key. */
type Key = { u: number; x: number; y: number; rot: number; s: number; f: number };
const CH = ["x", "y", "rot", "s", "f"] as const;

// In the frames the feather's spine points up-right, ~70deg above horizontal;
// rotating by +70 (clockwise) lays it flat with the tip to the right.
const SPINE_DEG = 70;

function buildKeys(portrait: boolean, palm: { x: number; y: number }): Key[] {
  const face = portrait
    ? { x: 0.66, y: 0.62, rot: 8, s: 0.9 }
    : { x: 0.79, y: 0.4, rot: 8, s: 0.85 };
  return [
    // enters edge-on, lying flat, from above the top-left
    { u: -1.0, x: portrait ? 0.05 : 0.1, y: -0.18, rot: 78, s: 0.5, f: 0 },
    // stays high, above the headline, before swinging down to the right
    { u: -0.2, x: portrait ? 0.3 : 0.38, y: portrait ? 0.06 : 0.05, rot: 60, s: 0.62, f: 0.25 },
    // opens up towards the viewer beside the headline
    { u: 0.6, x: face.x, y: face.y, rot: face.rot, s: face.s, f: 1 },
    { u: 1.0, x: face.x + 0.01, y: face.y + 0.03, rot: face.rot + 4, s: face.s, f: 1 },
    // turns edge-on and settles, floating flat above the hand
    { u: 1.9, x: palm.x, y: palm.y, rot: 64, s: 0.78, f: 0 },
    { u: PIN, x: palm.x, y: palm.y, rot: 64, s: 0.78, f: 0 },
  ];
}

/** Cardinal (Catmull-Rom) Hermite through non-uniform keys: C1-smooth, so the
 *  feather flows through keys instead of stopping at each. Tangent is zero at
 *  both ends and at the landing key so it settles without overshoot. */
function sample(keys: Key[], u: number) {
  const out = {} as Record<(typeof CH)[number], number>;
  if (u <= keys[0].u) {
    CH.forEach((c) => (out[c] = keys[0][c]));
    return out;
  }
  const last = keys.length - 1;
  if (u >= keys[last].u) {
    CH.forEach((c) => (out[c] = keys[last][c]));
    return out;
  }
  let i = 0;
  while (u > keys[i + 1].u) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const dt = b.u - a.u;
  const p = (u - a.u) / dt;
  const tangent = (k: number, c: (typeof CH)[number]) => {
    if (k === 0 || k >= last - 1) return 0;
    return (keys[k + 1][c] - keys[k - 1][c]) / (keys[k + 1].u - keys[k - 1].u);
  };
  const h00 = 2 * p ** 3 - 3 * p ** 2 + 1;
  const h10 = p ** 3 - 2 * p ** 2 + p;
  const h01 = -2 * p ** 3 + 3 * p ** 2;
  const h11 = p ** 3 - p ** 2;
  CH.forEach((c) => {
    out[c] =
      h00 * a[c] + h10 * dt * tangent(i, c) + h01 * b[c] + h11 * dt * tangent(i + 1, c);
  });
  return out;
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - (1 - t) ** 3;

export default function FeatherCTA() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const featherEl = root.querySelector<HTMLCanvasElement>(`.${styles.feather}`);
    const dustEl = root.querySelector<HTMLCanvasElement>(`.${styles.dust}`);
    const handEl = root.querySelector<HTMLImageElement>(`.${styles.hand}`);
    const copyEl = root.querySelector<HTMLElement>(`.${styles.copy}`);
    if (!featherEl || !dustEl || !handEl || !copyEl) return;
    const fctx = featherEl.getContext("2d");
    if (!fctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // phones: half the frames and a capped canvas resolution; iOS Safari kills
    // tabs that hold too much decoded image / canvas memory
    const touch = window.matchMedia("(pointer: coarse)").matches;
    const FRAMES = touch ? FRAME_NUMBERS.filter((_, i) => i % 2 === 0 || i === FRAME_NUMBERS.length - 1) : FRAME_NUMBERS;
    const DPR_CAP = touch ? 1.5 : 2;

    // ---- layout -----------------------------------------------------------
    const m = { w: 0, h: 0, base: 0, dpr: 1, portrait: false, keys: [] as Key[], lift: 0 };
    const measure = () => {
      m.w = root.clientWidth;
      m.h = window.innerHeight;
      m.portrait = m.w / m.h < 0.9;
      m.base = m.portrait ? Math.min(m.w * 0.62, m.h * 0.42) : Math.min(m.w * 0.36, m.h * 0.62);
      m.dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      const size = Math.round(m.base * m.dpr);
      if (featherEl.width !== size) {
        featherEl.width = size;
        featherEl.height = size;
        lastDrawn = -1;
      }
      featherEl.style.width = `${m.base}px`;
      featherEl.style.height = `${m.base}px`;
      // resting point in section fractions, floating above the hand
      const hx = handEl.offsetLeft + handEl.offsetWidth * LAND_X;
      const hy = handEl.offsetTop + handEl.offsetHeight * LAND_Y;
      m.keys = buildKeys(m.portrait, { x: hx / m.w, y: hy / m.h });
      // On short screens the resting feather would sit on the copy; slide the
      // copy up just enough (like the reference, where it scrolls away).
      const featherTop = hy - m.base * 0.78 * 0.22;
      const copyBottom = copyEl.offsetTop + copyEl.offsetHeight;
      m.lift = Math.max(0, copyBottom + 32 - featherTop);
    };

    // ---- frames -----------------------------------------------------------
    const frames: (HTMLImageElement | null)[] = FRAMES.map(() => null);
    let lastDrawn = -1;
    let loadStarted = false;
    const loadFrames = () => {
      if (loadStarted) return;
      loadStarted = true;
      // coarse pass first (every 4th) so scrubbing works early, then the rest
      const order = [
        ...FRAMES.map((_, i) => i).filter((i) => i % 4 === 0),
        ...FRAMES.map((_, i) => i).filter((i) => i % 4 !== 0),
      ];
      order.forEach((i) => {
        const img = new Image();
        img.decoding = "async";
        img.src = frameSrc(FRAMES[i]);
        img
          .decode()
          .then(() => {
            frames[i] = img;
            lastDrawn = -1; // may be a closer match now
          })
          .catch(() => { });
      });
    };
    const nearestLoaded = (target: number) => {
      let best = -1;
      let bestD = Infinity;
      FRAMES.forEach((n, i) => {
        if (!frames[i]) return;
        const d = Math.abs(n - target);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      return best;
    };
    const drawFrame = (openness: number) => {
      const i = nearestLoaded((1 - clamp01(openness)) * LAST_FRAME);
      if (i < 0 || i === lastDrawn) return;
      lastDrawn = i;
      fctx.clearRect(0, 0, featherEl.width, featherEl.height);
      fctx.drawImage(frames[i]!, 0, 0, featherEl.width, featherEl.height);
    };

    // ---- scroll state ------------------------------------------------------
    let uTarget = -1;
    let uSmooth = -1;
    const state = { x: 0, y: 0, rot: 0, s: 1, f: 0, vx: 0, vy: 0, hover: 0 };
    const setFX = gsap.quickSetter(featherEl, "x", "px");
    const setFY = gsap.quickSetter(featherEl, "y", "px");
    const setFR = gsap.quickSetter(featherEl, "rotation", "deg");
    // "scale" is an alias GSAP expands to "scaleX,scaleY"; quickSetter doesn't
    // split it, and Safari throws on the resulting attribute name (the page
    // failed to load on iOS). Two explicit setters instead.
    const setFSX = gsap.quickSetter(featherEl, "scaleX");
    const setFSY = gsap.quickSetter(featherEl, "scaleY");
    const setFS = (v: number) => {
      setFSX(v);
      setFSY(v);
    };
    const setHandX = gsap.quickSetter(handEl, "xPercent");
    const setHandO = gsap.quickSetter(handEl, "opacity");
    const setCopyY = gsap.quickSetter(copyEl, "y", "px");
    const setCopyO = gsap.quickSetter(copyEl, "opacity");

    let time = 0;
    const applyScene = (u: number, dtSec: number) => {
      const k = sample(m.keys, u);
      // a gentle float once it's settled on the hand / while held facing us
      time += dtSec;
      const settle = clamp01((u - 1.75) / 0.3);
      const hold = clamp01(1 - Math.abs(u - 0.8) / 0.4);
      const bob = Math.sin(time * 1.6) * (4 + 4 * settle) * Math.max(settle, hold);
      const px = k.x * m.w;
      const py = k.y * m.h + bob;
      if (dtSec > 0) {
        state.vx = (px - state.x) / dtSec;
        state.vy = (py - state.y) / dtSec;
      }
      state.x = px;
      state.y = py;
      state.rot = k.rot + Math.sin(time * 1.1) * 1.5 * Math.max(settle, hold);
      state.s = k.s;
      state.f = k.f;
      setFX(px - m.base / 2);
      setFY(py - m.base / 2);
      setFR(state.rot);
      setFS(state.s);
      drawFrame(state.f);

      const handT = easeOut(clamp01((u - 0.9) / 0.8));
      setHandX((1 - handT) * 45);
      setHandO(handT);
      const copyT = easeOut(clamp01((u + 0.7) / 0.7));
      const liftT = clamp01((u - 1.0) / 0.9);
      const lift = m.lift * (liftT * liftT * (3 - 2 * liftT));
      setCopyY((1 - copyT) * 40 - lift);
      setCopyO(copyT);
    };

    measure();
    applyScene(reduceMotion ? PIN : -1, 0);

    ScrollTrigger.create({
      trigger: root,
      start: "top top",
      end: () => `+=${window.innerHeight * PIN}`,
      pin: true,
      invalidateOnRefresh: true,
    });
    const driver = ScrollTrigger.create({
      trigger: root,
      start: "top bottom",
      end: () => `+=${window.innerHeight * (1 + PIN)}`,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        uTarget = reduceMotion ? PIN : self.progress * (1 + PIN) - 1;
      },
      onRefresh: (self) => {
        measure();
        uTarget = reduceMotion ? PIN : self.progress * (1 + PIN) - 1;
        uSmooth = uTarget;
        lastDrawn = -1;
        applyScene(uSmooth, 0);
      },
    });

    // ---- dust particles (three.js, loaded on demand) ------------------------
    type Dust = {
      step: (dtSec: number, emit: boolean) => void;
      resize: () => void;
      dispose: () => void;
    };
    let dust: Dust | null = null;
    let disposed = false;

    const initDust = async () => {
      const THREE = await import("three");
      if (disposed) return;
      const MAX = 900;
      const renderer = new THREE.WebGLRenderer({ canvas: dustEl, alpha: true, antialias: false, powerPreference: "high-performance" });
      renderer.setClearColor(0x000000, 0);
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -1, 1);

      const pos = new Float32Array(MAX * 3);
      const vel = new Float32Array(MAX * 2);
      const life = new Float32Array(MAX); // remaining seconds
      const maxLife = new Float32Array(MAX);
      const alpha = new Float32Array(MAX);
      const size = new Float32Array(MAX);
      const baseSize = new Float32Array(MAX);
      const hue = new Float32Array(MAX);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));
      geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
      geo.setAttribute("aHue", new THREE.BufferAttribute(hue, 1));
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uDpr: { value: m.dpr } },
        vertexShader: /* glsl */ `
          attribute float aAlpha; attribute float aSize; attribute float aHue;
          varying float vAlpha; varying float vHue;
          uniform float uDpr;
          void main() {
            vAlpha = aAlpha; vHue = aHue;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * uDpr;
          }`,
        fragmentShader: /* glsl */ `
          varying float vAlpha; varying float vHue;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            float d = length(c);
            float core = smoothstep(0.5, 0.0, d);
            float glow = pow(core, 2.2);
            vec3 gold = vec3(1.0, 0.82, 0.45);
            vec3 ember = vec3(1.0, 0.42, 0.18);
            vec3 col = mix(gold, ember, vHue);
            float halo = smoothstep(0.5, 0.15, d) * 0.35;
            gl_FragColor = vec4(col * (0.8 + 1.2 * glow), (glow + halo) * vAlpha);
          }`,
      });
      const points = new THREE.Points(geo, mat);
      points.frustumCulled = false;
      scene.add(points);

      let cursor = 0;
      let carry = 0;
      const spawn = () => {
        const i = cursor;
        cursor = (cursor + 1) % MAX;
        // along the feather's long axis (rotated), thinner when edge-on
        const rad = ((state.rot - SPINE_DEG) * Math.PI) / 180;
        const len = m.base * state.s * 0.4;
        const wid = m.base * state.s * (0.04 + 0.14 * state.f);
        const t = (Math.random() * 2 - 1) * len;
        const n = (Math.random() * 2 - 1) * wid;
        const ax = Math.cos(rad);
        const ay = Math.sin(rad);
        pos[i * 3] = state.x + ax * t - ay * n;
        pos[i * 3 + 1] = state.y + ay * t + ax * n;
        pos[i * 3 + 2] = 0;
        // trail behind the motion, then drift and slowly sink like dust
        vel[i * 2] = -state.vx * 0.08 + (Math.random() - 0.5) * 50;
        vel[i * 2 + 1] = -state.vy * 0.08 + (Math.random() - 0.5) * 40 + 10;
        const L = 1.4 + Math.random() * 2.2;
        life[i] = L;
        maxLife[i] = L;
        baseSize[i] = (3 + Math.random() * 5) * (Math.random() < 0.1 ? 2.2 : 1);
        hue[i] = Math.random() * 0.85;
      };

      const resize = () => {
        renderer.setPixelRatio(m.dpr);
        renderer.setSize(m.w, m.h, false);
        camera.right = m.w;
        camera.bottom = m.h;
        camera.updateProjectionMatrix();
        mat.uniforms.uDpr.value = m.dpr;
      };
      resize();

      dust = {
        resize,
        step: (dtSec, emit) => {
          if (emit) {
            const speed = Math.hypot(state.vx, state.vy);
            carry += dtSec * (70 + Math.min(speed, 1500) * 0.35);
            while (carry >= 1) {
              spawn();
              carry -= 1;
            }
          }
          for (let i = 0; i < MAX; i++) {
            if (life[i] <= 0) {
              alpha[i] = 0;
              continue;
            }
            life[i] -= dtSec;
            vel[i * 2] *= 0.985;
            vel[i * 2 + 1] = vel[i * 2 + 1] * 0.985 + 10 * dtSec; // slow settle
            pos[i * 3] += vel[i * 2] * dtSec;
            pos[i * 3 + 1] += vel[i * 2 + 1] * dtSec;
            const t = 1 - life[i] / maxLife[i]; // 0 -> 1
            // quick fade-in, long fade-out, with a sparkle flicker
            alpha[i] = Math.min(1, t * 6) * (1 - t) ** 1.2 * (0.7 + 0.3 * Math.sin(t * 38 + i));
            size[i] = baseSize[i] * (1 - 0.5 * t);
          }
          geo.attributes.position.needsUpdate = true;
          geo.attributes.aAlpha.needsUpdate = true;
          geo.attributes.aSize.needsUpdate = true;
          renderer.render(scene, camera);
        },
        dispose: () => {
          geo.dispose();
          mat.dispose();
          renderer.dispose();
        },
      };
    };

    // ---- render loop: only while the section is near/in view ---------------
    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dtSec = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      // extra easing on top of Lenis for a buttery scrub
      uSmooth += (uTarget - uSmooth) * (1 - Math.exp(-dtSec * 10));
      if (Math.abs(uTarget - uSmooth) < 1e-4) uSmooth = uTarget;
      applyScene(uSmooth, dtSec);
      const visible = uSmooth > -1 && uSmooth < PIN + 1;
      dust?.step(dtSec, visible && !reduceMotion);
    };
    const start = () => {
      if (raf) return;
      last = 0;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const near = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          loadFrames();
          if (!dust && !reduceMotion) void initDust();
        }
      },
      { rootMargin: "200% 0px" },
    );
    near.observe(root);
    const onScreen = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
    onScreen.observe(root);

    const onResize = () => {
      measure();
      dust?.resize();
      lastDrawn = -1;
    };
    const stopResize = onWidthResize(onResize);

    return () => {
      disposed = true;
      stop();
      near.disconnect();
      onScreen.disconnect();
      stopResize();
      driver.kill();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === root) t.kill();
      });
      dust?.dispose();
    };
  }, []);

  return (
    <section ref={rootRef} className={styles.section} aria-label="Start a project">
      <div className={styles.bg} aria-hidden="true" />
      <div className={styles.copy}>
        <CommonLoadFade index={1}>
          <div className="inner-headline__link loading-fade">
            <SmoothAnchorLink
              className="btn btn-line btn-line-permanent"
              targetId="services"
            >
              <TextScramble className="btn-caption mxd-scramble">
                Connect
              </TextScramble>
            </SmoothAnchorLink>
          </div>
        </CommonLoadFade>
        <h2 className={styles.title}>
          Hand me your idea.
          <br />
          <span>I&apos;ll make it fly.</span>
        </h2>
        <p className={styles.sub}>
          Design and development under one roof, from the first sketch to a
          fast, polished launch. Tell me what you&apos;re building.
        </p>
        <div className={styles.actions}>
          <Link className={styles.cta} href="/contact">
            Start a project <span aria-hidden="true">→</span>
          </Link>
          {/* <a className={styles.mail} href="mailto:vedank0522@gmail.com">
            vedank0522@gmail.com
          </a> */}
        </div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.hand} src="/img/cta/hand.webp" alt="" width={2000} height={280} />
      <canvas className={styles.feather} aria-hidden="true" />
      <canvas className={styles.dust} aria-hidden="true" />
    </section>
  );
}
