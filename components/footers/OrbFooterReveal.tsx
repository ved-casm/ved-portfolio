"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer1 from "@/components/footers/Footer1";
import "./OrbFooterReveal.css";

gsap.registerPlugin(ScrollTrigger);

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (p: number) => p * p * (3 - 2 * p);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
// cubic Hermite basis
const h00 = (p: number) => 2 * p * p * p - 3 * p * p + 1;
const h01 = (p: number) => -2 * p * p * p + 3 * p * p;
const h11 = (p: number) => p * p * p - p * p;

// Natural box size of each planet element; scale() does the rest.
const P1_BOX = 400;
const P2_BOX = 250;

/*
 * `s` = px scrolled since the block's top reached the viewport top (negative
 * while it scrolls in). The block is pinned for s ∈ [0, pinLen]:
 *   [0, D]            "CONTACT ME." slides left 1:1 with scroll
 *   [D, D+decel]      ...and eases to a stop
 *   (during the slide) the planet-01 "O" peels off and parks top-left
 *   [g0, g1]          the planet-02 "." grows into the orb at the centre
 *   [r0, r1]          a circle behind the orb reveals the footer
 *   [f0, f1]          each planet flies into its slot in the footer, where the
 *                     real image takes over (on mobile the slot is below the
 *                     fold, so the landing happens after the pin)
 * Every blend uses weights with zero slope at both ends, so nothing ever
 * changes speed abruptly.
 */
type Vec = { x: number; y: number; size: number };
type Planet = {
  el: HTMLElement;
  box: number;
  slot: HTMLElement;
  slotImg: HTMLImageElement;
  // landing target (block coords), scale target, timing
  tx: number;
  ty: number;
  tSize: number;
  f0: number;
  f1: number;
  late: boolean;
  landed: boolean | null;
  base: (s: number) => Vec;
  setX: (v: number) => void;
  setY: (v: number) => void;
  setS: (v: number) => void;
};

type OrbFooterRevealProps = {
  ctaHref?: string;
  captionCursorText?: string;
};

