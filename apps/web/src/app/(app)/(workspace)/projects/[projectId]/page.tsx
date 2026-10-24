import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { PlaceholderPage } from "@/components/layout/placeholder-page";
import { sampleProjects } from "@/components/layout/sample-projects";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}): Promise<ReactElement> {
  const { projectId } = await params;
  const project = sampleProjects.find((entry) => entry.id === projectId);
  if (!project) notFound();
  return (
    <PlaceholderPage
      title={project.name}
      description="A sample project. Project details are not available yet."
    />
  );
}

export function generateStaticParams(): { projectId: string }[] {
  return sampleProjects.map((project) => ({ projectId: project.id }));
}
