import OrbFooterReveal from "@/components/footers/OrbFooterReveal";
import { Metadata } from "next";
import ServicesStackVideo from "@/components/homes/ved/ServicesStackVideo";
import ContourTimeline from "@/components/homes/ved/ContourTimeline/ContourTimeline";
import RevealHero from "@/components/homes/ved/newhero/RevealHero";
import MarqueeDivider from "@/components/homes/ved/MarqueeDivider";
import NewSection from "@/components/homes/ved/NewSection";
import DividerStickyCaption from "@/components/animations/DividerStickyCaption";
import { SAME_AS, SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Vedank Gaur | Frontend & UI/UX Designer",
  description:
    "Vedank Gaur designs and builds websites and digital products end to end, from the first sketch to launch. Based in Jaipur, IN.",
  alternates: { canonical: "/" },
};

// who this site belongs to, so a search for the name can point here
const personJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Vedank Gaur",
      url: SITE_URL,
      image: `${SITE_URL}/apple-icon.png`,
      jobTitle: "Frontend Developer & UI/UX Designer",
      address: { "@type": "PostalAddress", addressLocality: "Jaipur", addressRegion: "Rajasthan", addressCountry: "IN" },
      knowsAbout: ["Web design", "UI/UX design", "Frontend development", "Next.js", "React", "Three.js", "GSAP"],
      sameAs: SAME_AS,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: ["Vedank Gaur Portfolio", "VED"],
      publisher: { "@id": `${SITE_URL}/#person` },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      {/* the page's heading for search engines and screen readers; kept out
          of the hero so the wordmark / video fit is untouched */}
      <h1
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          margin: -1,
          padding: 0,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        Vedank Gaur, Frontend &amp; UI/UX Designer
      </h1>
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
          I Don&apos;t Handoff &nbsp;
          <span>Designs. <br /></span>I Ship Them.
        </DividerStickyCaption>
        </div>
      </>
      <OrbFooterReveal />
    </>
  );
}
