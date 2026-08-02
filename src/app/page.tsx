import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <Container className="py-16">
      <p className="text-muted-foreground text-sm">Foundation ready</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {siteConfig.name}
      </h1>
      <p className="text-muted-foreground mt-3 max-w-2xl">
        Project scaffolding is in place. Feature pages will be added next.
      </p>
    </Container>
  );
}
