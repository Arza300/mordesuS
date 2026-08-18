"use client";

import { useEffect, useState, useTransition } from "react";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { BrandMark } from "@/components/common/brand-mark";
import { navigationConfig } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { logoutAction } from "@/actions/auth";
import { useSession } from "@/lib/auth/auth-client";
import { useLenis } from "@/providers/smooth-scroll-provider";
import { useProjectsOverlayStore } from "@/stores/projects-overlay-store";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [signingOut, startSignOut] = useTransition();
  const { setScrollLocked } = useLenis();
  const { data: session, isPending: sessionPending } = useSession();
  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";
  const projectsOpen = useProjectsOverlayStore((s) => s.open);
  const xpDesktopOpen = useUiStore((s) => s.xpDesktopOpen);
  const contactOpen = useUiStore((s) => s.contactOpen);
  const setContactOpen = useUiStore((s) => s.setContactOpen);
  const hideChrome = projectsOpen || xpDesktopOpen || contactOpen;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (hideChrome && open) setOpen(false);
  }, [hideChrome, open]);

  useEffect(() => {
    if (open) {
      setScrollLocked(true);
      return;
    }
    const unlocked = document.documentElement.dataset.scrollGate === "open";
    setScrollLocked(!unlocked);
  }, [open, setScrollLocked]);

  const closeMenu = () => {
    setOpen(false);
    document.body.style.overflow = "";
  };

  const go = (href: string) => {
    closeMenu();
    if (href === "#contact") {
      setContactOpen(true);
      return;
    }
    // Lower sections are temporarily hidden — hash nav disabled for now
    if (!href.startsWith("#")) return;
  };

  /** Hard navigation — avoids soft-route races with menu unmount + auth redirects */
  const goTo = (href: string) => {
    closeMenu();
    document.documentElement.dataset.scrollGate = "open";
    setScrollLocked(false);
    window.location.assign(href);
  };

  const handleSignOut = () => {
    startSignOut(async () => {
      closeMenu();
      await logoutAction();
      document.documentElement.dataset.scrollGate = "open";
      setScrollLocked(false);
      window.location.assign("/");
    });
  };

  return (
    <>
      <header
        className={cn(
          "site-chrome pointer-events-none fixed inset-x-0 top-0 z-[70] transition-opacity duration-300",
          hideChrome && "pointer-events-none opacity-0",
        )}
        aria-hidden={hideChrome || undefined}
      >
        <div className="flex items-start justify-between px-5 pt-5 sm:px-8 sm:pt-6 lg:px-10">
          <Link
            href="/"
            data-cursor="hover"
            className={cn(
              "pointer-events-auto inline-flex items-center",
              hideChrome && "pointer-events-none",
            )}
            aria-label={siteConfig.name}
            tabIndex={hideChrome ? -1 : undefined}
          >
            <BrandMark size={48} priority />
          </Link>

          <button
            type="button"
            className={cn(
              "pointer-events-auto inline-flex size-11 items-center justify-center text-white",
              hideChrome && "pointer-events-none",
            )}
            aria-expanded={open}
            aria-controls="studio-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            data-cursor="hover"
            tabIndex={hideChrome ? -1 : undefined}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <X className="size-6" strokeWidth={1.25} />
            ) : (
              <Menu className="size-6" strokeWidth={1.25} />
            )}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="studio-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[60] bg-[#0a0a0a] md:bg-[#0a0a0a]/94 md:backdrop-blur-xl"
          >
            <nav className="relative z-10 flex h-full flex-col justify-center px-8 sm:px-16 lg:px-24">
              <ul className="space-y-1">
                {navigationConfig.main.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.4 }}
                  >
                    <a
                      href={item.href}
                      data-cursor="hover"
                      className="font-display block py-2 text-4xl font-semibold tracking-tight text-white/90 transition-colors hover:text-white sm:text-5xl md:text-6xl"
                      onClick={(e) => {
                        e.preventDefault();
                        go(item.href);
                      }}
                    >
                      {item.title}
                    </a>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-16 flex flex-wrap items-center gap-6 text-sm tracking-[0.2em] text-white/45 uppercase">
                {sessionPending ? (
                  <span className="text-white/30">…</span>
                ) : user ? (
                  <>
                    {isAdmin ? (
                      <button
                        type="button"
                        data-cursor="hover"
                        className="transition-colors hover:text-white"
                        onClick={() => goTo("/admin/projects")}
                      >
                        Admin
                      </button>
                    ) : null}
                    <span className="tracking-normal text-white/35 normal-case">
                      {user.email}
                    </span>
                    <button
                      type="button"
                      data-cursor="hover"
                      className="transition-colors hover:text-white"
                      disabled={signingOut}
                      onClick={handleSignOut}
                    >
                      {signingOut ? "Signing out…" : "Sign out"}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      data-cursor="hover"
                      className="transition-colors hover:text-white"
                      onClick={() => goTo("/auth/login")}
                    >
                      Sign in
                    </button>
                    <button
                      type="button"
                      data-cursor="hover"
                      className="transition-colors hover:text-white"
                      onClick={() => goTo("/auth/register")}
                    >
                      Create account
                    </button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
