"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";

import { XpFileGlyph } from "@/experiences/xp-files/xp-icons";
import { XpPasswordDialog } from "@/experiences/xp-files/xp-password-dialog";
import {
  XpImageViewer,
  XpVideoPlayer,
} from "@/experiences/xp-files/xp-video-player";
import { verifyXpFilePinAction } from "@/actions/xp-files";
import { playWindowsXpClickSound } from "@/lib/windows-xp-startup-sound";
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

function WindowsXpLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M2 4.2l8.6-1.4v9.2H2V4.2z" fill="#F25022" />
      <path d="M11.4 2.6L22 1v11H11.4V2.6z" fill="#7FBA00" />
      <path d="M2 13.2h8.6V22L2 20.6v-7.4z" fill="#00A4EF" />
      <path d="M11.4 13.2H22V23l-10.6-1.6v-8.2z" fill="#FFB900" />
    </svg>
  );
}

function formatTrayClock(d: Date) {
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

function WinMaxButton({
  maximized,
  onToggle,
}: {
  maximized: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="win-btn max"
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      role="button"
      tabIndex={0}
      title={maximized ? "Restore Down" : "Maximize"}
      aria-label={maximized ? "Restore Down" : "Maximize"}
    >
      {maximized ? "❐" : "□"}
    </div>
  );
}

type TaskItem = {
  key: string;
  title: string;
  icon: ReactNode;
  z: number;
  minimized: boolean;
  onFocus: () => void;
  onMinimize: () => void;
  onClose: () => void;
};

function MyComputerIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className="desk-svg">
      <rect
        x="6"
        y="6"
        width="36"
        height="26"
        rx="2"
        fill="#A8C7E8"
        stroke="#3B6EA5"
        strokeWidth="1.5"
      />
      <rect x="9" y="9" width="30" height="18" fill="#1B3F73" />
      <rect x="12" y="12" width="10" height="7" fill="#7CB342" opacity=".85" />
      <rect x="24" y="12" width="12" height="3" fill="#90CAF9" />
      <rect x="24" y="17" width="8" height="2" fill="#64B5F6" />
      <rect
        x="16"
        y="32"
        width="16"
        height="4"
        fill="#B0BEC5"
        stroke="#78909C"
        strokeWidth="1"
      />
      <rect
        x="10"
        y="36"
        width="28"
        height="5"
        rx="1"
        fill="#CFD8DC"
        stroke="#78909C"
        strokeWidth="1"
      />
    </svg>
  );
}

function GamesIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className="desk-svg">
      <rect
        x="6"
        y="16"
        width="36"
        height="20"
        rx="8"
        fill="#5C6BC0"
        stroke="#283593"
        strokeWidth="1.5"
      />
      <circle
        cx="16"
        cy="26"
        r="4.5"
        fill="#EF5350"
        stroke="#C62828"
        strokeWidth="1"
      />
      <circle cx="16" cy="26" r="1.6" fill="#FFCDD2" />
      <rect x="28" y="22" width="3.2" height="8" rx="1" fill="#ECEFF1" />
      <rect x="25.4" y="24.4" width="8.4" height="3.2" rx="1" fill="#ECEFF1" />
      <circle cx="38" cy="22" r="1.4" fill="#FFEE58" />
      <circle cx="41" cy="26" r="1.4" fill="#66BB6A" />
    </svg>
  );
}

function DriveMadCarIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className="desk-svg">
      <path
        d="M8 28c0-1.2.6-2.3 1.6-3l3.2-2.2 2.4-5.4A4 4 0 0 1 18.8 15h10.4a4 4 0 0 1 3.6 2.4l2.4 5.4 3.2 2.2c1 .7 1.6 1.8 1.6 3V33a2 2 0 0 1-2 2h-2.2a4.2 4.2 0 0 1-8.2 0H20.4a4.2 4.2 0 0 1-8.2 0H10a2 2 0 0 1-2-2v-5z"
        fill="#FF7043"
        stroke="#BF360C"
        strokeWidth="1.2"
      />
      <path
        d="M15 22.5h18l-1.5-3.4A2 2 0 0 0 29.7 18H18.3a2 2 0 0 0-1.8 1.1L15 22.5z"
        fill="#81D4FA"
        stroke="#0277BD"
        strokeWidth="1"
      />
      <circle
        cx="16.2"
        cy="34.2"
        r="3.6"
        fill="#37474F"
        stroke="#263238"
        strokeWidth="1"
      />
      <circle cx="16.2" cy="34.2" r="1.4" fill="#90A4AE" />
      <circle
        cx="31.8"
        cy="34.2"
        r="3.6"
        fill="#37474F"
        stroke="#263238"
        strokeWidth="1"
      />
      <circle cx="31.8" cy="34.2" r="1.4" fill="#90A4AE" />
      <rect x="34.5" y="26.5" width="4" height="2" rx=".5" fill="#FFE082" />
    </svg>
  );
}

function PlanetDefenseIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className="desk-svg">
      <rect
        x="4"
        y="4"
        width="40"
        height="40"
        rx="3"
        fill="#0D1B2A"
        stroke="#1B3A4B"
        strokeWidth="1.2"
      />
      <circle cx="12" cy="12" r="1.2" fill="#E0F7FA" />
      <circle cx="38" cy="14" r=".9" fill="#B3E5FC" />
      <circle cx="34" cy="10" r=".7" fill="#fff" />
      <circle cx="14" cy="36" r="1" fill="#ECEFF1" />
      <circle
        cx="24"
        cy="25"
        r="9"
        fill="#42A5F5"
        stroke="#1565C0"
        strokeWidth="1.2"
      />
      <path
        d="M16 23c3-4 8-5 13-2 2 1.2 3.5 3 4 5"
        fill="none"
        stroke="#81C784"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M24 14l2.2 5.5 5.8.2-4.5 3.6 1.5 5.6L24 26.2l-5 2.7 1.5-5.6-4.5-3.6 5.8-.2L24 14z"
        fill="#FFEE58"
        stroke="#F9A825"
        strokeWidth=".8"
      />
      <path
        d="M33 31l6 2-4 3 1 5-5-3-5 3 1-5-4-3 6-2z"
        fill="#EF5350"
        stroke="#C62828"
        strokeWidth=".7"
      />
    </svg>
  );
}

function GorillasIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className="desk-svg">
      <ellipse cx="24" cy="36" rx="11" ry="7" fill="#4E342E" />
      <path
        d="M14 28c-4 2-7 6-6 10 4 1 8-1 10-4M34 28c4 2 7 6 6 10-4 1-8-1-10-4"
        fill="none"
        stroke="#3E2723"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <ellipse
        cx="24"
        cy="24"
        rx="10"
        ry="11"
        fill="#5D4037"
        stroke="#3E2723"
        strokeWidth="1.2"
      />
      <ellipse cx="24" cy="27" rx="6.5" ry="5.5" fill="#A1887F" />
      <circle cx="20.5" cy="22" r="2.2" fill="#EFEBE9" />
      <circle cx="27.5" cy="22" r="2.2" fill="#EFEBE9" />
      <circle cx="20.5" cy="22.2" r="1" fill="#212121" />
      <circle cx="27.5" cy="22.2" r="1" fill="#212121" />
      <ellipse cx="24" cy="26.2" rx="2.2" ry="1.4" fill="#6D4C41" />
      <path
        d="M21.5 29.5c1.2 1.4 3.8 1.4 5 0"
        fill="none"
        stroke="#3E2723"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M17 14c2-5 5-7 7-7s5 2 7 7"
        fill="#5D4037"
        stroke="#3E2723"
        strokeWidth="1"
      />
      <circle
        cx="18"
        cy="14"
        r="3.2"
        fill="#5D4037"
        stroke="#3E2723"
        strokeWidth="1"
      />
      <circle
        cx="30"
        cy="14"
        r="3.2"
        fill="#5D4037"
        stroke="#3E2723"
        strokeWidth="1"
      />
    </svg>
  );
}

function PepsimanIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="desk-svg desk-img-icon"
      src="/xp-games/pepsiman/icon.png"
      alt=""
      draggable={false}
    />
  );
}

function SpiderManIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="desk-svg desk-img-icon"
      src="/xp-games/spider-man/icon.png"
      alt=""
      draggable={false}
    />
  );
}

const XP_GAMES = [
  {
    id: "drive-mad",
    name: "Drive Mad",
    href: "/xp-games/drive-mad/index.html",
    Icon: DriveMadCarIcon,
  },
  {
    id: "planet-defense",
    name: "Planet Defense",
    href: "/xp-games/planet-defense/index.html",
    Icon: PlanetDefenseIcon,
  },
  {
    id: "gorillas",
    name: "Gorillas",
    href: "/xp-games/gorillas/index.html",
    Icon: GorillasIcon,
  },
  {
    id: "pepsiman",
    name: "Pepsiman",
    href: "/xp-games/pepsiman/index.html",
    Icon: PepsimanIcon,
  },
  {
    id: "spider-man",
    name: "Spider-Man",
    href: "/xp-games/spider-man/index.html",
    Icon: SpiderManIcon,
  },
] as const;

type XpGameId = (typeof XP_GAMES)[number]["id"];

function RecycleBinIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className="desk-svg">
      <path
        d="M14 14h20l-2 26H16L14 14z"
        fill="#ECEFF1"
        stroke="#78909C"
        strokeWidth="1.5"
      />
      <path
        d="M18 20v16M24 20v16M30 20v16"
        stroke="#90A4AE"
        strokeWidth="1.6"
      />
      <rect
        x="12"
        y="11"
        width="24"
        height="4"
        rx="1"
        fill="#B0BEC5"
        stroke="#78909C"
        strokeWidth="1"
      />
      <path d="M20 11V9h8v2" fill="none" stroke="#78909C" strokeWidth="1.5" />
      <path
        d="M16 18l2 18M32 18l-2 18"
        stroke="#CFD8DC"
        strokeWidth="1"
        opacity=".5"
      />
    </svg>
  );
}

function GoogleChromeIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className="desk-svg">
      <circle cx="24" cy="24" r="18" fill="#F44336" />
      <path d="M24 6a18 18 0 0 1 15.6 9H24V6z" fill="#FFC107" />
      <path d="M39.6 15A18 18 0 0 1 24 42V30h10.4L39.6 15z" fill="#4CAF50" />
      <path d="M24 42A18 18 0 0 1 8.4 15L24 15v27z" fill="#F44336" />
      <circle cx="24" cy="24" r="8" fill="#fff" />
      <circle cx="24" cy="24" r="5.5" fill="#1A73E8" />
    </svg>
  );
}

type DeskIconId = "my-computer" | "recycle-bin" | "chrome" | "games";

type RecycleWin = {
  id: number;
  x: number;
  y: number;
  z: number;
};

type GamesFolderWin = {
  id: number;
  x: number;
  y: number;
  z: number;
};

type GamePlayWin = {
  id: number;
  gameId: XpGameId;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
};

type ChromeWin = {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  url: string;
};

/** Google blocks plain google.com in iframes; igu=1 is the embeddable homepage. */
const CHROME_HOME = "https://www.google.com/webhp?igu=1";
const CHROME_HOME_DISPLAY = "https://www.google.com";

function toChromeEmbedUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return CHROME_HOME;
  let href = trimmed;
  if (!/^https?:\/\//i.test(href)) {
    if (href.includes(" ") || !href.includes(".")) {
      return `https://www.google.com/search?igu=1&q=${encodeURIComponent(href)}`;
    }
    href = `https://${href}`;
  }
  try {
    const u = new URL(href);
    if (u.hostname.includes("google.")) {
      // Homepage → embeddable Google home
      if (u.pathname === "/" || u.pathname === "/webhp") {
        return CHROME_HOME;
      }
      u.searchParams.set("igu", "1");
      return u.toString();
    }
    return u.toString();
  } catch {
    return `https://www.google.com/search?igu=1&q=${encodeURIComponent(trimmed)}`;
  }
}

function displayChromeUrl(url: string) {
  try {
    const u = new URL(url);
    u.searchParams.delete("igu");
    if (
      u.hostname.includes("google.") &&
      (u.pathname === "/" || u.pathname === "/webhp")
    ) {
      return CHROME_HOME_DISPLAY;
    }
    const s = u.toString();
    return s.endsWith("/") && u.pathname === "/" && !u.search ? u.origin : s;
  } catch {
    return url;
  }
}

