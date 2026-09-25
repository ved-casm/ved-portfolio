"use client";

import BlurSection from "@/components/animations/BlurSection";
import CommonAnimatedText from "@/components/animations/CommonAnimatedText";
import { useStickyCaptionFlip } from "@/hooks/useStickyCaptionFlip";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { CommonScrollAnimated } from "@/components/animations/CommonScrollAnimated";
import TextScramble from "@/components/animations/TextScramble";
import "./DividerStickyCaption.css";
export type DividerStickyCaptionProps = {
  topCtaLabel: string;
  topCtaHref: string;
  captionCursorText: string;
  captionHref: string;
  children: ReactNode;
  /** Trim the caption-only screens before and after the scrolling videos. */
  compact?: boolean;
  /**
   * Show the global bottom blur overlay (8 stacked backdrop-filter layers)
   * while this section is on screen. It has to re-blur the playing videos
   * every frame, which makes them stutter; pass false to skip it.
   */
  blurOverlay?: boolean;
};
export default function DividerStickyCaption({
  topCtaLabel,
  topCtaHref,
  captionCursorText,
  captionHref,
  children,
  compact = false,
  blurOverlay = true,
}: DividerStickyCaptionProps) {
  const Section = blurOverlay ? BlurSection : "div";
  const captionRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const topAreaRef = useRef<HTMLDivElement | null>(null);
  const centerAreaRef = useRef<HTMLDivElement | null>(null);
  const bottomAreaRef = useRef<HTMLDivElement | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useStickyCaptionFlip({
    captionRef,
    contentRef,
    topAreaRef,
    centerAreaRef,
    bottomAreaRef,
    scrollAreaRef,
  });

  // Play each video only while it's near the viewport. Started a screen
  // early so decoding is already running when it scrolls in; paused when far
  // away. (No autoplay attribute: Chrome pauses offscreen muted-autoplay
  // videos itself and they stutter when resumed.)
  useEffect(() => {
    const videos = videoRefs.current.filter(
      (v): v is HTMLVideoElement => Boolean(v),
    );
    if (!videos.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const v = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            if (v.paused) void v.play().catch(() => {});
          } else if (!v.paused) {
            v.pause();
          }
        });
      },
      { rootMargin: "100% 0px" },
    );
    videos.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <Section className={`${blurOverlay ? "" : "blur-section "}mxd-section services`}>
        <div className="mxd-container grid-l-container opposite">
          {/* Divider - Sticky Caption Start */}
          <div
            className={`mxd-dv-sticky-cap${compact ? " mxd-dv-sticky-cap--compact" : ""}`}
            ref={captionRef}
          >
            <div className="mxd-dv-sticky-cap__static">
              <div className="mxd-dv-sticky-cap__top" ref={topAreaRef}>
                <div className="mxd-dv-sticky-cap__content" ref={contentRef}>
                  <CommonScrollAnimated
                    className="mxd-dv-sticky-cap__btngroup anim-uni-in-up"
                    as="div"
                    animation="inUp"
                  >
                    <Link
                      className="btn btn-line btn-line-permanent"
                      href={topCtaHref}
                    >
                      <TextScramble className="btn-caption mxd-scramble">
                        {topCtaLabel}
                      </TextScramble>
                    </Link>
                  </CommonScrollAnimated>
                  <div className="mxd-dv-sticky-cap__caption">
                    <Link
                      className="active-cursor-accent"
                      data-cursor-text={captionCursorText}
                      href={captionHref}
                    >
                      <CommonAnimatedText
                        as="p"
                        className="mxd-dv-sticky-cap__text permanent mxd-split-lines"
                        animation="splitLines"
                      >
                        {children}
                      </CommonAnimatedText>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="mxd-dv-sticky-cap__center" ref={centerAreaRef} />
              <div className="mxd-dv-sticky-cap__bottom" ref={bottomAreaRef} />
            </div>
            <div className="mxd-dv-sticky-cap__scroll" ref={scrollAreaRef}>
              <div className="scroll-images-row row-01">
                <div className="container-fluid p-0">
                  <div className="row g-0">
                    <div className="col-12 col-md-4" />
                    <div className="col-12 col-md-5 scroll-images-row__item">
                      <div className="scroll-images-row__obj">
                        <CommonScrollAnimated
                          className="scroll-images-row__image mxd-clip-image"
                          as="div"
                          animation="clipImage"
                        >
                          <video
                            ref={(el) => {
                              videoRefs.current[0] = el;
                            }}
                            src="/img/web-design.mp4"
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                        </CommonScrollAnimated>
                        <div className="scroll-images-row__tags">
                          <TextScramble className="tag tag-m tag-medium mxd-scramble" style={{ color: "#ffffff" }}>
                            Web Designing
                          </TextScramble>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-3" />
                  </div>
                </div>
              </div>
              <div className="scroll-images-row row-02">
                <div className="container-fluid p-0">
                  <div className="row g-0">
                    <div className="col-12 col-md-6 scroll-images-row__item">
                      <div className="scroll-images-row__obj">
                        <CommonScrollAnimated
                          className="scroll-images-row__image mxd-clip-image"
                          as="div"
                          animation="clipImage"
                        >
                          <video
                            ref={(el) => {
                              videoRefs.current[1] = el;
                            }}
                            src="/img/ui-ux-design.mp4"
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                        </CommonScrollAnimated>
                        <div className="scroll-images-row__tags">
                          <TextScramble className="tag tag-m tag-medium mxd-scramble" style={{ color: "#ffffff" }}>
                            UI/UX Designing
                          </TextScramble>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-1" />
                    <div className="col-12 col-md-4 scroll-images-row__item">
                      <div className="scroll-images-row__obj">
                        <CommonScrollAnimated
                          className="scroll-images-row__image mxd-clip-image"
                          as="div"
                          animation="clipImage"
                        >
                          <video
                            ref={(el) => {
                              videoRefs.current[2] = el;
                            }}
                            src="/img/landing-page.mp4"
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                        </CommonScrollAnimated>
                        <div className="scroll-images-row__tags">
                          <TextScramble className="tag tag-m tag-medium mxd-scramble" style={{ color: "#ffffff" }}>
                            Landing Page Designing
                          </TextScramble>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-1" />
                  </div>
                </div>
              </div>
              <div className="scroll-images-row row-03">
                <div className="container-fluid p-0">
                  <div className="row g-0">
                    <div className="col-12 col-md-1" />
                    <div className="col-12 col-md-4 scroll-images-row__item">
                      <div className="scroll-images-row__obj">
                        <CommonScrollAnimated
                          className="scroll-images-row__image mxd-clip-image"
                          as="div"
                          animation="clipImage"
                        >
                          <video
                            ref={(el) => {
                              videoRefs.current[3] = el;
                            }}
                            src="/img/e-com.mp4"
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                        </CommonScrollAnimated>
                        <div className="scroll-images-row__tags">
                          <TextScramble className="tag tag-m tag-medium mxd-scramble" style={{ color: "#ffffff" }}>
                            E-Commerce Designing & Development
                          </TextScramble>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-1" />
                    <div className="col-12 col-md-6 scroll-images-row__item">
                      <div className="scroll-images-row__obj">
                        <CommonScrollAnimated
                          className="scroll-images-row__image mxd-clip-image"
                          as="div"
                          animation="clipImage"
                        >
                          <video
                            ref={(el) => {
                              videoRefs.current[4] = el;
                            }}
                            src="/img/virtaul-assistant.mp4"
                            muted
                            loop
                            playsInline
                            preload="metadata"
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />
                        </CommonScrollAnimated>
                        <div className="scroll-images-row__tags">
                          <TextScramble className="tag tag-m tag-medium mxd-scramble" style={{ color: "#ffffff" }}>
                            Virtual Assistant
                          </TextScramble>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div className="scroll-images-row row-04">
                <div className="container-fluid p-0">
                  <div className="row g-0">
                    <div className="col-12 col-md-3" />
                    <div className="col-12 col-md-5 scroll-images-row__item">
                      <div className="scroll-images-row__obj">
                        <CommonScrollAnimated
                          className="scroll-images-row__image mxd-clip-image"
                          as="div"
                          animation="clipImage"
                        >
                          <Image
                            alt=""
                            src="/img/dividers/1200x1200_row04.webp"
                            width={1200}
                            height={1200}
                          />
                        </CommonScrollAnimated>
                        <div className="scroll-images-row__tags">
                          <TextScramble className="tag tag-m tag-medium mxd-scramble">
                            Illustrations
                          </TextScramble>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-md-4" />
                  </div>
                </div>
              </div> */}
            </div>
          </div>
          {/* Divider - Sticky Caption End */}
        </div>
      </Section>
    </>
  );
}
