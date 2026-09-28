"use client";

/* eslint-disable @next/next/no-img-element */
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useLenis } from "@/components/common/LenisContext";
import { onPageRevealed } from "@/lib/pageReveal";
import AutoplayLoopVideo from "@/components/media/AutoplayLoopVideo";
import { ATHLNK_REEL } from "@/lib/lazyVideo";

gsap.registerPlugin(ScrollTrigger, SplitText);

/*
 * About page, part 1 (after wonjyou.studio's home intro):
 *   hero - big words that stack in one by one on load, then settle into the
 *          layout; behind them a scroll-driven photo sequence (head turn)
 *   intro - lines of copy revealed as they slide in
 *   mask  - "MEET VEDANK" as a clip-path over a photo; the letters pan past,
 *           then the view zooms into the K until the photo fills the screen
 * Desktop (>=1200px): all three sit on one pinned horizontal track.
 * Smaller screens: stacked, with the sequence and the mask pinned vertically.
 */

const WORDS = ["Designer", "Coder", "Creator", "Engineer"];
const SEQ_COUNT = 35;
const seqSrc = (i: number) => `/img/about/seq/frame-${String(i + 1).padStart(2, "0")}.avif`;
const PORTRAIT = "/img/about/vedank-portrait.avif";
const MASK_TEXT = "MEET VEDANK";
const DESKTOP = "(min-width: 1200px)";
const MOBILE = "(max-width: 1199px)";

