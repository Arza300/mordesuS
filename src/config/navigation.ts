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
    { title: "Work", href: "#work" },
    { title: "Services", href: "#services" },
    { title: "About", href: "#about" },
    { title: "Process", href: "#process" },
    { title: "Contact", href: "#contact" },
  ],
  footer: [
    { title: "Work", href: "#work" },
    { title: "Services", href: "#services" },
    { title: "About", href: "#about" },
    { title: "Contact", href: "#contact" },
    { title: "Sign in", href: "/auth/login" },
  ],
};
