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
    case "photo":
      return (
        <svg viewBox="0 0 64 64" aria-hidden className="h-full w-full">
          <rect
            x="8"
            y="16"
            width="48"
            height="36"
            rx="4"
            fill="#F5F5F5"
            stroke="#757575"
            strokeWidth="1.5"
          />
          <rect x="14" y="22" width="36" height="24" fill="#90CAF9" />
          <circle cx="24" cy="30" r="3.5" fill="#FFF59D" />
          <path d="M14 42l9-7 7 5 7-9 13 11H14z" fill="#43A047" />
          <circle
            cx="46"
            cy="18"
            r="7"
            fill="#424242"
            stroke="#212121"
            strokeWidth="1"
          />
          <circle cx="46" cy="18" r="3.5" fill="#90A4AE" />
        </svg>
      );
    case "video":
      return (
        <svg viewBox="0 0 64 64" aria-hidden className="h-full w-full">
          <rect
            x="6"
            y="12"
            width="52"
            height="40"
            rx="3"
            fill="#1A237E"
            stroke="#0D47A1"
            strokeWidth="1.5"
          />
          <rect x="10" y="16" width="36" height="28" fill="#000" />
          <path d="M22 22l14 8-14 8V22z" fill="#FF9800" />
          <rect x="48" y="18" width="6" height="8" rx="1" fill="#FF5722" />
          <rect x="48" y="30" width="6" height="8" rx="1" fill="#4CAF50" />
          <text
            x="28"
            y="52"
            fontSize="7"
            fontFamily="Tahoma, Arial"
            fill="#90CAF9"
            textAnchor="middle"
          >
            WMP
          </text>
        </svg>
      );
    case "film":
      return (
        <svg viewBox="0 0 64 64" aria-hidden className="h-full w-full">
          <rect
            x="10"
            y="8"
            width="44"
            height="48"
            rx="2"
            fill="#37474F"
            stroke="#263238"
            strokeWidth="1.5"
          />
          <rect x="14" y="12" width="6" height="5" fill="#ECEFF1" />
          <rect x="14" y="22" width="6" height="5" fill="#ECEFF1" />
          <rect x="14" y="32" width="6" height="5" fill="#ECEFF1" />
          <rect x="14" y="42" width="6" height="5" fill="#ECEFF1" />
          <rect x="44" y="12" width="6" height="5" fill="#ECEFF1" />
          <rect x="44" y="22" width="6" height="5" fill="#ECEFF1" />
          <rect x="44" y="32" width="6" height="5" fill="#ECEFF1" />
          <rect x="44" y="42" width="6" height="5" fill="#ECEFF1" />
          <rect x="24" y="14" width="16" height="36" fill="#1565C0" />
          <path d="M28 26l10 6-10 6V26z" fill="#FFE082" />
        </svg>
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
  { id: "photo", label: "Photo" },
  { id: "video", label: "Video" },
  { id: "film", label: "Film" },
  { id: "code", label: "Code" },
  { id: "doc", label: "Document" },
  { id: "music", label: "Music" },
];
