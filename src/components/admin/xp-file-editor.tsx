"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  createXpFileAction,
  createXpMediaUploadAction,
  deleteXpFileAction,
  updateXpFileAction,
} from "@/actions/xp-files";
import { XP_ICON_OPTIONS, XpFileGlyph } from "@/experiences/xp-files/xp-icons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { XpFileData, XpIconId, XpOpenMode } from "@/types/xp-file";
import { resolveMediaSource } from "@/lib/media-url";
import { cn } from "@/lib/utils";

type XpFileEditorProps = {
  file: XpFileData;
};

const OPEN_MODE_OPTIONS: { id: XpOpenMode; label: string }[] = [
  { id: "script", label: "Script" },
  { id: "link", label: "Direct link" },
  { id: "image", label: "Image" },
  { id: "video", label: "Video" },
];

export function XpFileEditor({ file }: XpFileEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(file.name);
  const [lang, setLang] = useState(file.lang);
  const [content, setContent] = useState(file.content);
  const [icon, setIcon] = useState<XpIconId>(file.icon);
  const [sortOrder, setSortOrder] = useState(file.sortOrder);
  const [href, setHref] = useState(file.href ?? "");
  const [openMode, setOpenMode] = useState<XpOpenMode>(file.openMode);
  const [pin, setPin] = useState("");
  const [clearPin, setClearPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState<number | null>(null);

  const isMedia = openMode === "image" || openMode === "video";

  const setMode = (mode: XpOpenMode) => {
    setOpenMode(mode);
    if (mode === "image" && (icon === "txt" || icon === "html")) {
      setIcon("image");
      setLang("Image");
    }
    if (mode === "video" && (icon === "txt" || icon === "html")) {
      setIcon("video");
      setLang("Video");
    }
  };

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
        href,
        openMode,
        pin: clearPin ? "" : pin,
        clearPin,
      });
      if (result?.serverError) {
        setError(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        const pinErrors = result.validationErrors.pin?._errors;
        const hrefErrors = result.validationErrors.href?._errors;
        setError(
          pinErrors?.[0] ??
            hrefErrors?.[0] ??
            "Check the fields and try again.",
        );
        return;
      }
      setPin("");
      setClearPin(false);
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

  const uploadMedia = async (selected: File) => {
    if (openMode !== "image" && openMode !== "video") return;
    setError(null);
    setUploading(true);
    setUploadPct(0);

    try {
      const signed = await createXpMediaUploadAction({
        kind: openMode,
        contentType: selected.type || "application/octet-stream",
        filename: selected.name,
      });

      if (signed?.serverError) {
        throw new Error(signed.serverError);
      }
      if (!signed?.data?.uploadUrl || !signed.data.publicUrl) {
        throw new Error("Could not start upload.");
      }

      const { uploadUrl, publicUrl } = signed.data;

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader(
          "Content-Type",
          selected.type || "application/octet-stream",
        );
        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          setUploadPct(Math.round((event.loaded / event.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else
            reject(
              new Error(
                `Upload failed (${xhr.status}). Check R2 CORS allows PUT from this origin.`,
              ),
            );
        };
        xhr.onerror = () =>
          reject(
            new Error(
              "Upload failed. Check R2 CORS allows PUT from this origin.",
            ),
          );
        xhr.send(selected);
      });

      setHref(publicUrl);
      setUploadPct(100);
      toast.success("Media uploaded — click Save to keep it");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
        <div className="space-y-2 sm:col-span-2">
          <Label>Open as</Label>
          <div className="flex flex-wrap gap-2">
            {OPEN_MODE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMode(opt.id)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm transition-colors",
                  openMode === opt.id
                    ? "border-white/50 bg-white/10"
                    : "border-white/10 hover:border-white/25",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`pin-${file.id}`}>
            Numeric password (PIN)
            {file.locked ? " — currently protected" : ""}
          </Label>
          <Input
            id={`pin-${file.id}`}
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder={
              file.locked
                ? "Enter new PIN to replace (4–12 digits)"
                : "Optional — 4–12 digits"
            }
            value={pin}
            disabled={clearPin}
            onChange={(e) =>
              setPin(e.target.value.replace(/\D/g, "").slice(0, 12))
            }
          />
          <div className="flex flex-wrap items-center gap-3">
            {file.locked ? (
              <label className="flex items-center gap-2 text-xs text-white/50">
                <input
                  type="checkbox"
                  checked={clearPin}
                  onChange={(e) => {
                    setClearPin(e.target.checked);
                    if (e.target.checked) setPin("");
                  }}
                />
                Remove password
              </label>
            ) : null}
            <p className="text-xs text-white/40">
              Visitors must enter this PIN in an XP password dialog before the
              file opens.
            </p>
          </div>
        </div>
      </div>

      {openMode === "link" || isMedia ? (
        <div className="space-y-2">
          <Label htmlFor={`href-${file.id}`}>
            {isMedia
              ? `${openMode === "image" ? "Image" : "Video"} URL`
              : "Link"}{" "}
            (required)
          </Label>
          <Input
            id={`href-${file.id}`}
            type="url"
            placeholder={
              isMedia
                ? "Upload below or paste a public URL"
                : "https://example.com"
            }
            value={href}
            onChange={(e) => setHref(e.target.value)}
          />
          {openMode === "link" ? (
            <p className="text-xs text-white/40">
              Opens in a real browser window so login and cookies work like a
              normal Chrome tab.
            </p>
          ) : isMedia ? (
            <p className="text-xs text-white/40">
              Google Drive share links work — the file must be set to Anyone
              with the link.
            </p>
          ) : null}
        </div>
      ) : null}

      {isMedia ? (
        <div className="space-y-2">
          <Label>Upload {openMode} (any size)</Label>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={
              openMode === "image"
                ? "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/svg+xml"
                : "video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska,.mp4,.webm,.mov,.avi,.mkv"
            }
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (selected) void uploadMedia(selected);
            }}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {uploading
                ? uploadPct != null
                  ? `Uploading ${uploadPct}%`
                  : "Uploading…"
                : `Choose ${openMode}`}
            </Button>
            <p className="text-xs text-white/40">
              Uploads go straight to storage — no size limit.
            </p>
          </div>
          {href && (openMode === "image" || openMode === "video") ? (
            <div className="overflow-hidden rounded-lg border border-white/10 bg-black/40 p-2">
              {(() => {
                const resolved = resolveMediaSource(href, openMode);
                if (openMode === "video" && resolved.kind === "drive-embed") {
                  return (
                    <iframe
                      src={resolved.src}
                      title={name}
                      className="h-40 w-full border-0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  );
                }
                if (openMode === "image") {
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolved.src}
                      alt={name}
                      className="max-h-40 w-auto max-w-full object-contain"
                    />
                  );
                }
                return (
                  <video
                    src={resolved.src}
                    className="max-h-40 w-auto max-w-full"
                    controls
                    preload="metadata"
                  />
                );
              })()}
            </div>
          ) : null}
        </div>
      ) : null}

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

      {openMode === "script" ? (
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
      ) : null}
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
        openMode: "script",
        href: null,
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
