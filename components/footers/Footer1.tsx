import BlurSection from "@/components/animations/BlurSection";
import CommonAnimatedText from "@/components/animations/CommonAnimatedText";
import Link from "next/link";
import Image from "next/image";
import TextScramble from "@/components/animations/TextScramble";
import { RESUME_FILE, RESUME_URL } from "@/lib/resume";
import FooterBackToTop from "@/components/footers/FooterBackToTop";
import {
  CommonScrollAnimated,
  CommonScrollAnimatedLink,
} from "@/components/animations/CommonScrollAnimated";
import SmoothAnchorLink from "@/components/common/SmoothAnchorLink";
import {
  footer1BackgroundImages,
  footer1ForegroundImages,
  footer1NavColumns,
} from "@/data/footer";

const navLinkClass = "anim-uni-slide-down";

export default function Footer1() {
  return (
    <BlurSection as="footer" className="mxd-demo-footer">
      {/* Footer Block - Background Start */}
      <div className="mxd-demo-footer__background">
        {footer1BackgroundImages.map((layer) => (
          <div key={layer.src} className={layer.wrapperClass}>
            <Image
              alt={layer.alt}
              src={layer.src}
              width={layer.width}
              height={layer.height}
            />
          </div>
        ))}
      </div>
      {/* Footer Block - Background End */}
      <div className="mxd-container grid-l-container">
        {/* Footer Block - Navigation Start */}
        <div className="mxd-block">
          <div className="container-fluid p-0">
            <div className="row g-0">
              <div className="col-12 col-xxl-4 mxd-demo-footer__item mxd-grid-item">
                <CommonScrollAnimated
                  className="mxd-demo-footer__logo anim-uni-in-up"
                  as="div"
                  animation="inUp"
                >
                  <Link className="mxd-logo" href={`/`}>
                    <img
                      className="mxd-logo__image"
                      src="/monogram-white.avif"
                      alt=""
                    />
                    {/* logo text */}
                    <div className="mxd-logo__text">
                      <TextScramble className="mxd-scramble">
                        VEDANK
                      </TextScramble>
                      <TextScramble className="mxd-scramble">GAUR</TextScramble>
                    </div>
                  </Link>
                </CommonScrollAnimated>
                <div className="mxd-demo-footer__slogan">
                  <CommonAnimatedText
                    as="p"
                    className="t-bold t-large t-120 mxd-split-lines-reverse"
                    animation="splitLinesReverse"
                  >
                    Web Designer & UI/UX Designer &nbsp;
                    <span>in Jaipur</span>
                  </CommonAnimatedText>
                </div>
                <CommonScrollAnimated
                  className="mxd-demo-footer__btn anim-uni-in-up"
                  as="div"
                  animation="inUp"
                >
                  <Link
                    className="btn btn-default-icon-small btn-default-fullwidth-mobile btn-default-outline slide-right-up"
                    href="/contact"
                  >
                    <TextScramble className="btn-caption mxd-scramble">
                      Contact Me
                    </TextScramble>
                    {/* <i class="btn-icon ph-bold ph-arrow-right"></i> */}
                    <i className="btn-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                        viewBox="0 0 18 18"
                      >
                        <path d="M18,0v14.4h-3.6v-7.2h-3.6v-3.6H3.6V0h14.4ZM7.2,10.8h3.6v-3.6h-3.6s0,3.6,0,3.6ZM3.6,14.4h3.6v-3.6h-3.6v3.6ZM0,18h3.6v-3.6H0v3.6Z" />
                      </svg>
                    </i>
                  </Link>
                  <a
                    className="btn btn-default-icon-small btn-default-fullwidth-mobile btn-default-outline slide-right-up"
                    href={RESUME_URL}
                    download={RESUME_FILE}
                  >
                    <TextScramble className="btn-caption mxd-scramble">
                      Download Resume
                    </TextScramble>
                    <i className="btn-icon">
                      {/* the same arrow, turned to point down-right */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                        viewBox="0 0 18 18"
                        style={{ transform: "rotate(90deg)" }}
                      >
                        <path d="M18,0v14.4h-3.6v-7.2h-3.6v-3.6H3.6V0h14.4ZM7.2,10.8h3.6v-3.6h-3.6s0,3.6,0,3.6ZM3.6,14.4h3.6v-3.6h-3.6v3.6ZM0,18h3.6v-3.6H0v3.6Z" />
                      </svg>
                    </i>
                  </a>
                </CommonScrollAnimated>
              </div>
              <div className="col-12 col-xxl-8 mxd-demo-footer__item">
                <nav className="mxd-demo-footer__nav">
                  <div className="container-fluid p-0">
                    <div className="row g-0">
                      {footer1NavColumns.map((column, columnIndex) => (
                        <div
                          key={`footer-nav-col-${columnIndex}`}
                          className={column.className}
                        >
                          {column.blocks.map((block) => (
                            <div
                              key={block.title}
                              className="mxd-demo-footer-nav__block"
                            >
                              <div className="mxd-footer-nav02__title">
                                <CommonScrollAnimated
                                  className="footer-data anim-uni-slide-down"
                                  as="p"
                                  animation="slideDownLine"
                                >
                                  <span>{block.title}</span>
                                </CommonScrollAnimated>
                              </div>
                              <div className="mxd-footer-nav02__list">
                                <ul
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.8rem",
                                  }}
                                >
                                  {block.links.map((link) => (
                                    <li key={`${block.title}-${link.href}`}>
                                      <CommonScrollAnimatedLink
                                        className={navLinkClass}
                                        href={link.href}
                                        animation="slideDownLine"
                                        style={{
                                          fontSize:
                                            "clamp(2.2rem, 3.2vw, 3.8rem)",
                                          fontWeight: 700,
                                          lineHeight: 1.2,
                                          letterSpacing: "-0.02em",
                                          color: "#ffffff",
                                        }}
                                      >
                                        <span>{link.label}</span>
                                      </CommonScrollAnimatedLink>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
        {/* Footer Block - Navigation End */}
        {/* Footer Block - Controls Start */}
        <div className="mxd-block">
          <div className="container-fluid p-0">
            <div className="row g-0">
              {/* <div class="col-12 col-xl-6 mxd-footer__item"></div> */}
              <div className="col-12 mxd-footer__item mxd-grid-item">
                <div className="mxd-footer__controls-middle controls-landing caption-small">
                  <CommonScrollAnimated
                    className="anim-uni-slide-down"
                    as="div"
                    animation="slideDownLine"
                  >
                    <FooterBackToTop />
                  </CommonScrollAnimated>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Footer Block - Controls End */}
        {/* Footer Block - Fullwidth Text Start */}
        <div className="mxd-block">
          <div className="mxd-footer__fw-mark mxd-grid-item">
            <CommonScrollAnimated
              className="mxd-footer__planet01 anim-uni-in-up"
              as="div"
              animation="inUp"
            >
              <Image
                className="mxd-move-slow"
                alt=""
                src="/img/demo/planet-01.avif"
                width={400}
                height={404}
              />
            </CommonScrollAnimated>
            <div className="fw-mark__wrap">
              <Link
                className="fw-mark__content small justify-content-center"
                href="/"
                aria-label="Vedank Gaur, home"
              >
                <CommonAnimatedText
                  as="span"
                  className="anim-uni-chars"
                  animation="animChars"
                >
                  VEDANK
                </CommonAnimatedText>
              </Link>
            </div>
            <CommonScrollAnimated
              className="mxd-footer__planet02 anim-uni-in-up"
              as="div"
              animation="inUp"
            >
              <Image
                className="mxd-move"
                alt=""
                src="/img/demo/planet-02.avif"
                width={250}
                height={255}
              />
            </CommonScrollAnimated>
          </div>
        </div>
        {/* Footer Block - Fullwidth Text End */}
      </div>
      {/* Footer Block - Foreground Start */}
      <div className="mxd-demo-footer__foreground">
        {footer1ForegroundImages.map((layer) => (
          <div key={layer.src} className={layer.wrapperClass}>
            <Image
              alt={layer.alt}
              src={layer.src}
              width={layer.width}
              height={layer.height}
            />
          </div>
        ))}
      </div>
      {/* Footer Block - Foreground End */}
      <div className="mxd-container grid-l-container">
        {/* Footer Block - Data Start */}
        <div className="mxd-block">
          <div className="mxd-footer__data caption-small">
            <div className="container-fluid p-0">
              <div className="row g-0">
                <div className="col-12 col-xl-4 col-xxl-6 mxd-footer__item mxd-grid-item">
                  <CommonScrollAnimated
                    className="mxd-footer__data-item anim-uni-fade-in"
                    as="div"
                    animation="fadeIn"
                  >
                    <p className="footer-data bright">
                      <span>Copyright Vedank. All rights reserved</span>
                    </p>
                  </CommonScrollAnimated>
                </div>
                <div className="col-12 col-xl-8 col-xxl-6 mxd-footer__item">
                  <div className="container-fluid p-0">
                    <div className="row g-0">
                      <div className="col-12 col-xl-6 mxd-grid-item">
                        <CommonScrollAnimated
                          className="mxd-footer__data-item anim-uni-fade-in"
                          as="div"
                          animation="fadeIn"
                        >
                          <p className="footer-data bright">
                            <span>
                              Made with ❤️ by&nbsp;
                              <Link href="/">
                                <TextScramble className="mxd-scramble">
                                  VED
                                </TextScramble>
                              </Link>
                            </span>
                          </p>
                        </CommonScrollAnimated>
                      </div>
                      <div className="col-12 col-xl-6 mxd-grid-item">
                        <CommonScrollAnimated
                          className="mxd-footer__data-item anim-uni-fade-in justify-end"
                          as="div"
                          animation="fadeIn"
                        >
                          <p className="footer-data bright">
                            <span>©{new Date().getFullYear()}</span>
                          </p>
                        </CommonScrollAnimated>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Footer Block - Data End */}
      </div>
    </BlurSection>
  );
}
