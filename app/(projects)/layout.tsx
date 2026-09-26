import Footer2 from "@/components/footers/Footer2";
import FeatherCTA from "@/components/other-pages/services/FeatherCTA";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FeatherCTA />
      <Footer2 />
    </>
  );
}
