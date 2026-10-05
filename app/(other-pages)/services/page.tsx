import { Metadata } from "next";
import InnerHeadline from "@/components/other-pages/services/InnerHeadline";
import ServicesDescriptionStack from "@/components/other-pages/services/ServicesDescriptionStack";
import FeatherCTA from "@/components/other-pages/services/FeatherCTA";
export const metadata: Metadata = {
  title: "Services | Vedank Gaur",
  description:
    "Web design, UI/UX, landing pages, e-commerce and virtual assistance by Vedank Gaur, a web designer and frontend developer in Jaipur.",
  alternates: { canonical: "/services" },
};
export default function ServicesPage() {
  return (
    <>
      <>
        <InnerHeadline />
        <ServicesDescriptionStack />
        <FeatherCTA />
      </>
    </>
  );
}