function ChromeBrowserPane({
  url,
  onNavigate,
}: {
  url: string;
  onNavigate: (next: string) => void;
}) {
  const [draft, setDraft] = useState(() => displayChromeUrl(url));

  useEffect(() => {
    setDraft(displayChromeUrl(url));
  }, [url]);

  return (
    <div className="chrome-pane">
      <div className="chrome-tabs">
        <div className="chrome-tab active">
          <GoogleChromeIcon />
          <span>Google</span>
        </div>
      </div>
      <form
        className="chrome-toolbar"
        onSubmit={(e) => {
          e.preventDefault();
          onNavigate(toChromeEmbedUrl(draft));
        }}
      >
        <button
          type="button"
          className="chrome-nav-btn"
          title="Home"
          onClick={() => onNavigate(CHROME_HOME)}
        >
          ⌂
        </button>
        <button type="submit" className="chrome-nav-btn" title="Go">
          →
        </button>
        <input
          className="chrome-address"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          spellCheck={false}
          aria-label="Address bar"
        />
      </form>
      <iframe
        className="chrome-frame"
        title="Google Chrome"
        src={url}
        referrerPolicy="no-referrer-when-downgrade"
        allow="fullscreen; clipboard-read; clipboard-write"
      />
    </div>
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
  const zTop = useRef(40);
  const notepadId = useRef(0);
  const linkPopups = useRef(new Map<string, Window>());

  const [folderPos, setFolderPos] = useState({ x: 0, y: 48 });
  const [folderOpen, setFolderOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [deskSelected, setDeskSelected] = useState<DeskIconId | null>(null);
  const [notepads, setNotepads] = useState<NotepadWin[]>([]);
  const [recycleWins, setRecycleWins] = useState<RecycleWin[]>([]);
  const [gamesFolderWins, setGamesFolderWins] = useState<GamesFolderWin[]>([]);
  const [gamePlayWins, setGamePlayWins] = useState<GamePlayWin[]>([]);
  const [chromeWins, setChromeWins] = useState<ChromeWin[]>([]);
  const [gamesSelected, setGamesSelected] = useState<XpGameId | null>(null);
  const [folderZ, setFolderZ] = useState(40);
  const [minimizedKeys, setMinimizedKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [maximizedKeys, setMaximizedKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [trayClock, setTrayClock] = useState(() => formatTrayClock(new Date()));
  const recycleId = useRef(0);
  const gamesFolderId = useRef(0);
  const gamePlayId = useRef(0);
  const chromeId = useRef(0);
  const [popupBlocked, setPopupBlocked] = useState<Record<string, boolean>>({});
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(() => new Set());
  const [pinPrompt, setPinPrompt] = useState<{
    fileId: string;
    error: string | null;
    pending: boolean;
  } | null>(null);

  const fileById = useCallback(
    (id: string) => files.find((f) => f.id === id) ?? null,
    [files],
  );

  const openExternalSite = useCallback((fileId: string, href: string) => {
    const existing = linkPopups.current.get(fileId);
    if (existing && !existing.closed) {
      existing.focus();
      setPopupBlocked((prev) => ({ ...prev, [fileId]: false }));
      return existing;
    }

    const w = Math.min(1040, window.screen.availWidth - 40);
    const h = Math.min(760, window.screen.availHeight - 80);
    const left = Math.max(0, Math.round((window.screen.availWidth - w) / 2));
    const top = Math.max(0, Math.round((window.screen.availHeight - h) / 2));
    const popup = window.open(
      href,
      `xp-ie-${fileId}`,
      `popup=yes,width=${w},height=${h},left=${left},top=${top},scrollbars=yes,resizable=yes`,
    );

    if (!popup) {
      setPopupBlocked((prev) => ({ ...prev, [fileId]: true }));
      return null;
    }

    linkPopups.current.set(fileId, popup);
    setPopupBlocked((prev) => ({ ...prev, [fileId]: false }));
    return popup;
  }, []);

  useEffect(() => {
    if (!active) {
      setNotepads([]);
      setRecycleWins([]);
      setGamesFolderWins([]);
      setGamePlayWins([]);
      setChromeWins([]);
      setSelected(null);
      setDeskSelected(null);
      setGamesSelected(null);
      setFolderOpen(false);
      setMinimizedKeys(new Set());
      setMaximizedKeys(new Set());
      setStartMenuOpen(false);
      setPopupBlocked({});
      setUnlockedIds(new Set());
      setPinPrompt(null);
      return;
    }
    const w = Math.min(780, window.innerWidth - 24);
    // Leave room for desktop icons on the left
    setFolderPos({ x: Math.max(120, (window.innerWidth - w) / 2), y: 48 });
  }, [active]);

  useEffect(() => {
    if (!active) return;
    const tick = () => setTrayClock(formatTrayClock(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [active]);

  const isMinimized = useCallback(
    (key: string) => minimizedKeys.has(key),
    [minimizedKeys],
  );

  const setMinimized = useCallback((key: string, value: boolean) => {
    setMinimizedKeys((prev) => {
      const next = new Set(prev);
      if (value) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);

  const isMaximized = useCallback(
    (key: string) => maximizedKeys.has(key),
    [maximizedKeys],
  );

  const toggleMaximize = useCallback((key: string) => {
    setMaximizedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const clearMaximized = useCallback((key: string) => {
    setMaximizedKeys((prev) => {
      if (!prev.has(key)) return prev;
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const focusExplorer = useCallback(() => {
    setFolderOpen(true);
    setMinimized("explorer", false);
    zTop.current += 1;
    setFolderZ(zTop.current);
    if (folderRef.current) {
      folderRef.current.style.zIndex = String(zTop.current);
    }
  }, [setMinimized]);

  const openRecycleBin = useCallback(() => {
    recycleId.current += 1;
    zTop.current += 1;
    const id = recycleId.current;
    setMinimized(`recycle-${id}`, false);
    setRecycleWins((prev) => [
      ...prev,
      {
        id,
        x: 140 + id * 20,
        y: 100 + id * 20,
        z: zTop.current,
      },
    ]);
  }, [setMinimized]);

  const openGoogleChrome = useCallback(() => {
    zTop.current += 1;
    setChromeWins((prev) => {
      const existing = prev[0];
      if (existing) {
        setMinimized(`chrome-${existing.id}`, false);
        return prev.map((w) =>
          w.id === existing.id ? { ...w, z: zTop.current } : w,
        );
      }
      chromeId.current += 1;
      const id = chromeId.current;
      setMinimized(`chrome-${id}`, false);
      return [
        {
          id,
          x: 56,
          y: 40,
          w: Math.min(960, window.innerWidth - 48),
          h: Math.min(640, window.innerHeight - 96),
          z: zTop.current,
          url: CHROME_HOME,
        },
      ];
    });
  }, [setMinimized]);

  const openGamesFolder = useCallback(() => {
    gamesFolderId.current += 1;
    zTop.current += 1;
    const id = gamesFolderId.current;
    setMinimized(`games-folder-${id}`, false);
    setGamesFolderWins((prev) => [
      ...prev,
      {
        id,
        x: 160 + id * 18,
        y: 90 + id * 18,
        z: zTop.current,
      },
    ]);
  }, [setMinimized]);

  const openGame = useCallback(
    (gameId: XpGameId) => {
      zTop.current += 1;
      setGamePlayWins((prev) => {
        const existing = prev.find((w) => w.gameId === gameId);
        if (existing) {
          setMinimized(`game-${existing.id}`, false);
          return prev.map((w) =>
            w.id === existing.id ? { ...w, z: zTop.current } : w,
          );
        }
        gamePlayId.current += 1;
        const id = gamePlayId.current;
        setMinimized(`game-${id}`, false);
        return [
          ...prev,
          {
            id,
            gameId,
            x: 48 + id * 16,
            y: 56 + id * 16,
            w: Math.min(920, window.innerWidth - 48),
            h: Math.min(680, window.innerHeight - 72),
            z: zTop.current,
          },
        ];
      });
    },
    [setMinimized],
  );

  const onDeskIconOpen = (id: DeskIconId) => {
    setDeskSelected(id);
    if (id === "my-computer") focusExplorer();
    else if (id === "recycle-bin") openRecycleBin();
    else if (id === "games") openGamesFolder();
    else openGoogleChrome();
  };

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

      const handle = e.currentTarget as HTMLElement;
      const winEl = handle.closest(".xp-window") as HTMLElement | null;
      if (!winEl) return;

      const pointerId = e.pointerId;
      const startX = e.clientX;
      const startY = e.clientY;
      const origin = opts.getOrigin();
      let latest = origin;
      let raf = 0;
      let pending: { x: number; y: number } | null = null;
      let dragging = true;

      // Iframes swallow pointerup — disable them for the drag + capture pointer.
      rootRef.current?.classList.add("is-dragging-window");
      try {
        handle.setPointerCapture(pointerId);
      } catch {
        /* older browsers / non-primary pointers */
      }

      winEl.style.willChange = "left, top";
      winEl.style.left = `${origin.x}px`;
      winEl.style.top = `${origin.y}px`;
      winEl.style.transform = "";

      const flush = () => {
        raf = 0;
        if (!pending || !dragging) return;
        latest = pending;
        pending = null;
        winEl.style.left = `${latest.x}px`;
        winEl.style.top = `${latest.y}px`;
      };

      const onPointerMove = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        pending = opts.clamp(
          origin.x + (ev.clientX - startX),
          origin.y + (ev.clientY - startY),
        );
        if (!raf) raf = requestAnimationFrame(flush);
      };

      const endDrag = (ev?: Event) => {
        if (
          ev &&
          "pointerId" in ev &&
          (ev as PointerEvent).pointerId !== pointerId
        ) {
          return;
        }
        if (!dragging) return;
        dragging = false;
        if (raf) cancelAnimationFrame(raf);
        if (pending) {
          latest = pending;
          pending = null;
        }
        winEl.style.left = `${latest.x}px`;
        winEl.style.top = `${latest.y}px`;
        winEl.style.willChange = "";
        winEl.style.transform = "";
        rootRef.current?.classList.remove("is-dragging-window");
        try {
          if (handle.hasPointerCapture(pointerId)) {
            handle.releasePointerCapture(pointerId);
          }
        } catch {
          /* already released */
        }
        window.removeEventListener("pointermove", onPointerMove, true);
        window.removeEventListener("pointerup", endDrag, true);
        window.removeEventListener("pointercancel", endDrag, true);
        handle.removeEventListener("lostpointercapture", endDrag);
        // Sync React state in the same turn so controlled left/top
        // never snap back to the pre-drag position for a frame.
        flushSync(() => {
          opts.commit(latest);
        });
      };

      // Capture phase so we still see the release if something stops bubbling.
      window.addEventListener("pointermove", onPointerMove, {
        passive: true,
        capture: true,
      });
      window.addEventListener("pointerup", endDrag, true);
      window.addEventListener("pointercancel", endDrag, true);
      handle.addEventListener("lostpointercapture", endDrag);
    },
    [],
  );

  const openNotepad = (fileId: string) => {
    notepadId.current += 1;
    zTop.current += 1;
    const id = notepadId.current;
    const file = files.find((f) => f.id === fileId);
    const mode = file?.openMode ?? "script";

    if (mode === "link" && file?.href) {
      openExternalSite(fileId, file.href);
    }

    const size =
      mode === "link"
        ? { w: 520, h: 280 }
        : mode === "video"
          ? { w: 640, h: 480 }
          : mode === "image"
            ? { w: 560, h: 440 }
            : { w: 560, h: 420 };

    setNotepads((prev) => [
      ...prev,
      {
        id,
        fileId,
        x: 80 + id * 24,
        y: 60 + id * 24,
        w: Math.min(size.w, window.innerWidth - 32),
        h: Math.min(size.h, window.innerHeight - 80),
        z: zTop.current,
      },
    ]);
  };

  const requestOpenFile = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (!file) return;

    if (file.locked && !unlockedIds.has(fileId)) {
      setPinPrompt({ fileId, error: null, pending: false });
      return;
    }

    openNotepad(fileId);
  };

  const submitPin = async (pin: string) => {
    if (!pinPrompt) return;
    const { fileId } = pinPrompt;
    setPinPrompt({ fileId, error: null, pending: true });

    const result = await verifyXpFilePinAction({ id: fileId, pin });
    if (result?.serverError) {
      setPinPrompt({
        fileId,
        error: result.serverError,
        pending: false,
      });
      return;
    }
    if (!result?.data?.unlocked) {
      setPinPrompt({
        fileId,
        error: "Incorrect password.",
        pending: false,
      });
      return;
    }

    setUnlockedIds((prev) => new Set(prev).add(fileId));
    setPinPrompt(null);
    openNotepad(fileId);
  };

  const taskItems = useMemo(() => {
    const items: TaskItem[] = [];

    if (folderOpen) {
      items.push({
        key: "explorer",
        title: "Mordesu Studio: Files",
        icon: <FolderSvg />,
        z: folderZ,
        minimized: isMinimized("explorer"),
        onFocus: () => focusExplorer(),
        onMinimize: () => setMinimized("explorer", true),
        onClose: () => {
          setFolderOpen(false);
          setMinimized("explorer", false);
        },
      });
    }

    for (const win of recycleWins) {
      const key = `recycle-${win.id}`;
      items.push({
        key,
        title: "Recycle Bin",
        icon: <RecycleBinIcon />,
        z: win.z,
        minimized: isMinimized(key),
        onFocus: () => {
          setMinimized(key, false);
          zTop.current += 1;
          setRecycleWins((prev) =>
            prev.map((n) => (n.id === win.id ? { ...n, z: zTop.current } : n)),
          );
        },
        onMinimize: () => setMinimized(key, true),
        onClose: () => {
          setMinimized(key, false);
          setRecycleWins((prev) => prev.filter((n) => n.id !== win.id));
        },
      });
    }

    for (const win of gamesFolderWins) {
      const key = `games-folder-${win.id}`;
      items.push({
        key,
        title: "Games",
        icon: <GamesIcon />,
        z: win.z,
        minimized: isMinimized(key),
        onFocus: () => {
          setMinimized(key, false);
          zTop.current += 1;
          setGamesFolderWins((prev) =>
            prev.map((n) => (n.id === win.id ? { ...n, z: zTop.current } : n)),
          );
        },
        onMinimize: () => setMinimized(key, true),
        onClose: () => {
          setMinimized(key, false);
          setGamesFolderWins((prev) => prev.filter((n) => n.id !== win.id));
        },
      });
    }

    for (const win of gamePlayWins) {
      const game = XP_GAMES.find((g) => g.id === win.gameId);
      if (!game) continue;
      const key = `game-${win.id}`;
      const Icon = game.Icon;
      items.push({
        key,
        title: game.name,
        icon: <Icon />,
        z: win.z,
        minimized: isMinimized(key),
        onFocus: () => {
          setMinimized(key, false);
          zTop.current += 1;
          setGamePlayWins((prev) =>
            prev.map((n) => (n.id === win.id ? { ...n, z: zTop.current } : n)),
          );
        },
        onMinimize: () => setMinimized(key, true),
        onClose: () => {
          setMinimized(key, false);
          setGamePlayWins((prev) => prev.filter((n) => n.id !== win.id));
        },
      });
    }

    for (const win of chromeWins) {
      const key = `chrome-${win.id}`;
      items.push({
        key,
        title: "Google Chrome",
        icon: <GoogleChromeIcon />,
        z: win.z,
        minimized: isMinimized(key),
        onFocus: () => {
          setMinimized(key, false);
          zTop.current += 1;
          setChromeWins((prev) =>
            prev.map((n) => (n.id === win.id ? { ...n, z: zTop.current } : n)),
          );
        },
        onMinimize: () => setMinimized(key, true),
        onClose: () => {
          setMinimized(key, false);
          setChromeWins((prev) => prev.filter((n) => n.id !== win.id));
        },
      });
    }

    for (const win of notepads) {
      const file = fileById(win.fileId);
      if (!file) continue;
      const key = `notepad-${win.id}`;
      const title =
        file.openMode === "link"
          ? `${file.name} - Internet Explorer`
          : file.openMode === "video"
            ? `${file.name} - Windows Media Player`
            : file.openMode === "image"
              ? `${file.name} - Windows Picture and Fax Viewer`
              : `${file.name} - Notepad`;
      items.push({
        key,
        title,
        icon: <XpFileGlyph icon={file.icon} />,
        z: win.z,
        minimized: isMinimized(key),
        onFocus: () => {
          setMinimized(key, false);
          zTop.current += 1;
          setNotepads((prev) =>
            prev.map((n) => (n.id === win.id ? { ...n, z: zTop.current } : n)),
          );
        },
        onMinimize: () => setMinimized(key, true),
        onClose: () => {
          setMinimized(key, false);
          setNotepads((prev) => prev.filter((n) => n.id !== win.id));
        },
      });
    }

    return items;
  }, [
    folderOpen,
    folderZ,
    recycleWins,
    gamesFolderWins,
    gamePlayWins,
    chromeWins,
    notepads,
    fileById,
    isMinimized,
    setMinimized,
    focusExplorer,
  ]);

  const topTaskKey = useMemo(() => {
    let best: TaskItem | null = null;
    for (const item of taskItems) {
      if (item.minimized) continue;
      if (!best || item.z > best.z) best = item;
    }
    return best?.key ?? null;
  }, [taskItems]);

  if (!active) return null;

  return (
    <div
      ref={rootRef}
      className={cn(
        "xp-desktop",
        maximizedKeys.size > 0 && "has-maximized",
        className,
      )}
      role="dialog"
      aria-label="Windows XP files easter egg"
      onPointerDown={(e) => {
        if (e.button === 0) {
          const t = e.target as HTMLElement;
          // Skip game iframes / media controls — keep XP chrome clicks only.
          if (!t.closest(".game-frame, .xp-media-player, iframe")) {
            void playWindowsXpClickSound();
          }
        }
        if (
          startMenuOpen &&
          !(e.target as HTMLElement).closest(".xp-start-menu, .xp-start-btn")
        ) {
          setStartMenuOpen(false);
        }
        // Click empty desktop wallpaper → clear icon selection
        if (e.target === e.currentTarget) {
          setDeskSelected(null);
        }
      }}
    >
      <button type="button" className="xp-back" onClick={onClose}>
        ← Back to Mordesu
      </button>

      <div className="desk-icons" onClick={() => setDeskSelected(null)}>
        {(
          [
            {
              id: "my-computer" as const,
              label: "My Computer",
              icon: <MyComputerIcon />,
            },
            {
              id: "recycle-bin" as const,
              label: "Recycle Bin",
              icon: <RecycleBinIcon />,
            },
            {
              id: "chrome" as const,
              label: "Google Chrome",
              icon: <GoogleChromeIcon />,
            },
            {
              id: "games" as const,
              label: "Games",
              icon: <GamesIcon />,
            },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            className={cn("desk-icon", deskSelected === item.id && "selected")}
            onClick={(e) => {
              e.stopPropagation();
              setDeskSelected(item.id);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              onDeskIconOpen(item.id);
            }}
          >
            <div className="desk-glyph">{item.icon}</div>
            <span className="desk-label">{item.label}</span>
          </button>
        ))}
      </div>

      {folderOpen && !isMinimized("explorer") ? (
        <div
          ref={folderRef}
          className={cn(
            "xp-window main-window",
            isMaximized("explorer") && "is-maximized",
          )}
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
            onDoubleClick={() => toggleMaximize("explorer")}
            onPointerDown={(e) => {
              zTop.current += 1;
              if (folderRef.current) {
                folderRef.current.style.zIndex = String(zTop.current);
              }
              if (isMaximized("explorer")) {
                setFolderZ(zTop.current);
                return;
              }
              startDrag(e, {
                getOrigin: () => folderPos,
                commit: (pos) => {
                  setFolderPos(pos);
                  setFolderZ(zTop.current);
                },
                clamp: (x, y) => ({
                  x: Math.max(-200, Math.min(window.innerWidth - 80, x)),
                  y: Math.max(0, Math.min(window.innerHeight - 80, y)),
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
                onClick={() => setMinimized("explorer", true)}
                role="button"
                tabIndex={0}
              >
                _
              </div>
              <WinMaxButton
                maximized={isMaximized("explorer")}
                onToggle={() => toggleMaximize("explorer")}
              />
              <div
                className="win-btn close"
                onClick={() => {
                  setFolderOpen(false);
                  setMinimized("explorer", false);
                  clearMaximized("explorer");
                }}
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
                    onDoubleClick={() => requestOpenFile(file.id)}
                  >
                    <div className="file-glyph">
                      <XpFileGlyph icon={file.icon} />
                      {file.locked ? (
                        <span className="file-lock" title="Password protected">
                          <svg viewBox="0 0 16 16" aria-hidden>
                            <rect
                              x="3"
                              y="7"
                              width="10"
                              height="8"
                              rx="1.5"
                              fill="#F4C542"
                              stroke="#8B6914"
                              strokeWidth="1"
                            />
                            <path
                              d="M5 7V5a3 3 0 0 1 6 0v2"
                              fill="none"
                              stroke="#546E7A"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                          </svg>
                        </span>
                      ) : null}
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

      {recycleWins.map((win) => {
        const key = `recycle-${win.id}`;
        if (isMinimized(key)) return null;
        const maximized = isMaximized(key);
        return (
          <div
            key={key}
            className={cn(
              "xp-window recycle-window",
              maximized && "is-maximized",
            )}
            style={{
              left: win.x,
              top: win.y,
              zIndex: win.z,
            }}
            onPointerDown={(e) => {
              if ((e.target as HTMLElement).closest(".titlebar")) return;
              zTop.current += 1;
              const el = e.currentTarget;
              el.style.zIndex = String(zTop.current);
              setRecycleWins((prev) =>
                prev.map((n) =>
                  n.id === win.id ? { ...n, z: zTop.current } : n,
                ),
              );
            }}
          >
            <div
              className="titlebar"
              onDoubleClick={() => toggleMaximize(key)}
              onPointerDown={(e) => {
                zTop.current += 1;
                const winEl = (e.currentTarget as HTMLElement).closest(
                  ".xp-window",
                ) as HTMLElement | null;
                if (winEl) winEl.style.zIndex = String(zTop.current);
                if (maximized) {
                  setRecycleWins((prev) =>
                    prev.map((n) =>
                      n.id === win.id ? { ...n, z: zTop.current } : n,
                    ),
                  );
                  return;
                }
                startDrag(e, {
                  getOrigin: () => ({ x: win.x, y: win.y }),
                  commit: (pos) => {
                    setRecycleWins((prev) =>
                      prev.map((n) =>
                        n.id === win.id
                          ? { ...n, x: pos.x, y: pos.y, z: zTop.current }
                          : n,
                      ),
                    );
                  },
                  clamp: (x, y) => ({
                    x: Math.max(0, Math.min(window.innerWidth - 80, x)),
                    y: Math.max(0, Math.min(window.innerHeight - 80, y)),
                  }),
                });
              }}
            >
              <span className="ttl-icon">
                <RecycleBinIcon />
              </span>
              <span className="ttl-text">Recycle Bin</span>
              <div className="win-btns">
                <div
                  className="win-btn min"
                  onClick={() => setMinimized(key, true)}
                  role="button"
                  tabIndex={0}
                >
                  _
                </div>
                <WinMaxButton
                  maximized={maximized}
                  onToggle={() => toggleMaximize(key)}
                />
                <div
                  className="win-btn close"
                  onClick={() => {
                    setMinimized(key, false);
                    clearMaximized(key);
                    setRecycleWins((prev) =>
                      prev.filter((n) => n.id !== win.id),
                    );
                  }}
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
            <div className="recycle-body">
              <p>The Recycle Bin is empty.</p>
            </div>
            <div className="np-status">0 object(s)</div>
          </div>
        );
      })}

      {gamesFolderWins.map((win) => {
        const key = `games-folder-${win.id}`;
        if (isMinimized(key)) return null;
        const maximized = isMaximized(key);
        return (
          <div
            key={key}
            className={cn(
              "xp-window games-folder-window",
              maximized && "is-maximized",
            )}
            style={{
              left: win.x,
              top: win.y,
              zIndex: win.z,
            }}
            onPointerDown={(e) => {
              if ((e.target as HTMLElement).closest(".titlebar")) return;
              zTop.current += 1;
              const el = e.currentTarget;
              el.style.zIndex = String(zTop.current);
              setGamesFolderWins((prev) =>
                prev.map((n) =>
                  n.id === win.id ? { ...n, z: zTop.current } : n,
                ),
              );
            }}
          >
            <div
              className="titlebar"
              onDoubleClick={() => toggleMaximize(key)}
              onPointerDown={(e) => {
                zTop.current += 1;
                const winEl = (e.currentTarget as HTMLElement).closest(
                  ".xp-window",
                ) as HTMLElement | null;
                if (winEl) winEl.style.zIndex = String(zTop.current);
                if (maximized) {
                  setGamesFolderWins((prev) =>
                    prev.map((n) =>
                      n.id === win.id ? { ...n, z: zTop.current } : n,
                    ),
                  );
                  return;
                }
                startDrag(e, {
                  getOrigin: () => ({ x: win.x, y: win.y }),
                  commit: (pos) => {
                    setGamesFolderWins((prev) =>
                      prev.map((n) =>
                        n.id === win.id
                          ? { ...n, x: pos.x, y: pos.y, z: zTop.current }
                          : n,
                      ),
                    );
                  },
                  clamp: (x, y) => ({
                    x: Math.max(0, Math.min(window.innerWidth - 80, x)),
                    y: Math.max(0, Math.min(window.innerHeight - 80, y)),
                  }),
                });
              }}
            >
              <span className="ttl-icon">
                <GamesIcon />
              </span>
              <span className="ttl-text">Games</span>
              <div className="win-btns">
                <div
                  className="win-btn min"
                  onClick={() => setMinimized(key, true)}
                  role="button"
                  tabIndex={0}
                >
                  _
                </div>
                <WinMaxButton
                  maximized={maximized}
                  onToggle={() => toggleMaximize(key)}
                />
                <div
                  className="win-btn close"
                  onClick={() => {
                    setMinimized(key, false);
                    clearMaximized(key);
                    setGamesFolderWins((prev) =>
                      prev.filter((n) => n.id !== win.id),
                    );
                  }}
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
            <div
              className="content games-body"
              onClick={() => setGamesSelected(null)}
            >
              <div className="icon-grid">
                {XP_GAMES.map((game) => {
                  const Icon = game.Icon;
                  return (
                    <button
                      key={game.id}
                      type="button"
                      className={cn(
                        "file-icon",
                        gamesSelected === game.id && "selected",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        setGamesSelected(game.id);
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setGamesSelected(game.id);
                        openGame(game.id);
                      }}
                    >
                      <div className="file-glyph">
                        <Icon />
                      </div>
                      <div className="name">{game.name}</div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="np-status">{XP_GAMES.length} games</div>
          </div>
        );
      })}

      {gamePlayWins.map((win) => {
        const game = XP_GAMES.find((g) => g.id === win.gameId);
        if (!game) return null;
        const key = `game-${win.id}`;
        if (isMinimized(key)) return null;
        const maximized = isMaximized(key);
        const Icon = game.Icon;
        return (
          <div
            key={`game-play-${win.id}`}
            className={cn(
              "xp-window game-play-window",
              maximized && "is-maximized",
            )}
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
              setGamePlayWins((prev) =>
                prev.map((n) =>
                  n.id === win.id ? { ...n, z: zTop.current } : n,
                ),
              );
            }}
          >
            <div
              className="titlebar"
              onDoubleClick={() => toggleMaximize(key)}
              onPointerDown={(e) => {
                zTop.current += 1;
                const winEl = (e.currentTarget as HTMLElement).closest(
                  ".xp-window",
                ) as HTMLElement | null;
                if (winEl) winEl.style.zIndex = String(zTop.current);
                if (maximized) {
                  setGamePlayWins((prev) =>
                    prev.map((n) =>
                      n.id === win.id ? { ...n, z: zTop.current } : n,
                    ),
                  );
                  return;
                }
                startDrag(e, {
                  getOrigin: () => ({ x: win.x, y: win.y }),
                  commit: (pos) => {
                    setGamePlayWins((prev) =>
                      prev.map((n) =>
                        n.id === win.id
                          ? { ...n, x: pos.x, y: pos.y, z: zTop.current }
                          : n,
                      ),
                    );
                  },
                  clamp: (x, y) => ({
                    x: Math.max(0, Math.min(window.innerWidth - 80, x)),
                    y: Math.max(0, Math.min(window.innerHeight - 80, y)),
                  }),
                });
              }}
            >
              <span className="ttl-icon">
                <Icon />
              </span>
              <span className="ttl-text">{game.name}</span>
              <div className="win-btns">
                <div
                  className="win-btn min"
                  onClick={() => setMinimized(key, true)}
                  role="button"
                  tabIndex={0}
                >
                  _
                </div>
                <WinMaxButton
                  maximized={maximized}
                  onToggle={() => toggleMaximize(key)}
                />
                <div
                  className="win-btn close"
                  onClick={() => {
                    setMinimized(key, false);
                    clearMaximized(key);
                    setGamePlayWins((prev) =>
                      prev.filter((n) => n.id !== win.id),
                    );
                  }}
                  role="button"
                  tabIndex={0}
                >
                  ✕
                </div>
              </div>
            </div>
            <iframe
              className="game-frame"
              title={game.name}
              src={game.href}
              allow="fullscreen; gamepad; autoplay"
            />
          </div>
        );
      })}

      {chromeWins.map((win) => {
        const key = `chrome-${win.id}`;
        if (isMinimized(key)) return null;
        const maximized = isMaximized(key);
        return (
          <div
            key={key}
            className={cn(
              "xp-window chrome-window",
              maximized && "is-maximized",
            )}
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
              setChromeWins((prev) =>
                prev.map((n) =>
                  n.id === win.id ? { ...n, z: zTop.current } : n,
                ),
              );
            }}
          >
            <div
              className="titlebar"
              onDoubleClick={() => toggleMaximize(key)}
              onPointerDown={(e) => {
                zTop.current += 1;
                const winEl = (e.currentTarget as HTMLElement).closest(
                  ".xp-window",
                ) as HTMLElement | null;
                if (winEl) winEl.style.zIndex = String(zTop.current);
                if (maximized) {
                  setChromeWins((prev) =>
                    prev.map((n) =>
                      n.id === win.id ? { ...n, z: zTop.current } : n,
                    ),
                  );
                  return;
                }
                startDrag(e, {
                  getOrigin: () => ({ x: win.x, y: win.y }),
                  commit: (pos) => {
                    setChromeWins((prev) =>
                      prev.map((n) =>
                        n.id === win.id
                          ? { ...n, x: pos.x, y: pos.y, z: zTop.current }
                          : n,
                      ),
                    );
                  },
                  clamp: (x, y) => ({
                    x: Math.max(0, Math.min(window.innerWidth - 80, x)),
                    y: Math.max(0, Math.min(window.innerHeight - 80, y)),
                  }),
                });
              }}
            >
              <span className="ttl-icon">
                <GoogleChromeIcon />
              </span>
              <span className="ttl-text">Google - Google Chrome</span>
              <div className="win-btns">
                <div
                  className="win-btn min"
                  onClick={() => setMinimized(key, true)}
                  role="button"
                  tabIndex={0}
                >
                  _
                </div>
                <WinMaxButton
                  maximized={maximized}
                  onToggle={() => toggleMaximize(key)}
                />
                <div
                  className="win-btn close"
                  onClick={() => {
                    setMinimized(key, false);
                    clearMaximized(key);
                    setChromeWins((prev) =>
                      prev.filter((n) => n.id !== win.id),
                    );
                  }}
                  role="button"
                  tabIndex={0}
                >
                  ✕
                </div>
              </div>
            </div>
            <ChromeBrowserPane
              url={win.url}
              onNavigate={(next) =>
                setChromeWins((prev) =>
                  prev.map((n) => (n.id === win.id ? { ...n, url: next } : n)),
                )
              }
            />
          </div>
        );
      })}

      {notepads.map((win) => {
        const file = fileById(win.fileId);
        if (!file) return null;
        const key = `notepad-${win.id}`;
        if (isMinimized(key)) return null;
        const maximized = isMaximized(key);

        return (
          <div
            key={win.id}
            className={cn("xp-window notepad", maximized && "is-maximized")}
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
              onDoubleClick={() => toggleMaximize(key)}
              onPointerDown={(e) => {
                zTop.current += 1;
                const winEl = (e.currentTarget as HTMLElement).closest(
                  ".xp-window",
                ) as HTMLElement | null;
                if (winEl) winEl.style.zIndex = String(zTop.current);
                if (maximized) {
                  setNotepads((prev) =>
                    prev.map((n) =>
                      n.id === win.id ? { ...n, z: zTop.current } : n,
                    ),
                  );
                  return;
                }
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
                    y: Math.max(0, Math.min(window.innerHeight - 80, y)),
                  }),
                });
              }}
            >
              <span className="ttl-text">
                {file.openMode === "link"
                  ? `${file.name} - Internet Explorer`
                  : file.openMode === "video"
                    ? `${file.name} - Windows Media Player`
                    : file.openMode === "image"
                      ? `${file.name} - Windows Picture and Fax Viewer`
                      : `${file.name} - Notepad`}
              </span>
              <div className="win-btns">
                <div
                  className="win-btn min"
                  onClick={() => setMinimized(key, true)}
                  role="button"
                  tabIndex={0}
                >
                  _
                </div>
                <WinMaxButton
                  maximized={maximized}
                  onToggle={() => toggleMaximize(key)}
                />
                <div
                  className="win-btn close"
                  onClick={() => {
                    setMinimized(key, false);
                    clearMaximized(key);
                    setNotepads((prev) => prev.filter((n) => n.id !== win.id));
                  }}
                  role="button"
                  tabIndex={0}
                >
                  ✕
                </div>
              </div>
            </div>
            {file.openMode === "video" || file.openMode === "image" ? null : (
              <div className="np-menu">
                {file.openMode === "link" ? (
                  <>
                    <span>File</span>
                    <span>View</span>
                    <span>Favorites</span>
                    <span>Tools</span>
                    <span>Help</span>
                  </>
                ) : (
                  <>
                    <span>File</span>
                    <span>Edit</span>
                    <span>Format</span>
                    <span>View</span>
                    <span>Help</span>
                  </>
                )}
              </div>
            )}
            {file.openMode === "link" && file.href ? (
              <div className="np-body np-link-launch">
                <div className="np-address">
                  <span className="np-address-label">Address</span>
                  <input
                    className="np-address-input"
                    readOnly
                    value={file.href}
                    aria-label="Site address"
                  />
                  <button
                    type="button"
                    className="np-address-go"
                    onClick={() => openExternalSite(file.id, file.href!)}
                  >
                    Go
                  </button>
                </div>
                <div className="np-link-message">
                  <p>
                    This site opens in a real browser window so login and
                    cookies work the same as Chrome.
                  </p>
                  {popupBlocked[file.id] ? (
                    <p className="np-link-warn">
                      Popup was blocked — allow popups for this site, then press
                      Open again.
                    </p>
                  ) : null}
                  <div className="np-link-actions">
                    <button
                      type="button"
                      className="np-link-btn"
                      onClick={() => openExternalSite(file.id, file.href!)}
                    >
                      Open / Focus site
                    </button>
                  </div>
                </div>
              </div>
            ) : file.openMode === "video" && file.href ? (
              <XpVideoPlayer src={file.href} title={file.name} />
            ) : file.openMode === "image" && file.href ? (
              <XpImageViewer src={file.href} title={file.name} />
            ) : (
              <textarea
                className="np-body"
                readOnly
                spellCheck={false}
                value={
                  file.openMode === "link"
                    ? "No link set for this file."
                    : file.openMode === "video" || file.openMode === "image"
                      ? `No ${file.openMode} uploaded for this file.`
                      : file.content
                }
              />
            )}
            <div className="np-status">
              {file.openMode === "link" && file.href
                ? file.href
                : file.openMode === "video"
                  ? "Windows Media Player"
                  : file.openMode === "image"
                    ? "Windows Picture and Fax Viewer"
                    : `${file.lang} file  |  Ln 1, Col 1`}
            </div>
          </div>
        );
      })}

      {pinPrompt
        ? (() => {
            const lockedFile = fileById(pinPrompt.fileId);
            if (!lockedFile) return null;
            return (
              <XpPasswordDialog
                fileName={lockedFile.name}
                error={pinPrompt.error}
                pending={pinPrompt.pending}
                onSubmit={(pin) => void submitPin(pin)}
                onCancel={() => setPinPrompt(null)}
              />
            );
          })()
        : null}

      {startMenuOpen ? (
        <div className="xp-start-menu" role="menu">
          <div className="xp-start-menu-hd">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="xp-start-avatar"
              src="/xp-desktop/mordesu-logo.png"
              alt=""
              draggable={false}
            />
            <span>Mordesu</span>
          </div>
          <div className="xp-start-menu-body">
            <button
              type="button"
              className="xp-start-item"
              onClick={() => {
                setStartMenuOpen(false);
                focusExplorer();
              }}
            >
              <span className="start-ico">
                <MyComputerIcon />
              </span>
              My Computer
            </button>
            <button
              type="button"
              className="xp-start-item"
              onClick={() => {
                setStartMenuOpen(false);
                openGamesFolder();
              }}
            >
              <span className="start-ico">
                <GamesIcon />
              </span>
              Games
            </button>
            <button
              type="button"
              className="xp-start-item"
              onClick={() => {
                setStartMenuOpen(false);
                openRecycleBin();
              }}
            >
              <span className="start-ico">
                <RecycleBinIcon />
              </span>
              Recycle Bin
            </button>
            <button
              type="button"
              className="xp-start-item"
              onClick={() => {
                setStartMenuOpen(false);
                openGoogleChrome();
              }}
            >
              <span className="start-ico">
                <GoogleChromeIcon />
              </span>
              Google Chrome
            </button>
            <div className="xp-start-sep" />
          </div>
          <div className="xp-start-menu-ft">
            <button
              type="button"
              className="xp-start-exit"
              onClick={() => {
                setStartMenuOpen(false);
                onClose();
              }}
            >
              <span className="xp-start-exit-ico" aria-hidden>
                →
              </span>
              Back to Mordesu
            </button>
          </div>
        </div>
      ) : null}

      <div className="xp-taskbar" role="toolbar" aria-label="Taskbar">
        <button
          type="button"
          className={cn("xp-start-btn", startMenuOpen && "open")}
          onClick={(e) => {
            e.stopPropagation();
            setStartMenuOpen((v) => !v);
          }}
        >
          <WindowsXpLogo className="xp-start-logo" />
          <span className="xp-start-label">start</span>
        </button>

        <div className="xp-task-buttons">
          {taskItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={cn(
                "xp-task-btn",
                topTaskKey === item.key && "active",
                item.minimized && "minimized",
              )}
              title={item.title}
              onClick={() => {
                setStartMenuOpen(false);
                if (!item.minimized && topTaskKey === item.key) {
                  item.onMinimize();
                } else {
                  item.onFocus();
                }
              }}
            >
              <span className="task-ico">{item.icon}</span>
              <span className="task-label">{item.title}</span>
            </button>
          ))}
        </div>

        <div className="xp-tray" aria-label="System tray">
          <span className="xp-tray-clock">{trayClock}</span>
        </div>
      </div>
    </div>
  );
}
