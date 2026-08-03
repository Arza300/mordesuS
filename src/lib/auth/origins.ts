import { env } from "@/env";

function normalizeOrigin(url: string) {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function withWwwVariants(origin: string) {
  const url = new URL(origin);
  const host = url.host;
  const variants = new Set<string>([origin]);

  if (host.startsWith("www.")) {
    url.host = host.slice(4);
    variants.add(url.origin);
  } else {
    url.host = `www.${host}`;
    variants.add(url.origin);
  }

  return [...variants];
}

/**
 * Origins trusted by Better Auth (custom domain + Vercel hosts + www variants).
 */
export function getTrustedOrigins(): string[] {
  const origins = new Set<string>();

  for (const value of [env.BETTER_AUTH_URL, env.NEXT_PUBLIC_SITE_URL]) {
    const origin = normalizeOrigin(value);
    if (!origin) continue;
    for (const variant of withWwwVariants(origin)) {
      origins.add(variant);
    }
  }

  if (process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL}`);
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    origins.add(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }

  return [...origins];
}
