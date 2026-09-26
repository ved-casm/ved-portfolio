import { ScrollTrigger } from "gsap/ScrollTrigger";

/*
 * Every section calls ScrollTrigger.refresh() when it sets itself up (after
 * fonts, after a delay, after load...). Each call re-measures every pin on
 * the page, so a page load paid for ~10 full refreshes. Calls that land in
 * the same frame now collapse into one refresh on the next frame. GSAP's own
 * internal refreshes (resize, load) are untouched.
 */
let patched = false;

export function coalesceScrollTriggerRefresh() {
  if (patched || typeof window === "undefined") return;
  patched = true;
  const run = ScrollTrigger.refresh.bind(ScrollTrigger);
  let raf = 0;
  let safe = false;
  ScrollTrigger.refresh = ((s?: boolean) => {
    safe = safe || !!s;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const wasSafe = safe;
      safe = false;
      run(wasSafe);
    });
  }) as typeof ScrollTrigger.refresh;
}
