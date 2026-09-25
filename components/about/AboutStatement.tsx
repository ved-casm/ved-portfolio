"use client";

/* eslint-disable @next/next/no-img-element */
import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/*
 * Big statement (after wonjyou.studio's "Over 20 years" block): grey lines
 * with a white copy on top that's wiped in from the top as you scroll, a
 * velocity skew on the lines, and floating media drifting at different speeds.
 */

const LINES = [
  "Design",
  "is how",
  "it works,",
  "not only",
  "how it",
  "looks.",
  "I shape",
  "both, from",
  "pixel to",
  "product.",
];

const MEDIA: { src: string; video?: boolean }[] = [
  { src: "/showcase.mp4", video: true },
  { src: "/img/about/vedank-portrait.webp" },
  { src: "/Cocogirl.png" },
  { src: "/showcase1.mp4", video: true },
  { src: "/Foreward.png" },
];
// parallax travel per image (yPercent start -> end)
const DRIFT = [
  { start: 80, end: -120 },
  { start: 0, end: -80 },
  { start: 0, end: -40 },
  { start: 80, end: -200 },
  { start: 60, end: -120 },
];

export default function AboutStatement() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      const titles = root.querySelector<HTMLElement>(".ab-st__titles")!;
      const fill = root.querySelector<HTMLElement>(".ab-st__fill")!;
      const skewTo = gsap.quickSetter(titles, "skewY", "deg");
      const clampSkew = gsap.utils.clamp(-4, 4);
      const skew = { v: 0 };
      gsap.set(titles, { transformOrigin: "center center" });
      gsap.to(fill, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        ease: "none",
        scrollTrigger: {
          trigger: fill,
          start: "top bottom",
          end: "bottom center",
          scrub: true,
          onUpdate: (self) => {
            // lean with scroll speed, then settle back
            const v = clampSkew(-(self.getVelocity() / 1000));
            if (Math.abs(v) > Math.abs(skew.v)) {
              skew.v = v;
              gsap.to(skew, { v: 0, overwrite: true, onUpdate: () => skewTo(skew.v) });
            }
          },
        },
      });

      const mm = gsap.matchMedia();
      mm.add("(min-width: 1025px)", () => {
        root.querySelectorAll<HTMLElement>(".ab-st__media").forEach((el, i) => {
          gsap.fromTo(
            el,
            { yPercent: DRIFT[i].start },
            {
              yPercent: DRIFT[i].end,
              ease: "none",
              scrollTrigger: { trigger: el, start: "clamp(top bottom)", end: "clamp(bottom top)", scrub: true },
            },
          );
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="ab-st">
      <div className="ab-st__titles">
        <div className="ab-st__grey" aria-hidden="true">
          {LINES.map((l, i) => (
            <h3 key={i} className="ab-st__title">
              {l}
            </h3>
          ))}
        </div>
        <div className="ab-st__fill">
          {LINES.map((l, i) => (
            <h3 key={i} className="ab-st__title">
              {l}
            </h3>
          ))}
        </div>
      </div>
      <div className="ab-st__link">
        <Link href="/works" className="ab-st__cta">
          See my work <span aria-hidden="true">↗</span>
        </Link>
      </div>
      <div className="ab-st__images" aria-hidden="true">
        {MEDIA.map((m, i) => (
          <div key={m.src + i} className={`ab-st__media ab-st__media--${i}`}>
            {m.video ? (
              <video src={m.src} muted loop playsInline autoPlay preload="metadata" />
            ) : (
              <img src={m.src} alt="" loading="lazy" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
