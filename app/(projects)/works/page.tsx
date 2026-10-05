import { Metadata } from "next";
import WorksIndex from "@/components/projects/showcase/WorksIndex";
import { projects } from "@/components/projects/showcase/projectShowcaseData";

export const metadata: Metadata = {
  title: "Works | Vedank Gaur",
  description: "Selected projects by Vedank Gaur: product design, web design and frontend development.",
  alternates: { canonical: "/works" },
};

export default function WorksPage() {
  return <WorksIndex projects={projects} />;
}
