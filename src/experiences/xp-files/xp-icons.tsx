"use client";

import type { ReactNode } from "react";

import type { XpIconId } from "@/types/xp-file";

type GlyphProps = {
  icon: XpIconId;
  className?: string;
};

function DocShell({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className="h-full w-full">
      <path
        d="M14 2h26l10 10v46a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3z"
        fill="#fff"
        stroke="#8C8C8C"
        strokeWidth="1.2"
      />
      <path d="M40 2v10h10z" fill="#D8D8D8" />
      {children}
    </svg>
  );
}

export function XpFileGlyph({ icon }: GlyphProps) {
  switch (icon) {
    case "html":
      return (
        <DocShell>
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
        </DocShell>
      );
    case "css":
      return (
        <DocShell>
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
        </DocShell>
      );
    case "js":
      return (
        <DocShell>
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
        </DocShell>
      );
    case "image":
      return (
        <DocShell>
          <rect x="16" y="24" width="32" height="26" rx="2" fill="#E8F5E9" />
          <circle cx="24" cy="32" r="4" fill="#FFC107" />
          <path d="M16 44l10-8 8 6 8-10 6 12H16z" fill="#4CAF50" />
        </DocShell>
      );
    case "code":
      return (
        <DocShell>
          <circle cx="32" cy="38" r="16" fill="#263238" />
          <text
            x="32"
            y="43"
            fontSize="11"
            fontFamily="Consolas, monospace"
            fontWeight="bold"
            fill="#80CBC4"
            textAnchor="middle"
          >
            {"</>"}
          </text>
        </DocShell>
      );
    case "doc":
      return (
        <DocShell>
          <rect x="18" y="24" width="28" height="4" rx="1" fill="#90CAF9" />
          <rect x="18" y="32" width="28" height="3" rx="1" fill="#BBDEFB" />
          <rect x="18" y="39" width="20" height="3" rx="1" fill="#BBDEFB" />
          <rect x="18" y="46" width="24" height="3" rx="1" fill="#BBDEFB" />
        </DocShell>
      );
    case "music":
      return (
        <DocShell>
          <circle cx="26" cy="44" r="7" fill="#E91E63" />
          <circle cx="42" cy="40" r="7" fill="#E91E63" />
          <path
            d="M33 14v30M49 10v30"
            stroke="#C2185B"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </DocShell>
      );
    case "txt":
    default:
      return (
        <DocShell>
          <rect x="18" y="24" width="28" height="3" rx="1" fill="#9E9E9E" />
          <rect x="18" y="31" width="28" height="3" rx="1" fill="#BDBDBD" />
          <rect x="18" y="38" width="22" height="3" rx="1" fill="#BDBDBD" />
          <rect x="18" y="45" width="26" height="3" rx="1" fill="#BDBDBD" />
        </DocShell>
      );
  }
}

export const XP_ICON_OPTIONS: { id: XpIconId; label: string }[] = [
  { id: "html", label: "HTML" },
  { id: "css", label: "CSS" },
  { id: "js", label: "JavaScript" },
  { id: "txt", label: "Text" },
  { id: "image", label: "Image" },
  { id: "code", label: "Code" },
  { id: "doc", label: "Document" },
  { id: "music", label: "Music" },
];
