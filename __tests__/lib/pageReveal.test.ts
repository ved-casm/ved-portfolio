// the module keeps state, so each test gets a fresh copy
const load = async () => {
  jest.resetModules();
  return import("@/lib/pageReveal");
};

describe("page reveal signal", () => {
  it("runs waiting callbacks once, when the page is revealed", async () => {
    const { onPageRevealed, markPageRevealed } = await load();
    const cb = jest.fn();
    onPageRevealed(cb);
    expect(cb).not.toHaveBeenCalled();
    markPageRevealed();
    markPageRevealed();
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("runs a late callback straight away", async () => {
    const { onPageRevealed, markPageRevealed } = await load();
    markPageRevealed();
    const cb = jest.fn();
    onPageRevealed(cb);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("can unsubscribe before the reveal", async () => {
    const { onPageRevealed, markPageRevealed } = await load();
    const cb = jest.fn();
    const off = onPageRevealed(cb);
    off();
    markPageRevealed();
    expect(cb).not.toHaveBeenCalled();
  });
});
