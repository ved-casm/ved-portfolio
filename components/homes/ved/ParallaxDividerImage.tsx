import UkiyoParallax from "@/components/animations/UkiyoParallax";
import BlurSection from "@/components/animations/BlurSection";

export default function ParallaxDividerImage() {
  return (
    <>
      <BlurSection className="mxd-section">
        <div className="mxd-container fullwidth-container">
          <div className="mxd-divider">
            <UkiyoParallax
              className="mxd-divider__image divider-image-4 parallax-img"
              scale={1.4}
              speed={1.5}
              externalRAF={false}
            >
              {/* <Image class="parallax-img" src="/img/illustrations/1920x1080_divider-01.webp" alt=""> */}
            </UkiyoParallax>
          </div>
        </div>
      </BlurSection>
    </>
  );
}
