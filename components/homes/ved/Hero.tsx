"use client";

import Link from "next/link";
import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import CommonLoadAnimation, {
  CommonLoadFade,
  CommonLoadItem,
} from "@/components/animations/CommonLoadAnimation";
import TextScramble from "@/components/animations/TextScramble";
import SmoothAnchorLink from "@/components/common/SmoothAnchorLink";

gsap.registerPlugin(ScrollTrigger);

type HeroSlide = {
  src: string;
  name: string;
  description: string;
  descriptionAccent?: string;
};

const HERO_SLIDES: HeroSlide[] = [
  {
    src: "/img/hero/1920x1200_h03.webp",
    name: "Solei",
    description: "Interactive concept",
    descriptionAccent: "powered by AI",
  },
  {
    src: "/img/hero/1920x1200_h04.webp",
    name: "Azurio",
    description: "Digital agency & personal portfolio",
    descriptionAccent: "React Nextjs Template",
  },
  {
    src: "/img/hero/1920x1200_h05.webp",
    name: "Sunset",
    description: "Editorial Midjourney",
    descriptionAccent: "illustrations set",
  },
];

export default function Hero() {
  const pathname = usePathname();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const slidesContainerRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const imageRefs = useRef<Array<HTMLImageElement | null>>([]);
  const nameRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const descrRefs = useRef<Array<HTMLParagraphElement | null>>([]);

  useLayoutEffect(() => {
    const stickySection = wrapRef.current;
    const slidesContainer = slidesContainerRef.current;
    const slider = sliderRef.current;
    const slides = slideRefs.current.filter((slide): slide is HTMLDivElement =>
      Boolean(slide),
    );

    if (!stickySection || !slidesContainer || !slider || !slides.length) return;

    const names = nameRefs.current.filter((el): el is HTMLParagraphElement =>
      Boolean(el),
    );
    const descriptions = descrRefs.current.filter(
      (el): el is HTMLParagraphElement => Boolean(el),
    );

    gsap.set([...names, ...descriptions], { yPercent: 120 });
    gsap.set(
      imageRefs.current.filter((img): img is HTMLImageElement => Boolean(img)),
      {
        x: 0,
        scale: 1.25,
      },
    );

    let activeSlide = -1;
    const slideCount = slides.length;

    const st = ScrollTrigger.create({
      trigger: stickySection,
      start: "top top",
      end: () => `+=${window.innerHeight * (slideCount - 0.5)}`,
      scrub: true,
      pin: true,
      pinSpacing: true,
      invalidateOnRefresh: true,
      snap:
        slideCount > 1
          ? {
              snapTo: 1 / (slideCount - 1),
              duration: { min: 0.2, max: 0.6 },
              ease: "none",
            }
          : undefined,
      onUpdate: (self) => {
        const sliderWidth = slider.offsetWidth;
        if (!sliderWidth) return;

        const totalMove = Math.max(
          0,
          slidesContainer.scrollWidth - sliderWidth,
        );
        const mainMove = self.progress * totalMove;

        gsap.set(slidesContainer, { x: -mainMove });

        const rawIndex = mainMove / sliderWidth;
        const baseSlide = Math.floor(rawIndex);
        const sliderProgress = rawIndex - baseSlide;

        let activationIndex = sliderProgress > 0.33 ? baseSlide + 1 : baseSlide;
        activationIndex = Math.max(
          0,
          Math.min(slideCount - 1, activationIndex),
        );

        imageRefs.current.forEach((image, index) => {
          if (!image) return;
          if (index === baseSlide || index === baseSlide + 1) {
            const relativeProgress =
              index === baseSlide ? sliderProgress : sliderProgress - 1;
            gsap.set(image, {
              x: relativeProgress * sliderWidth * 0.25,
              scale: 1.25,
            });
            return;
          }
          gsap.set(image, { x: 0, scale: 1.25 });
        });

        if (activationIndex === activeSlide) return;
        activeSlide = activationIndex;

        names.forEach((name, index) => {
          const descr = descriptions[index];
          if (!descr) return;
          if (index === activeSlide) {
            gsap.to(name, { yPercent: 0, duration: 0.7, ease: "power3.out" });
            gsap.to(descr, {
              yPercent: 0,
              duration: 0.7,
              delay: 0.08,
              ease: "power3.out",
            });
            return;
          }
          gsap.to([name, descr], {
            yPercent: 120,
            duration: 0.5,
            ease: "power2.in",
          });
        });
      },
    });

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      st.kill();
    };
  }, [pathname]);

  return (
    <CommonLoadAnimation>
      <>
        <div className="mxd-section mxd-hero-section no-padding loading-wrap">
          <div className="mxd-hero-04">
            <div className="mxd-hero-04__wrap" ref={wrapRef}>
              {/* centered controls */}
              <div className="mxd-hero-04__controls">
                <CommonLoadItem index={0}>
                  <div className="mxd-hero-04__left mxd-grid-item loading-item">
                    <Link
                      className="btn btn-line btn-line-permanent"
                      href={`/works-grid`}
                    >
                      <TextScramble className="btn-caption mxd-scramble">
                        All Work
                      </TextScramble>
                    </Link>
                  </div>
                </CommonLoadItem>
                <CommonLoadItem index={1}>
                  <div className="mxd-hero-04__right mxd-grid-item loading-item">
                    <SmoothAnchorLink
                      className="btn btn-line-icon btn-line-permanent slide-down"
                      targetId="about"
                    >
                      <TextScramble className="btn-caption mxd-scramble">
                        Scroll to explore
                      </TextScramble>
                      <i>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          version="1.1"
                          viewBox="0 0 18 18"
                        >
                          <path d="M18,10.8h-3.6v-3.6h3.6v3.6ZM7.2,14.4v3.6h3.6v-3.6h3.6v-3.6h-3.6V0h-3.6v10.8h-3.6v3.6s3.6,0,3.6,0ZM3.6,10.8v-3.6H0v3.6h3.6Z" />
                        </svg>
                      </i>
                    </SmoothAnchorLink>
                  </div>
                </CommonLoadItem>
              </div>
              {/* decorative arrow */}
              <CommonLoadFade index={0}>
                <div className="mxd-hero-04__arrow loading-fade">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    x="0px"
                    y="0px"
                    viewBox="0 0 259 260"
                    enableBackground="new 0 0 259 260"
                    xmlSpace="preserve"
                  >
                    <path
                      d="M143.9,0v28.8h-28.8V0H143.9z M143.9,28.8v28.8h28.8V28.8H143.9z M172.7,57.6v28.8h28.8V57.6H172.7z M230.2,115.2V86.4
                  h-28.8v28.8H0V144h201.4v28.8h28.8V144H259v-28.8H230.2z M172.7,201.6h28.8v-28.8h-28.8V201.6z M143.9,230.4h28.8v-28.8h-28.8V230.4
                  z M114.3,260h28.8v-28.8h-28.8V260z"
                    />
                  </svg>
                </div>
              </CommonLoadFade>
              {/* slider */}
              <div className="mxd-hero-04__slider" ref={sliderRef}>
                <div className="mxd-hero-04__slides" ref={slidesContainerRef}>
                  {HERO_SLIDES.map((slide, index) => (
                    <div
                      key={slide.src}
                      className="mxd-hero-04__slide"
                      ref={(el) => {
                        slideRefs.current[index] = el;
                      }}
                    >
                      <div className="mxd-hero-04__media">
                        <Image
                          alt="Azurio Template Sample Image"
                          src={slide.src}
                          width={1920}
                          height={1200}
                          priority={index === 0 ? true : false}
                          ref={(el) => {
                            imageRefs.current[index] = el;
                          }}
                        />
                        <div className="mxd-hero-04__cover" />
                      </div>
                      {index === 0 ? (
                        <CommonLoadFade index={1}>
                          <Link
                            className="mxd-hero-04__title active-cursor-accent loading-fade"
                            data-cursor-text="View Work"
                            href={`/project-details`}
                          >
                            <div className="mxd-hero-04__name mxd-grid-item">
                              <p
                                className="large"
                                ref={(el) => {
                                  nameRefs.current[index] = el;
                                }}
                              >
                                {slide.name}
                              </p>
                            </div>
                            <div className="mxd-hero-04__descr mxd-grid-item">
                              <p
                                ref={(el) => {
                                  descrRefs.current[index] = el;
                                }}
                              >
                                {slide.description}
                                {slide.descriptionAccent ? (
                                  <>
                                    {" "}
                                    <span>{slide.descriptionAccent}</span>
                                  </>
                                ) : null}
                              </p>
                            </div>
                          </Link>
                        </CommonLoadFade>
                      ) : (
                        <Link
                          className="mxd-hero-04__title active-cursor-accent"
                          data-cursor-text="View Work"
                          href={`/project-details`}
                        >
                          <div className="mxd-hero-04__name mxd-grid-item">
                            <p
                              className="large"
                              ref={(el) => {
                                nameRefs.current[index] = el;
                              }}
                            >
                              {slide.name}
                            </p>
                          </div>
                          <div className="mxd-hero-04__descr mxd-grid-item">
                            <p
                              ref={(el) => {
                                descrRefs.current[index] = el;
                              }}
                            >
                              {slide.description}
                              {slide.descriptionAccent ? (
                                <>
                                  {" "}
                                  <span>{slide.descriptionAccent}</span>
                                </>
                              ) : null}
                            </p>
                          </div>
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    </CommonLoadAnimation>
  );
}