export default function OrbFooterReveal({
  ctaHref = "/contact",
  captionCursorText = "Contact me",
}: OrbFooterRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const clip = root.querySelector<HTMLElement>(".orb-reveal__clip");
    const track = root.querySelector<HTMLElement>(".orb-reveal__track");
    const phO = root.querySelector<HTMLElement>(".orb-reveal__ph--o");
    const phDot = root.querySelector<HTMLElement>(".orb-reveal__ph--dot");
    const capsule = root.querySelector<HTMLElement>(".orb-reveal__capsule");
    const video = root.querySelector<HTMLVideoElement>(".orb-reveal__capsule video");
    const p1El = root.querySelector<HTMLElement>(".orb-reveal__p1");
    const p2El = root.querySelector<HTMLElement>(".orb-reveal__p2");
    const slot1 = root.querySelector<HTMLElement>(".mxd-footer__planet01");
    const slot2 = root.querySelector<HTMLElement>(".mxd-footer__planet02");
    const slot1Img = slot1?.querySelector<HTMLImageElement>("img") ?? null;
    const slot2Img = slot2?.querySelector<HTMLImageElement>("img") ?? null;
    if (
      !clip || !track || !phO || !phDot || !capsule || !video || !p1El || !p2El ||
      !slot1 || !slot2 || !slot1Img || !slot2Img
    ) {
      return;
    }

    const ctx = gsap.context(() => {
      const m = {
        vw: 0,
        vh: 0,
        trackY: 0,
        xStart: 0,
        D: 0,
        decel: 0,
        o: { x: 0, y: 0, size: 0 }, // "O" placeholder centre in track coords
        dot: { x: 0, y: 0, size: 0 },
        orbSize: 0,
        park: { x: 0, y: 0, size: 0 },
        parkFrom: 0, // O starts peeling off when its centre passes this x
        parkSpan: 0,
        g0: 0,
        g1: 0,
        r0: 0,
        r1: 0,
        rMin: 0,
        rEnd: 0,
        f0: 0,
        pinLen: 0,
        driveLen: 0,
        capsuleOut: 0, // s at which the capsule has slid off the left edge
      };

      const trackX = (s: number) => {
        if (s <= 0) return m.xStart;
        if (s <= m.D) return m.xStart - s;
        const t = Math.min(s - m.D, m.decel);
        return m.xStart - m.D - (t - (t * t) / (2 * m.decel));
      };

      const centreIn = (ph: HTMLElement) => ({
        x: ph.offsetLeft + ph.offsetWidth / 2,
        y: ph.offsetTop + ph.offsetHeight / 2,
        size: ph.offsetWidth,
      });

      const p1Base = (s: number): Vec => {
        const tx = trackX(s);
        const ax = tx + m.o.x;
        const ay = m.trackY + m.o.y;
        const w = smooth(clamp01((m.parkFrom - ax) / m.parkSpan));
        return {
          x: lerp(ax, m.park.x, w),
          y: lerp(ay, m.park.y, w),
          size: lerp(m.o.size, m.park.size, w),
        };
      };

      const p2Base = (s: number): Vec => {
        const ax = trackX(s) + m.dot.x;
        const ay = m.trackY + m.dot.y;
        const e = smooth(clamp01((s - m.g0) / (m.g1 - m.g0)));
        return {
          x: lerp(ax, m.vw / 2, e),
          y: lerp(ay, m.vh / 2, e),
          size: lerp(m.dot.size, m.orbSize, e),
        };
      };

      const makePlanet = (
        el: HTMLElement,
        box: number,
        slot: HTMLElement,
        slotImg: HTMLImageElement,
        base: (s: number) => Vec,
      ): Planet => ({
        el,
        box,
        slot,
        slotImg,
        tx: 0,
        ty: 0,
        tSize: 0,
        f0: 0,
        f1: 0,
        late: false,
        landed: null,
        base,
        setX: gsap.quickSetter(el, "x", "px") as (v: number) => void,
        setY: gsap.quickSetter(el, "y", "px") as (v: number) => void,
        setS: (() => {
          const sx = gsap.quickSetter(el, "scaleX");
          const sy = gsap.quickSetter(el, "scaleY");
          return (v: number) => {
            sx(v);
            sy(v);
          };
        })(),
      });

      const planets = [
        makePlanet(p1El, P1_BOX, slot1, slot1Img, p1Base),
        makePlanet(p2El, P2_BOX, slot2, slot2Img, p2Base),
      ];

      const measure = () => {
        const vw = root.clientWidth;
        const vh = window.innerHeight;
        m.vw = vw;
        m.vh = vh;

        const trackW = track.offsetWidth;
        m.trackY = (vh - track.offsetHeight) / 2;
        m.o = centreIn(phO);
        m.dot = centreIn(phDot);

        // start with the video capsule near the left edge, end with "ME." at
        // the right
        m.decel = 0.8 * vh;
        m.xStart = vw * 0.05 - capsule.offsetLeft;
        m.capsuleOut = m.xStart + capsule.offsetLeft + capsule.offsetWidth;
        const xEnd = vw * 0.94 - trackW;
        m.D = Math.max(0.2 * vh, m.xStart - xEnd - m.decel / 2);

        m.orbSize = Math.min(150, Math.max(90, vw * 0.09));
        m.park = { x: vw * 0.18, y: vh * 0.15, size: m.orbSize * 1.25 };
        m.parkFrom = vw * 0.36;
        m.parkSpan = vw * 0.3;

        const textEnd = m.D + m.decel;
        // "ME." settles with the dot on screen first, then the dot grows
        m.g0 = textEnd - 0.15 * vh;
        m.g1 = textEnd + 0.75 * vh;
        m.r0 = m.g1 - 0.1 * vh;
        m.r1 = m.r0 + 1.35 * vh;
        m.rMin = (m.orbSize / 2) * 0.9;
        m.rEnd = Math.hypot(vw / 2, vh / 2) + 4;
        m.f0 = m.g1 + 0.8 * vh;
        m.pinLen = m.f0 + 1.1 * vh;

        // the block ends the page: s can't exceed rootH + pinLen - vh
        const maxS = root.offsetHeight + m.pinLen - vh - 0.03 * vh;
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

        planets.forEach((p) => {
          let x = 0;
          let y = 0;
          let node: HTMLElement | null = p.slot;
          while (node && node !== root) {
            x += node.offsetLeft;
            y += node.offsetTop;
            node = node.offsetParent as HTMLElement | null;
          }
          const w = p.slot.offsetWidth;
          const h = p.slotImg.offsetHeight || w;
          // land on the float keyframe translateY(-1rem), where it is still
          p.tx = x + w / 2;
          p.ty = y + h / 2 - rem;
          p.tSize = w;
          const below = y + h > vh * 0.92;
          const wanted = below ? m.pinLen + (p.ty - vh * 0.65) : m.pinLen;
          p.f1 = Math.min(wanted, maxS);
          p.late = p.f1 > m.pinLen;
          // a late landing dips before rising with the footer; keep it short
          p.f0 = p.late ? Math.max(m.f0, p.f1 - vh) : m.f0;
        });

        // run a little past the last landing so rounding can't leave s a hair
        // short of f1 (the handover would never fire)
        m.driveLen = vh + Math.max(...planets.map((p) => p.f1)) + 0.25 * vh;
      };
      measure();

      const setTrackX = gsap.quickSetter(track, "x", "px");
      const setTrackY = gsap.quickSetter(track, "y", "px");
      let lastClip = "";

      const setLanded = (p: Planet, value: boolean) => {
        if (p.landed === value) return;
        p.landed = value;
        p.el.style.visibility = value ? "hidden" : "visible";
        p.slotImg.style.visibility = value ? "visible" : "hidden";
        // restart the float from its first keyframe exactly on landing
        p.slotImg.style.animation = value ? "" : "none";
      };

      const render = (s: number) => {
        setTrackX(trackX(s));
        setTrackY(m.trackY);

        const scrolled = Math.max(0, s - m.pinLen); // block scroll after unpin
        planets.forEach((p) => {
          let v: Vec;
          if (s <= p.f0) {
            v = p.base(Math.min(s, m.f0));
          } else {
            const from = p.base(m.f0); // at rest by now
            const q = clamp01((s - p.f0) / (p.f1 - p.f0));
            const landY = p.ty - Math.max(0, p.f1 - m.pinLen);
            const vEnd = p.late ? -1 : 0;
            const k = h01(q);
            v = {
              x: lerp(from.x, p.tx, k),
              y: h00(q) * from.y + h01(q) * landY + h11(q) * (p.f1 - p.f0) * vEnd,
              size: lerp(from.size, p.tSize, k),
            };
          }
          p.setX(v.x - p.box / 2);
          p.setY(v.y + scrolled - p.box / 2);
          p.setS(v.size / p.box);
          setLanded(p, s >= p.f1);
        });

        const u = clamp01((s - m.r0) / (m.r1 - m.r0));
        const next =
          u >= 1
            ? "none"
            : u <= 0
              ? `circle(0px at 50% ${m.vh / 2}px)`
              : `circle(${(m.rMin + (m.rEnd - m.rMin) * u * u).toFixed(1)}px at 50% ${m.vh / 2}px)`;
        if (next !== lastClip) {
          clip.style.clipPath = next;
          lastClip = next;
        }
      };
      render(-m.vh);

      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: () => {
          measure();
          return `+=${m.pinLen}`;
        },
        pin: true,
      });

      // Decode the footer's images and start fetching the capsule video
      // before the block arrives (the video is preload="none" until then).
      ScrollTrigger.create({
        trigger: root,
        start: "top bottom+=100%",
        once: true,
        onEnter: () => {
          clip.querySelectorAll("img").forEach((img) => {
            img.loading = "eager";
            img.decode?.().catch(() => {});
          });
          video.preload = "auto";
          video.load();
        },
      });

      // Only play the video while the capsule is on screen.
      ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: () => `+=${m.vh + m.capsuleOut}`,
        onToggle: (self) => {
          if (self.isActive) void video.play().catch(() => {});
          else video.pause();
        },
      });

      const drive = (self: ScrollTrigger) =>
        render(self.progress * (self.end - self.start) - m.vh);

      ScrollTrigger.create({
        trigger: root,
        start: "top bottom",
        end: () => {
          measure();
          return `+=${m.driveLen}`;
        },
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: drive,
        onRefresh: drive,
      });
    }, root);

    return () => {
      ctx.revert();
      [p1El, p2El, slot1Img, slot2Img].forEach((el) => {
        el.style.visibility = "";
      });
      slot1Img.style.animation = "";
      slot2Img.style.animation = "";
    };
  }, []);

  return (
    <div className="orb-reveal" ref={rootRef}>
      <div className="orb-reveal__cta">
        <Link
          className="orb-reveal__track active-cursor-accent"
          data-cursor-text={captionCursorText}
          href={ctaHref}
          aria-label="Contact me"
        >
          <span aria-hidden="true">
            <span className="orb-reveal__capsule">
              <video muted loop playsInline preload="none">
                <source src="/video/1280x720_bus.mp4" type="video/mp4" />
              </video>
            </span>
            C<span className="orb-reveal__ph orb-reveal__ph--o" />NTACT ME
            <span className="orb-reveal__ph orb-reveal__ph--dot" />
          </span>
        </Link>
      </div>
      <div className="orb-reveal__clip">
        <Footer1 />
      </div>
      <div className="orb-reveal__layer" aria-hidden="true">
        <div className="orb-reveal__planet orb-reveal__p1">
          <Image src="/img/demo/planet-01.webp" alt="" width={400} height={404} />
        </div>
        <div className="orb-reveal__planet orb-reveal__p2">
          <Image src="/img/demo/planet-02.webp" alt="" width={250} height={255} />
        </div>
      </div>
    </div>
  );
}
