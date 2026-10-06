import { act, fireEvent, render, screen } from "@testing-library/react";
import TextScramble from "@/components/animations/TextScramble";

describe("<TextScramble />", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("renders its text in the chosen element", () => {
    render(
      <TextScramble as="p" className="tag">
        {"  Resume  "}
      </TextScramble>,
    );
    const el = screen.getByText("Resume");
    expect(el.tagName).toBe("P");
    expect(el).toHaveClass("tag");
  });

  it("scrambles on hover and settles back on the real text", () => {
    render(<TextScramble>Contact</TextScramble>);
    const el = screen.getByText("Contact");
    fireEvent.pointerEnter(el);
    act(() => {
      jest.advanceTimersByTime(40);
    });
    expect(el.textContent).toHaveLength("Contact".length);
    act(() => {
      jest.advanceTimersByTime(40 * 4 * "Contact".length + 200);
    });
    expect(el.textContent).toBe("Contact");
  });

  it("restores the text when the pointer leaves mid-scramble", () => {
    render(<TextScramble>Works</TextScramble>);
    const el = screen.getByText("Works");
    fireEvent.pointerEnter(el);
    act(() => {
      jest.advanceTimersByTime(80);
    });
    fireEvent.pointerLeave(el);
    expect(el.textContent).toBe("Works");
  });
});
