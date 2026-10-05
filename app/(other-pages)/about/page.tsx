import { Metadata } from "next";
import AboutHorizontal from "@/components/about/AboutHorizontal";
import AboutStatement from "@/components/about/AboutStatement";
import FeatherBloomCTA from "@/components/about/FeatherBloomCTA";
import "@/components/about/AboutPage.css";

export const metadata: Metadata = {
  title: "About | Vedank Gaur",
  description:
    "Vedank Gaur, web designer and frontend developer in Jaipur, designing and building websites from the first sketch to launch.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="ab-page">
      <AboutHorizontal />
      <AboutStatement />
      <FeatherBloomCTA />
    </div>
  );
}
