"use client";

import { gsap } from "gsap";
import { Flip } from "gsap/dist/Flip.js";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, type RefObject } from "react";

gsap.registerPlugin(ScrollTrigger, Flip);

type StickyCaptionFlipRefs = {
  captionRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLElement | null>;
  topAreaRef: RefObject<HTMLElement | null>;
  centerAreaRef: RefObject<HTMLElement | null>;
  bottomAreaRef: RefObject<HTMLElement | null>;
  scrollAreaRef: RefObject<HTMLElement | null>;
};

export function useStickyCaptionFlip({
  captionRef,
  contentRef,
  topAreaRef,
  centerAreaRef,
  bottomAreaRef,
  scrollAreaRef,
}: StickyCaptionFlipRefs): void {
  useLayoutEffect(() => {
    const caption = captionRef.current;
    const content = contentRef.current;
    const topArea = topAreaRef.current;
    const centerArea = centerAreaRef.current;
    const bottomArea = bottomAreaRef.current;
    const scrollArea = scrollAreaRef.current;
    if (!caption || !content || !topArea || !centerArea || !bottomArea || !scrollArea) {
      return;
    }

    let refreshRaf = 0;
    const scheduleRefresh = () => {
      if (refreshRaf) cancelAnimationFrame(refreshRaf);
      refreshRaf = requestAnimationFrame(() => {
        refreshRaf = 0;
        ScrollTrigger.refresh();
      });
    };

    const flipTo = (targetContainer: HTMLElement) => {
      if (content.parentNode === targetContainer) return;
      const state = Flip.getState(content);
      targetContainer.appendChild(content);
      // No ScrollTrigger.refresh() afterwards: the caption only moves inside
      // the fixed-height (100vh, overflow hidden) sticky block, so page
      // layout doesn't change, and a full refresh mid-scroll (every trigger
      // re-measured, pins re-applied) caused a visible hitch on each flip.
      Flip.from(state, {
        duration: 0.6,
        ease: "none",
        absolute: true,
      });
    };

    const triggerA = ScrollTrigger.create({
      trigger: caption,
      start: "top top",
      onEnter: () => flipTo(centerArea),
      onEnterBack: () => flipTo(centerArea),
      onLeaveBack: () => flipTo(topArea),
    });

    const triggerB = ScrollTrigger.create({
      trigger: scrollArea,
      start: "bottom bottom",
      onEnter: () => flipTo(bottomArea),
      onLeaveBack: () => flipTo(centerArea),
    });

    // Ensure triggers below this section get fresh measurements after initial mount.
    scheduleRefresh();

    return () => {
      if (refreshRaf) cancelAnimationFrame(refreshRaf);
      triggerA.kill();
      triggerB.kill();
    };
  }, [captionRef, contentRef, topAreaRef, centerAreaRef, bottomAreaRef, scrollAreaRef]);
}
