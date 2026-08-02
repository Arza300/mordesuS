export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
};

export type NavigationConfig = {
  main: NavItem[];
  footer: NavItem[];
};

export const navigationConfig: NavigationConfig = {
  main: [
    { title: "Home", href: "/" },
    { title: "Work", href: "/work", disabled: true },
    { title: "Services", href: "/services", disabled: true },
    { title: "About", href: "/about", disabled: true },
    { title: "Contact", href: "/contact", disabled: true },
  ],
  footer: [
    { title: "Home", href: "/" },
    { title: "Sign in", href: "/auth/login" },
    { title: "Register", href: "/auth/register" },
    { title: "Privacy", href: "/privacy", disabled: true },
    { title: "Terms", href: "/terms", disabled: true },
  ],
};
