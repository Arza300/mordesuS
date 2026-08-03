"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import {
  deleteProjectAction,
  toggleProjectPublishedAction,
} from "@/actions/projects";
import { Button } from "@/components/ui/button";

type ProjectRowActionsProps = {
  id: string;
  published: boolean;
};

export function ProjectRowActions({ id, published }: ProjectRowActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            const result = await toggleProjectPublishedAction({
              id,
              published: !published,
            });
            if (result?.serverError) {
              toast.error(result.serverError);
              return;
            }
            toast.success(published ? "Unpublished" : "Published");
            router.refresh();
          });
        }}
      >
        {published ? "Unpublish" : "Publish"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="destructive"
        disabled={pending}
        onClick={() => {
          if (!window.confirm("Delete this project?")) return;
          startTransition(async () => {
            const result = await deleteProjectAction({ id });
            if (result?.serverError) {
              toast.error(result.serverError);
              return;
            }
            toast.success("Project deleted");
            router.refresh();
          });
        }}
      >
        Delete
      </Button>
    </div>
  );
}
