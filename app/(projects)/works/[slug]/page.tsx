import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProjectShowcase from "@/components/projects/showcase/ProjectShowcase";
import FeatherCTA from "@/components/other-pages/services/FeatherCTA";
import { getNext, getProject, projects } from "@/components/projects/showcase/projectShowcaseData";

type Params = { params: Promise<{ slug: string }> };

// every project in the data file gets its own page at build time
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return { title: project.seoTitle, description: project.seoDescription };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  // key: remount on project change so the scroll/GSAP setup rebuilds
  return (
    <>
      <ProjectShowcase key={slug} project={project} next={getNext(slug)} />
      <FeatherCTA key={`cta-${slug}`} />
    </>
  );
}
