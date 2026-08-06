"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  createXpFileAction,
  deleteXpFileAction,
  updateXpFileAction,
} from "@/actions/xp-files";
import { XP_ICON_OPTIONS, XpFileGlyph } from "@/experiences/xp-files/xp-icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { XpFileData, XpIconId } from "@/types/xp-file";
import { cn } from "@/lib/utils";

type XpFileEditorProps = {
  file: XpFileData;
};

export function XpFileEditor({ file }: XpFileEditorProps) {
  const router = useRouter();
  const [name, setName] = useState(file.name);
  const [lang, setLang] = useState(file.lang);
  const [content, setContent] = useState(file.content);
  const [icon, setIcon] = useState<XpIconId>(file.icon);
  const [sortOrder, setSortOrder] = useState(file.sortOrder);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const save = () => {
    setError(null);
    startTransition(async () => {
      const result = await updateXpFileAction({
        id: file.id,
        name,
        lang,
        content,
        icon,
        sortOrder,
      });
      if (result?.serverError) {
        setError(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        setError("Check the fields and try again.");
        return;
      }
      toast.success("File saved");
      router.refresh();
    });
  };

  const remove = () => {
    if (!window.confirm(`Delete “${file.name}”?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteXpFileAction({ id: file.id });
      if (result?.serverError) {
        setError(result.serverError);
        return;
      }
      toast.success("File deleted");
      router.refresh();
    });
  };

  return (
    <article className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-12 shrink-0">
            <XpFileGlyph icon={icon} />
          </div>
          <div>
            <h2 className="font-medium tracking-tight">{file.name}</h2>
            <p className="text-xs text-white/40">{file.slug}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" onClick={save} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : "Save"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={remove}
            disabled={pending}
            aria-label="Delete file"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`name-${file.id}`}>File name</Label>
          <Input
            id={`name-${file.id}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`lang-${file.id}`}>Language label</Label>
          <Input
            id={`lang-${file.id}`}
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`order-${file.id}`}>Sort order</Label>
          <Input
            id={`order-${file.id}`}
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Icon</Label>
        <div className="flex flex-wrap gap-2">
          {XP_ICON_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setIcon(opt.id)}
              className={cn(
                "flex size-14 flex-col items-center justify-center rounded-lg border p-1 transition-colors",
                icon === opt.id
                  ? "border-white/50 bg-white/10"
                  : "border-white/10 hover:border-white/25",
              )}
              title={opt.label}
            >
              <div className="size-8">
                <XpFileGlyph icon={opt.id} />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`content-${file.id}`}>Contents</Label>
        <textarea
          id={`content-${file.id}`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          spellCheck={false}
          rows={12}
          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs leading-relaxed text-white/90 outline-none focus:border-white/30"
        />
      </div>
    </article>
  );
}

export function XpFileCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("notes.txt");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const create = () => {
    setError(null);
    startTransition(async () => {
      const result = await createXpFileAction({
        name,
        lang: "Text",
        content: "",
        icon: "txt",
        sortOrder: 99,
      });
      if (result?.serverError) {
        setError(result.serverError);
        return;
      }
      toast.success("File created");
      setName("notes.txt");
      router.refresh();
    });
  };

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-white/15 p-4">
      <div className="min-w-[12rem] flex-1 space-y-2">
        <Label htmlFor="new-xp-name">New file name</Label>
        <Input
          id="new-xp-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <Button type="button" onClick={create} disabled={pending || !name.trim()}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : "Add file"}
      </Button>
      {error ? <p className="w-full text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
