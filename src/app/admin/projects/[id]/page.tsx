import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectForm } from "@/components/admin/project-form";
import { Button } from "@/components/ui/button";
import { getProjectById } from "@/server/projects";

type EditProjectPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Edit project</h1>
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link href="/admin/projects" />}
        >
          Back
        </Button>
      </div>
      <ProjectForm
        mode="edit"
        projectId={project.id}
        defaultValues={{
          title: project.title,
          client: project.client,
          category: project.category,
          description: project.description ?? "",
          year: project.year ?? "",
          imageUrl: project.imageUrl,
          imageAlt: project.imageAlt,
          href: project.href ?? "",
          sortOrder: project.sortOrder,
          published: project.published,
        }}
      />
    </div>
  );
}
