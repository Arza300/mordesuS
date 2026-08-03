import { HeroSection } from "@/components/sections";
import { getPublishedProjects } from "@/server/projects";

/**
 * Marketing sections below the hero are temporarily hidden
 * until content placement is decided.
 *
 * Hidden for now: About, Projects, Services, WhyUs, Process,
 * Technologies, Stats, Testimonials, FAQ, Contact
 */
export default async function HomePage() {
  const projects = await getPublishedProjects();

  return <HeroSection projects={projects} />;
}
