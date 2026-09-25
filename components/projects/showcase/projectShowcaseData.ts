export type ShowcaseMedia =
  | { type: "image"; src: string; alt?: string }
  | { type: "video"; src: string; poster?: string };

export type ShowcaseProject = {
  /** URL segment: /works/<slug> */
  slug: string;
  /** Page <title> / description */
  seoTitle: string;
  seoDescription: string;
  intro: {
    primary: ShowcaseMedia;
    secondary: ShowcaseMedia;
    titleLines: string[];
  };
  context: {
    categories: string[];
    paragraphs: string[];
    links: { label: string; href: string; variant: "experience" | "credits" }[];
  };
  ellipse: ShowcaseMedia;
  /** 8 works best: the gallery shows 5 at a time around a large centre slide.
   *  Its first images also become the hover previews when this project is
   *  "Up next" on the previous page. */
  gallery: ShowcaseMedia[];
};

/** What the "Up next" panel needs; built from the following project. */
export type ShowcaseNext = {
  leftWord: string;
  rightWord: string;
  name: string;
  href: string;
  medias: { src: string; logo?: boolean }[];
};

// ---------------------------------------------------------------------------
// Placeholder media: each project only has one image in /public so far, so
// galleries borrow the others. Replace per project as real assets arrive.
// ---------------------------------------------------------------------------
const IMG = {
  athlnk: { type: "video", src: "/showcase.mp4" } as ShowcaseMedia,
  athlnkAlt: { type: "video", src: "/showcase1.mp4" } as ShowcaseMedia,
  foreward: { type: "image", src: "/Foreward.png", alt: "Foreward Golf" } as ShowcaseMedia,
  cocogirl: { type: "image", src: "/Cocogirl.png", alt: "Cocogirl AI" } as ShowcaseMedia,
  clear: { type: "image", src: "/Clear.png", alt: "Clear Place" } as ShowcaseMedia,
  ascension: { type: "image", src: "/Ascension.png", alt: "Ascension Healthcare" } as ShowcaseMedia,
  greenfrog: { type: "image", src: "/GreenFrog.png", alt: "GreenFrog Cleaning" } as ShowcaseMedia,
};
const ALL: ShowcaseMedia[] = [
  IMG.foreward,
  IMG.cocogirl,
  IMG.athlnk,
  IMG.clear,
  IMG.ascension,
  IMG.greenfrog,
  IMG.athlnkAlt,
];
/** own media first, then the rest, 8 in total */
const galleryFor = (...own: ShowcaseMedia[]) =>
  [...own, ...ALL.filter((m) => !own.includes(m))].concat(ALL).slice(0, 8);
const LOGO = { src: "/newmonogram-white.png", logo: true };
const contactLinks = (label: string) => [
  { label, href: "/contact", variant: "experience" as const },
  { label: "Start a similar project", href: "/services", variant: "credits" as const },
];

