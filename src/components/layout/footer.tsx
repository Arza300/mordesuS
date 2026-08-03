import Link from "next/link";
import { FaGithub, FaInstagram, FaLinkedin, FaXTwitter } from "react-icons/fa6";

import { navigationConfig } from "@/config/navigation";
import { siteConfig } from "@/config/site";

const social = [
  { href: siteConfig.links.twitter, label: "X / Twitter", Icon: FaXTwitter },
  { href: siteConfig.links.github, label: "GitHub", Icon: FaGithub },
  { href: siteConfig.links.linkedin, label: "LinkedIn", Icon: FaLinkedin },
  { href: siteConfig.links.instagram, label: "Instagram", Icon: FaInstagram },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#050505]">
      <div className="container-studio section-pad !py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-display text-2xl font-semibold tracking-tight text-white">
              {siteConfig.name}
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/55">
              {siteConfig.description}
            </p>
            <div className="mt-6 flex gap-3">
              {social.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  data-cursor="hover"
                  className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-[#A855F7]/40 hover:text-white"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs tracking-[0.2em] text-white/40 uppercase">
              Navigate
            </p>
            <nav className="mt-4 flex flex-col gap-2" aria-label="Footer">
              {navigationConfig.footer.map((item) =>
                item.href.startsWith("/") ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-cursor="hover"
                    className="text-sm text-white/65 transition-colors hover:text-white"
                  >
                    {item.title}
                  </Link>
                ) : (
                  <a
                    key={item.href}
                    href={item.href}
                    data-cursor="hover"
                    className="text-sm text-white/65 transition-colors hover:text-white"
                  >
                    {item.title}
                  </a>
                ),
              )}
            </nav>
          </div>

          <div>
            <p className="text-xs tracking-[0.2em] text-white/40 uppercase">
              Contact
            </p>
            <div className="mt-4 space-y-2 text-sm text-white/65">
              <a
                href={`mailto:${siteConfig.contact.email}`}
                data-cursor="hover"
                className="block transition-colors hover:text-white"
              >
                {siteConfig.contact.email}
              </a>
              <p>{siteConfig.contact.address}</p>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-8 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p className="tracking-[0.18em] uppercase">Crafted with precision</p>
        </div>
      </div>
    </footer>
  );
}
