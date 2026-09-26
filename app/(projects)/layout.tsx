import Footer2 from "@/components/footers/Footer2";
import FeatherCTA from "@/components/other-pages/services/FeatherCTA";

/*
 * Each part sits in its own plain wrapper: GSAP pins wrap elements in a
 * pin-spacer, and React needs its siblings to stay direct children when it
 * swaps pages (otherwise insertBefore/removeChild throw on navigation).
 */
export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div>{children}</div>
      <div>
        <FeatherCTA />
      </div>
      <div>
        <Footer2 />
      </div>
    </>
  );
}