// ---------------------------------------------------------------------------
// Projects, in "Up next" order (the last one links back to the first).
// ---------------------------------------------------------------------------
export const projects: ShowcaseProject[] = [
  {
    slug: "athlnk",
    seoTitle: "AthLnk Platform | Works | Vedank Gaur",
    seoDescription: "AthLnk: product design and Next.js frontend for a platform connecting athletes, coaches and scouts.",
    intro: { primary: IMG.athlnkAlt, secondary: IMG.athlnk, titleLines: ["AthLnk", "Platform"] },
    context: {
      categories: ["UI/UX Design", "Next.js", "Logo Design"],
      paragraphs: [
        "A platform that connects athletes, coaches and scouts in one place, designed to make talent easy to discover.",
        "I led the product design and built the frontend: a design system in Figma, responsive layouts in Next.js, TypeScript and Tailwind, and motion that keeps browsing profiles fast and clear.",
      ],
      links: contactLinks("Discuss this project"),
    },
    ellipse: IMG.athlnkAlt,
    gallery: galleryFor(IMG.athlnk, IMG.athlnkAlt),
  },
  {
    slug: "foreward-golf",
    seoTitle: "Foreward Golf | Works | Vedank Gaur",
    seoDescription: "Foreward Golf: brand website, graphic design and parallax UI in React.",
    intro: { primary: IMG.foreward, secondary: IMG.athlnkAlt, titleLines: ["Foreward", "Golf"] },
    context: {
      categories: ["React.js", "Parallax UI", "Graphic Design"],
      paragraphs: [
        "A brand website for golf clubs designed with zero gimmicks, where the product and the craft behind it do the talking.",
        "I handled the logo, graphics and copy, and built the site in React with Bootstrap and custom CSS, using parallax sections to give each club room to breathe.",
      ],
      links: contactLinks("Discuss this project"),
    },
    ellipse: IMG.foreward,
    gallery: galleryFor(IMG.foreward),
  },
  {
    slug: "cocogirl-ai",
    seoTitle: "Cocogirl AI | Works | Vedank Gaur",
    seoDescription: "Cocogirl AI: messaging UI and Next.js frontend for an AI character chat app.",
    intro: { primary: IMG.cocogirl, secondary: IMG.athlnk, titleLines: ["Cocogirl", "AI"] },
    context: {
      categories: ["Next.js", "Messaging Design", "Shadcn UI"],
      paragraphs: [
        "An AI chat experience built around character profiles, where conversations should feel personal and effortless.",
        "I designed the messaging flows and the brand mark, and built the interface in Next.js and TypeScript with Tailwind, Shadcn UI and subtle motion.",
      ],
      links: contactLinks("Discuss this project"),
    },
    ellipse: IMG.cocogirl,
    gallery: galleryFor(IMG.cocogirl),
  },
  {
    slug: "clear-place",
    seoTitle: "Clear Place | Works | Vedank Gaur",
    seoDescription: "Clear Place: CRM dashboard, payments and kanban boards in one brand platform.",
    intro: { primary: IMG.clear, secondary: IMG.athlnkAlt, titleLines: ["Clear", "Place"] },
    context: {
      categories: ["CRM Dashboard", "React.js", "Payment Portal"],
      paragraphs: [
        "One platform with every tool a brand needs: customers, payments and projects managed from a single place.",
        "I designed and built the CRM dashboard, payment portal and kanban boards in React with Bootstrap, keeping dense data readable and quick to act on.",
      ],
      links: contactLinks("Discuss this project"),
    },
    ellipse: IMG.clear,
    gallery: galleryFor(IMG.clear),
  },
  {
    slug: "ascension-healthcare",
    seoTitle: "Ascension Healthcare | Works | Vedank Gaur",
    seoDescription: "Ascension Healthcare: patient report dashboard with live data in React.",
    intro: { primary: IMG.ascension, secondary: IMG.athlnk, titleLines: ["Ascension", "Healthcare"] },
    context: {
      categories: ["Dashboard", "React.js", "Web Sockets"],
      paragraphs: [
        "A healthcare dashboard that turns patient reports into clear summaries clinicians can scan at a glance.",
        "I built the interface in React with Terra UI and Tailwind, integrated the reporting APIs and used web sockets so report updates arrive live.",
      ],
      links: contactLinks("Discuss this project"),
    },
    ellipse: IMG.ascension,
    gallery: galleryFor(IMG.ascension),
  },
  {
    slug: "greenfrog-cleaning",
    seoTitle: "GreenFrog Cleaning | Works | Vedank Gaur",
    seoDescription: "GreenFrog Cleaning: booking portal, CRM and payments for a cleaning company.",
    intro: { primary: IMG.greenfrog, secondary: IMG.athlnkAlt, titleLines: ["GreenFrog", "Cleaning"] },
    context: {
      categories: ["Booking Portal", "CRM Dashboard", "React.js"],
      paragraphs: [
        "A cleaning company's online home, where customers book in a few taps and the team manages every job from one dashboard.",
        "I designed the brand mark and built the booking portal, CRM and payment flows in React with Bootstrap and custom CSS.",
      ],
      links: contactLinks("Discuss this project"),
    },
    ellipse: IMG.greenfrog,
    gallery: galleryFor(IMG.greenfrog),
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

/** The following project (wrapping around), shaped for the "Up next" panel. */
export function getNext(slug: string): ShowcaseNext {
  const i = projects.findIndex((p) => p.slug === slug);
  const next = projects[(i + 1) % projects.length];
  // 4 image previews from the next project's gallery, logo in the middle
  const imgs = next.gallery
    .filter((m): m is Extract<ShowcaseMedia, { type: "image" }> => m.type === "image")
    .slice(0, 4)
    .map((m) => ({ src: m.src }));
  return {
    leftWord: "Up",
    rightWord: "next",
    name: next.intro.titleLines.join(" ").toLowerCase(),
    href: `/works/${next.slug}`,
    medias: [...imgs.slice(0, 2), LOGO, ...imgs.slice(2)],
  };
}
