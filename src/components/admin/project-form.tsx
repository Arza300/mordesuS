"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  createProjectAction,
  updateProjectAction,
  uploadProjectImageFormAction,
} from "@/actions/projects";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  projectFormSchema,
  type ProjectFormInput,
} from "@/validators/projects";

type ProjectFormProps = {
  mode: "create" | "edit";
  projectId?: string;
  defaultValues?: Partial<ProjectFormInput>;
};

export function ProjectForm({
  mode,
  projectId,
  defaultValues,
}: ProjectFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormInput>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: "",
      client: "",
      category: "",
      description: "",
      year: "",
      imageUrl: "",
      imageAlt: "",
      href: "",
      sortOrder: 0,
      published: true,
      ...defaultValues,
    },
  });

  const imageUrl = watch("imageUrl");
  const published = watch("published");

  const onSubmit = handleSubmit((values) => {
    setError(null);

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProjectAction(values)
          : await updateProjectAction({ ...values, id: projectId! });

      if (result?.serverError) {
        setError(result.serverError);
        return;
      }

      if (result?.validationErrors) {
        setError("Please check the form fields and try again.");
        return;
      }

      if (result?.data?.success) {
        toast.success(
          mode === "create" ? "Project created" : "Project updated",
        );
        router.push("/admin/projects");
        router.refresh();
      }
    });
  });

  const onUpload = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadProjectImageFormAction(formData);
      setValue("imageUrl", result.url, {
        shouldValidate: true,
        shouldDirty: true,
      });
      if (!watch("imageAlt")) {
        setValue("imageAlt", file.name.replace(/\.[^.]+$/, ""), {
          shouldValidate: true,
        });
      }
      toast.success("Image uploaded");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" disabled={isPending} {...register("title")} />
          {errors.title ? (
            <p className="text-destructive text-sm">{errors.title.message}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="client">Client / subtitle</Label>
          <Input id="client" disabled={isPending} {...register("client")} />
          {errors.client ? (
            <p className="text-destructive text-sm">{errors.client.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" disabled={isPending} {...register("category")} />
          {errors.category ? (
            <p className="text-destructive text-sm">
              {errors.category.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="year">Year</Label>
          <Input id="year" disabled={isPending} {...register("year")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          rows={3}
          disabled={isPending}
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-lg border bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:ring-3"
          {...register("description")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          placeholder="https://... or /projects/..."
          disabled={isPending || uploading}
          {...register("imageUrl")}
        />
        {errors.imageUrl ? (
          <p className="text-destructive text-sm">{errors.imageUrl.message}</p>
        ) : null}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Label
            htmlFor="imageFile"
            className="border-border hover:bg-muted cursor-pointer rounded-lg border px-3 py-1.5 text-sm"
          >
            {uploading ? "Uploading…" : "Upload to R2"}
          </Label>
          <input
            id="imageFile"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="sr-only"
            disabled={isPending || uploading}
            onChange={(e) => {
              void onUpload(e.target.files);
              e.target.value = "";
            }}
          />
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="Preview"
              className="h-12 w-20 rounded object-cover"
            />
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="imageAlt">Image alt</Label>
          <Input id="imageAlt" disabled={isPending} {...register("imageAlt")} />
          {errors.imageAlt ? (
            <p className="text-destructive text-sm">
              {errors.imageAlt.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="href">Link (optional)</Label>
          <Input id="href" disabled={isPending} {...register("href")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="sortOrder">Sort order</Label>
          <Input
            id="sortOrder"
            type="number"
            min={0}
            disabled={isPending}
            {...register("sortOrder", { valueAsNumber: true })}
          />
        </div>
        <div className="flex items-end gap-2 pb-1">
          <input
            id="published"
            type="checkbox"
            className="size-4 rounded border"
            checked={Boolean(published)}
            onChange={(e) =>
              setValue("published", e.target.checked, { shouldDirty: true })
            }
            disabled={isPending}
          />
          <Label htmlFor="published">Published</Label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending || uploading}>
          {isPending ? <Loader2 className="animate-spin" /> : null}
          {mode === "create" ? "Create project" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => router.push("/admin/projects")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
