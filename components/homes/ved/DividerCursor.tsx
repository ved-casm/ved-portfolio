import BlurSection from "@/components/animations/BlurSection";
import CommonAnimatedText from "@/components/animations/CommonAnimatedText";
import Link from "next/link";
import Image from "next/image";
import TextScramble from "@/components/animations/TextScramble";
import CommonCursorTrailTransparent, {
  CommonCursorTrailContent,
  CommonCursorTrailImage,
  CommonCursorTrailWrapper,
} from "@/components/animations/CommonCursorTrailTransparent";

export default function DividerCursor() {
  return (
    <>
      <BlurSection className="mxd-section bg-color-base">
        <CommonCursorTrailTransparent
          as="div"
          className="cursor-trail-transparent"
        >
          {/* Effect - Cursor Trail Transparent Start */}
          <CommonCursorTrailWrapper className="mxd-trail-transparent-wrapper">
            <CommonCursorTrailContent className="mxd-trail-transparent-content">
              <CommonCursorTrailImage
                index={0}
                className="mxd-trail-transparent-image"
                alt="Azurio Template Cursor Trail Image"
                src="/img/cursor-trail-transparent/01_trail.webp"
                width={400}
                height={521}
              />
              <CommonCursorTrailImage
                index={1}
                className="mxd-trail-transparent-image"
                alt="Azurio Template Cursor Trail Image"
                src="/img/cursor-trail-transparent/02_trail.webp"
                width={412}
                height={400}
              />
              <CommonCursorTrailImage
                index={2}
                className="mxd-trail-transparent-image"
                alt="Azurio Template Cursor Trail Image"
                src="/img/cursor-trail-transparent/03_trail.webp"
                width={485}
                height={400}
              />
              <CommonCursorTrailImage
                index={3}
                className="mxd-trail-transparent-image"
                alt="Azurio Template Cursor Trail Image"
                src="/img/cursor-trail-transparent/04_trail.webp"
                width={530}
                height={400}
              />
              <CommonCursorTrailImage
                index={4}
                className="mxd-trail-transparent-image"
                alt="Azurio Template Cursor Trail Image"
                src="/img/cursor-trail-transparent/05_trail.webp"
                width={400}
                height={520}
              />
              <CommonCursorTrailImage
                index={5}
                className="mxd-trail-transparent-image"
                alt="Azurio Template Cursor Trail Image"
                src="/img/cursor-trail-transparent/06_trail.webp"
                width={407}
                height={400}
              />
              <CommonCursorTrailImage
                index={6}
                className="mxd-trail-transparent-image"
                alt="Azurio Template Cursor Trail Image"
                src="/img/cursor-trail-transparent/07_trail.webp"
                width={400}
                height={480}
              />
              <CommonCursorTrailImage
                index={7}
                className="mxd-trail-transparent-image"
                alt="Azurio Template Cursor Trail Image"
                src="/img/cursor-trail-transparent/08_trail.webp"
                width={637}
                height={400}
              />
              <CommonCursorTrailImage
                index={8}
                className="mxd-trail-transparent-image"
                alt="Azurio Template Cursor Trail Image"
                src="/img/cursor-trail-transparent/09_trail.webp"
                width={400}
                height={992}
              />
            </CommonCursorTrailContent>
          </CommonCursorTrailWrapper>
          {/* Effect - Cursor Trail Transparent End */}
          {/* Divider - Divider XL Start */}
          <div className="mxd-container">
            <div className="mxd-divider-xl padding-top-subtitle padding-bottom-default">
              <div className="mxd-divider-xl__content">
                <div className="mxd-divider-xl__btngroup difference">
                  <Link
                    className="btn btn-line btn-line-permanent"
                    href={`/contact`}
                  >
                    <TextScramble className="btn-caption mxd-scramble">
                      Contact
                    </TextScramble>
                  </Link>
                </div>
                <div className="mxd-divider-xl__caption difference">
                  <Link
                    className="active-cursor-permanent"
                    data-cursor-text="Let's Talk"
                    href={`/contact`}
                  >
                    <CommonAnimatedText
                      as="h2"
                      className="mxd-split-lines permanent"
                      animation="splitLines"
                    >
                      Ready for the game changing website?
                    </CommonAnimatedText>
                  </Link>
                </div>
                <div className="mxd-divider-gif">
                  <div className="mxd-divider-gif__back left accent">
                    <Image
                      alt="Azurio Template Example Image"
                      src="/img/gifs/nice-thumbs-up.gif"
                      width={640}
                      height={440}
                    />
                  </div>
                  <div className="mxd-divider-gif__front">
                    <Image
                      alt="Azurio Template Example Image"
                      src="/img/gifs/nice-thumbs-up.gif"
                      width={640}
                      height={440}
                    />
                  </div>
                  <div className="mxd-divider-gif__back right accent">
                    <Image
                      alt="Azurio Template Example Image"
                      src="/img/gifs/nice-thumbs-up.gif"
                      width={640}
                      height={440}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Divider - Divider XL End */}
        </CommonCursorTrailTransparent>
      </BlurSection>
    </>
  );
}
