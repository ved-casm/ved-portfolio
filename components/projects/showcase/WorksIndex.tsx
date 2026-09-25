"use client";

/* eslint-disable @next/next/no-img-element */
import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ShowcaseMedia, ShowcaseProject } from "./projectShowcaseData";
import "./WorksIndex.css";

gsap.registerPlugin(ScrollTrigger);

/** Preview for a row: the project's first gallery item. */
const previewOf = (p: ShowcaseProject): ShowcaseMedia => p.gallery[0] ?? p.ellipse;

function Preview({ media, className }: { media: ShowcaseMedia; className: string }) {
  if (media.type === "video") {
    return <video className={className} src={media.src} muted loop playsInline autoPlay preload="metadata" />;
  }
  return <img className={className} src={media.src} alt={media.alt ?? ""} loading="lazy" />;
}

/*
 * Works index: big numbered rows. On hover a preview follows the cursor
 * (lagging, tilting with speed) and the other rows dim. Touch screens show a
 * thumbnail in each row instead.
 */
export default function WorksIndex({ projects }: { projects: ShowcaseProject[] }) {
  const rootRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      // heading + rows rise in
      gsap.from(".wi-head > *", { yPercent: 40, opacity: 0, duration: 1.2, ease: "power3.out", stagger: 0.08 });
      gsap.utils.toArray<HTMLElement>(".wi-row").forEach((row) => {
        gsap.from(row.querySelectorAll(".wi-row__inner > *"), {
          yPercent: 60,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.06,
          // play once and drop inline styles, so the CSS hover transforms work
          clearProps: "transform,opacity",
          scrollTrigger: { trigger: row, start: "top 90%", once: true },
        });
        gsap.from(row.querySelector(".wi-row__line"), {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.2,
          ease: "expo.out",
          clearProps: "transform",
          scrollTrigger: { trigger: row, start: "top 92%", once: true },
        });
      });

      // floating preview (fine pointers only)
      const floater = root.querySelector<HTMLElement>(".wi-floater");
      if (!floater || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const xTo = gsap.quickTo(floater, "x", { duration: 0.6, ease: "power3" });
      const yTo = gsap.quickTo(floater, "y", { duration: 0.6, ease: "power3" });
      const rTo = gsap.quickTo(floater, "rotation", { duration: 0.8, ease: "power3" });
      let lastX = 0;
      const onMove = (e: PointerEvent) => {
        xTo(e.clientX);
        yTo(e.clientY);
        rTo(gsap.utils.clamp(-12, 12, (e.clientX - lastX) * 0.6));
        lastX = e.clientX;
      };
      window.addEventListener("pointermove", onMove);
      return () => window.removeEventListener("pointermove", onMove);
    }, root);
    return () => ctx.revert();
  }, []);

  // play only the active preview video
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.querySelectorAll<HTMLVideoElement>(".wi-floater video").forEach((v, i) => {
      if (Number(v.dataset.index ?? i) === active) void v.play().catch(() => {});
      else v.pause();
    });
  }, [active]);

  const count = String(projects.length).padStart(2, "0");

  return (
    <section ref={rootRef} className={`wi${active !== null ? " wi--hovering" : ""}`}>
      <header className="wi-head">
        <p className="wi-eyebrow">[ Selected works ]</p>
        <h1 className="wi-title">
          Works<sup>({count})</sup>
        </h1>
        <p className="wi-intro">
          Products, platforms and brand sites I&apos;ve designed and built, each one
          from the first sketch to launch.
        </p>
      </header>

      <ul className="wi-list" onMouseLeave={() => setActive(null)}>
        {projects.map((p, i) => (
          <li
            key={p.slug}
            className={`wi-row${active === i ? " is-active" : ""}`}
            onMouseEnter={() => setActive(i)}
          >
            <Link className="wi-row__link" href={`/works/${p.slug}`}>
              <span className="wi-row__line" aria-hidden="true" />
              <span className="wi-row__inner">
                <span className="wi-row__index">{String(i + 1).padStart(2, "0")}</span>
                <span className="wi-row__name">{p.intro.titleLines.join(" ")}</span>
                <span className="wi-row__tags">{p.context.categories.join(" / ")}</span>
                <span className="wi-row__thumb" aria-hidden="true">
                  <Preview media={previewOf(p)} className="wi-row__thumb-media" />
                </span>
                <span className="wi-row__arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M6 18L18 6M18 6H8M18 6V16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* outer moves with the cursor (GSAP), inner fades/scales (CSS) */}
      <div className={`wi-floater${active !== null ? " is-visible" : ""}`} aria-hidden="true">
        <div className="wi-floater__card">
        {projects.map((p, i) => {
          const media = previewOf(p);
          const cls = `wi-floater__media${active === i ? " is-active" : ""}`;
          return media.type === "video" ? (
            <video key={p.slug} className={cls} data-index={i} src={media.src} muted loop playsInline preload="metadata" />
          ) : (
            <img key={p.slug} className={cls} src={media.src} alt="" loading="lazy" />
          );
        })}
        </div>
      </div>
    </section>
  );
}
