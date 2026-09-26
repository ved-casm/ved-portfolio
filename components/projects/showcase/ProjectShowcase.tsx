"use client";

/* eslint-disable @next/next/no-img-element */
import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type { ShowcaseMedia, ShowcaseNext, ShowcaseProject } from "./projectShowcaseData";
import "./ProjectShowcase.css";

gsap.registerPlugin(ScrollTrigger, SplitText);

/*
 * Horizontal project showcase (after guillaumezhu.com project pages):
 *   intro (two visuals + title) -> context (tags + line-revealed copy) ->
 *   capsule visual -> vertical "focus" gallery -> "Up next" link.
 * Desktop: one pinned track scrubbed by vertical scroll; the gallery plays
 * its own timeline while the track holds still. Small screens: stacked
 * panels with per-section triggers.
 */

// Gallery shows 5 slides at a time; flex share + side inset per position.
const SLIDE_FLEX = [0.1, 0.12, 0.56, 0.12, 0.1];
const SLIDE_INSET = [15, 5, 0, 5, 15, 15];
const DESKTOP = "(min-width: 901px) and (min-height: 651px), (min-width: 1025px)";
const MOBILE = "(max-width: 900px), (max-width: 1024px) and (max-height: 650px)";

function Media({ media, className }: { media: ShowcaseMedia; className: string }) {
  if (media.type === "video") {
    return (
      <video
        className={className}
        src={media.src}
        poster={media.poster}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
      />
    );
  }
  return <img className={className} src={media.src} alt={media.alt ?? ""} loading="lazy" />;
}

