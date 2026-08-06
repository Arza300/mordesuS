import Link from "next/link";

import {
  XpFileCreateForm,
  XpFileEditor,
} from "@/components/admin/xp-file-editor";
import { ensureDefaultXpFiles, getXpFilesAdmin } from "@/server/xp-files";

export default async function AdminXpFilesPage() {
  await ensureDefaultXpFiles();
  const files = await getXpFilesAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Windows XP files
        </h1>
        <p className="mt-1 text-sm text-white/50">
          Edit names, contents, and icons for the secret XP desktop. Only admins
          can change these — visitors still open them read-only.
        </p>
        <p className="mt-2 text-xs text-white/35">
          Unlock on the site by keeping the hold bar in the mid zone for ~2s.{" "}
          <Link href="/" className="underline hover:text-white/60">
            Open site
          </Link>
        </p>
      </div>

      <XpFileCreateForm />

      {files.length === 0 ? (
        <p className="text-sm text-white/50">No XP files yet.</p>
      ) : (
        <div className="space-y-5">
          {files.map((file) => (
            <XpFileEditor key={file.id} file={file} />
          ))}
        </div>
      )}
    </div>
  );
}
