import Link from "next/link";

import { ProjectForm } from "@/components/admin/project-form";
import { Button } from "@/components/ui/button";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">New project</h1>
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link href="/admin/projects" />}
        >
          Back
        </Button>
      </div>
      <ProjectForm mode="create" />
    </div>
  );
}
