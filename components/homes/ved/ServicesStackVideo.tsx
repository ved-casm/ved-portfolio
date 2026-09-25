"use client";

import AutoplayLoopVideo from "@/components/media/AutoplayLoopVideo";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useLayoutEffect, useRef } from "react";
import TextScramble from "@/components/animations/TextScramble";
import {
  initStackCardsEffects,
  initVelocityMarqueeRows,
  type StackCardMedia,
} from "@/lib/template/stackCardsEffects";

const MARQUEE_WORDS = [
  "Design/",
  "UI/UX/",
  "Landing Pages/",
  "Web Development/",
  "Logo Design/",
] as const;

type VideoSources = { type: string; src: string }[];

type WebStudioServiceCard =
  | {
    key: string;
    leftTags: string[];
    rightTags: string[];
    titleLines: string[];
    coverClassName?: string;
    media: "video";
    poster: string;
    sources: VideoSources;
  }
  | {
    key: string;
    leftTags: string[];
    rightTags: string[];
    titleLines: string[];
    coverClassName?: string;
    media: "image";
    imageSrc: string;
    imageWidth: number;
    imageHeight: number;
  };

const WEB_STUDIO_SERVICE_CARDS: WebStudioServiceCard[] = [
  {
    key: "athlnk",
    leftTags: ["UI/UX", "Next.js", "TypeScript", "Tailwind"],
    rightTags: ["Aceternity UI", "Logo design", "Motion", "Hero UI"],
    titleLines: ["AthLnk", "Platform"],
    media: "video",
    poster: "/showcase1.mp4",
    sources: [{ type: "video/mp4", src: "/showcase.mp4" }],
  },
  {
    key: "foreward",
    leftTags: ["React.js", "Bootstrap", "Inline CSS", "Dynamic CSS"],
    rightTags: ["Graphic Design", "Content Writing", "Logo Design", "Parallax UI"],
    titleLines: ["Foreward", "Golf"],
    media: "image",
    imageSrc: "/img/projects/foreward-golf/01.avif",
    imageWidth: 1920,
    imageHeight: 1086,
  },
  {
    key: "cocogirl",
    leftTags: ["Next.js", "TypeScript", "Motion", "Tailwind"],
    rightTags: ["Aceternity", "Logo Design", "Shadcn UI", "Messaging Design"],
    titleLines: ["Cocogirl", "AI"],
    media: "image",
    imageSrc: "/img/projects/cocogirl-ai/01.avif",
    imageWidth: 1920,
    imageHeight: 1086,
  },
  {
    key: "clearplace",
    leftTags: ["React.js", "Bootstrap", "Inline CSS", "Dynamic CSS"],
    rightTags: ["CRM Dashboard", "Logo Design", "Payment Portal", "Kanban Boards"],
    titleLines: ["Clear", "Place"],
    media: "image",
    imageSrc: "/img/projects/clear-place/01.avif",
    imageWidth: 1920,
    imageHeight: 1086,
    coverClassName: "cover-darken",
  },
  {
    key: "ascension",
    leftTags: ["React.js", "Terra UI", "Tailwind CSS", "Dashboard"],
    rightTags: ["Patient Report", "Report Summary", "API Integration", "Web Sockets"],
    titleLines: ["Ascension", "Healthcare"],
    media: "image",
    imageSrc: "/img/projects/ascension-healthcare/01.avif",
    imageWidth: 1920,
    imageHeight: 1086,
    coverClassName: "cover-darken",
  },
  {
    key: "greenfrog",
    leftTags: ["React.js", "Bootstrap", "Inline CSS", "Dynamic CSS"],
    rightTags: ["CRM Dashboard", "Logo Design", "Payment Portal", "Booking Portal"],
    titleLines: ["GreenFrog", "Cleaning"],
    media: "image",
    imageSrc: "/img/projects/greenfrog-cleaning/01.avif",
    imageWidth: 1920,
    imageHeight: 1086,
    coverClassName: "cover-darken",
  },
];

