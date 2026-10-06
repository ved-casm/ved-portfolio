import fs from "node:fs";
import path from "node:path";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { projects } from "@/components/projects/showcase/projectShowcaseData";
import { RESUME_FILE, RESUME_URL } from "@/lib/resume";
import { SAME_AS, SITE_URL } from "@/lib/site";

describe("sitemap.xml", () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  it("lists the main pages and every project", () => {
    for (const p of ["", "/about", "/works", "/services", "/contact"]) {
      expect(urls).toContain(`${SITE_URL}${p}`);
    }
    for (const p of projects) expect(urls).toContain(`${SITE_URL}/works/${p.slug}`);
    expect(entries).toHaveLength(5 + projects.length);
  });

  it("uses absolute URLs without duplicates and ranks the home page first", () => {
    expect(new Set(urls).size).toBe(urls.length);
    urls.forEach((u) => expect(u).toMatch(/^https?:\/\//));
    expect(entries[0]).toMatchObject({ url: SITE_URL, priority: 1 });
  });
});

describe("robots.txt", () => {
  const r = robots();

  it("allows crawling except the API and points at the sitemap", () => {
    expect(r.rules).toEqual({ userAgent: "*", allow: "/", disallow: "/api/" });
    expect(r.sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });
});

describe("site constants", () => {
  it("has no trailing slash on the site URL", () => {
    expect(SITE_URL.endsWith("/")).toBe(false);
  });

  it("links the profiles that belong to the same person", () => {
    expect(SAME_AS).toEqual(expect.arrayContaining([expect.stringContaining("linkedin.com")]));
  });
});

describe("resume download", () => {
  it("points at a PDF that ships in public/", () => {
    expect(RESUME_URL.endsWith(RESUME_FILE)).toBe(true);
    const file = path.join(process.cwd(), "public", RESUME_URL);
    expect(fs.existsSync(file)).toBe(true);
    expect(fs.readFileSync(file).subarray(0, 4).toString()).toBe("%PDF");
  });
});

describe("link preview images", () => {
  it.each(["app/opengraph-image.jpg", "app/twitter-image.jpg"])(
    "%s exists with alt text",
    (img) => {
      expect(fs.existsSync(path.join(process.cwd(), img))).toBe(true);
      const alt = img.replace(/\.jpg$/, ".alt.txt");
      expect(fs.readFileSync(path.join(process.cwd(), alt), "utf8").trim().length).toBeGreaterThan(10);
    },
  );
});
