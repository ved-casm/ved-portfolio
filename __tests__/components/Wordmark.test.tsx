import { render, screen } from "@testing-library/react";
import Wordmark from "@/components/homes/ved/newhero/Wordmark";

describe("<Wordmark />", () => {
  it("is an accessible VEDANK image", () => {
    render(<Wordmark />);
    expect(screen.getByRole("img", { name: "VEDANK" })).toBeInTheDocument();
  });

  it("uses the hero video's 1920x1080 frame and covers by default", () => {
    render(<Wordmark />);
    const svg = screen.getByRole("img", { name: "VEDANK" });
    expect(svg).toHaveAttribute("viewBox", "0 0 1920 1080");
    expect(svg).toHaveAttribute("preserveAspectRatio", "xMidYMid slice");
  });

  it("follows the video size and fit mode it is given", () => {
    render(<Wordmark videoWidth={1280} videoHeight={720} preserveAspectRatio="xMidYMid meet" className="w" />);
    const svg = screen.getByRole("img", { name: "VEDANK" });
    expect(svg).toHaveAttribute("viewBox", "0 0 1280 720");
    expect(svg).toHaveAttribute("preserveAspectRatio", "xMidYMid meet");
    expect(svg).toHaveClass("w");
  });

  it("keeps the letters fitted to the video (transform unchanged)", () => {
    const { container } = render(<Wordmark />);
    expect(container.querySelector("g")).toHaveAttribute("transform", "matrix(0.78475 0 0 1.02608 186.9 354)");
  });
});
