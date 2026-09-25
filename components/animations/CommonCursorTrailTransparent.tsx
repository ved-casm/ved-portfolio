"use client";

import { gsap } from "gsap";
import Image, { type ImageProps } from "next/image";
import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
  type Ref,
} from "react";

const MAX_SIZE = 240;

function lerp(a: number, b: number, n: number) {
  return (1 - n) * a + n * b;
}

function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.hypot(x2 - x1, y2 - y1);
}

type TrailContextValue = {
  registerWrapper: (el: HTMLElement | null) => void;
  registerContent: (el: HTMLElement | null) => void;
  registerImage: (index: number) => (el: HTMLImageElement | null) => void;
};

const TrailContext = createContext<TrailContextValue | null>(null);

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (value: T | null) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(value);
        return;
      }
      (ref as { current: T | null }).current = value;
    });
  };
}

type CommonCursorTrailTransparentProps<T extends ElementType = "div"> = {
  as?: T;
  className?: string;
  children: ReactNode;
  threshold?: number;
  active?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export default function CommonCursorTrailTransparent<
  T extends ElementType = "div",
>({
  as,
  className,
  children,
  threshold = 120,
  active = true,
  ...rest
}: CommonCursorTrailTransparentProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  const sectionRef = useRef<HTMLElement | null>(null);
  const wrapperRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLElement | null>(null);
  const imageRefs = useRef<HTMLImageElement[]>([]);

  const registerWrapper = useMemo(
    () => (el: HTMLElement | null) => {
      wrapperRef.current = el;
    },
    [],
  );

  const registerContent = useMemo(
    () => (el: HTMLElement | null) => {
      contentRef.current = el;
    },
    [],
  );

  const registerImage = useMemo(
    () => (index: number) => (el: HTMLImageElement | null) => {
      if (!el) return;
      imageRefs.current[index] = el;
    },
    [],
  );

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const wrapper = wrapperRef.current;
    const images = imageRefs.current.filter(Boolean);
    if (!section || !wrapper || !images.length) return;

    let rafId = 0;
    let zIndex = 1;
    let currentIndex = 0;
    let prevPos = { x: 0, y: 0 };
    let cachedPos = { x: 0, y: 0 };
    const mousePos = { x: 0, y: 0 };
    let hasPointer = false;

    const handleMove = (ev: PointerEvent) => {
      const rect = wrapper.getBoundingClientRect();
      mousePos.x = ev.clientX - rect.left;
      mousePos.y = ev.clientY - rect.top;
      if (!hasPointer) {
        hasPointer = true;
        prevPos = { ...mousePos };
        cachedPos = { ...mousePos };
      }
    };

    const setImageSize = (img: HTMLImageElement) => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      if (w >= h) {
        img.style.width = `${MAX_SIZE}px`;
        img.style.height = "auto";
      } else {
        img.style.height = `${MAX_SIZE}px`;
        img.style.width = "auto";
      }
    };

    const showNext = (dx: number, dy: number) => {
      const img = images[currentIndex];
      const rect = img.getBoundingClientRect();
      const offsetX = rect.width / 2;
      const offsetY = rect.height / 2;
      const rotation = gsap.utils.clamp(-14, 14, -(dx + dy) * 0.3);

      gsap.killTweensOf(img);
      gsap
        .timeline()
        .set(img, {
          opacity: 1,
          scale: 1,
          zIndex: zIndex++,
          x: cachedPos.x - offsetX,
          y: cachedPos.y - offsetY,
          rotation,
        })
        .to(
          img,
          {
            duration: 1,
            x: mousePos.x - offsetX,
            y: mousePos.y - offsetY,
            rotation,
            ease: "expo.out",
          },
          0,
        )
        .to(
          img,
          {
            duration: 0.8,
            scale: 0,
            ease: "power1.out",
            onComplete: () => {
              gsap.set(img, { scale: 1, opacity: 0 });
            },
          },
          0.55,
        );

      currentIndex = (currentIndex + 1) % images.length;
    };

    const update = () => {
      if (!hasPointer) {
        rafId = window.requestAnimationFrame(update);
        return;
      }
      const dx = mousePos.x - prevPos.x;
      const dy = mousePos.y - prevPos.y;
      const dist = distance(mousePos.x, mousePos.y, prevPos.x, prevPos.y);

      cachedPos.x = lerp(cachedPos.x, mousePos.x, 0.14);
      cachedPos.y = lerp(cachedPos.y, mousePos.y, 0.14);

      if (active && dist > threshold) {
        showNext(dx, dy);
        prevPos = { ...mousePos };
      }

      if (!images.some((img) => gsap.getTweensOf(img).length > 0)) {
        zIndex = 1;
      }

      rafId = window.requestAnimationFrame(update);
    };

    images.forEach(setImageSize);
    section.addEventListener("pointermove", handleMove);
    rafId = window.requestAnimationFrame(update);

    return () => {
      section.removeEventListener("pointermove", handleMove);
      if (rafId) window.cancelAnimationFrame(rafId);
      images.forEach((img) => gsap.killTweensOf(img));
    };
  }, [active, threshold]);

  return (
    <TrailContext.Provider
      value={{ registerWrapper, registerContent, registerImage }}
    >
      <Tag className={className} {...rest} ref={sectionRef}>
        {children}
      </Tag>
    </TrailContext.Provider>
  );
}

type CommonCursorTrailWrapperProps<T extends ElementType = "div"> = {
  as?: T;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function CommonCursorTrailWrapper<T extends ElementType = "div">({
  as,
  className,
  children,
  ...rest
}: CommonCursorTrailWrapperProps<T>) {
  const context = useContext(TrailContext);
  const Tag = (as ?? "div") as ElementType;
  if (!context) return <Tag className={className} {...rest}>{children}</Tag>;
  return (
    <Tag
      className={className}
      {...rest}
      ref={mergeRefs((rest as { ref?: Ref<HTMLElement> }).ref, context.registerWrapper)}
    >
      {children}
    </Tag>
  );
}

type CommonCursorTrailContentProps<T extends ElementType = "div"> = {
  as?: T;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

export function CommonCursorTrailContent<T extends ElementType = "div">({
  as,
  className,
  children,
  ...rest
}: CommonCursorTrailContentProps<T>) {
  const context = useContext(TrailContext);
  const Tag = (as ?? "div") as ElementType;
  if (!context) return <Tag className={className} {...rest}>{children}</Tag>;
  return (
    <Tag
      className={className}
      {...rest}
      ref={mergeRefs((rest as { ref?: Ref<HTMLElement> }).ref, context.registerContent)}
    >
      {children}
    </Tag>
  );
}

type CommonCursorTrailImageProps = {
  index: number;
} & Omit<ImageProps, "ref">;

export function CommonCursorTrailImage({
  index,
  className,
  alt,
  src,
  ...rest
}: CommonCursorTrailImageProps) {
  const context = useContext(TrailContext);
  const ref = context ? context.registerImage(index) : undefined;
  return (
    <Image className={className} alt={alt} src={src} {...rest} ref={ref} />
  );
}
