import { onWidthResize } from "@/lib/widthResize";

const resizeTo = (w: number, h: number) => {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: w });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: h });
  window.dispatchEvent(new Event("resize"));
};

describe("onWidthResize", () => {
  beforeEach(() => resizeTo(1024, 768));

  it("ignores height-only resizes (mobile address bar)", () => {
    const cb = jest.fn();
    const off = onWidthResize(cb);
    resizeTo(1024, 700);
    resizeTo(1024, 768);
    expect(cb).not.toHaveBeenCalled();
    off();
  });

  it("fires when the width changes", () => {
    const cb = jest.fn();
    const off = onWidthResize(cb);
    resizeTo(800, 768);
    expect(cb).toHaveBeenCalledTimes(1);
    off();
  });

  it("stops listening after cleanup", () => {
    const cb = jest.fn();
    const off = onWidthResize(cb);
    off();
    resizeTo(500, 768);
    expect(cb).not.toHaveBeenCalled();
  });
});