/** Draws a frame into a canvas with object-fit: cover. */
function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) {
  const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const dw = img.naturalWidth * s;
  const dh = img.naturalHeight * s;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

export default function AboutHorizontal() {
  const rootRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  useLayoutEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const q = <T extends Element = HTMLElement>(s: string) => root.querySelector<T>(s)!;
    const qa = <T extends Element = HTMLElement>(s: string) => [...root.querySelectorAll<T>(s)];

    // ---- photo sequence (shared by both layouts) ---------------------------
    const canvas = q<HTMLCanvasElement>(".ab-seq canvas");
    const ctx2d = canvas.getContext("2d")!;
    const frames: (HTMLImageElement | null)[] = Array(SEQ_COUNT).fill(null);
    let seqProgress = 0;
    let drawn = -1;
    const sizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      drawn = -1;
      drawSeq();
    };
    const drawSeq = () => {
      const target = Math.round(seqProgress * (SEQ_COUNT - 1));
      // nearest loaded frame
      let i = target;
      for (let d = 0; d < SEQ_COUNT; d++) {
        if (frames[target - d]) { i = target - d; break; }
        if (frames[target + d]) { i = target + d; break; }
      }
      const img = frames[i];
      if (!img || i === drawn) return;
      drawn = i;
      drawCover(ctx2d, img, canvas.width, canvas.height);
    };
    frames.forEach((_, i) => {
      const img = new Image();
      img.decoding = "async";
      img.src = seqSrc(i);
      img.decode().then(() => {
        frames[i] = img;
        drawn = -1;
        drawSeq();
      }).catch(() => { });
    });
    const ro = new ResizeObserver(sizeCanvas);
    ro.observe(canvas);

    // ---- mask geometry: "MEET VEDANK" measured with the page font ----------
    const fontFamily = getComputedStyle(q(".ab-hero__word")).fontFamily;
    const measureInk = (text: string, size: number) => {
      const c = document.createElement("canvas").getContext("2d")!;
      c.font = `800 ${size}px ${fontFamily}`;
      const m = c.measureText(text);
      return {
        left: m.actualBoundingBoxLeft,
        width: m.actualBoundingBoxLeft + m.actualBoundingBoxRight,
        ascent: m.actualBoundingBoxAscent,
        height: m.actualBoundingBoxAscent + m.actualBoundingBoxDescent,
        advance: (s: string) => c.measureText(s).width,
        glyph: (ch: string) => c.measureText(ch),
      };
    };

    let mm: gsap.MatchMedia | null = null;
    let cancelled = false;
    let stopReveal = () => { };
    let stopMenuWait = () => { };
    const ctx = gsap.context(() => { }, root);

    // runs `fn` once the overlay menu is closed (right away if it isn't open)
    const afterMenuCloses = (fn: () => void) => {
      const burger = document.querySelector(".mxd-menu__hamburger");
      if (!burger || !burger.classList.contains("active")) {
        fn();
        return () => { };
      }
      let t = 0;
      const mo = new MutationObserver(() => {
        if (burger.classList.contains("active")) return;
        mo.disconnect();
        // let the overlay's close animation clear the screen
        t = window.setTimeout(fn, 850);
      });
      mo.observe(burger, { attributes: true, attributeFilter: ["class"] });
      return () => {
        mo.disconnect();
        window.clearTimeout(t);
      };
    };

    // ---- hero intro: words stack in, then settle ----------------------------
    const playIntro = () => {
      const hero = q(".ab-hero");
      const words = qa(".ab-hero__word");
      const sub = q(".ab-hero__sub");
      const caption = root.querySelector<HTMLElement>(".ab-hero__caption");
      const capSpan = root.querySelector<HTMLElement>(".ab-hero__caption span");
      const hint = q(".ab-hero__scroll");
      // the page always opens at the top now, so only reduced motion skips it
      const skip = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (window.scrollY > 0) {
        window.scrollTo(0, 0);
        lenisRef.current?.scrollTo(0, { immediate: true, force: true });
      }
      const hr = hero.getBoundingClientRect();
      const rects = words.map((w) => w.getBoundingClientRect());
      const top = rects.map((r) => r.top - hr.top);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const centerX = rects.map((r) => (vw - r.width) / 2 - (r.left - hr.left));
      const last = words.length - 1;

      gsap.set(hint, { autoAlpha: 0 });
      if (skip) {
        gsap.set(words, { opacity: 1 });
        gsap.set(sub, { xPercent: 0 });
        if (caption) gsap.set(caption, { autoAlpha: 0 });
        gsap.to(hint, { autoAlpha: 1, duration: 0.6 });
        return;
      }
      lenisRef.current?.stop();
      gsap.set(words, { opacity: 1, x: (i) => centerX[i], y: (i) => vh - top[i], scale: 0.8 });
      gsap.set(sub, { xPercent: -120 });
      const capRect = caption?.getBoundingClientRect();
      const capTop = capRect ? capRect.top - hr.top : 0;
      const capH = capRect ? capRect.height : 0;
      // caption rides just above the top of the growing stack
      const capYFor = (row: number) => top[row] - capH - 18 - capTop;

      // held on the first frame until the site loader has lifted
      const tl = gsap.timeline({ paused: true, defaults: { duration: 0.88, ease: "power2.out" } });
      // start once the site loader has lifted AND the menu (if we came from
      // it) has finished closing, so the intro isn't played behind either
      stopReveal = onPageRevealed(() => {
        stopMenuWait = afterMenuCloses(() => tl.play());
      });
      if (capSpan) {
        tl.to(capSpan, { yPercent: 0, duration: 0.7, ease: "power3.out" }, 0.3);
      }
      words.forEach((_, i) => {
        const at = 0.6 + i * 0.88;
        // the newest word takes the bottom row, older ones move up a row
        for (let k = 0; k <= i; k++) {
          const row = last - (i - k);
          tl.to(words[k], { y: top[row] - top[k], scale: 1 }, at);
        }
        if (caption) {
          tl.to(caption, { y: capYFor(last - i) }, at);
        }
      });
      const settle = 0.6 + words.length * 0.88 + 0.3;
      if (capSpan) {
        tl.to(capSpan, { yPercent: -110, duration: 0.6, ease: "power3.in" }, settle);
      }
      tl.to(words, { x: 0, duration: 1, ease: "expo.inOut" }, settle);
      tl.to(sub, { xPercent: 0, duration: 1, ease: "expo.inOut" }, settle + 0.1);
      tl.to(hint, { autoAlpha: 1, duration: 0.6 }, settle + 0.8);
      tl.call(() => {
        if (caption) gsap.set(caption, { autoAlpha: 0 });
        lenisRef.current?.start();
      });
    };

    // ---- desktop: one horizontal track --------------------------------------
    const buildDesktop = () => {
      const inner = q(".ab-h__inner");
      const track = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          refreshPriority: 10,
          end: () => `+=${inner.scrollWidth - window.innerWidth}`,
        },
      });
      track.to(inner, { x: () => -(inner.scrollWidth - window.innerWidth), ease: "none" });

      // photo sequence: head turns as the hero slides out
      ScrollTrigger.create({
        trigger: q(".ab-hero"),
        containerAnimation: track,
        start: "left left",
        end: "center left",
        scrub: true,
        onUpdate: (self) => {
          seqProgress = self.progress;
          drawSeq();
        },
      });

      // intro copy: lines rise as the panel arrives
      const splits = qa(".ab-intro [data-split]").map((el) =>
        SplitText.create(el, { type: "lines", mask: "lines", linesClass: "ab-line" }),
      );
      splits.forEach((s, i) => {
        gsap.from(s.lines, {
          yPercent: 110,
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.06,
          delay: i === 0 ? 0 : 0.12,
          scrollTrigger: { trigger: s.elements[0] as HTMLElement, containerAnimation: track, start: "left 85%", once: true },
          onComplete: () => {
            if (s.masks) gsap.set(s.masks, { overflow: "visible" });
          },
        });
      });

      // mask: pan the letters past, then zoom into the K
      const section = q(".ab-mask");
      const bg = q(".ab-mask__bg");
      const fill = q(".ab-mask__fill");
      const text = q<SVGTextElement>(".ab-mask__text");
      const box = q(".ab-mask__box");
      const geo = { ox: 0, oy: 0, y0: 0, panTo: 0 };
      const layoutMask = () => {
        const vh = window.innerHeight;
        const vw = window.innerWidth;
        const ink = measureInk(MASK_TEXT, 1000);
        const s = (0.8 * vh) / ink.height;
        // one line on desktop
        const tspans = text.querySelectorAll("tspan");
        tspans[0].textContent = MASK_TEXT;
        tspans[1].textContent = "";
        tspans.forEach((t) => {
          t.removeAttribute("x");
          t.removeAttribute("y");
        });
        text.setAttribute("font-size", String(1000 * s));
        text.setAttribute("x", String(ink.left * s));
        text.setAttribute("y", String(ink.ascent * s));
        const textW = ink.width * s;
        box.style.width = `${textW * 1.25}px`;
        // zoom point: on the upright stem of the final "K"
        const kLeft = ink.left + ink.advance(MASK_TEXT.slice(0, -1));
        const k = ink.glyph("K");
        geo.ox = (kLeft + k.actualBoundingBoxLeft * -1 + (k.actualBoundingBoxRight + k.actualBoundingBoxLeft) * 0.14) * s;
        geo.oy = (0.8 * vh) / 2;
        geo.y0 = (vh - 0.8 * vh) / 2;
        geo.panTo = vw / 2 - geo.ox;
      };
      layoutMask();
      const apply = (p: number) => {
        const pan = Math.min(1, p / 0.72);
        const zoom = p <= 0.72 ? 0 : (p - 0.72) / 0.28;
        const x = geo.panTo * pan;
        // 1 -> 21 like the reference, but capped: Chrome stops painting text
        // this large (the glyphs pass ~10k px). By then the letters already
        // cover the screen and the unclipped photo has faded in on top.
        const k = 1 + 11 * zoom;
        // full photo lands right as the track ends, so the next scroll moves on
        gsap.set(fill, { opacity: gsap.utils.clamp(0, 1, (zoom - 0.55) / 0.37) });
        text.setAttribute(
          "transform",
          `translate(${x} ${geo.y0}) translate(${geo.ox} ${geo.oy}) scale(${k}) translate(${-geo.ox} ${-geo.oy})`,
        );
      };
      apply(0);
      ScrollTrigger.create({
        trigger: section,
        containerAnimation: track,
        start: "left left",
        end: "right right",
        scrub: true,
        onUpdate: (self) => {
          // keep the photo still in the viewport while the section slides
          gsap.set([bg, fill], { x: (section.scrollWidth - window.innerWidth) * self.progress });
          apply(self.progress);
        },
        onRefresh: (self) => {
          layoutMask();
          apply(self.progress);
        },
      });
      return () => splits.forEach((s) => s.revert());
    };

    // ---- smaller screens: stacked --------------------------------------------
    const buildMobile = () => {
      ScrollTrigger.create({
        trigger: q(".ab-seq"),
        // clamp: the canvas is already on screen at load, so start at scroll 0
        // on the first frame (left profile) instead of mid-turn
        start: "clamp(top bottom)",
        end: "bottom 15%",
        scrub: true,
        onUpdate: (self) => {
          seqProgress = self.progress;
          drawSeq();
        },
      });
      const splits = qa(".ab-intro [data-split]").map((el) =>
        SplitText.create(el, { type: "lines", mask: "lines", linesClass: "ab-line" }),
      );
      splits.forEach((s) => {
        gsap.from(s.lines, {
          yPercent: 110,
          duration: 1,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: { trigger: s.elements[0] as HTMLElement, start: "top 85%", once: true },
          onComplete: () => {
            if (s.masks) gsap.set(s.masks, { overflow: "visible" });
          },
        });
      });

      // two-line mask, pinned, zooming into the E of VEDANK
      const section = q(".ab-mask");
      const text = q<SVGTextElement>(".ab-mask__text");
      const geo = { ox: 0, oy: 0, tx: 0, ty: 0 };
      const layout = () => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const [l1, l2] = ["MEET", "VEDANK"];
        const i1 = measureInk(l1, 1000);
        const i2 = measureInk(l2, 1000);
        const lineGap = 0.08;
        const blockW = Math.max(i1.width, i2.width);
        const blockH = i1.height + i2.height + lineGap * 1000;
        const s = Math.min((0.88 * vw) / blockW, (0.6 * vh) / blockH);
        text.setAttribute("font-size", String(1000 * s));
        // two lines on small screens
        const tspans = text.querySelectorAll("tspan");
        tspans[0].textContent = l1;
        tspans[1].textContent = l2;
        const x1 = ((blockW - i1.width) / 2 + i1.left) * s;
        const x2 = ((blockW - i2.width) / 2 + i2.left) * s;
        tspans[0].setAttribute("x", String(x1));
        tspans[0].setAttribute("y", String(i1.ascent * s));
        tspans[1].setAttribute("x", String(x2));
        tspans[1].setAttribute("y", String((i1.height + lineGap * 1000 + i2.ascent) * s));
        text.removeAttribute("x");
        text.removeAttribute("y");
        geo.tx = (vw - blockW * s) / 2;
        geo.ty = (vh - blockH * s) / 2;
        const e = i2.glyph("E");
        const eLeft = i2.advance("V");
        // x2 is line 2's origin; E's ink starts after the V's advance
        geo.ox = x2 + (eLeft - e.actualBoundingBoxLeft + (e.actualBoundingBoxRight + e.actualBoundingBoxLeft) * 0.12) * s;
        geo.oy = (i1.height + lineGap * 1000 + i2.height / 2) * s;
      };
      layout();
      const fill = q(".ab-mask__fill");
      const apply = (p: number) => {
        const k = 1 + 11 * p * p;
        // full photo lands just before the pin releases
        gsap.set(fill, { opacity: gsap.utils.clamp(0, 1, (p - 0.55) / 0.37) });
        text.setAttribute(
          "transform",
          `translate(${geo.tx} ${geo.ty}) translate(${geo.ox} ${geo.oy}) scale(${k}) translate(${-geo.ox} ${-geo.oy})`,
        );
      };
      apply(0);
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight * 1.4}`,
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => apply(self.progress),
        onRefresh: (self) => {
          layout();
          apply(self.progress);
        },
      });
      return () => splits.forEach((s) => s.revert());
    };

    document.fonts.ready.then(() => {
      if (cancelled) return;
      ctx.add(() => {
        mm = gsap.matchMedia();
        mm.add(DESKTOP, () => {
          root.classList.add("is-horizontal");
          const clean = buildDesktop();
          return () => {
            clean();
            root.classList.remove("is-horizontal");
          };
        });
        mm.add(MOBILE, () => buildMobile());
        sizeCanvas();
        playIntro();
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      });
    });

    return () => {
      cancelled = true;
      stopReveal();
      stopMenuWait();
      ro.disconnect();
      mm?.revert();
      ctx.revert();
      lenisRef.current?.start();
    };
  }, []);

  return (
    <div className="ab-h" ref={rootRef}>
      <div className="ab-h__inner">
        {/* ---- hero ---- */}
        <section className="ab-hero" aria-label="Intro">
          <div className="ab-hero__container">
            <div className="ab-hero__words">
              <h1 className="ab-hero__word">{WORDS[0]}</h1>
              <div className="ab-hero__flex">
                {/* the wrapper clips the caption as it slides in from the left */}
                <span className="ab-hero__subwrap">
                  <span className="ab-hero__sub">
                    Web design &amp; development
                    <br />
                    by Vedank Gaur
                  </span>
                </span>
                <h2 className="ab-hero__word">{WORDS[1]}</h2>
              </div>
              <h2 className="ab-hero__word">{WORDS[2]}</h2>
              <h2 className="ab-hero__word">{WORDS[3]}</h2>
            </div>
            {/* <p className="ab-hero__caption" aria-hidden="true">
              <span>Vedank Gaur Design</span>
            </p> */}
            <div className="ab-hero__scroll">
              <span></span>
              <i aria-hidden="true" />
            </div>
          </div>
          <div className="ab-seq" aria-hidden="true">
            <canvas />
          </div>
        </section>

        {/* ---- introduce ---- */}
        <section className="ab-intro">
          <div className="ab-intro__container">
            <div className="ab-intro__top">
              <p className="ab-intro__desc" data-split>
                Same curiosity.
                <br />
                New canvas.
              </p>
              <h2 className="ab-intro__title" data-split>
                {/* inline spacer instead of text-indent: survives SplitText's line split */}
                <span className="ab-intro__indent" aria-hidden="true" />
                After some years of turning ideas into interfaces...
              </h2>
            </div>
            <div className="ab-intro__bot">
              <div className="ab-intro__media">
                <div className="ab-intro__video">
                  <AutoplayLoopVideo sources={ATHLNK_REEL.sources} poster={ATHLNK_REEL.poster} />
                </div>
                <div className="ab-intro__mediaText">
                  <span className="ab-intro__mediaLabel">showreel</span>
                  <span>design by ved</span>
                </div>
              </div>
              <div className="ab-intro__content">
                <p className="ab-intro__p" data-split>
                  I design and build websites end to end, from the first
                  wireframe to the last line of production code, so nothing is
                  lost between the idea and the browser.
                </p>
                <p className="ab-intro__p" data-split>
                  My goal is simple: interfaces that feel effortless, load fast
                  and give people a reason to remember the brand behind them.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ---- MEET VEDANK mask ---- */}
        <section className="ab-mask" aria-label="Meet Vedank">
          <div className="ab-mask__box">
            <svg className="ab-mask__svg" width="100%" height="100%" aria-hidden="true">
              <defs>
                <clipPath id="abMeetMask">
                  {/* <clipPath> only accepts shapes/text (no <g>), so the
                      pan/zoom transform goes straight onto the <text> */}
                  <text className="ab-mask__text" fontWeight={800}>
                    {/* filled per layout: one line (desktop) or two */}
                    <tspan>{MASK_TEXT}</tspan>
                    <tspan />
                  </text>
                </clipPath>
              </defs>
            </svg>
          </div>
          <div className="ab-mask__bg" style={{ clipPath: "url(#abMeetMask)" }}>
            <img src={PORTRAIT} alt="Vedank Gaur" />
          </div>
          {/* the same photo unclipped, faded in at the end of the zoom */}
          <div className="ab-mask__bg ab-mask__fill" aria-hidden="true">
            <img src={PORTRAIT} alt="" />
          </div>
        </section>
      </div>
    </div>
  );
}