export default function ProjectShowcase({
  project,
  next,
}: {
  project: ShowcaseProject;
  next: ShowcaseNext;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const q = <T extends Element = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
    const qa = <T extends Element = HTMLElement>(sel: string) => [...root.querySelectorAll<T>(sel)];

    let mm: gsap.MatchMedia | null = null;
    let cancelled = false;
    const ctx = gsap.context(() => { }, root);

    // --- intro reveal on load ------------------------------------------------
    const intro = () => {
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(qa(".ps-intro__visual"), { opacity: 1, scale: 1, duration: 2, stagger: 0.08 })
        .to(q(".ps-intro__title"), { opacity: 1, y: 0, duration: 2 }, "<+=0.25")
        .to(q(".ps-back"), { opacity: 1, duration: 2 }, "<+=0.25");
    };

    // --- gallery: 5 visible slides, the middle one takes 56% ---------------
    const buildGallery = () => {
      const gallery = q(".ps-gallery");
      const slidesWrap = q(".ps-gallery__slides");
      const slides = qa(".ps-gallery__slide");
      const steps = slides.length - 5;
      const size = () => {
        const h = gallery.clientHeight;
        gsap.set(slidesWrap, { height: h + (steps - 2) * 0.01 * h });
      };
      size();
      slides.forEach((slide, i) => {
        if (i >= 5) return;
        gsap.set(slide, { flex: SLIDE_FLEX[i] });
        gsap.set(slide.querySelector(".ps-gallery__media"), {
          clipPath: `inset(0 ${SLIDE_INSET[i]}% round 20px)`,
        });
      });
      const tl = gsap.timeline({ paused: true, defaults: { duration: 1, ease: "none" } });
      for (let i = 0; i < steps; i++) {
        tl.to(slides[i], { flex: 0 }, i);
        tl.to(slides[i].querySelector(".ps-gallery__media"), { clipPath: "inset(0 15% round 20px)" }, i);
        tl.to(slidesWrap, { y: () => `-=${0.01 * gallery.clientHeight}` }, i);
        for (let k = 0; k < 5; k++) {
          const s = slides[i + 1 + k];
          tl.to(s, { flex: SLIDE_FLEX[k] }, i);
          tl.fromTo(
            s.querySelector(".ps-gallery__media"),
            { clipPath: `inset(0 ${SLIDE_INSET[k + 1]}% round 20px)` },
            { clipPath: `inset(0 ${SLIDE_INSET[k]}% round 20px)` },
            i,
          );
        }
      }
      return {
        steps,
        timeline: tl,
        refresh: () => {
          const p = tl.progress();
          tl.progress(0);
          size();
          tl.invalidate();
          tl.progress(p);
        },
      };
    };

    // --- desktop: pinned horizontal track ------------------------------------
    const buildTrack = (gallery: ReturnType<typeof buildGallery>) => {
      const pinHeight = q(".ps-pin-height");
      const container = q(".ps-container");
      const track = q(".ps-track");
      const galleryPanel = q(".ps-panel--gallery");
      const total = () => track.scrollWidth - container.clientWidth;
      const toGallery = () => galleryPanel.offsetLeft;
      const afterGallery = () => total() - toGallery();
      const galleryLen = () => gallery.steps * window.innerHeight;

      // durations are in px so nested timelines line up with scroll distance
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pinHeight,
          start: "top top",
          end: () => `+=${total() + galleryLen()}`,
          scrub: true,
          pin: container,
          invalidateOnRefresh: true,
          onRefreshInit: gallery.refresh,
        },
      });
      tl.to(track, { x: () => -toGallery(), duration: () => toGallery(), ease: "none" });
      tl.fromTo(gallery.timeline, { progress: 0 }, { progress: 1, duration: () => galleryLen(), ease: "none" });
      tl.to(track, { x: () => -total(), duration: () => afterGallery(), ease: "none" });

      // context copy: lines wipe in and tags rise as the panel slides in
      const context = q(".ps-context");
      const contextPanel = context.closest<HTMLElement>(".ps-panel--context")!;
      const texts = q(".ps-context__texts");
      const lines = qa(".ps-context__text, .ps-context__link");
      const tags = qa(".ps-context__category");
      const ellipse = q(".ps-ellipse");
      gsap.set(texts, { visibility: "visible" });
      gsap.set(tags, { opacity: 0, y: 20 });
      gsap.set(ellipse, { opacity: 0, y: 20 });
      const left = () => contextPanel.offsetLeft + context.offsetLeft;
      const pad = () => context.offsetWidth * 0.2;
      const start = () => left() + context.offsetWidth - container.clientWidth - pad();
      const centered = () => left() + context.offsetWidth / 2 - container.clientWidth / 2 - pad();

      const splitVars: SplitText.Vars = {
        type: "lines",
        linesClass: "ps-context__line",
        onSplit: (self) => {
          const s = start();
          const span = centered() - s;
          const each = span / self.lines.length;
          const reveal = gsap.timeline();
          reveal.to(
            self.lines,
            {
              maskImage: "linear-gradient(90deg, #000 100%, transparent 125%)",
              webkitMaskImage: "linear-gradient(90deg, #000 100%, transparent 125%)",
              duration: each,
              ease: "power1.inOut",
              stagger: { each },
            },
            0,
          );
          reveal.to(tags, { opacity: 1, y: 0, duration: span * 0.2, ease: "power2.out", stagger: { each: span * 0.08 } }, 0);
          reveal.to(ellipse, { opacity: 1, y: 0, duration: span * 0.4, ease: "power2.out" }, span);
          tl.add(reveal, s);
          return reveal;
        },
      };
      const split = SplitText.create(lines, splitVars);
      // re-split (and rebuild the reveal) with fresh line breaks on refresh
      const resplit = () => {
        split.split(splitVars);
      };
      ScrollTrigger.addEventListener("refreshInit", resplit);
      return () => {
        ScrollTrigger.removeEventListener("refreshInit", resplit);
        split.revert();
      };
    };

    // --- "Up next": words part, previews pop in between ----------------------
    const buildNextHover = () => {
      const next = q(".ps-next");
      const link = q(".ps-next__link");
      const leftWord = q(".ps-next__word--left");
      const right = q(".ps-next__right");
      const mediasBox = q(".ps-next__medias");
      const medias = qa(".ps-next__media");
      const measure = () => {
        const n = next.getBoundingClientRect();
        const l = leftWord.getBoundingClientRect();
        const r = right.getBoundingClientRect();
        const margin = 0.1 * next.clientWidth;
        const leftDistance = margin - (l.left - n.left);
        const rightEdge = r.right - n.left;
        const rightDistance = next.clientWidth - margin - rightEdge;
        const midX = (l.right + leftDistance + (r.left + rightDistance)) / 2;
        const midY = (l.top + l.bottom) / 2;
        const box = mediasBox.getBoundingClientRect();
        return { leftDistance, rightDistance, mediaStartX: midX - box.left, mediaStartY: midY - box.top };
      };
      let m = measure();
      // five previews now (no logo): keep the pile compact and centred on the gap
      const startYPct = -135;
      const endYPct = 35;
      const count = medias.length;
      const rnd = medias.map(() => ({
        startRotate: (Math.random() - 0.5) * 10,
        startXPercent: -50 + (Math.random() - 0.5) * 70,
        endScale: Math.random() / 5 + 1,
        endRotate: (Math.random() - 0.5) * 10,
      }));
      const tl = gsap.timeline({ paused: true });
      tl.to(leftWord, { x: () => m.leftDistance, duration: 0.8, ease: "expo.inOut" });
      tl.to(right, { x: () => m.rightDistance, duration: 0.8, ease: "expo.inOut" }, "<");
      tl.fromTo(
        medias,
        {
          display: "none",
          scale: 0.8,
          rotate: (i) => rnd[i].startRotate,
          x: () => m.mediaStartX,
          y: () => m.mediaStartY,
          xPercent: (i) => rnd[i].startXPercent,
          yPercent: (i) => startYPct + (i / Math.max(1, count - 1)) * (endYPct - startYPct),
        },
        {
          display: "block",
          scale: (i) => rnd[i].endScale,
          rotate: (i) => rnd[i].endRotate,
          duration: 0.3,
          ease: "back.out(2)",
          stagger: { each: 0.045, from: "random" },
        },
        "<0.3",
      );
      const onRefresh = () => {
        const p = tl.progress();
        tl.progress(0);
        m = measure();
        tl.invalidate();
        tl.progress(p);
      };
      const play = () => tl.play();
      const reverse = () => tl.reverse();
      ScrollTrigger.addEventListener("refreshInit", onRefresh);
      link.addEventListener("mouseenter", play);
      link.addEventListener("mouseleave", reverse);
      return () => {
        ScrollTrigger.removeEventListener("refreshInit", onRefresh);
        link.removeEventListener("mouseenter", play);
        link.removeEventListener("mouseleave", reverse);
      };
    };

    // --- small screens -------------------------------------------------------
    const buildMobile = (gallery: ReturnType<typeof buildGallery>) => {
      const context = q(".ps-context");
      const texts = q(".ps-context__texts");
      const lines = qa(".ps-context__text, .ps-context__link");
      const tags = qa(".ps-context__category");
      gsap.set(texts, { visibility: "visible" });
      gsap.set(tags, { opacity: 0, y: 20 });
      const split = SplitText.create(lines, {
        type: "lines",
        linesClass: "ps-context__line",
        autoSplit: true,
        onSplit: (self) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: context, start: "top 75%", end: "top 20%", scrub: true } });
          tl.to(tags, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", stagger: 0.12 }, 0);
          tl.to(
            self.lines,
            {
              maskImage: "linear-gradient(90deg, #000 100%, transparent 125%)",
              webkitMaskImage: "linear-gradient(90deg, #000 100%, transparent 125%)",
              duration: 0.5,
              ease: "power1.inOut",
              stagger: 0.5,
            },
            0.1,
          );
          return tl;
        },
      });

      const ellipse = q(".ps-ellipse");
      gsap.fromTo(ellipse, { opacity: 0, y: 20 }, {
        opacity: 1,
        y: 0,
        ease: "power2.out",
        scrollTrigger: { trigger: q(".ps-ellipse__visual"), start: "top 85%", end: "top 45%", scrub: true },
      });

      gsap.fromTo(gallery.timeline, { progress: 0 }, {
        progress: 1,
        ease: "none",
        scrollTrigger: {
          trigger: q(".ps-panel--gallery"),
          start: "top top",
          end: () => `+=${gallery.steps * window.innerHeight * 0.6}`,
          scrub: true,
          pin: true,
          invalidateOnRefresh: true,
          onRefreshInit: gallery.refresh,
        },
      });

      gsap.fromTo(qa(".ps-next__media"), { opacity: 0, scale: 0.8, y: 20 }, {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: "back.out(2)",
        stagger: { each: 0.06, from: "random" },
        scrollTrigger: { trigger: q(".ps-next"), start: "top 55%", toggleActions: "play none none reverse" },
      });
      return () => split.revert();
    };

    // --- play gallery videos only near the viewport --------------------------
    const galleryVideos = qa<HTMLVideoElement>(".ps-panel--gallery video, .ps-panel--ellipse video");
    const near = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? near.add(e.target) : near.delete(e.target)));
        galleryVideos.forEach((v) => (near.size ? v.play().catch(() => { }) : v.pause()));
      },
      { rootMargin: "1000px" },
    );
    [q(".ps-panel--ellipse"), q(".ps-panel--gallery")].forEach((el) => io.observe(el));

    document.fonts.ready.then(() => {
      if (cancelled) return;
      ctx.add(() => {
        intro();
        mm = gsap.matchMedia();
        mm.add(DESKTOP, () => {
          const cleanTrack = buildTrack(buildGallery());
          const cleanNext = buildNextHover();
          return () => {
            cleanTrack();
            cleanNext();
          };
        });
        mm.add(MOBILE, () => buildMobile(buildGallery()));
        // These triggers are created after the fonts load, i.e. after ones
        // further down the page (e.g. the CTA's pin). Put them in page order so
        // those account for this pin's spacing, then re-measure.
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      });
    });

    return () => {
      cancelled = true;
      io.disconnect();
      mm?.revert();
      ctx.revert();
    };
  }, []);

  const { intro, context, ellipse, gallery } = project;

  return (
    <div className="ps" ref={rootRef}>
      <Link className="ps-back" href="/" aria-label="Back to home">
        <svg className="ps-back__icon" width="62" height="15" viewBox="0 0 62 15" fill="none" aria-hidden="true">
          <path className="ps-back__shaft" d="M60.3018 7.37256L2.30176 7.37256" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M7.26025 13.7279L1.07307 7.54074C0.975439 7.44311 0.975439 7.28482 1.07307 7.18718L7.26025 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </Link>

      <section className="ps-scroll">
        <div className="ps-pin-height">
          <div className="ps-container">
            <div className="ps-track">
              {/* Intro */}
              <section className="ps-panel ps-panel--intro">
                <div className="ps-intro">
                  <Media media={intro.primary} className="ps-intro__visual ps-intro__visual--primary" />
                  <Media media={intro.secondary} className="ps-intro__visual ps-intro__visual--secondary" />
                  <h1 className="ps-intro__title">
                    {intro.titleLines.map((line, i) => (
                      <span key={line}>
                        {line}
                        {i < intro.titleLines.length - 1 && <br />}
                      </span>
                    ))}
                  </h1>
                </div>
              </section>

              {/* Context */}
              <section className="ps-panel ps-panel--context">
                <div className="ps-context ps-context--with-links">
                  <ul className="ps-context__categories">
                    {context.categories.map((c) => (
                      <li key={c} className="ps-context__category">
                        {c}
                      </li>
                    ))}
                  </ul>
                  <div className="ps-context__texts">
                    {context.paragraphs.map((p) => (
                      <p key={p.slice(0, 24)} className="ps-context__text">
                        {p}
                      </p>
                    ))}
                    <div className="ps-context__links">
                      {context.links.map((l) => (
                        <a
                          key={l.label}
                          className={`ps-context__link ps-context__link--${l.variant}`}
                          href={l.href}
                          target={l.href.startsWith("http") ? "_blank" : undefined}
                          rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        >
                          {l.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Capsule visual */}
              <section className="ps-panel ps-panel--ellipse">
                <div className="ps-ellipse">
                  <Media media={ellipse} className="ps-ellipse__visual" />
                </div>
              </section>

              {/* Focus gallery */}
              <section className="ps-panel ps-panel--gallery">
                <div className="ps-gallery">
                  <div className="ps-gallery__slides">
                    {[0, 1].map((i) => (
                      <div key={`s${i}`} className="ps-gallery__slide ps-gallery__slide--spacer" aria-hidden="true">
                        <div className="ps-gallery__media" />
                      </div>
                    ))}
                    {gallery.map((media, i) => (
                      <div key={`${media.src}-${i}`} className="ps-gallery__slide">
                        <Media media={media} className="ps-gallery__media" />
                      </div>
                    ))}
                    {[2, 3].map((i) => (
                      <div key={`s${i}`} className="ps-gallery__slide ps-gallery__slide--spacer" aria-hidden="true">
                        <div className="ps-gallery__media" />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Up next */}
              <section className="ps-panel ps-panel--next">
                <div className="ps-next">
                  <Link className="ps-next__link" href={next.href} aria-label={`Discover ${next.name}`}>
                    <h2 className="ps-next__title">
                      <span className="ps-next__word ps-next__word--left">{next.leftWord}</span>{" "}
                      <span className="ps-next__right">
                        <span className="ps-next__word ps-next__word--right">{next.rightWord}</span>
                        <span className="ps-next__project-name">{next.name}</span>
                      </span>
                    </h2>
                    <div className="ps-next__medias" aria-hidden="true">
                      {next.medias.map((m, i) => (
                        <img
                          key={`${m.src}-${i}`}
                          className={`ps-next__media${m.logo ? " ps-next__media--logo" : ""}`}
                          src={m.src}
                          alt=""
                          loading="lazy"
                        />
                      ))}
                    </div>
                  </Link>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
