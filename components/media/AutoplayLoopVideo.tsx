"use client";

import { forwardRef, type ReactNode, type VideoHTMLAttributes } from "react";

export type AutoplayVideoSource = {
  src: string;
  type: string;
};

/** Next.js serves `public/` at `/`; relative `video/...` breaks on nested routes. */
export function toPublicMediaUrl(path: string): string {
  if (!path) return path;
  if (
    path.startsWith("/") ||
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }
  return path.startsWith("video/")
    ? `/${path}`
    : `/${path.replace(/^\.\//, "")}`;
}

export type AutoplayLoopVideoProps = Omit<
  VideoHTMLAttributes<HTMLVideoElement>,
  "autoPlay" | "muted" | "loop" | "playsInline" | "children" | "preload"
> & {
  sources: AutoplayVideoSource[];
  children?: ReactNode;
  /** true: the owner starts playback itself (e.g. the menu video) */
  manual?: boolean;
};

/**
 * Background / loop videos. Nothing downloads at page load: the video renders
 * with preload="none", and lib/lazyVideo plays it as it nears the viewport
 * (and pauses it off screen). The poster shows until the first frame is ready.
 */
const AutoplayLoopVideo = forwardRef<HTMLVideoElement, AutoplayLoopVideoProps>(
  function AutoplayLoopVideo({ sources, className, poster, manual = false, children, ...rest }, ref) {
    const posterUrl = poster != null ? toPublicMediaUrl(String(poster)) : undefined;
    return (
      <video
        ref={ref}
        className={className}
        poster={posterUrl}
        preload="none"
        data-autoplay={manual ? "manual" : "auto"}
        muted
        loop
        playsInline
        {...rest}
      >
        {sources.map((s) => {
          const src = toPublicMediaUrl(s.src);
          return <source key={`${src}-${s.type}`} src={src} type={s.type} />;
        })}
        {children}
      </video>
    );
  },
);

export default AutoplayLoopVideo;
