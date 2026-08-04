"use client";

import { useEffect, useRef } from "react";

import Image from "next/image";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { FaFacebookF, FaWhatsapp } from "react-icons/fa6";
import gsap from "gsap";

import { siteConfig } from "@/config/site";
import { useLenis } from "@/providers/smooth-scroll-provider";
import { useUiStore } from "@/stores/ui-store";

const socials = [
  {
    id: "facebook",
    label: "Facebook",
    href: siteConfig.links.facebook,
    Icon: FaFacebookF,
    hoverClass: "hover:text-[#1877F2]",
    overshootX: -12,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: siteConfig.links.whatsapp,
    Icon: FaWhatsapp,
    hoverClass: "hover:text-[#25D366]",
    overshootX: 12,
  },
] as const;

export function ContactPopup() {
  const open = useUiStore((s) => s.contactOpen);
  const setContactOpen = useUiStore((s) => s.setContactOpen);
  const { setScrollLocked } = useLenis();

  const logoRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const onClose = () => setContactOpen(false);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    setScrollLocked(true);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      const unlocked = document.documentElement.dataset.scrollGate === "open";
      setScrollLocked(!unlocked);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- close via store setter
  }, [open, setScrollLocked]);

  useEffect(() => {
    if (!open) return;

    let tl: gsap.core.Timeline | null = null;
    let cancelled = false;
    const icons = () => iconRefs.current.filter(Boolean) as HTMLAnchorElement[];

    // Keep icons fully hidden until parked at the logo (prevents final-pos flash)
    gsap.set(icons(), { autoAlpha: 0, x: 0, y: 0 });

    const timer = window.setTimeout(() => {
      if (cancelled) return;

      const logo = logoRef.current;
      const els = icons();
      if (!logo || els.length === 0) return;

      const logoRect = logo.getBoundingClientRect();
      const logoCX = logoRect.left + logoRect.width / 2;
      const logoCY = logoRect.top + logoRect.height / 2;

      // Park at logo center while still invisible, then reveal + animate out
      els.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const fromX = logoCX - (rect.left + rect.width / 2);
        const fromY = logoCY - (rect.top + rect.height / 2);
        gsap.set(el, { x: fromX, y: fromY, autoAlpha: 0 });
      });

      tl = gsap.timeline();

      els.forEach((el, i) => {
        const overshootX = socials[i].overshootX;
        const start = 0.2 * i;

        tl!
          .set(el, { autoAlpha: 1 }, start)
          .to(
            el,
            {
              x: overshootX,
              y: 8,
              duration: 0.5,
              ease: "power2.out",
            },
            start,
          )
          .to(
            el,
            {
              x: 0,
              y: 0,
              duration: 0.25,
              ease: "power2.out",
            },
            start + 0.5,
          );
      });
    }, 420);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      tl?.kill();
      // Don't clearProps — that strips React inline styles and causes a visible flash
      gsap.set(icons(), { autoAlpha: 0, x: 0, y: 0 });
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Contact"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black"
        >
          <button
            type="button"
            aria-label="Close contact"
            data-cursor="hover"
            onClick={onClose}
            className="absolute top-5 right-5 z-20 inline-flex size-11 items-center justify-center text-white/70 transition-colors hover:text-white sm:top-6 sm:right-8"
          >
            <X className="size-6" strokeWidth={1.25} />
          </button>

          <button
            type="button"
            aria-label="Close contact backdrop"
            className="absolute inset-0 z-0 cursor-default"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex w-full max-w-sm flex-col items-center px-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              ref={logoRef}
              className="relative z-[2] size-[150px] overflow-hidden rounded-full"
            >
              <Image
                src="/brand/contact-avatar.png"
                alt={siteConfig.name}
                width={150}
                height={150}
                priority
                unoptimized
                className="size-full object-cover"
              />
            </div>

            <p className="relative z-[2] mt-2 text-center text-[0.7rem] tracking-[0.28em] text-white/50 uppercase">
              {siteConfig.name}
            </p>

            <div className="mt-5 flex items-center justify-center gap-14 text-[2.35rem] text-white/40">
              {socials.map(({ id, label, href, Icon, hoverClass }, i) => (
                <a
                  key={id}
                  ref={(el) => {
                    iconRefs.current[i] = el;
                  }}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  data-cursor="hover"
                  className={`invisible inline-flex cursor-pointer transition-colors duration-300 ease-out hover:-translate-y-px ${hoverClass}`}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
