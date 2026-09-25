"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import imagesLoaded from "imagesloaded";

interface LoaderProps {
  onComplete?: () => void;
}

const LOADER_IMAGES = [
  "/img/loa_01.webp",
  "/img/loa_02.webp",
  "/img/loa_03.webp",
  "/img/loa_04.webp",
  "/img/loa_05.webp",
  "/img/loa_06.webp",
  "/img/loa_07.webp",
];

export default function Loader({ onComplete }: LoaderProps) {
  const loaderRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const imagesContainerRef = useRef<HTMLDivElement>(null);
  const countTextRef = useRef<HTMLSpanElement>(null);
  const imgRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const loader = loaderRef.current;
    const top = topRef.current;
    const bottom = bottomRef.current;
    const imagesContainer = imagesContainerRef.current;
    const countText = countTextRef.current;

    if (!loader || !top || !bottom || !imagesContainer || !countText) {
      onComplete?.();
      return;
    }

    gsap.set(loader, { display: "flex", backgroundColor: "#050505" });
    gsap.set([top, bottom], { opacity: 0 });
    gsap.set(imagesContainer, {
      clipPath: "polygon(100% 0%, 100% 0%, 0% 0%, 0% 0%)",
    });

    if (imgRefs.current[0]) {
      gsap.set(imgRefs.current[0], { opacity: 1 });
    }
    imgRefs.current.slice(1).forEach((img) => {
      if (img) gsap.set(img, { opacity: 0 });
    });

    let targetProgress = 100;
    try {
      const imgLoad = imagesLoaded(document.body, { background: true });
      imgLoad.on("progress", (instance) => {
        const inst = instance as unknown as {
          images: unknown[];
          progressedCount: number;
        };
        if (inst.images && inst.images.length > 0) {
          const progress = Math.round(
            (inst.progressedCount / inst.images.length) * 100
          );
          if (!isNaN(progress) && progress > 0) {
            targetProgress = Math.max(targetProgress, progress);
          }
        }
      });
    } catch {
      // Fallback to time-based counter if imagesLoaded is unavailable
    }

    const counterObj = { value: 0 };
    const activeImageIndexRef = { current: 0 };

    const updateImages = (val: number) => {
      const index = Math.min(6, Math.floor((val / 100) * 7));
      if (index !== activeImageIndexRef.current) {
        const prevIndex = activeImageIndexRef.current;
        activeImageIndexRef.current = index;
        if (imgRefs.current[prevIndex]) {
          gsap.set(imgRefs.current[prevIndex], { opacity: 0 });
        }
        if (imgRefs.current[index]) {
          gsap.set(imgRefs.current[index], { opacity: 1 });
        }
      }
    };

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(loader, { display: "none" });
        onComplete?.();
      },
    });

    // Step 1: Intro reveal
    tl.to([top, bottom], {
      opacity: 1,
      duration: 0.5,
      ease: "power2.out",
    }).to(
      imagesContainer,
      {
        clipPath: "polygon(100% 0%, 100% 100%, 0% 100%, 0% 0%)",
        duration: 0.7,
        ease: "power3.inOut",
      },
      "-=0.3"
    );

    // Step 2: Progress & Image cycling (0% -> 100%)
    tl.to(counterObj, {
      value: 100,
      duration: 1.8,
      ease: "power1.inOut",
      onUpdate: () => {
        const currentVal = Math.floor(counterObj.value);
        countText.innerText = currentVal.toString();
        updateImages(counterObj.value);
      },
    });

    // Step 3: Outro wipe out
    tl.to([top, bottom], {
      opacity: 0,
      duration: 0.4,
      ease: "power2.in",
    }).to(
      imagesContainer,
      {
        clipPath: "polygon(100% 0%, 100% 0%, 0% 0%, 0% 0%)",
        duration: 0.6,
        ease: "power3.inOut",
      },
      "-=0.2"
    );

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={loaderRef}
      className="mxd-loader"
      style={{
        display: "none",
        backgroundColor: "#050505",
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
      <div
        ref={imagesContainerRef}
        className="mxd-loader__images"
        style={{ clipPath: "polygon(100% 0%, 100% 0%, 0% 0%, 0% 0%)" }}
      >
        {LOADER_IMAGES.map((src, index) => (
          <img
            key={src}
            ref={(el) => {
              imgRefs.current[index] = el;
            }}
            src={src}
            alt="Azurio Template Loader Image"
            style={{
              translate: "none",
              rotate: "none",
              scale: "none",
              transform: "translate3d(0px, 0px, 0px)",
              opacity: index === 0 ? 1 : 0,
            }}
          />
        ))}
      </div>
      <div ref={bottomRef} className="mxd-loader__bottom" style={{ opacity: 0 }}>
        <div className="mxd-loader__count">
          <span ref={countTextRef} className="count__text">
            100
          </span>
          <span className="count__percent">%</span>
        </div>
        <span className="mxd-loader__caption">Loading</span>
      </div>
    </div>
  );
}
