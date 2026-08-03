import type { SiteContent } from "@/content/types";

export const enContent: SiteContent = {
  hero: {
    eyebrow: "Digital Product Studio",
    title: "We craft digital",
    titleAccent: "experiences that endure",
    description:
      "Mordesu Studio designs and builds high-performance web products for ambitious brands — blending cinematic craft with engineering precision.",
    ctaPrimary: "Start a project",
    ctaSecondary: "View work",
    scrollLabel: "Scroll",
    viewWork: "View all projects",
    holdHint: "Click & hold",
    explore: "Explore",
  },
  about: {
    eyebrow: "About Studio",
    title: "A studio built for clarity, craft, and velocity.",
    body: [
      "We partner with founders and product teams who refuse average. From first sketch to production deploy, every decision is intentional — performance, narrative, and interface as one system.",
      "Our work lives at the intersection of design rigor and modern engineering. No templates. No noise. Just sharp digital products that feel inevitable.",
    ],
    highlight: "Strategy · Design · Engineering · Launch",
  },
  projects: {
    eyebrow: "Selected Work",
    title: "Featured projects",
    description:
      "A curated set of product experiences shaped with precision — interfaces that move, systems that scale.",
    items: [
      {
        id: "aurora-commerce",
        title: "Aurora Commerce",
        category: "E-commerce Platform",
        description:
          "A conversion-focused storefront with fluid product storytelling and sub-second interactions.",
        year: "2025",
        tags: ["Next.js", "Commerce", "Motion"],
        image: "/projects/aurora.svg",
        imageAlt: "Aurora Commerce abstract preview",
        href: "#contact",
      },
      {
        id: "nova-analytics",
        title: "Nova Analytics",
        category: "SaaS Dashboard",
        description:
          "Real-time insight surfaces with immersive data visualization and calm, confident UI.",
        year: "2025",
        tags: ["React", "Data Viz", "Design System"],
        image: "/projects/nova.svg",
        imageAlt: "Nova Analytics abstract preview",
        href: "#contact",
      },
      {
        id: "lumen-brand",
        title: "Lumen Identity",
        category: "Brand Experience",
        description:
          "An immersive brand site with WebGL atmospheres and editorial typography.",
        year: "2024",
        tags: ["WebGL", "Brand", "GSAP"],
        image: "/projects/lumen.svg",
        imageAlt: "Lumen Identity abstract preview",
        href: "#contact",
      },
      {
        id: "pulse-platform",
        title: "Pulse Platform",
        category: "Product Engineering",
        description:
          "End-to-end product build — auth, billing, dashboards — shipped with studio-grade polish.",
        year: "2024",
        tags: ["Full-stack", "Auth", "API"],
        image: "/projects/pulse.svg",
        imageAlt: "Pulse Platform abstract preview",
        href: "#contact",
      },
    ],
  },
  services: {
    eyebrow: "Capabilities",
    title: "Services engineered for impact",
    description:
      "From concept to production — we own the full surface of digital product creation.",
    items: [
      {
        id: "product-design",
        title: "Product Design",
        description:
          "Research-backed interfaces, design systems, and prototypes that clarify the product story.",
        icon: "palette",
      },
      {
        id: "web-development",
        title: "Web Development",
        description:
          "Next.js applications built for speed, accessibility, SEO, and long-term maintainability.",
        icon: "code",
      },
      {
        id: "motion-experience",
        title: "Motion & Experience",
        description:
          "Cinematic interaction design — scroll narratives, micro-motion, and immersive WebGL.",
        icon: "sparkles",
      },
      {
        id: "brand-digital",
        title: "Digital Branding",
        description:
          "Visual systems and web presence that signal confidence the moment someone lands.",
        icon: "layers",
      },
      {
        id: "product-engineering",
        title: "Product Engineering",
        description:
          "Auth, APIs, databases, and infrastructure — production systems that scale with you.",
        icon: "cpu",
      },
      {
        id: "performance",
        title: "Performance Audit",
        description:
          "Core Web Vitals, bundle strategy, and rendering pipelines tuned for 60fps feel.",
        icon: "gauge",
      },
    ],
  },
  whyUs: {
    eyebrow: "Why Mordesu",
    title: "Why teams choose us",
    description:
      "We ship like a partner, not a vendor — sharp taste, clear process, and engineering that lasts.",
    items: [
      {
        id: "craft",
        title: "Obsessive craft",
        description:
          "Every pixel, transition, and line of code is intentional. Average is not on the table.",
      },
      {
        id: "speed",
        title: "Studio velocity",
        description:
          "Lean collaboration and decisive direction. You get momentum without sacrificing quality.",
      },
      {
        id: "systems",
        title: "Systems thinking",
        description:
          "We design products as systems — scalable components, clear architecture, durable foundations.",
      },
      {
        id: "partnership",
        title: "True partnership",
        description:
          "Transparent communication and shared ownership of outcomes from kickoff to launch.",
      },
    ],
  },
  process: {
    eyebrow: "How we work",
    title: "Development process",
    description:
      "A clear path from ambition to shipped product — no mystery, no drift.",
    steps: [
      {
        id: "discover",
        step: "01",
        title: "Discover",
        description:
          "Goals, audience, constraints. We map the problem before we design the solution.",
      },
      {
        id: "define",
        step: "02",
        title: "Define",
        description:
          "Information architecture, visual direction, and technical approach locked with clarity.",
      },
      {
        id: "design",
        step: "03",
        title: "Design",
        description:
          "High-fidelity interfaces and motion language that feel premium and purposeful.",
      },
      {
        id: "build",
        step: "04",
        title: "Build",
        description:
          "Production-grade engineering with performance budgets and accessibility baked in.",
      },
      {
        id: "launch",
        step: "05",
        title: "Launch",
        description:
          "Ship, measure, refine. We stay close through release and the first wave of feedback.",
      },
    ],
  },
  technologies: {
    eyebrow: "Stack",
    title: "Technologies we master",
    description:
      "Modern tools chosen for reliability, developer experience, and production excellence.",
    items: [
      { id: "next", name: "Next.js", category: "Framework" },
      { id: "react", name: "React", category: "UI" },
      { id: "ts", name: "TypeScript", category: "Language" },
      { id: "tailwind", name: "Tailwind CSS", category: "Styling" },
      { id: "three", name: "Three.js", category: "3D" },
      { id: "gsap", name: "GSAP", category: "Motion" },
      { id: "prisma", name: "Prisma", category: "Data" },
      { id: "node", name: "Node.js", category: "Runtime" },
      { id: "postgres", name: "PostgreSQL", category: "Database" },
      { id: "cloudflare", name: "Cloudflare", category: "Infra" },
      { id: "vercel", name: "Vercel", category: "Deploy" },
      { id: "figma", name: "Figma", category: "Design" },
    ],
  },
  stats: {
    eyebrow: "Impact",
    title: "Numbers that matter",
    items: [
      { id: "projects", value: 48, suffix: "+", label: "Projects shipped" },
      { id: "clients", value: 32, suffix: "+", label: "Clients worldwide" },
      { id: "years", value: 6, suffix: "", label: "Years of craft" },
      {
        id: "satisfaction",
        value: 98,
        suffix: "%",
        label: "Client satisfaction",
      },
    ],
  },
  testimonials: {
    eyebrow: "Voices",
    title: "What partners say",
    description:
      "Trusted by founders and product leaders who care about the details.",
    items: [
      {
        id: "t1",
        quote:
          "Mordesu delivered a site that feels like a product — fast, intentional, and unmistakably ours. The launch week metrics spoke for themselves.",
        name: "Sara Al-Hassan",
        role: "Founder",
        company: "Northline",
      },
      {
        id: "t2",
        quote:
          "Rare combination of taste and engineering discipline. They anticipated problems before we named them and shipped without drama.",
        name: "James Okonkwo",
        role: "Head of Product",
        company: "Vertex Labs",
      },
      {
        id: "t3",
        quote:
          "The motion work alone set us apart. Visitors stay longer, convert higher — and the codebase is clean enough for our team to own.",
        name: "Elena Voss",
        role: "Creative Director",
        company: "Atelier Nine",
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Questions, answered",
    description:
      "Straight answers about how we collaborate and what to expect.",
    items: [
      {
        id: "faq-1",
        question: "What types of projects do you take on?",
        answer:
          "Marketing sites, SaaS products, e-commerce experiences, and design systems. If it needs craft, performance, and a clear narrative — we are interested.",
      },
      {
        id: "faq-2",
        question: "How long does a typical project take?",
        answer:
          "Most marketing sites land in 4–8 weeks. Product builds vary by scope — we share a realistic timeline after discovery.",
      },
      {
        id: "faq-3",
        question: "Do you work with existing design systems?",
        answer:
          "Yes. We can extend your system or create one from scratch. Consistency and maintainability always come first.",
      },
      {
        id: "faq-4",
        question: "What does collaboration look like?",
        answer:
          "Weekly syncs, shared Figma and staging environments, and async updates. You always know where things stand.",
      },
      {
        id: "faq-5",
        question: "Can you help after launch?",
        answer:
          "Absolutely. We offer retainers for iteration, performance monitoring, and ongoing feature work.",
      },
    ],
  },
  contact: {
    eyebrow: "Contact",
    title: "Let's build something remarkable",
    description:
      "Tell us about your product, timeline, and ambition. We reply within two business days.",
    form: {
      name: "Name",
      email: "Email",
      company: "Company",
      message: "Project details",
      submit: "Send message",
      success: "Message received. We will be in touch soon.",
    },
  },
};
