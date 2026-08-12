"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type XpCtxTarget =
  { kind: "desktop" } | { kind: "icon"; id: string; label: string };

export type XpCtxAction =
  | "refresh"
  | "paste"
  | "paste-shortcut"
  | "new-folder"
  | "new-shortcut"
  | "new-bitmap"
  | "new-text"
  | "new-zip"
  | "properties"
  | "arrange-name"
  | "arrange-size"
  | "arrange-type"
  | "arrange-modified"
  | "auto-arrange"
  | "align-grid"
  | "open"
  | "cut"
  | "copy"
  | "create-shortcut"
  | "delete"
  | "rename";

type XpContextMenuProps = {
  x: number;
  y: number;
  target: XpCtxTarget;
  canPaste: boolean;
  autoArrange: boolean;
  alignToGrid: boolean;
  onAction: (action: XpCtxAction) => void;
  onClose: () => void;
};

function Item({
  label,
  disabled,
  checked,
  onClick,
  onHover,
}: {
  label: string;
  disabled?: boolean;
  checked?: boolean;
  onClick?: () => void;
  onHover?: () => void;
}) {
  return (
    <button
      type="button"
      className={cn("xp-ctx-item", disabled && "is-disabled")}
      disabled={disabled}
      onMouseEnter={onHover}
      onClick={() => {
        if (!disabled) onClick?.();
      }}
    >
      <span className="xp-ctx-label">
        {checked ? <span className="xp-ctx-check">✓ </span> : null}
        {label}
      </span>
    </button>
  );
}

function Sep() {
  return <div className="xp-ctx-sep" role="separator" />;
}

export function XpContextMenu({
  x,
  y,
  target,
  canPaste,
  autoArrange,
  alignToGrid,
  onAction,
  onClose,
}: XpContextMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x, y });
  const [submenu, setSubmenu] = useState<"arrange" | "new" | null>(null);
  const [flipLeft, setFlipLeft] = useState(false);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pad = 8;
    let nx = x;
    let ny = y;
    if (nx + rect.width > window.innerWidth - pad) {
      nx = Math.max(pad, window.innerWidth - rect.width - pad);
    }
    if (ny + rect.height > window.innerHeight - pad) {
      ny = Math.max(pad, window.innerHeight - rect.height - pad);
    }
    setPos({ x: nx, y: ny });
    setFlipLeft(nx + rect.width + 190 > window.innerWidth - pad);
  }, [x, y, target, submenu]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const run = (action: XpCtxAction) => {
    onAction(action);
    onClose();
  };

  return (
    <div
      ref={rootRef}
      className="xp-ctx-menu"
      style={{ left: pos.x, top: pos.y }}
      role="menu"
      onContextMenu={(e) => e.preventDefault()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {target.kind === "desktop" ? (
        <>
          <div
            className={cn("xp-ctx-sub", submenu === "arrange" && "is-open")}
            onMouseEnter={() => setSubmenu("arrange")}
          >
            <span className="xp-ctx-label">Arrange Icons By</span>
            <span className="xp-ctx-arrow">▶</span>
            {submenu === "arrange" ? (
              <div
                className={cn("xp-ctx-flyout", flipLeft && "flip-left")}
                onMouseEnter={() => setSubmenu("arrange")}
              >
                <Item label="Name" onClick={() => run("arrange-name")} />
                <Item label="Size" onClick={() => run("arrange-size")} />
                <Item label="Type" onClick={() => run("arrange-type")} />
                <Item
                  label="Modified"
                  onClick={() => run("arrange-modified")}
                />
                <Sep />
                <Item
                  label="Auto Arrange"
                  checked={autoArrange}
                  onClick={() => run("auto-arrange")}
                />
                <Item
                  label="Align to Grid"
                  checked={alignToGrid}
                  onClick={() => run("align-grid")}
                />
              </div>
            ) : null}
          </div>
          <Item
            label="Refresh"
            onHover={() => setSubmenu(null)}
            onClick={() => run("refresh")}
          />
          <Sep />
          <Item
            label="Paste"
            disabled={!canPaste}
            onHover={() => setSubmenu(null)}
            onClick={() => run("paste")}
          />
          <Item
            label="Paste Shortcut"
            disabled
            onHover={() => setSubmenu(null)}
            onClick={() => run("paste-shortcut")}
          />
          <Sep />
          <div
            className={cn("xp-ctx-sub", submenu === "new" && "is-open")}
            onMouseEnter={() => setSubmenu("new")}
          >
            <span className="xp-ctx-label">New</span>
            <span className="xp-ctx-arrow">▶</span>
            {submenu === "new" ? (
              <div
                className={cn("xp-ctx-flyout", flipLeft && "flip-left")}
                onMouseEnter={() => setSubmenu("new")}
              >
                <Item label="Folder" onClick={() => run("new-folder")} />
                <Item label="Shortcut" onClick={() => run("new-shortcut")} />
                <Sep />
                <Item label="Bitmap Image" onClick={() => run("new-bitmap")} />
                <Item label="Text Document" onClick={() => run("new-text")} />
                <Item
                  label="Compressed (zipped) Folder"
                  onClick={() => run("new-zip")}
                />
              </div>
            ) : null}
          </div>
          <Sep />
          <Item
            label="Properties"
            onHover={() => setSubmenu(null)}
            onClick={() => run("properties")}
          />
        </>
      ) : (
        <>
          <Item label="Open" onClick={() => run("open")} />
          <Sep />
          <Item label="Cut" disabled onClick={() => run("cut")} />
          <Item label="Copy" onClick={() => run("copy")} />
          <Sep />
          <Item
            label="Create Shortcut"
            disabled
            onClick={() => run("create-shortcut")}
          />
          <Item
            label="Delete"
            disabled={!target.id.startsWith("user-")}
            onClick={() => run("delete")}
          />
          <Item label="Rename" disabled onClick={() => run("rename")} />
          <Sep />
          <Item label="Properties" onClick={() => run("properties")} />
        </>
      )}
    </div>
  );
}
