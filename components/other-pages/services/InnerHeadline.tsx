"use client";

import AutoplayLoopVideo from "@/components/media/AutoplayLoopVideo";
import PinnedSection from "@/components/animations/PinnedSection";
import Link from "next/link";
import CommonLoadAnimation, {
  CommonLoadFade,
} from "@/components/animations/CommonLoadAnimation";
import CommonAnimatedText from "@/components/animations/CommonAnimatedText";
import TextScramble from "@/components/animations/TextScramble";
import SmoothAnchorLink from "@/components/common/SmoothAnchorLink";
import { videoPoster, videoSources } from "@/lib/lazyVideo";

export default function InnerHeadline() {
  return (
    <CommonLoadAnimation>
      <>
        <PinnedSection className="mxd-section">
          <PinnedSection.Inner>
            <div className="mxd-container fullwidth-container">
              {/* Block - Inner Headline v03 Start */}
              <div className="mxd-block loading-wrap">
                <div className="inner-headline fullheight">
                  <div className="inner-headline__bg">
                    <div
                      className="video parallax-video"
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <AutoplayLoopVideo
                        poster={videoPoster("/video/1280x720_stone-geometry.mp4")}
                        sources={videoSources("/video/1280x720_stone-geometry.mp4")}
                      />
                    </div>
                    <div className="inner-headline__cover" />
                  </div>
                  {/* bottom positioned headline */}
                  <div className="inner-headline__bottom">
                    <div className="mxd-container grid-l-container">
                      <div className="container-fluid p-0">
                        <div className="row g-0">
                          <div className="col-12">
                            {/* content */}
                            <div className="inner-headline__content has-medium-title">
                              <div className="container-fluid p-0">
                                <div className="row g-0">
                                  <div className="col-12 col-xl-10 mxd-grid-item">
                                    <CommonLoadFade index={1}>
                                      <div className="inner-headline__link loading-fade">
                                        <SmoothAnchorLink
                                          className="btn btn-line btn-line-permanent"
                                          targetId="services"
                                        >
                                          <TextScramble className="btn-caption mxd-scramble">
                                            Services
                                          </TextScramble>
                                        </SmoothAnchorLink>
                                      </div>
                                    </CommonLoadFade>
                                    <div className="inner-headline__title">
                                      <CommonAnimatedText
                                        as="h1"
                                        className="medium permanent loading-split"
                                        animation="splitLinesLoad"
                                      >
                                        Designed with intent.{" "}
                                        <span>Built to ship.</span>
                                      </CommonAnimatedText>
                                    </div>
                                  </div>
                                  <div className="col-12 col-xl-2 mxd-grid-item">
                                    <CommonLoadFade index={2}>
                                      <div className="inner-headline__btngroup align-end-desktop tags-medium-title loading-fade">
                                        <SmoothAnchorLink
                                          className="btn btn-line-icon btn-line-icon-small btn-line-permanent slide-down"
                                          targetId="services"
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
                                    </CommonLoadFade>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Block - Inner Headline v03 End */}
            </div>
            <PinnedSection.Trigger />
          </PinnedSection.Inner>
        </PinnedSection>
      </>
    </CommonLoadAnimation>
  );
}
