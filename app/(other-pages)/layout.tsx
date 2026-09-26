import Footer2 from "@/components/footers/Footer2";

/*
 * Plain wrappers keep React's siblings stable when GSAP pins sections inside
 * them (pin-spacers), so client-side navigation doesn't throw.
 */
export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div>{children}</div>
      <div>
        <Footer2 />
      </div>
    </>
  );
}
