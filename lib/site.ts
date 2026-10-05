/*
 * Public site URL, used for canonical links, the sitemap and structured
 * data. Set SITE_URL on Vercel when the site moves to its own domain.
 */
export const SITE_URL = (
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://ved-portfolio-nine.vercel.app"
).replace(/\/$/, "");

export const SITE_NAME = "Vedank Gaur";

/** Profiles that belong to the same person (schema.org sameAs). */
export const SAME_AS = [
  "https://www.linkedin.com/in/vedank-gaur/",
  "https://github.com/ved-casm",
  "https://www.behance.net/vedankgaur",
];
