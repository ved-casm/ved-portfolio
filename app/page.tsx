import OrbFooterReveal from "@/components/footers/OrbFooterReveal";
import { Metadata } from "next";
import ServicesStackVideo from "@/components/homes/ved/ServicesStackVideo";
import ContourTimeline from "@/components/homes/ved/ContourTimeline/ContourTimeline";
import RevealHero from "@/components/homes/ved/newhero/RevealHero";
import MarqueeDivider from "@/components/homes/ved/MarqueeDivider";
import NewSection from "@/components/homes/ved/NewSection";
import DividerStickyCaption from "@/components/animations/DividerStickyCaption";

export const metadata: Metadata = {
  title: "Vedank Gaur | Frontend & UI/UX Designer",
  description:
    "Vedank Gaur designs and builds websites and digital products end to end, from the first sketch to launch. Based in Jaipur, IN.",
};

export default function HomePage() {
  return (
    <>
      <>
        <RevealHero videoSrc="/newhero.mp4" word="VEDANK" />
        {/* These template sections were designed on the light theme (their dark
            look comes from its "opposite" tokens), so keep light tokens here
            now that the site is always dark. display:contents = no layout box. */}
        <div color-scheme="light" style={{ display: "contents" }}>
          <MarqueeDivider />
          <ServicesStackVideo />
        </div>
        <ContourTimeline />
        <NewSection />
        <div color-scheme="light" style={{ display: "contents" }}>
        <DividerStickyCaption
          topCtaLabel="Services"
          topCtaHref="/services"
          captionCursorText="I do best"
          captionHref="/services"
          compact
          blurOverlay={false}
        >
          I Don't Handoff &nbsp;
          <span>Designs. <br /></span>I Ship Them.
        </DividerStickyCaption>
        </div>
      </>
      <OrbFooterReveal />
    </>
  );
}
