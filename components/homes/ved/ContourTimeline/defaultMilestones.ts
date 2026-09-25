export interface ContourMilestone {
  id: string;
  year: string;
  eyebrow: string;
  title: string;
  description: string;
  subtitle: string;
  media?: string;
  mediaType?: "image" | "video";
  ctaLabel?: string;
  ctaHref?: string;
}

export const DEFAULT_CONTOUR_MILESTONES: ContourMilestone[] = [
  {
    id: "01",
    year: "01",
    subtitle: "Discover",
    eyebrow: "01",
    title: "Discover",
    description:
      "Every project starts with understanding the actual problem, not direct Figma. I map user flows and business goals first, so the interface solves something real instead of just looking good.",
    media: "/process1.mp4",
    mediaType: "video",
  },
  {
    id: "02",
    year: "02",
    subtitle: "Design",
    eyebrow: "02",
    title: "Design",
    description:
      "UI design that balances usability with personality - wireframes to high-fidelity Figma files, built with production in mind from the first screen, not redesigned twice.",
    media: "/process2.mp4",
    mediaType: "video",
  },
  {
    id: "03",
    year: "03",
    subtitle: "Build",
    eyebrow: "03",
    title: "Build",
    description:
      "Design becomes a real, responsive interface - built with Next.js, React, and Tailwind CSS, coded the way it was designed, pixel for pixel.",
    media: "/process3.mp4",
    mediaType: "video",
  },
  {
    id: "04",
    year: "04",
    subtitle: "Ship & Optimize",
    eyebrow: "04",
    title: "Ship & Optimize",
    description:
      "Launch is the start, not the finish. I tune load times, fix layout shift, and clean up the small details that separate a finished site from a fast, polished one.",
    media: "/process4.mp4",
    mediaType: "video",
  },
];

