import Link from "next/link";
import Image from "next/image";

import { ProjectRowActions } from "@/components/admin/project-row-actions";
import { Button } from "@/components/ui/button";
import { getAllProjectsAdmin } from "@/server/projects";

export default async function AdminProjectsPage() {
  const projects = await getAllProjectsAdmin();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-1 text-sm text-white/50">
            Manage items shown in the All Projects overlay. Promote a user to
            ADMIN via Prisma Studio (`User.role = ADMIN`) after register.
          </p>
        </div>
        <Button
          nativeButton={false}
          render={<Link href="/admin/projects/new" />}
        >
          New project
        </Button>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-white/50">No projects yet. Create one.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-white/50">
              <tr>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded bg-white/5">
                        <Image
                          src={project.imageUrl}
                          alt={project.imageAlt}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <Link
                          href={`/admin/projects/${project.id}`}
                          className="font-medium hover:underline"
                        >
                          {project.title}
                        </Link>
                        <p className="text-white/45">{project.client}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {project.category}
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {project.sortOrder}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        project.published ? "text-emerald-400" : "text-white/40"
                      }
                    >
                      {project.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        nativeButton={false}
                        render={<Link href={`/admin/projects/${project.id}`} />}
                      >
                        Edit
                      </Button>
                      <ProjectRowActions
                        id={project.id}
                        published={project.published}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
