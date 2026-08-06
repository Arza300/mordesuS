import { HeroSection } from "@/components/sections";
import { getPublishedProjects } from "@/server/projects";
import { getXpFiles } from "@/server/xp-files";

/**
 * Marketing sections below the hero are temporarily hidden
 * until content placement is decided.
 *
 * Hidden for now: About, Projects, Services, WhyUs, Process,
 * Technologies, Stats, Testimonials, FAQ, Contact
 */
export default async function HomePage() {
  const [projects, xpFiles] = await Promise.all([
    getPublishedProjects(),
    getXpFiles(),
  ]);

  return <HeroSection projects={projects} xpFiles={xpFiles} />;
}
