"use client";

import type { ReactNode } from "react";
import TextScramble from "@/components/animations/TextScramble";
import AutoplayLoopVideo from "@/components/media/AutoplayLoopVideo";
import { videoPoster, videoSources } from "@/lib/lazyVideo";
import CommonServicesStack, {
  ServicesStackSlot,
} from "@/components/animations/CommonServicesStack";

type Card = {
  subtitle: string;
  title: string;
  tagCols: [string[], string[]];
  video: string;
  descrClass: string;
  descr: ReactNode;
};

// Same service videos as the sticky-caption section on the home page.
const CARDS: Card[] = [
  {
    subtitle: "01 / Services",
    title: "Web Design",
    tagCols: [
      ["Website design", "Responsive layouts", "Design systems", "Typography"],
      ["Motion", "Figma", "Prototyping"],
    ],
    video: "/img/web-design.mp4",
    descrClass: "t-large t-bold services-card__descr",
    descr: (
      <>
        Websites that look like your brand and work like a product.{" "}
        <span>
          Every page is designed mobile-first, with a clear hierarchy and a
          layout system that stays consistent as the site grows.
        </span>
      </>
    ),
  },
  {
    subtitle: "02 / Services",
    title: "UI/UX Design",
    tagCols: [
      ["User research", "Wireframes", "User flows", "Usability testing"],
      ["UI kits", "Prototypes", "Accessibility"],
    ],
    video: "/img/ui-ux-design.mp4",
    descrClass: "t-bold t-large services-card__descr",
    descr: (
      <>
        Interfaces people understand at first glance.{" "}
        <span>
          I map the flows, test rough ideas early and deliver pixel-precise
          Figma files designed with the build in mind, so nothing gets lost in
          development.
        </span>
      </>
    ),
  },
  {
    subtitle: "03 / Services",
    title: "Landing Pages",
    tagCols: [
      ["Hero design", "Conversion layout", "Clear CTAs"],
      ["Next.js", "Animations", "Fast loading"],
    ],
    video: "/img/landing-page.mp4",
    descrClass: "t-bold t-large services-card__descr",
    descr: (
      <>
        One page, one goal.{" "}
        <span>
          Landing pages built around a single action: structured to convert,
          quick to load and ready for your next launch or campaign.
        </span>
      </>
    ),
  },
  {
    subtitle: "04 / Services",
    title: "E-Commerce",
    tagCols: [
      ["Storefront design", "Product pages", "Cart & checkout"],
      ["Next.js", "React", "Payment integration"],
    ],
    video: "/img/e-com.mp4",
    descrClass: "t-bold t-large services-card__descr",
    descr: (
      <>
        Online stores that make buying feel easy.{" "}
        <span>
          From product pages to checkout, I design and develop shopping
          experiences that keep carts moving and stay simple for you to manage.
        </span>
      </>
    ),
  },
  {
    subtitle: "05 / Services",
    title: "Virtual Assistant",
    tagCols: [
      ["Website updates", "Content uploads", "Email & calendar"],
      ["Research", "Admin support", "Reporting"],
    ],
    video: "/img/virtaul-assistant.mp4",
    descrClass: "t-bold t-large services-card__descr",
    descr: (
      <>
        An extra pair of hands for the day-to-day.{" "}
        <span>
          Website updates, content management, inbox and calendar handling,
          research: the routine work done reliably, so you can focus on the
          business.
        </span>
      </>
    ),
  },
];

function Tag({ children }: { children: string }) {
  return (
    <TextScramble className="tag tag-s-mobile mxd-scramble">
      {children}
    </TextScramble>
  );
}

function ServiceCard({ card, index }: { card: Card; index: number }) {
  const [colA, colB] = card.tagCols;
  return (
    <ServicesStackSlot part="card" index={index}>
      <div className="mxd-stack-services__card">
        <ServicesStackSlot part="wrapper" index={index}>
          <div className="services-card__wrapper">
            <div className="services-card__content">
              <div className="services-card__info">
                <div className="services-card__subtitle">
                  <Tag>{card.subtitle}</Tag>
                </div>
                <div className="services-card__title">
                  <ServicesStackSlot part="title" index={index}>
                    <div className="services-card__title-text">
                      {card.title}
                    </div>
                  </ServicesStackSlot>
                </div>
                <ServicesStackSlot part="tags" index={index}>
                  <div className="services-card__tags">
                    <div className="tags-column">
                      {colA.map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </div>
                    <div className="tags-column">
                      {colB.map((t) => (
                        <Tag key={t}>{t}</Tag>
                      ))}
                    </div>
                  </div>
                </ServicesStackSlot>
              </div>
              <ServicesStackSlot part="descr" index={index}>
                <div className={card.descrClass}>{card.descr}</div>
              </ServicesStackSlot>
            </div>
            <ServicesStackSlot part="image" index={index}>
              <div className="services-card__image">
                <AutoplayLoopVideo
                  sources={videoSources(card.video)}
                  poster={videoPoster(card.video)}
                  aria-label={card.title}
                />
                <div className="services-card__cover" />
              </div>
            </ServicesStackSlot>
          </div>
        </ServicesStackSlot>
      </div>
    </ServicesStackSlot>
  );
}

export default function ServicesDescriptionStack() {
  return (
    <div id="services" className="mxd-section">
      <div className="mxd-container fullwidth-container">
        <div className="mxd-block">
          <CommonServicesStack className="mxd-stack-services">
            {CARDS.map((card, index) => (
              <ServiceCard key={card.subtitle} card={card} index={index} />
            ))}
          </CommonServicesStack>
        </div>
      </div>
    </div>
  );
}
