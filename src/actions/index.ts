/**
 * Server Actions.
 * Use `actionClient` from `@/lib/safe-action` for type-safe mutations.
 */

export {
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
  toggleProjectPublishedAction,
  uploadProjectImageFormAction,
} from "@/actions/projects";

export {
  createXpFileAction,
  updateXpFileAction,
  deleteXpFileAction,
} from "@/actions/xp-files";
