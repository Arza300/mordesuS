# Mordesu Studio

Official website foundation for **Mordesu Studio** — a production-ready Next.js 15 App Router scaffold.

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 · shadcn/ui · Lucide
- Prisma 7 + Neon (`@prisma/adapter-neon`)
- Cloudflare R2 via AWS SDK v3 (S3-compatible)
- TanStack Query · Zustand · next-themes · next-safe-action
- React Hook Form · Zod · `@t3-oss/env-nextjs`
- motion · ESLint · Prettier · Husky · lint-staged

## Getting started

```bash
pnpm install
cp .env.example .env
# Fill in Neon + R2 values in .env
pnpm dev
```

## Scripts

| Script             | Description                               |
| ------------------ | ----------------------------------------- |
| `pnpm dev`         | Start development server (Turbopack)      |
| `pnpm build`       | Generate Prisma client + production build |
| `pnpm start`       | Start production server                   |
| `pnpm lint`        | Run ESLint                                |
| `pnpm format`      | Format with Prettier                      |
| `pnpm db:generate` | Generate Prisma Client                    |
| `pnpm db:push`     | Push schema to Neon (no models yet)       |
| `pnpm db:studio`   | Open Prisma Studio                        |

## Project structure

See `src/` for Clean Architecture layers: `app`, `components`, `config`, `lib`, `services`, `actions`, `providers`, `hooks`, `stores`, `types`, `utils`.
