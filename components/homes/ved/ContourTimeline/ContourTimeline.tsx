"use client";

import { useRef, useEffect, useState, useMemo, useCallback, memo } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { smoothPath, ContourPoint } from "./contourPath";
import {
  ContourMilestone,
  DEFAULT_CONTOUR_MILESTONES,
} from "./defaultMilestones";
import styles from "./ContourTimeline.module.css";
import ScrollRevealText from "@/components/animations/ScrollRevealText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const VIEWBOX_W = 1000;
const VIEWBOX_H = 90;
const BASE_Y = 70;
const HILL_HEIGHT = 45;
const SIGMA = 70;

export interface ContourTimelineProps {
  milestones?: ContourMilestone[];
  vhPerMilestone?: number;
}

/**
 * Isolated, memoized media player box.
 * Crucial for desktop/laptop performance:
 * 1. Only re-renders when activeIndex changes (4 times total, NOT 60fps on scroll).
 * 2. Only decodes the active video on the GPU, pausing inactive ones.
 * 3. Actively resists browser scroll/pause throttling with event listeners.
 */
const MilestoneMediaBox = memo(function MilestoneMediaBox({
  milestones,
  activeIndex,
}: {
  milestones: ContourMilestone[];
  activeIndex: number;
}) {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // 1. Play active video, pause inactive to relieve laptop GPU decoder
  useEffect(() => {
    milestones.forEach((_, idx) => {
      const v = videoRefs.current[idx];
      if (!v) return;
      if (idx === activeIndex) {
        if (v.paused) {
          void v.play().catch(() => {});
        }
      } else {
        if (!v.paused) {
          v.pause();
        }
      }
    });
  }, [activeIndex, milestones]);

  // 2. Prevent Chrome from pausing active video during desktop wheel/scroll events
  useEffect(() => {
    const activeVideo = videoRefs.current[activeIndex];
    if (!activeVideo) return;

    const resumePlayback = () => {
      if (document.visibilityState === "visible" && activeVideo.paused) {
        void activeVideo.play().catch(() => {});
      }
    };

    activeVideo.addEventListener("pause", resumePlayback);
    window.addEventListener("scroll", resumePlayback, { passive: true });
    window.addEventListener("wheel", resumePlayback, { passive: true });

    resumePlayback();

    return () => {
      activeVideo.removeEventListener("pause", resumePlayback);
      window.removeEventListener("scroll", resumePlayback);
      window.removeEventListener("wheel", resumePlayback);
    };
  }, [activeIndex]);

  return (
    <div className={styles.imageBox}>
      {milestones.map((m, idx) => {
        const isActive = idx === activeIndex;
        if (!m.media) return null;
        if (m.mediaType === "video") {
          return (
            <video
              key={m.id}
              ref={(el) => {
                videoRefs.current[idx] = el;
              }}
              className={`${styles.image} ${
                isActive ? styles.mediaActive : styles.mediaHidden
              }`}
              src={m.media}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              disablePictureInPicture
              disableRemotePlayback
            />
          );
        }
        return (
          <Image
            key={m.id}
            className={`${styles.image} ${
              isActive ? styles.mediaActive : styles.mediaHidden
            }`}
            src={m.media}
            alt={m.title}
            width={600}
            height={450}
            priority
          />
        );
      })}
    </div>
  );
});

/**
 * Isolated, memoized card body text (does not re-render on scroll ticks)
 */
const CardBody = memo(function CardBody({
  milestone,
}: {
  milestone: ContourMilestone;
}) {
  return (
    <div className={styles.cardBody}>
      <span className={styles.eyebrow}>{milestone.eyebrow}</span>
      <h3 className={styles.title}>{milestone.title}</h3>
      <p className={styles.description}>{milestone.description}</p>
      {milestone.ctaHref && (
        <a href={milestone.ctaHref} className={styles.cta}>
          {milestone.ctaLabel ?? "Explore chapter"}
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M7 17L17 7M17 7H7M17 7V17" />
          </svg>
        </a>
      )}
    </div>
  );
});

/**
 * Isolated, memoized timeline year buttons
 */
const YearsGrid = memo(function YearsGrid({
  milestones,
  activeIndex,
  onSelectMilestone,
}: {
  milestones: ContourMilestone[];
  activeIndex: number;
  onSelectMilestone: (index: number) => void;
}) {
  return (
    <div
      className={styles.yearsGrid}
      style={{ "--milestone-count": milestones.length } as React.CSSProperties}
    >
      {milestones.map((m, i) => {
        const isActive = i === activeIndex;
        return (
          <button
            key={m.id}
            onClick={() => onSelectMilestone(i)}
            className={`${styles.yearItem} ${isActive ? styles.activeYear : ""}`}
            aria-label={`Jump to ${m.year} — ${m.subtitle}`}
          >
            <span className={styles.yearText}>{m.year}</span>
            <span className={styles.subtitleText}>{m.subtitle}</span>
          </button>
        );
      })}
    </div>
  );
});

