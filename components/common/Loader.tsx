"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface LoaderProps {
  onComplete?: () => void;
}

// the loader belongs to a full page load only; client-side navigation must not replay it
let loaderDone = false;

/*
 * First-load loader: a large Cormorant italic counter (0 -> 100%) with a
 * hairline that fills alongside it. The counter is tweened on GSAP's ticker
 * and written every frame; tabular figures keep the digits from shifting.
 */
export default function Loader({ onComplete }: LoaderProps) {
  // latest callback without re-running the effect (the parent passes a new
  // function on every render, which used to restart the loader on navigation)
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  const loaderRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLDivElement>(null);
  const countTextRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const loader = loaderRef.current;
    const top = topRef.current;
    const count = countRef.current;
    const countText = countTextRef.current;
    const bar = barRef.current;

    if (loaderDone) return;
    if (!loader || !top || !count || !countText || !bar) {
      loaderDone = true;
      onCompleteRef.current?.();
      return;
    }

    gsap.set(loader, { display: "flex" });
    gsap.set(top, { opacity: 0 });
    gsap.set(count, { opacity: 0, yPercent: 18 });
    gsap.set(bar, { scaleX: 0 });

    // The counter eases towards a time-based target but may only advance a
    // small step per frame: if the page stalls (hydration, section setup on a
    // slow phone), it pauses and carries on smoothly instead of jumping.
    const DURATION = 2.2; // s, from 0 to 100 at full speed
    const MAX_PER_SEC = 95; // cap on how fast the number may climb
    let shown = -1;
    let value = 0;
    let t = 0;
    let raf = 0;
    let last = 0;
    let started = false;
    const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
    const write = () => {
      const v = Math.round(value);
      if (v !== shown) {
        shown = v;
        countText.textContent = String(v);
      }
      bar.style.transform = `scaleX(${value / 100})`;
    };
    write();

    const outro = () => {
      gsap
        .timeline({
          onComplete: () => {
            gsap.set(loader, { display: "none" });
            loaderDone = true;
            onCompleteRef.current?.();
          },
        })
        .to([top, count], { opacity: 0, duration: 0.45, ease: "power2.in" }, 0.15)
        .to(count, { yPercent: -14, duration: 0.45, ease: "power2.in" }, "<");
    };
    const frame = (now: number) => {
      // at most a 30fps step, so a long stall never turns into a jump
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 0;
      last = now;
      t += dt;
      const target = 100 * easeInOut(Math.min(1, t / DURATION));
      value = Math.min(target, value + MAX_PER_SEC * dt);
      write();
      if (value >= 99.999) {
        value = 100;
        write();
        outro();
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    const startCounting = () => {
      if (started) return;
      started = true;
      raf = requestAnimationFrame(frame);
    };

    gsap
      .timeline()
      .to(top, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0)
      .to(count, { opacity: 1, yPercent: 0, duration: 0.8, ease: "expo.out" }, 0.05);
    // count once the heavy first-load work (hydration, section setup) is done,
    // with a fallback so it never waits too long
    const whenLoaded = () => requestAnimationFrame(() => requestAnimationFrame(startCounting));
    if (document.readyState === "complete") whenLoaded();
    else window.addEventListener("load", whenLoaded, { once: true });
    const fallback = window.setTimeout(startCounting, 2500);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(fallback);
      window.removeEventListener("load", whenLoaded);
    };
  }, []);

  return (
    <div
      ref={loaderRef}
      className="mxd-loader ved-loader"
      style={{
        display: "none",
        background: "#050505",
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 99999,
      }}
    >
      <div ref={topRef} className="mxd-loader__top" style={{ opacity: 0 }}>
        <span>Ved-Space</span>
      </div>
      <div ref={countRef} className="ved-loader__count" style={{ opacity: 0 }}>
        <span ref={countTextRef} className="ved-loader__num">
          0
        </span>
        <span className="ved-loader__pct">%</span>
        <span className="ved-loader__line" aria-hidden="true">
          <span ref={barRef} className="ved-loader__bar" />
        </span>
      </div>
      <span className="ved-loader__sr" role="status">
        Loading
      </span>
    </div>
  );
}
