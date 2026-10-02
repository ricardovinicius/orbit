import { ProjectScreen } from "@/components/orbit/projects";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <ProjectScreen id={id} />; }