export default function ContourTimeline({
  milestones = DEFAULT_CONTOUR_MILESTONES,
  vhPerMilestone = 100,
}: ContourTimelineProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const [progress, setProgress] = useState(0); // 0 (2018) to 1 (2026)
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Compute active milestone index from progress
  const activeIndex = useMemo(() => {
    if (!milestones.length) return 0;
    const count = milestones.length;
    // Map progress 0..1 to index 0..count-1 with thresholds
    const rawIdx = Math.floor(progress * count);
    return Math.min(count - 1, Math.max(0, rawIdx));
  }, [progress, milestones.length]);

  const activeMilestone = milestones[activeIndex] || milestones[0];

  // X coordinate in SVG viewBox space matching milestone column centers
  const activeX = useMemo(() => {
    const count = milestones.length;
    if (count <= 1) return VIEWBOX_W / 2;

    const minX = (0.5 / count) * VIEWBOX_W;
    const maxX = ((count - 0.5) / count) * VIEWBOX_W;
    return minX + progress * (maxX - minX);
  }, [progress, milestones.length]);

  // Generate SVG path for contour line with dynamic hill curve
  const pathD = useMemo(() => {
    const pts: ContourPoint[] = [];
    const numSamples = 60;
    for (let i = 0; i <= numSamples; i++) {
      const x = (i / numSamples) * VIEWBOX_W;
      const dist = (x - activeX) / SIGMA;
      const y = BASE_Y - HILL_HEIGHT * Math.exp(-(dist * dist));
      pts.push({ x, y });
    }
    return smoothPath(pts);
  }, [activeX]);

  // Peak dot Y position at the apex of the hill curve
  const peakY = BASE_Y - HILL_HEIGHT; // 70 - 45 = 25px

  // Card horizontal percentage (0..100) matching activeX
  const cardLeftPercent = (activeX / VIEWBOX_W) * 100;

  const visualGroupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!wrapperRef.current || !pinRef.current) return;

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) {
        setProgress(0);
        return;
      }

      // Entrance animation for visual group
      gsap.from(visualGroupRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });

      // 2. Timeline progression scrub
      ScrollTrigger.create({
        trigger: wrapperRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.8,
        pin: pinRef.current,
        anticipatePin: 1,
        onUpdate: (self) => {
          // Progress 0..0.999
          const p = Math.min(0.999, Math.max(0, self.progress));
          setProgress(p);
        },
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, [milestones]);

  const scrollToMilestone = useCallback(
    (index: number) => {
      if (!wrapperRef.current || !milestones.length) return;
      const targetP = index / (milestones.length - 1);
      const wrapperTop = wrapperRef.current.offsetTop;
      const totalHeight = wrapperRef.current.offsetHeight - window.innerHeight;
      const targetScroll = wrapperTop + targetP * totalHeight;

      window.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
    },
    [milestones.length],
  );

  return (
    <div
      ref={wrapperRef}
      className={styles.wrapper}
      style={{ height: `${milestones.length * vhPerMilestone}vh` }}
    >
      <div ref={pinRef} className={styles.pinned}>
        {/* Header & Intro Line — revealed by the (un-pinned) wrapper's
            position, since the header itself lives inside the pin */}
        <div className={styles.headerArea}>
          <ScrollRevealText
            as="h2"
            className={styles.sectionTitle}
            text="Process"
            dimColor="rgba(255, 255, 255, 0.25)"
            brightColor="#ffffff"
            trigger={`.${styles.wrapper}`}
            start="top 85%"
            end="top 50%"
          />
          <ScrollRevealText
            as="p"
            className={styles.sectionIntro}
            text="Design and development aren't two handoffs - they're one continuous thread, start to finish."
            dimColor="rgba(255, 255, 255, 0.3)"
            brightColor="rgba(255, 255, 255, 0.95)"
            trigger={`.${styles.wrapper}`}
            start="top 80%"
            end="top 40%"
          />
        </div>

        {/* Unified Visual Group: Card + Stem + Ribbon Wave (Tightly Connected) */}
        <div ref={visualGroupRef} className={styles.visualGroup}>
          <div className={styles.stage}>
            <div
              className={styles.cardWrapper}
              style={{
                left: `clamp(calc(var(--card-width, 320px) / 2 + 16px), ${cardLeftPercent}%, calc(100% - var(--card-width, 320px) / 2 - 16px))`,
              }}
            >
              <div className={styles.card}>
                {/* Isolated media box - never touched during continuous scroll scrub */}
                <MilestoneMediaBox
                  milestones={milestones}
                  activeIndex={activeIndex}
                />

                {/* Isolated card body copy */}
                <CardBody milestone={activeMilestone} />
              </div>
            </div>

            {/* Connecting Vertical Stem Line - Aligned directly with peak dot */}
            <div
              className={styles.stem}
              style={{
                left: `${cardLeftPercent}%`,
              }}
            />
          </div>

          {/* Ribbon & Dynamic Hill Curve Area */}
          <div className={styles.ribbonSection}>
            <svg
              viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
              preserveAspectRatio="none"
              className={styles.ribbonSvg}
            >
              <path d={pathD} className={styles.ribbonPath} fill="none" />
            </svg>

            {/* Active Peak Dot Marker traveling along hill curve apex */}
            {isClient && (
              <div
                className={styles.peakDot}
                style={{
                  left: `${cardLeftPercent}%`,
                  top: `${(peakY / VIEWBOX_H) * 100}%`,
                }}
              >
                <div className={styles.peakDotInner} />
              </div>
            )}
          </div>

          {/* Years Grid Navigation at Bottom */}
          <YearsGrid
            milestones={milestones}
            activeIndex={activeIndex}
            onSelectMilestone={scrollToMilestone}
          />
        </div>
      </div>
    </div>
  );
}
