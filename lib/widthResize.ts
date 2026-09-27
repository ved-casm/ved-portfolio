/*
 * Resize listener that ignores height-only changes.
 *
 * On iOS Safari (and Android Chrome) the address bar collapses/expands while
 * scrolling, firing `resize` with a new innerHeight many times. Re-measuring
 * pins / canvases on each one makes the page jump and, on iOS, can stall it.
 * Real layout changes (rotation, window resize on desktop) change the width.
 */
export function onWidthResize(cb: () => void): () => void {
  let w = window.innerWidth;
  const handler = () => {
    if (window.innerWidth === w) return;
    w = window.innerWidth;
    cb();
  };
  window.addEventListener("resize", handler);
  window.addEventListener("orientationchange", handler);
  return () => {
    window.removeEventListener("resize", handler);
    window.removeEventListener("orientationchange", handler);
  };
}
