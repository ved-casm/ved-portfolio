import Footer2 from "@/components/footers/Footer2";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Footer2 />
    </>
  );
}
