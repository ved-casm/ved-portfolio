import { ATHLNK_REEL, startLazyVideos, videoPoster, videoSources } from "@/lib/lazyVideo";

describe("video helpers", () => {
  it("serves an MP4 source", () => {
    expect(videoSources("/video/a.mp4")).toEqual([{ src: "/video/a.mp4", type: "video/mp4" }]);
  });

  it("derives the poster next to the video", () => {
    expect(videoPoster("/video/a.mp4")).toBe("/video/a-poster.avif");
  });

  it("offers the AthLnk reel as AV1 WebM first, MP4 second", () => {
    expect(ATHLNK_REEL.sources[0].type).toMatch(/^video\/webm/);
    expect(ATHLNK_REEL.sources[1].type).toBe("video/mp4");
  });
});

describe("startLazyVideos", () => {
  type Entry = { target: Element; isIntersecting: boolean };
  let callback: (entries: Entry[]) => void;
  const observed: Element[] = [];
  const disconnect = jest.fn();

  beforeEach(() => {
    observed.length = 0;
    disconnect.mockClear();
    (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = jest.fn((cb) => {
      callback = cb;
      return { observe: (el: Element) => observed.push(el), disconnect };
    });
    document.body.innerHTML = `
      <video id="auto" data-autoplay="auto"></video>
      <video id="manual" data-autoplay="manual"></video>`;
  });

  it("watches only data-autoplay=auto videos", () => {
    const stop = startLazyVideos();
    expect(observed.map((el) => el.id)).toEqual(["auto"]);
    stop();
    expect(disconnect).toHaveBeenCalled();
  });

  it("plays a video as it nears the viewport and pauses it when it leaves", () => {
    const stop = startLazyVideos();
    const v = document.getElementById("auto") as HTMLVideoElement;
    const play = jest.spyOn(v, "play").mockResolvedValue(undefined);
    const pause = jest.spyOn(v, "pause").mockImplementation(() => {});

    callback([{ target: v, isIntersecting: true }]);
    expect(play).toHaveBeenCalled();
    expect(v.muted).toBe(true);

    Object.defineProperty(v, "paused", { configurable: true, get: () => false });
    callback([{ target: v, isIntersecting: false }]);
    expect(pause).toHaveBeenCalled();
    stop();
  });

  it("picks up videos added after start", async () => {
    const stop = startLazyVideos();
    const late = document.createElement("video");
    late.id = "late";
    late.dataset.autoplay = "auto";
    document.body.appendChild(late);
    await new Promise((r) => setTimeout(r, 0)); // MutationObserver is async
    expect(observed.map((el) => el.id)).toContain("late");
    stop();
  });
});
