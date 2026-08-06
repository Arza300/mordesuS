"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { XpFileGlyph } from "@/experiences/xp-files/xp-icons";
import type { XpFileData } from "@/types/xp-file";
import { cn } from "@/lib/utils";

import "./xp-desktop.css";

type NotepadWin = {
  id: number;
  fileId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
};

type XpDesktopProps = {
  active: boolean;
  onClose: () => void;
  files: XpFileData[];
  className?: string;
};

function FolderSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden>
      <path
        d="M1 5.5c0-.8.7-1.5 1.5-1.5H8l1.6 2H17.5c.8 0 1.5.7 1.5 1.5v9c0 .8-.7 1.5-1.5 1.5h-15C1.7 18 1 17.3 1 16.5v-11z"
        fill="#F6C13A"
        stroke="#B8860B"
        strokeWidth=".5"
      />
    </svg>
  );
}

export function XpDesktop({
  active,
  onClose,
  files,
  className,
}: XpDesktopProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const folderRef = useRef<HTMLDivElement>(null);
  const zTop = useRef(10);
  const notepadId = useRef(0);

  const [folderPos, setFolderPos] = useState({ x: 0, y: 48 });
  const [folderHidden, setFolderHidden] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [notepads, setNotepads] = useState<NotepadWin[]>([]);
  const [folderZ, setFolderZ] = useState(10);

  const fileById = useCallback(
    (id: string) => files.find((f) => f.id === id) ?? null,
    [files],
  );

  useEffect(() => {
    if (!active) {
      setNotepads([]);
      setSelected(null);
      setFolderHidden(false);
      return;
    }
    const w = Math.min(780, window.innerWidth - 24);
    setFolderPos({ x: Math.max(12, (window.innerWidth - w) / 2), y: 48 });
  }, [active]);

  const startDrag = useCallback(
    (
      e: ReactPointerEvent,
      opts: {
        getOrigin: () => { x: number; y: number };
        commit: (pos: { x: number; y: number }) => void;
        clamp: (x: number, y: number) => { x: number; y: number };
        ignoreSelector?: string;
      },
    ) => {
      if (
        (e.target as HTMLElement).closest(opts.ignoreSelector ?? ".win-btn")
      ) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();

      const winEl = (e.currentTarget as HTMLElement).closest(
        ".xp-window",
      ) as HTMLElement | null;
      if (!winEl) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const origin = opts.getOrigin();
      let latest = origin;
      let raf = 0;
      let pending: { x: number; y: number } | null = null;

      winEl.style.willChange = "transform";
      winEl.style.left = `${origin.x}px`;
      winEl.style.top = `${origin.y}px`;
      winEl.style.transform = "translate3d(0,0,0)";

      const flush = () => {
        raf = 0;
        if (!pending) return;
        const { x, y } = pending;
        pending = null;
        latest = { x, y };
        winEl.style.transform = `translate3d(${x - origin.x}px, ${y - origin.y}px, 0)`;
      };

      const onPointerMove = (ev: PointerEvent) => {
        pending = opts.clamp(
          origin.x + (ev.clientX - startX),
          origin.y + (ev.clientY - startY),
        );
        if (!raf) raf = requestAnimationFrame(flush);
      };

      const onPointerUp = () => {
        if (raf) cancelAnimationFrame(raf);
        if (pending) {
          latest = pending;
          pending = null;
        }
        winEl.style.willChange = "";
        winEl.style.transform = "none";
        winEl.style.left = `${latest.x}px`;
        winEl.style.top = `${latest.y}px`;
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        opts.commit(latest);
      };

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerup", onPointerUp);
    },
    [],
  );

  const openNotepad = (fileId: string) => {
    notepadId.current += 1;
    zTop.current += 1;
    const id = notepadId.current;
    setNotepads((prev) => [
      ...prev,
      {
        id,
        fileId,
        x: 100 + id * 24,
        y: 80 + id * 24,
        w: Math.min(560, window.innerWidth - 32),
        h: Math.min(420, window.innerHeight - 80),
        z: zTop.current,
      },
    ]);
  };

  if (!active) return null;

  return (
    <div
      ref={rootRef}
      className={cn("xp-desktop", className)}
      role="dialog"
      aria-label="Windows XP files easter egg"
    >
      <button type="button" className="xp-back" onClick={onClose}>
        ← Back to Mordesu
      </button>

      {!folderHidden ? (
        <div
          ref={folderRef}
          className="xp-window main-window"
          style={{
            left: folderPos.x,
            top: folderPos.y,
            zIndex: folderZ,
          }}
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest(".titlebar")) return;
            zTop.current += 1;
            folderRef.current &&
              (folderRef.current.style.zIndex = String(zTop.current));
            setFolderZ(zTop.current);
          }}
        >
          <div
            className="titlebar"
            onPointerDown={(e) => {
              zTop.current += 1;
              if (folderRef.current) {
                folderRef.current.style.zIndex = String(zTop.current);
              }
              startDrag(e, {
                getOrigin: () => folderPos,
                commit: (pos) => {
                  setFolderPos(pos);
                  setFolderZ(zTop.current);
                },
                clamp: (x, y) => ({
                  x: Math.max(-200, Math.min(window.innerWidth - 80, x)),
                  y: Math.max(0, Math.min(window.innerHeight - 40, y)),
                }),
              });
            }}
          >
            <span className="ttl-icon">
              <FolderSvg />
            </span>
            <span className="ttl-text">Mordesu Studio: Files</span>
            <div className="win-btns">
              <div
                className="win-btn min"
                onClick={() => setFolderHidden(true)}
                role="button"
                tabIndex={0}
              >
                _
              </div>
              <div className="win-btn max">□</div>
              <div
                className="win-btn close"
                onClick={onClose}
                role="button"
                tabIndex={0}
              >
                ✕
              </div>
            </div>
          </div>

          <div className="menubar">
            <span>File</span>
            <span>Edit</span>
            <span>View</span>
            <span>Favorites</span>
            <span>Tools</span>
            <span>Help</span>
          </div>

          <div className="toolbar">
            <div className="tb-btn active">
              <FolderSvg />
              <span>Folders</span>
            </div>
          </div>

          <div className="addressbar">
            <span>Address</span>
            <div className="addr-input">
              <FolderSvg />
              C:\My Project\Mordesu Studio\Files
            </div>
          </div>

          <div className="body-area">
            <div className="sidebar">
              <div className="sidebar-hd">
                <span>Folders</span>
              </div>
              <div className="tree">
                {[
                  { depth: 0, label: "Desktop" },
                  { depth: 1, label: "My Documents" },
                  { depth: 1, label: "My Computer" },
                  { depth: 2, label: "Local Disk (C:)" },
                  { depth: 3, label: "My Project" },
                  { depth: 4, label: "Mordesu Studio: Files", selected: true },
                ].map((row) => (
                  <div
                    key={`${row.depth}-${row.label}`}
                    className={cn("tree-row", row.selected && "selected")}
                    style={{ ["--depth" as string]: row.depth }}
                  >
                    <FolderSvg />
                    <div className="tree-label">{row.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="content" onClick={() => setSelected(null)}>
              <div className="icon-grid">
                {files.map((file) => (
                  <button
                    key={file.id}
                    type="button"
                    className={cn(
                      "file-icon",
                      selected === file.id && "selected",
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(file.id);
                    }}
                    onDoubleClick={() => openNotepad(file.id)}
                  >
                    <div className="file-glyph">
                      <XpFileGlyph icon={file.icon} />
                    </div>
                    <div className="name">{file.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="statusbar">
            <div>
              {files.length} object{files.length === 1 ? "" : "s"}
            </div>
            <div>1.23 MB</div>
            <div>My Computer</div>
          </div>
        </div>
      ) : null}

      {notepads.map((win) => {
        const file = fileById(win.fileId);
        if (!file) return null;

        return (
          <div
            key={win.id}
            className="xp-window notepad"
            style={{
              left: win.x,
              top: win.y,
              width: win.w,
              height: win.h,
              zIndex: win.z,
            }}
            onPointerDown={(e) => {
              if ((e.target as HTMLElement).closest(".titlebar")) return;
              zTop.current += 1;
              const el = e.currentTarget;
              el.style.zIndex = String(zTop.current);
              setNotepads((prev) =>
                prev.map((n) =>
                  n.id === win.id ? { ...n, z: zTop.current } : n,
                ),
              );
            }}
          >
            <div
              className="titlebar"
              onPointerDown={(e) => {
                zTop.current += 1;
                const winEl = (e.currentTarget as HTMLElement).closest(
                  ".xp-window",
                ) as HTMLElement | null;
                if (winEl) winEl.style.zIndex = String(zTop.current);
                startDrag(e, {
                  getOrigin: () => ({ x: win.x, y: win.y }),
                  commit: (pos) => {
                    setNotepads((prev) =>
                      prev.map((n) =>
                        n.id === win.id
                          ? { ...n, x: pos.x, y: pos.y, z: zTop.current }
                          : n,
                      ),
                    );
                  },
                  clamp: (x, y) => ({
                    x: Math.max(0, Math.min(window.innerWidth - 80, x)),
                    y: Math.max(0, Math.min(window.innerHeight - 40, y)),
                  }),
                });
              }}
            >
              <span className="ttl-text">{file.name} - Notepad</span>
              <div className="win-btns">
                <div className="win-btn min">_</div>
                <div className="win-btn max">□</div>
                <div
                  className="win-btn close"
                  onClick={() =>
                    setNotepads((prev) => prev.filter((n) => n.id !== win.id))
                  }
                  role="button"
                  tabIndex={0}
                >
                  ✕
                </div>
              </div>
            </div>
            <div className="np-menu">
              <span>File</span>
              <span>Edit</span>
              <span>Format</span>
              <span>View</span>
              <span>Help</span>
            </div>
            <textarea
              className="np-body"
              readOnly
              spellCheck={false}
              value={file.content}
            />
            <div className="np-status">
              {file.lang} file &nbsp; | &nbsp; Ln 1, Col 1
            </div>
          </div>
        );
      })}
    </div>
  );
}
