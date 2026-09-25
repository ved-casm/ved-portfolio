import { Metadata } from "next";
import NotFound from "@/components/other-pages/404/NotFound";
import Footer2 from "@/components/footers/Footer2";
export const metadata: Metadata = {
  title: "Page not found | Vedank Gaur",
  description: "This page doesn't exist.",
};
export default function NotFoundPage() {
  return (
    <>
      <NotFound />
      <Footer2 />
    </>
  );
}
