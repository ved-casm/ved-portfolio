"use client";

import PinnedSection from "@/components/animations/PinnedSection";
import CommonAnimatedText from "@/components/animations/CommonAnimatedText";
import Link from "next/link";
import Image from "next/image";
import { CommonScrollAnimated } from "@/components/animations/CommonScrollAnimated";
import TextScramble from "@/components/animations/TextScramble";
import MxdImgAnim from "@/components/animations/MxdImgAnim";

export default function SelectedWork() {
  return (
    <>
      <PinnedSection
        blurSection
        className="mxd-section padding-top-title padding-bottom-default"
      >
        <PinnedSection.Inner>
          <div className="mxd-container grid-l-container">
            {/* Block - Section Title v03 Start */}
            <div className="mxd-block">
              <div className="mxd-section-title pre-grid">
                <div className="container-fluid p-0">
                  <div className="row g-0">
                    <div className="col-12 col-xl-8 mxd-grid-item">
                      <div className="mxd-section-title__title pre-caption">
                        <CommonAnimatedText
                          as="h2"
                          className="mxd-split-lines"
                          animation="splitLines"
                        >
                          Selected
                          <br />
                          work
                        </CommonAnimatedText>
                      </div>
                    </div>
                    <div className="col-12 col-xl-3 mxd-grid-item">
                      <div className="mxd-section-title__data top-caption">
                        <div className="mxd-section-title__caption">
                          <CommonAnimatedText
                            as="p"
                            className="t-bold t-large mxd-split-lines"
                            animation="splitLines"
                          >
                            We helped 20+ brands, agencies and creatives to
                            <span>elevate their online presence.</span>
                          </CommonAnimatedText>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Block - Section Title v03 End */}
            {/* Block - Projects List Start */}
            <div className="mxd-block">
              {/* projects list */}
              <div className="mxd-projects-list">
                <Link
                  className="mxd-projects-list__item active-cursor-image active-cursor-permanent"
                  data-cursor-image="/img/works/showcase-archive/500x500_pr01.webp"
                  data-cursor-text="View Work"
                  href={`/project-details`}
                >
                  <div className="mxd-projects-list__divider top" />
                  <div className="container-fluid px-0 mxd-projects-list__inner">
                    <div className="row gx-0">
                      <div className="col-12 col-xl-2 mxd-grid-padding">
                        <div className="mxd-projects-list__niche">
                          <TextScramble className="meta-niche mxd-scramble">
                            Tech
                          </TextScramble>
                        </div>
                      </div>
                      <div className="col-12 col-xl-6 mxd-grid-padding">
                        <div className="mxd-projects-list__title">
                          <h3>
                            Creative{" "}
                            <span>
                              studio
                              <br />
                              template
                            </span>
                          </h3>
                        </div>
                      </div>
                      <div className="col-6 col-md-6 col-xl-2 mxd-grid-padding">
                        <div className="mxd-projects-list__meta">
                          <TextScramble className="meta-tag mxd-scramble">
                            Brand
                          </TextScramble>
                          <TextScramble className="meta-tag mxd-scramble">
                            Marketing
                          </TextScramble>
                          <TextScramble className="meta-tag mxd-scramble">
                            Website
                          </TextScramble>
                        </div>
                      </div>
                      <div className="col-6 col-md-6 col-xl-2 mxd-grid-padding">
                        <div className="mxd-projects-list__date">
                          <TextScramble className="meta-date mxd-scramble">
                            February
                          </TextScramble>
                          <TextScramble className="meta-date mxd-scramble">
                            2026
                          </TextScramble>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mxd-projects-list__divider bottom" />
                </Link>
                <Link
                  className="mxd-projects-list__item active-cursor-image active-cursor-permanent"
                  data-cursor-image="/img/works/showcase-archive/500x500_pr02.webp"
                  data-cursor-text="View Work"
                  href={`/project-details`}
                >
                  <div className="mxd-projects-list__divider top" />
                  <div className="container-fluid px-0 mxd-projects-list__inner">
                    <div className="row gx-0">
                      <div className="col-12 col-xl-2 mxd-grid-padding">
                        <div className="mxd-projects-list__niche">
                          <TextScramble className="meta-niche mxd-scramble">
                            Fashion
                          </TextScramble>
                        </div>
                      </div>
                      <div className="col-12 col-xl-6 mxd-grid-padding">
                        <div className="mxd-projects-list__title">
                          <h3>
                            Editorial
                            <br />
                            <span>illustrations set</span>
                          </h3>
                        </div>
                      </div>
                      <div className="col-6 col-md-6 col-xl-2 mxd-grid-padding">
                        <div className="mxd-projects-list__meta">
                          <TextScramble className="meta-tag mxd-scramble">
                            Midjourney
                          </TextScramble>
                          <TextScramble className="meta-tag mxd-scramble">
                            Illustrations
                          </TextScramble>
                          <TextScramble className="meta-tag mxd-scramble">
                            Design
                          </TextScramble>
                        </div>
                      </div>
                      <div className="col-6 col-md-6 col-xl-2 mxd-grid-padding">
                        <div className="mxd-projects-list__date">
                          <TextScramble className="meta-date mxd-scramble">
                            January
                          </TextScramble>
                          <TextScramble className="meta-date mxd-scramble">
                            2026
                          </TextScramble>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mxd-projects-list__divider bottom" />
                </Link>
                <Link
                  className="mxd-projects-list__item active-cursor-image active-cursor-permanent"
                  data-cursor-image="/img/works/showcase-archive/500x500_pr03.webp"
                  data-cursor-text="View Work"
                  href={`/project-details`}
                >
                  <div className="mxd-projects-list__divider top" />
                  <div className="container-fluid px-0 mxd-projects-list__inner">
                    <div className="row gx-0">
                      <div className="col-12 col-xl-2 mxd-grid-padding">
                        <div className="mxd-projects-list__niche">
                          <TextScramble className="meta-niche mxd-scramble">
                            Pets
                          </TextScramble>
                        </div>
                      </div>
                      <div className="col-12 col-xl-6 mxd-grid-padding">
                        <div className="mxd-projects-list__title">
                          <h3>
                            Interactive{" "}
                            <span>
                              media
                              <br />
                              concept
                            </span>
                          </h3>
                        </div>
                      </div>
                      <div className="col-6 col-md-6 col-xl-2 mxd-grid-padding">
                        <div className="mxd-projects-list__meta">
                          <TextScramble className="meta-tag mxd-scramble">
                            Brand
                          </TextScramble>
                          <TextScramble className="meta-tag mxd-scramble">
                            Social Media
                          </TextScramble>
                          <TextScramble className="meta-tag mxd-scramble">
                            Packaging
                          </TextScramble>
                        </div>
                      </div>
                      <div className="col-6 col-md-6 col-xl-2 mxd-grid-padding">
                        <div className="mxd-projects-list__date">
                          <TextScramble className="meta-date mxd-scramble">
                            January
                          </TextScramble>
                          <TextScramble className="meta-date mxd-scramble">
                            2026
                          </TextScramble>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mxd-projects-list__divider bottom" />
                </Link>
              </div>
              {/* all projects link */}
              <div className="mxd-object-link">
                <div className="container-fluid p-0">
                  <div className="row g-0 mxd-object-link__wrap">
                    <div className="col-12 col-md-6 col-xl-4 mxd-object-link__item justify-start">
                      <CommonScrollAnimated
                        className="mxd-object-link__object mxd-slide-object"
                        as="div"
                        animation="slideObject"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          version="1.1"
                          viewBox="0 0 259 260"
                        >
                          <path d="M143.9,0v28.8h-28.8V0h28.8ZM143.9,28.8v28.8h28.8v-28.8h-28.8ZM172.7,57.6v28.8h28.8v-28.8h-28.8ZM230.2,115.2v-28.8h-28.8v28.8H0v28.8h201.4v28.8h28.8v-28.8h28.8v-28.8h-28.8ZM172.7,201.6h28.8v-28.8h-28.8v28.8ZM143.9,230.4h28.8v-28.8h-28.8v28.8ZM114.3,260h28.8v-28.8h-28.8v28.8Z" />
                        </svg>
                      </CommonScrollAnimated>
                    </div>
                    <div className="col-12 col-md-6 col-xl-4 mxd-object-link__item justify-end">
                      <div className="mxd-object-link__content">
                        <div className="mxd-object-link__btnholder">
                          <Link
                            className="btn btn-line btn-line-default"
                            href={`/works-default`}
                          >
                            <TextScramble className="btn-caption mxd-scramble">
                              All Works
                            </TextScramble>
                          </Link>
                        </div>
                        <Link
                          className="mxd-object-link__media active-cursor-permanent"
                          data-cursor-text="All Works"
                          href={`/works-default`}
                        >
                          <MxdImgAnim
                            main={
                              <Image
                                className="centered-y"
                                alt="Project Preview Image"
                                src="/img/works/800x450_all03.webp"
                                width={800}
                                height={450}
                              />
                            }
                            absolutes={[
                              <Image
                                key="all02"
                                className="centered-y"
                                alt="Project Preview Image"
                                src="/img/works/800x450_all02.webp"
                                width={800}
                                height={450}
                              />,
                              <Image
                                key="all01"
                                className="centered-y"
                                alt="Project Preview Image"
                                src="/img/works/800x450_all01.webp"
                                width={800}
                                height={450}
                              />,
                              <Image
                                key="all04"
                                className="centered-y"
                                alt="Project Preview Image"
                                src="/img/works/800x450_all04.webp"
                                width={800}
                                height={450}
                              />,
                              <Image
                                key="all05"
                                className="centered-y"
                                alt="Project Preview Image"
                                src="/img/works/800x450_all05.webp"
                                width={800}
                                height={450}
                              />,
                              <Image
                                key="all06"
                                className="centered-y"
                                alt="Project Preview Image"
                                src="/img/works/800x450_all06.webp"
                                width={800}
                                height={450}
                              />,
                            ]}
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Block - Projects List End */}
          </div>
          <PinnedSection.Trigger />
        </PinnedSection.Inner>
      </PinnedSection>
    </>
  );
}
