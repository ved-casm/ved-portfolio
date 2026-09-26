"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import BlurSection from "@/components/animations/BlurSection";

const MARQUEE_TEXTS = [
  "UI/UX DESIGN",
  "FRONTEND DEVELOPMENT",
  "NEXT.JS",
  "DESIGN ENGINEERING",
  "REACT.JS",
  "FIGMA",
  "VIBE CODING",
  "TAILWIND",
  "BOOTSTRAP",
  "SHADCN UI",
  "ACETERNITY UI",
];

const LOADER_IMAGES = [
  "/img/loa_01.avif",
  "/img/loa_02.avif",
  "/img/loa_03.avif",
  "/img/loa_04.avif",
  "/img/loa_05.avif",
  "/img/loa_06.avif",
  "/img/loa_07.avif",
];

interface FlowingMarqueeRowProps {
  texts: string[];
  images: string[];
  speed?: number;
  direction?: "left" | "right";
  bgColor?: string;
  marqueeBgColor?: string;
  textColor?: string;
  marqueeTextColor?: string;
  imageOffset?: number;
  isFirst?: boolean;
}

function FlowingMarqueeRow({
  texts,
  images,
  speed = 22,
  direction = "left",
  bgColor = "#120F17",
  marqueeBgColor = "#ffffff",
  textColor = "#ffffff",
  marqueeTextColor = "#120F17",
  imageOffset = 0,
  isFirst = false,
}: FlowingMarqueeRowProps) {
  const itemRef = useRef<HTMLDivElement | null>(null);
  const marqueeRef = useRef<HTMLDivElement | null>(null);
  const marqueeInnerRef = useRef<HTMLDivElement | null>(null);
  const baseTrackRef = useRef<HTMLDivElement | null>(null);
  const baseAnimationRef = useRef<gsap.core.Tween | null>(null);
  const hoverAnimationRef = useRef<gsap.core.Tween | null>(null);

  const [repetitions, setRepetitions] = useState(4);

  const animationDefaults = { duration: 0.6, ease: "expo.out" };

  const findClosestEdge = (
    mouseX: number,
    mouseY: number,
    width: number,
    height: number
  ): "top" | "bottom" => {
    const topEdgeDist = (mouseX - width / 2) ** 2 + mouseY ** 2;
    const bottomEdgeDist = (mouseX - width / 2) ** 2 + (mouseY - height) ** 2;
    return topEdgeDist < bottomEdgeDist ? "top" : "bottom";
  };

  useEffect(() => {
    const calculateRepetitions = () => {
      if (!baseTrackRef.current) return;
      const marqueeContent = baseTrackRef.current.querySelector(".marquee-part");
      if (!marqueeContent) return;
      const contentWidth = (marqueeContent as HTMLElement).offsetWidth;
      if (contentWidth === 0) return;
      const viewportWidth = window.innerWidth;
      const needed = Math.ceil(viewportWidth / contentWidth) + 2;
      setRepetitions(Math.max(4, needed));
    };

    const timer = setTimeout(calculateRepetitions, 50);
    window.addEventListener("resize", calculateRepetitions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculateRepetitions);
    };
  }, [texts]);

  useEffect(() => {
    const setupMarquee = () => {
      if (!baseTrackRef.current || !marqueeInnerRef.current) return;

      const basePart = baseTrackRef.current.querySelector(
        ".marquee-part"
      ) as HTMLElement;
      if (!basePart) return;
      const contentWidth = basePart.offsetWidth;
      if (contentWidth === 0) return;

      if (baseAnimationRef.current) baseAnimationRef.current.kill();
      if (hoverAnimationRef.current) hoverAnimationRef.current.kill();

      if (direction === "left") {
        baseAnimationRef.current = gsap.to(baseTrackRef.current, {
          x: -contentWidth,
          duration: speed,
          ease: "none",
          repeat: -1,
        });
        hoverAnimationRef.current = gsap.to(marqueeInnerRef.current, {
          x: -contentWidth,
          duration: speed,
          ease: "none",
          repeat: -1,
        });
      } else {
        baseAnimationRef.current = gsap.fromTo(
          baseTrackRef.current,
          { x: -contentWidth },
          { x: 0, duration: speed, ease: "none", repeat: -1 }
        );
        hoverAnimationRef.current = gsap.fromTo(
          marqueeInnerRef.current,
          { x: -contentWidth },
          { x: 0, duration: speed, ease: "none", repeat: -1 }
        );
      }
    };

    const timer = setTimeout(setupMarquee, 50);
    return () => {
      clearTimeout(timer);
      if (baseAnimationRef.current) baseAnimationRef.current.kill();
      if (hoverAnimationRef.current) hoverAnimationRef.current.kill();
    };
  }, [texts, repetitions, speed, direction]);

  const handleMouseEnter = (ev: React.MouseEvent<HTMLDivElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current)
      return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(
      ev.clientX - rect.left,
      ev.clientY - rect.top,
      rect.width,
      rect.height
    );

    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .set(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: "0%" }, 0);
  };

  const handleMouseLeave = (ev: React.MouseEvent<HTMLDivElement>) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current)
      return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(
      ev.clientX - rect.left,
      ev.clientY - rect.top,
      rect.width,
      rect.height
    );

    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
      .to(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0);
  };

  return (
    <div
      ref={itemRef}
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        cursor: "pointer",
        userSelect: "none",
        paddingTop: "1.5rem",
        paddingBottom: "1.5rem",
        backgroundColor: bgColor,
        borderBottom: "1px solid rgba(255,255,255,0.15)",
        borderTop: isFirst ? "1px solid rgba(255,255,255,0.15)" : "none",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Layer 1: Base Marquee Track (White text + Star separator ★) */}
      <div
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <div
          ref={baseTrackRef}
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            width: "max-content",
            alignItems: "center",
            willChange: "transform",
          }}
        >
          {[...Array(repetitions)].map((_, repIdx) => (
            <div
              className="marquee-part"
              key={`base-${repIdx}`}
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                alignItems: "center",
                flexShrink: 0,
                gap: "2.5rem",
                paddingLeft: "1.25rem",
                paddingRight: "1.25rem",
              }}
            >
              {texts.map((text, idx) => (
                <div
                  key={`base-item-${idx}`}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "2.5rem",
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    className="marquee-font"
                    style={{
                      color: textColor,
                      textTransform: "uppercase",
                      fontWeight: 400,
                      fontSize: "clamp(2.4rem, 3.5vw, 3.8rem)",
                      lineHeight: 1,
                      fontStyle: "italic",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {text}
                  </span>
                  <span
                    style={{
                      color: textColor,
                      fontSize: "clamp(1.8rem, 2.2vw, 2.5rem)",
                      lineHeight: 1,
                      opacity: 0.85,
                    }}
                  >
                    ★
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Layer 2: Hover Overlay Track (White BG + Black text + Capsule Loader Images) */}
      <div
        ref={marqueeRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflow: "hidden",
          pointerEvents: "none",
          transform: "translateY(101%)",
          display: "flex",
          alignItems: "center",
          backgroundColor: marqueeBgColor,
        }}
      >
        <div
          ref={marqueeInnerRef}
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            width: "max-content",
            alignItems: "center",
            willChange: "transform",
          }}
        >
          {[...Array(repetitions)].map((_, repIdx) => (
            <div
              className="marquee-part"
              key={`hover-${repIdx}`}
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                alignItems: "center",
                flexShrink: 0,
                gap: "2.5rem",
                paddingLeft: "1.25rem",
                paddingRight: "1.25rem",
              }}
            >
              {texts.map((text, idx) => {
                const imgIdx = (idx + imageOffset) % images.length;
                const imageSrc = images[imgIdx];
                return (
                  <div
                    key={`hover-item-${idx}`}
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "2.5rem",
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span
                      className="marquee-font"
                      style={{
                        color: marqueeTextColor,
                        textTransform: "uppercase",
                        fontWeight: 400,
                        fontSize: "clamp(2.4rem, 3.5vw, 3.8rem)",
                        lineHeight: 1,
                        fontStyle: "italic",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {text}
                    </span>
                    <div
                      style={{
                        width: "135px",
                        height: "55px",
                        borderRadius: "50px",
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,0.2)",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      <img
                        src={imageSrc}
                        alt={text}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MarqueeDivider() {
  return (
    <BlurSection className="w-full overflow-hidden bg-[#120F17] py-10">
      <style jsx global>{`
        .marquee-font {
          font-family: var(--font-cormorant), "Cormorant", "Cormorant Garamond", serif;
        }
      `}</style>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        <FlowingMarqueeRow
          texts={MARQUEE_TEXTS}
          images={LOADER_IMAGES}
          speed={22}
          direction="left"
          bgColor="#120F17"
          marqueeBgColor="#ffffff"
          textColor="#ffffff"
          marqueeTextColor="#120F17"
          imageOffset={0}
          isFirst={true}
        />
        <FlowingMarqueeRow
          texts={MARQUEE_TEXTS}
          images={LOADER_IMAGES}
          speed={22}
          direction="right"
          bgColor="#120F17"
          marqueeBgColor="#ffffff"
          textColor="#ffffff"
          marqueeTextColor="#120F17"
          imageOffset={3}
          isFirst={false}
        />
      </div>
    </BlurSection>
  );
}


