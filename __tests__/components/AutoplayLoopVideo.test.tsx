import { render } from "@testing-library/react";
import AutoplayLoopVideo, { toPublicMediaUrl } from "@/components/media/AutoplayLoopVideo";

describe("toPublicMediaUrl", () => {
  it("leaves absolute and root paths alone", () => {
    expect(toPublicMediaUrl("/video/a.mp4")).toBe("/video/a.mp4");
    expect(toPublicMediaUrl("https://cdn.example.com/a.mp4")).toBe("https://cdn.example.com/a.mp4");
  });

  it("roots relative public paths", () => {
    expect(toPublicMediaUrl("video/a.mp4")).toBe("/video/a.mp4");
    expect(toPublicMediaUrl("./img/a.mp4")).toBe("/img/a.mp4");
    expect(toPublicMediaUrl("")).toBe("");
  });
});

describe("<AutoplayLoopVideo />", () => {
  const sources = [
    { src: "video/a.webm", type: "video/webm" },
    { src: "/video/a.mp4", type: "video/mp4" },
  ];

  it("renders a muted, looping, inline video that downloads nothing up front", () => {
    const { container } = render(<AutoplayLoopVideo sources={sources} poster="video/a.avif" aria-label="Reel" />);
    const v = container.querySelector("video")!;
    expect(v.muted).toBe(true);
    expect(v).toHaveAttribute("loop");
    expect(v).toHaveAttribute("playsinline");
    expect(v).toHaveAttribute("preload", "none");
    expect(v).toHaveAttribute("poster", "/video/a.avif");
    expect(v).toHaveAttribute("data-autoplay", "auto");
    expect(v).toHaveAttribute("aria-label", "Reel");
  });

  it("lists the sources in order with rooted URLs", () => {
    const { container } = render(<AutoplayLoopVideo sources={sources} />);
    const s = [...container.querySelectorAll("source")].map((el) => [el.getAttribute("src"), el.getAttribute("type")]);
    expect(s).toEqual([
      ["/video/a.webm", "video/webm"],
      ["/video/a.mp4", "video/mp4"],
    ]);
  });

  it("can be left for its owner to play", () => {
    const { container } = render(<AutoplayLoopVideo sources={sources} manual />);
    expect(container.querySelector("video")).toHaveAttribute("data-autoplay", "manual");
  });
});
