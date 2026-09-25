import Footer2 from "@/components/footers/Footer2";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* <div className="mxd-page-content inner-page-content"> */}
      {children}
      {/* </div> */}
      <Footer2 />
    </>
  );
}
