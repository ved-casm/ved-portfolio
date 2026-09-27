"use client";

import { initVelocityMarqueeRows } from "@/lib/template/stackCardsEffects";
import Link from "next/link";
import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import CommonLoadAnimation, {
  CommonLoadFade,
} from "@/components/animations/CommonLoadAnimation";
import CommonAnimatedText from "@/components/animations/CommonAnimatedText";
import TextScramble from "@/components/animations/TextScramble";

export default function NotFound() {
  const topRefs = useRef<HTMLDivElement[]>([]);
  const bottomRefs = useRef<HTMLDivElement[]>([]);

  useLayoutEffect(() => {
    return initVelocityMarqueeRows(topRefs.current, bottomRefs.current);
  }, []);

  return (
    <CommonLoadAnimation>
      <>
        <div className="mxd-section mxd-section-fullscreen loading-wrap">
          <div className="mxd-error">
            {/* Block - 404 Background Start */}
            <div className="mxd-error__background">
              <div className="card__marquees">
                {/* Marquee Divider Start */}
                <div className="marquee marquee-stack marquee--gsap muted-extra">
                  <div
                    className="marquee__top"
                    ref={(el) => {
                      if (el) topRefs.current[0] = el;
                    }}
                  >
                    {/* single item */}
                    <div className="marquee__item item-regular text">
                      <p className="marquee__text text-with-gliph">
                        Nothing here/
                      </p>
                    </div>
                    {/* single item */}
                    <div className="marquee__item item-regular text">
                      <p className="marquee__text text-with-gliph">
                        Nothing here/
                      </p>
                    </div>
                    {/* single item */}
                    <div className="marquee__item item-regular text">
                      <p className="marquee__text text-with-gliph">
                        Nothing here/
                      </p>
                    </div>
                    {/* single item */}
                    <div className="marquee__item item-regular text">
                      <p className="marquee__text text-with-gliph">
                        Nothing here/
                      </p>
                    </div>
                    {/* single item */}
                    <div className="marquee__item item-regular text">
                      <p className="marquee__text text-with-gliph">
                        Nothing here/
                      </p>
                    </div>
                  </div>
                  <div
                    className="marquee__bottom"
                    ref={(el) => {
                      if (el) bottomRefs.current[0] = el;
                    }}
                  >
                    {/* single item */}
                    <div className="marquee__item item-regular text">
                      <p className="marquee__text text-with-gliph">
                        Nothing here/
                      </p>
                    </div>
                    {/* single item */}
                    <div className="marquee__item item-regular text">
                      <p className="marquee__text text-with-gliph">
                        Nothing here/
                      </p>
                    </div>
                    {/* single item */}
                    <div className="marquee__item item-regular text">
                      <p className="marquee__text text-with-gliph">
                        Nothing here/
                      </p>
                    </div>
                    {/* single item */}
                    <div className="marquee__item item-regular text">
                      <p className="marquee__text text-with-gliph">
                        Nothing here/
                      </p>
                    </div>
                    {/* single item */}
                    <div className="marquee__item item-regular text">
                      <p className="marquee__text text-with-gliph">
                        Nothing here/
                      </p>
                    </div>
                  </div>
                  <div
                    className="marquee__top"
                    ref={(el) => {
                      if (el) topRefs.current[1] = el;
                    }}
                  >
                    {/* single item */}
                    <div className="marquee__item item-regular text">
                      <p className="marquee__text text-with-gliph">
                        Nothing here/
                      </p>
                    </div>
                    {/* single item */}
                    <div className="marquee__item item-regular text">
                      <p className="marquee__text text-with-gliph">
                        Nothing here/
                      </p>
                    </div>
                    {/* single item */}
                    <div className="marquee__item item-regular text">
                      <p className="marquee__text text-with-gliph">
                        Nothing here/
                      </p>
                    </div>
                    {/* single item */}
                    <div className="marquee__item item-regular text">
                      <p className="marquee__text text-with-gliph">
                        Nothing here/
                      </p>
                    </div>
                    {/* single item */}
                    <div className="marquee__item item-regular text">
                      <p className="marquee__text text-with-gliph">
                        Nothing here/
                      </p>
                    </div>
                  </div>
                  <div
                    className="marquee__bottom"
                    ref={(el) => {
                      if (el) bottomRefs.current[1] = el;
                    }}
                  >
                    {/* single item */}
                    <div className="marquee__item item-regular text">
                      <p className="marquee__text text-with-gliph">
                        Nothing here/
                      </p>
                    </div>
                    {/* single item */}
                    <div className="marquee__item item-regular text">
                      <p className="marquee__text text-with-gliph">
                        Nothing here/
                      </p>
                    </div>
                    {/* single item */}
                    <div className="marquee__item item-regular text">
                      <p className="marquee__text text-with-gliph">
                        Nothing here/
                      </p>
                    </div>
                    {/* single item */}
                    <div className="marquee__item item-regular text">
                      <p className="marquee__text text-with-gliph">
                        Nothing here/
                      </p>
                    </div>
                    {/* single item */}
                    <div className="marquee__item item-regular text">
                      <p className="marquee__text text-with-gliph">
                        Nothing here/
                      </p>
                    </div>
                  </div>
                </div>
                {/* Marquee Divider End */}
              </div>
            </div>
            {/* Block - 404 Background End */}
            <div className="mxd-container fullscreen-container">
              <div className="mxd-block mxd-block-fullscreen centered-content">
                {/* Block - 404 Content Start */}
                <div className="mxd-error__content">
                  <div className="mxd-error__number">
                    <span>4</span>
                    <span>0</span>
                    <span>4</span>
                    <CommonLoadFade index={0}>
                      <div className="mxd-error__image image-1 mxd-move-slow loading-fade">
                        <Image
                          alt=""
                          src="/img/404_03.avif"
                          width={600}
                          height={251}
                        />
                      </div>
                    </CommonLoadFade>
                    <div className="mxd-error__image image-2">
                      <Image
                        alt=""
                        src="/img/404_01.avif"
                        width={400}
                        height={480}
                      />
                    </div>
                    <div className="mxd-error__image image-3">
                      <Image
                        alt=""
                        src="/img/404_02.avif"
                        width={485}
                        height={400}
                      />
                    </div>
                    <CommonLoadFade index={1}>
                      <div className="mxd-error__image image-4 mxd-move-slow loading-fade">
                        <Image
                          alt=""
                          src="/img/404_04.avif"
                          width={485}
                          height={203}
                        />
                      </div>
                    </CommonLoadFade>
                  </div>
                  <div className="mxd-error__caption">
                    <CommonAnimatedText
                      as="p"
                      className="loading-split"
                      animation="splitLinesLoad"
                    >
                      This page doesn&apos;t exist. <span>Sorry.</span>
                    </CommonAnimatedText>
                    <CommonLoadFade index={2}>
                      <Link
                        className="btn btn-default-icon btn-default-icon-left btn-default-outline slide-left loading-fade"
                        href={`/`}
                      >
                        <i className="btn-icon">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            version="1.1"
                            viewBox="0 0 18 18"
                          >
                            <path d="M7.2,18v-3.6h3.6v3.6h-3.6ZM3.6,7.2H0v3.6h3.6v3.6h3.6v-3.6h10.8v-3.6H7.2v-3.6h-3.6s0,3.6,0,3.6ZM7.2,3.6h3.6V0h-3.6v3.6Z" />
                          </svg>
                        </i>
                        <TextScramble className="btn-caption mxd-scramble">
                          Go Home
                        </TextScramble>
                      </Link>
                    </CommonLoadFade>
                  </div>
                </div>
                {/* Block - 404 Content End */}
              </div>
            </div>
          </div>
        </div>
      </>
    </CommonLoadAnimation>
  );
}
