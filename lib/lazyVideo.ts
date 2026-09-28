/*
 * Background loop videos render with preload="none" and data-autoplay (no
 * autoPlay attribute), so nothing downloads at page load. This watcher plays
 * each one as it nears the viewport and pauses it again once it's off screen.
 * `play()` is what starts the download.
 */

const SELECTOR = 'video[data-autoplay="auto"]';

/**
 * Sources for a loop video. The MP4s are re-encoded H.264 (no audio, 30fps,
 * faststart): for this footage they came out smaller than VP9/AV1 WebM at the
 * same look, and every browser plays them.
 */
export function videoSources(mp4: string): { src: string; type: string }[] {
  return [{ src: mp4, type: "video/mp4" }];
}

/** Poster frame written next to each video by the encode step. */
export const videoPoster = (mp4: string) => mp4.replace(/\.mp4$/, "-poster.avif");

export function startLazyVideos(): () => void {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return () => {};
  const seen = new WeakSet<HTMLVideoElement>();

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const v = e.target as HTMLVideoElement;
        if (e.isIntersecting && !document.hidden) {
          v.muted = true;
          void v.play().catch(() => {});
        } else if (!v.paused) {
          v.pause();
        }
      }
    },
    // start a little before it scrolls in so the first frames are ready
    { rootMargin: "40% 0px" },
  );

  const scan = (root: ParentNode) => {
    root.querySelectorAll<HTMLVideoElement>(SELECTOR).forEach((v) => {
      if (seen.has(v)) return;
      seen.add(v);
      io.observe(v);
    });
  };
  scan(document);

  // new sections mount on client-side navigation
  const mo = new MutationObserver((records) => {
    for (const r of records) {
      r.addedNodes.forEach((n) => {
        if (n instanceof HTMLVideoElement && n.matches(SELECTOR)) scan(n.parentNode ?? document);
        else if (n instanceof Element) scan(n);
      });
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });

  // background tabs don't need to decode anything
  const onVis = () => {
    document.querySelectorAll<HTMLVideoElement>(SELECTOR).forEach((v) => {
      if (document.hidden) {
        v.pause();
        return;
      }
      // coming back: resume the ones that are on screen
      const r = v.getBoundingClientRect();
      if (r.bottom > -innerHeight * 0.4 && r.top < innerHeight * 1.4 && r.width > 0) void v.play().catch(() => {});
    });
  };
  document.addEventListener("visibilitychange", onVis);

  return () => {
    io.disconnect();
    mo.disconnect();
    document.removeEventListener("visibilitychange", onVis);
  };
}

/** AthLnk showreel: AV1 WebM where it decodes, H.264 MP4 everywhere else. */
export const ATHLNK_REEL = {
  poster: "/video/projects/athlnk-reel-poster.avif",
  sources: [
    { type: 'video/webm; codecs="av01.0.08M.08"', src: "/video/projects/athlnk-reel.webm" },
    { type: "video/mp4", src: "/video/projects/athlnk-reel.mp4" },
  ],
};
