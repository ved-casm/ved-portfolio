"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/*
 * CTA over a blooming fan of feathers (after broadwayplatform.com/about-us):
 * the frame sequence plays once like a video when the section comes into
 * view; after that it's tied to scroll — the feathers fold away as the
 * section leaves and open again when you come back.
 */

const COUNT = 76;
const src = (i: number) => `/img/feather-background/fc-${String(i + 1).padStart(5, "0")}.avif`;
const INTRO_SECONDS = 3.2;

export default function FeatherBloomCTA() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const canvas = root.querySelector<HTMLCanvasElement>(".ab-cta__seq")!;
    const ctx2d = canvas.getContext("2d")!;
    const frames: (HTMLImageElement | null)[] = Array(COUNT).fill(null);
    const state = { p: 0 };
    let drawn = -1;
    let loaded = false;
    let introDone = false;

    const draw = () => {
      const target = Math.round(state.p * (COUNT - 1));
      let i = -1;
      for (let d = 0; d < COUNT && i < 0; d++) {
        if (frames[target - d]) i = target - d;
        else if (frames[target + d]) i = target + d;
      }
      if (i < 0 || i === drawn) return;
      drawn = i;
      const img = frames[i]!;
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      ctx2d.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(r.width * dpr));
      canvas.height = Math.max(1, Math.round(r.height * dpr));
      drawn = -1;
      draw();
    };
    const load = () => {
      if (loaded) return;
      loaded = true;
      frames.forEach((_, i) => {
        const img = new Image();
        img.decoding = "async";
        img.src = src(i);
        img.decode().then(() => {
          frames[i] = img;
          drawn = -1;
          draw();
        }).catch(() => {});
      });
    };

    const ctx = gsap.context(() => {
      // fetch frames a screen early
      ScrollTrigger.create({ trigger: root, start: "top bottom+=100%", once: true, onEnter: load });

      // scroll target once the intro has played: open while the section is
      // in view, folding away as it scrolls off the top
      let scrollTarget = 1;
      const follow = gsap.quickTo(state, "p", { duration: 0.6, ease: "power2.out", onUpdate: draw });
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          scrollTarget = 1 - self.progress;
          if (introDone) follow(scrollTarget);
        },
      });

      // intro: play the bloom once, like a video
      const intro = gsap.to(state, {
        p: 1,
        duration: INTRO_SECONDS,
        ease: "none",
        paused: true,
        onUpdate: draw,
        onComplete: () => {
          introDone = true;
          follow(scrollTarget);
        },
      });
      ScrollTrigger.create({
        trigger: root,
        start: "top 65%",
        once: true,
        onEnter: () => {
          load();
          intro.play();
        },
      });

      // copy rises in with the bloom
      gsap.from(root.querySelectorAll(".ab-cta__copy > *"), {
        y: 40,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: root, start: "top 65%", once: true },
      });
    }, root);

    const ro = new ResizeObserver(size);
    ro.observe(canvas);
    return () => {
      ro.disconnect();
      ctx.revert();
    };
  }, []);

  return (
    <section ref={rootRef} className="ab-cta" aria-label="Start a project">
      <div className="ab-cta__copy">
        <p className="ab-cta__eyebrow">[ Let&apos;s talk ]</p>
        <h2 className="ab-cta__title">
          Let&apos;s unfold
          <br />
          <span>your next big idea.</span>
        </h2>
        <p className="ab-cta__sub">
          Every great product opens up one layer at a time. Tell me what
          you&apos;re building, and I&apos;ll bring the design and the code.
        </p>
        <div className="ab-cta__actions">
          <Link className="ab-cta__btn" href="/contact">
            Start a project <span aria-hidden="true">→</span>
          </Link>
          <a className="ab-cta__mail" href="mailto:vedank0522@gmail.com">
            vedank0522@gmail.com
          </a>
        </div>
      </div>
      <canvas className="ab-cta__seq" aria-hidden="true" />
    </section>
  );
}