export default function ServicesStackVideo() {
  const topRefs = useRef<HTMLDivElement[]>([]);
  const bottomRefs = useRef<HTMLDivElement[]>([]);
  const cardRefs = useRef<HTMLDivElement[]>([]);
  const cardWrapperRefs = useRef<HTMLDivElement[]>([]);
  const cardDescriptionRefs = useRef<HTMLDivElement[]>([]);
  const cardTitleRefs = useRef<HTMLParagraphElement[]>([]);
  const cardCoverRefs = useRef<HTMLDivElement[]>([]);
  const cardImageWrapperRefs = useRef<HTMLDivElement[]>([]);
  const cardMediaRefs = useRef<StackCardMedia[]>([]);
  const introMarqueeRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    return initVelocityMarqueeRows(topRefs.current, bottomRefs.current);
  }, []);

  useLayoutEffect(() => {
    return initStackCardsEffects({
      cards: cardRefs.current,
      cardWrappers: cardWrapperRefs.current,
      cardDescriptions: cardDescriptionRefs.current,
      cardTitleParagraphs: cardTitleRefs.current,
      cardCovers: cardCoverRefs.current,
      cardImageWrappers: cardImageWrapperRefs.current,
      cardMedias: cardMediaRefs.current,
      introMarquee: introMarqueeRef.current,
    });
  }, []);

  return (
    <>
      <div className="mxd-section">
        <div className="mxd-container fullwidth-container">
          {/* Block - Services Stack Video Start */}
          <div className="mxd-block">
            <div className="mxd-stack-cards opposite">
              {WEB_STUDIO_SERVICE_CARDS.map((card, index) => (
                <div
                  key={card.key}
                  className="mxd-stack-cards__card"
                  ref={(el) => {
                    if (!el) return;
                    cardRefs.current[index] = el;
                  }}
                >
                  {index === 0 ? (
                    <div
                      className="card__marquees"
                      ref={(el) => {
                        if (!el) return;
                        introMarqueeRef.current = el;
                      }}
                    >
                      <div className="marquee marquee-stack marquee--gsap muted-extra-opposite">
                        <div
                          className="marquee__top"
                          ref={(el) => {
                            if (!el) return;
                            topRefs.current[0] = el;
                          }}
                        >
                          {MARQUEE_WORDS.map((word) => (
                            <div
                              key={`top-0-${word}`}
                              className="marquee__item item-regular text"
                            >
                              <p className="marquee__text text-with-gliph">
                                {word}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div
                          className="marquee__bottom"
                          ref={(el) => {
                            if (!el) return;
                            bottomRefs.current[0] = el;
                          }}
                        >
                          {MARQUEE_WORDS.map((word) => (
                            <div
                              key={`bottom-0-${word}`}
                              className="marquee__item item-regular text"
                            >
                              <p className="marquee__text text-with-gliph">
                                {word}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div
                          className="marquee__top"
                          ref={(el) => {
                            if (!el) return;
                            topRefs.current[1] = el;
                          }}
                        >
                          {MARQUEE_WORDS.map((word) => (
                            <div
                              key={`top-1-${word}`}
                              className="marquee__item item-regular text"
                            >
                              <p className="marquee__text text-with-gliph">
                                {word}
                              </p>
                            </div>
                          ))}
                        </div>
                        <div
                          className="marquee__bottom"
                          ref={(el) => {
                            if (!el) return;
                            bottomRefs.current[1] = el;
                          }}
                        >
                          {MARQUEE_WORDS.map((word) => (
                            <div
                              key={`bottom-1-${word}`}
                              className="marquee__item item-regular text"
                            >
                              <p className="marquee__text text-with-gliph">
                                {word}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div
                    className="card__wrapper"
                    ref={(el) => {
                      if (!el) return;
                      cardWrapperRefs.current[index] = el;
                    }}
                  >
                    <div className="card__content">
                      <div
                        className="card__descr"
                        ref={(el) => {
                          if (!el) return;
                          cardDescriptionRefs.current[index] = el;
                        }}
                      >
                        <div className="card__tags">
                          {card.leftTags.map((tag) => (
                            <TextScramble
                              key={`${card.key}-left-${tag}`}
                              className="tag tag-m tag-permanent mxd-scramble"
                            >
                              {tag}
                            </TextScramble>
                          ))}
                        </div>
                        <div className="card__tags desktop-right">
                          {card.rightTags.map((tag) => (
                            <TextScramble
                              key={`${card.key}-right-${tag}`}
                              className="tag tag-m tag-permanent mxd-scramble"
                            >
                              {tag}
                            </TextScramble>
                          ))}
                        </div>
                      </div>
                      <Link
                        className="card__title active-cursor-permanent"
                        data-cursor-text="Know More"
                        href="/services"
                      >
                        <p
                          className="permanent"
                          ref={(el) => {
                            if (!el) return;
                            cardTitleRefs.current[index] = el;
                          }}
                        >
                          {card.titleLines.map((line, lineIndex) => (
                            <Fragment key={`${card.key}-t-${lineIndex}`}>
                              {lineIndex > 0 ? <br /> : null}
                              {line}
                            </Fragment>
                          ))}
                        </p>
                      </Link>
                    </div>
                    <div
                      className="card__image"
                      ref={(el) => {
                        if (!el) return;
                        cardImageWrapperRefs.current[index] = el;
                      }}
                    >
                      {card.media === "video" ? (
                        <AutoplayLoopVideo
                          className="video card__media"
                          poster={card.poster}
                          sources={card.sources}
                          ref={(el) => {
                            if (!el) return;
                            cardMediaRefs.current[index] = el;
                          }}
                        />
                      ) : (
                        <Image
                          className="card__media"
                          alt="Project Preview Image"
                          src={card.imageSrc}
                          width={card.imageWidth}
                          height={card.imageHeight}
                          ref={(el) => {
                            if (!el) return;
                            cardMediaRefs.current[index] = el;
                          }}
                        />
                      )}
                      <div
                        className={`card__cover${card.coverClassName ? ` ${card.coverClassName}` : ""}`}
                        ref={(el) => {
                          if (!el) return;
                          cardCoverRefs.current[index] = el;
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Block - Services Stack Video End */}
        </div>
      </div>
    </>
  );
}
