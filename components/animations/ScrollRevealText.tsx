"use client";

import React, { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ScrollRevealText.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ScrollRevealTextProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "div" | "span";
  className?: string;
  style?: React.CSSProperties;
  dimColor?: string;
  brightColor?: string;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  /**
   * Selector of an ancestor whose position drives the reveal (resolved with
   * `closest()`; defaults to the text itself). Use an un-pinned ancestor when
   * the text sits inside a pinned element: a trigger inside a pin can be
   * measured while it's position:fixed, which puts start/end in the wrong
   * place.
   */
  trigger?: string;
}

export default function ScrollRevealText({
  text,
  as: Component = "div",
  className = "",
  style,
  dimColor,
  brightColor,
  start = "top 75%",
  end = "bottom 50%",
  scrub = 1,
  trigger,
}: ScrollRevealTextProps) {
  const elRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { "--clip-value": "100%" },
        {
          "--clip-value": "0%",
          ease: "none",
          scrollTrigger: {
            trigger: (trigger && el.closest<HTMLElement>(trigger)) || el,
            start,
            end,
            scrub,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [start, end, scrub, trigger]);

  const customStyle: React.CSSProperties = {
    ...style,
    ...(dimColor ? ({ "--reveal-dim": dimColor } as React.CSSProperties) : {}),
    ...(brightColor ? ({ "--reveal-bright": brightColor } as React.CSSProperties) : {}),
  };

  const combinedClassName = `${styles.scrollRevealText} ${className}`.trim();

  return (
    <Component
      ref={elRef as never}
      className={combinedClassName}
      style={customStyle}
      data-text={text}
    >
      {text}
    </Component>
  );
}
