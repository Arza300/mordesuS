export type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  year: string;
  tags: string[];
  image: string;
  imageAlt: string;
  video?: string;
  href: string;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

export type WhyUsItem = {
  id: string;
  title: string;
  description: string;
};

export type ProcessStep = {
  id: string;
  step: string;
  title: string;
  description: string;
};

export type Technology = {
  id: string;
  name: string;
  category: string;
};

export type Stat = {
  id: string;
  value: number;
  suffix: string;
  label: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  role: string;
  company: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type SiteContent = {
  hero: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
    scrollLabel: string;
    viewWork: string;
    holdHint: string;
    explore: string;
  };
  about: {
    eyebrow: string;
    title: string;
    body: string[];
    highlight: string;
  };
  projects: {
    eyebrow: string;
    title: string;
    description: string;
    items: Project[];
  };
  services: {
    eyebrow: string;
    title: string;
    description: string;
    items: Service[];
  };
  whyUs: {
    eyebrow: string;
    title: string;
    description: string;
    items: WhyUsItem[];
  };
  process: {
    eyebrow: string;
    title: string;
    description: string;
    steps: ProcessStep[];
  };
  technologies: {
    eyebrow: string;
    title: string;
    description: string;
    items: Technology[];
  };
  stats: {
    eyebrow: string;
    title: string;
    items: Stat[];
  };
  testimonials: {
    eyebrow: string;
    title: string;
    description: string;
    items: Testimonial[];
  };
  faq: {
    eyebrow: string;
    title: string;
    description: string;
    items: FaqItem[];
  };
  contact: {
    eyebrow: string;
    title: string;
    description: string;
    form: {
      name: string;
      email: string;
      company: string;
      message: string;
      submit: string;
      success: string;
    };
  };
};
