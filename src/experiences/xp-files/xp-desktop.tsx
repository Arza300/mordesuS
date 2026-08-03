"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { cn } from "@/lib/utils";

import "./xp-desktop.css";

type FileKey = "index.html" | "styles.css" | "script.js";

const FILES: Record<FileKey, { lang: string; content: string }> = {
  "index.html": {
    lang: "HTML",
    content: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Mordesu Studio — Files</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <div id="desktop">
      <!-- Windows XP folder window lives here -->
    </div>
    <script src="./script.js"></script>
  </body>
</html>`,
  },
  "styles.css": {
    lang: "CSS",
    content: `:root {
  --xp-face: #ece9d8;
  --xp-border: #0a246a;
}

#desktop {
  min-height: 100vh;
  background: url("bliss.jpg") center / cover;
}

.xp-window {
  background: var(--xp-face);
  border: 1px solid var(--xp-border);
}`,
  },
  "script.js": {
    lang: "JavaScript",
    content: `// Hold the hero charge at 50% for 4 seconds.
// Welcome to the Mordesu XP files easter egg.`,
  },
};

type NotepadWin = {
  id: number;
  file: FileKey;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
};

type XpDesktopProps = {
  active: boolean;
  onClose: () => void;
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

export function XpDesktop({ active, onClose, className }: XpDesktopProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const folderRef = useRef<HTMLDivElement>(null);
  const zTop = useRef(10);
  const notepadId = useRef(0);

  const [folderPos, setFolderPos] = useState({ x: 0, y: 48 });
  const [folderHidden, setFolderHidden] = useState(false);
  const [selected, setSelected] = useState<FileKey | null>(null);
  const [notepads, setNotepads] = useState<NotepadWin[]>([]);
  const [folderZ, setFolderZ] = useState(10);

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

  const openNotepad = (file: FileKey) => {
    notepadId.current += 1;
    zTop.current += 1;
    const id = notepadId.current;
    setNotepads((prev) => [
      ...prev,
      {
        id,
        file,
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
            // Bring to front via DOM only — avoid React re-render mid-interaction
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
                {(Object.keys(FILES) as FileKey[]).map((file) => (
                  <button
                    key={file}
                    type="button"
                    className={cn("file-icon", selected === file && "selected")}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(file);
                    }}
                    onDoubleClick={() => openNotepad(file)}
                  >
                    <FileGlyph name={file} />
                    <div className="name">{file}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="statusbar">
            <div>3 objects</div>
            <div>1.23 MB</div>
            <div>My Computer</div>
          </div>
        </div>
      ) : null}

      {notepads.map((win) => (
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
            <span className="ttl-text">{win.file} - Notepad</span>
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
            value={FILES[win.file].content}
          />
          <div className="np-status">
            {FILES[win.file].lang} file &nbsp; | &nbsp; Ln 1, Col 1
          </div>
        </div>
      ))}
    </div>
  );
}

function FileGlyph({ name }: { name: FileKey }) {
  if (name === "index.html") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden>
        <path
          d="M14 2h26l10 10v46a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3z"
          fill="#fff"
          stroke="#8C8C8C"
          strokeWidth="1.2"
        />
        <path d="M40 2v10h10z" fill="#D8D8D8" />
        <circle cx="32" cy="38" r="16" fill="#1A73E8" />
        <text
          x="32"
          y="43"
          fontSize="12"
          fontFamily="Arial"
          fontWeight="bold"
          fill="#fff"
          textAnchor="middle"
        >
          {"</>"}
        </text>
      </svg>
    );
  }
  if (name === "styles.css") {
    return (
      <svg viewBox="0 0 64 64" aria-hidden>
        <path
          d="M14 2h26l10 10v46a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3z"
          fill="#fff"
          stroke="#8C8C8C"
          strokeWidth="1.2"
        />
        <path d="M40 2v10h10z" fill="#D8D8D8" />
        <circle cx="32" cy="38" r="16" fill="#7C4DFF" />
        <text
          x="32"
          y="43"
          fontSize="11"
          fontFamily="Arial"
          fontWeight="bold"
          fill="#fff"
          textAnchor="middle"
        >
          {"{ }"}
        </text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" aria-hidden>
      <path
        d="M14 2h26l10 10v46a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3z"
        fill="#fff"
        stroke="#8C8C8C"
        strokeWidth="1.2"
      />
      <path d="M40 2v10h10z" fill="#D8D8D8" />
      <rect x="17" y="24" width="30" height="28" rx="3" fill="#F0DB4F" />
      <text
        x="32"
        y="44"
        fontSize="14"
        fontFamily="Arial"
        fontWeight="bold"
        fill="#323330"
        textAnchor="middle"
      >
        JS
      </text>
    </svg>
  );
}
