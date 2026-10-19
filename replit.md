# germring.de — FFB Energie & Zukunft

Faktenbasiertes Lokalmedium für Erneuerbare Energien, Kommunalpolitik und die Zukunft des Landkreises Fürstenfeldbruck (FFB). Kein Clickbait, seriöser Journalismus, monetarisiert über Native Sponsoring.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxy at /api)
- `pnpm --filter @workspace/ffb-lokal run dev` — run the frontend (port from $PORT)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

### Automatischer Förderlink-Check

Der API-Server startet 30 Sekunden nach dem Hochfahren einen Förderlink-Check
und wiederholt ihn standardmäßig alle 168 Stunden. Fehler, auffällige
Weiterleitungen und sichtbare Inhaltsänderungen werden über Resend an
`FOERDERLINK_ALERT_EMAIL` gemeldet; falls diese Variable fehlt, wird
`ADMIN_RESET_EMAIL` als Redaktionsempfänger verwendet. Das Intervall lässt
sich mit `FOERDERLINK_CHECK_INTERVAL_HOURS` ändern, relative Quellen werden
gegen `FOERDERLINK_SITE_URL` aufgelöst (Standard: `https://germring.de`).

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, wouter (routing)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec → React Query hooks + Zod schemas)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/ffb-lokal/` — React frontend (pages: Home, Category, ArticleDetail, Newsletter)
- `artifacts/api-server/` — Express API (routes: articles, categories, sponsors, summary)
- `lib/db/` — Drizzle ORM schema (tables: articles, categories, sponsors)
- `lib/api-spec/openapi.yaml` — source of truth for API contract
- `lib/api-client-react/` — generated React Query hooks
- `lib/api-zod/` — generated Zod validation schemas
- `artifacts/ffb-lokal/src/index.css` — design tokens (forest green palette, Merriweather/Public Sans)

## Architecture decisions

- Contract-first API: OpenAPI spec → Orval codegen → hooks + Zod schemas. Never write hooks or validators by hand.
- Native Sponsoring model: `sponsors` table with category targeting. `/api/sponsors/active?categorySlug=...` returns category-specific sponsor first, global fallback second.
- Images via Unsplash CDN direct URLs (no API key needed) — stored in `articles.image_url`.
- `zod/v4` in lib packages; plain `zod` must NOT be imported directly in `api-server` (not in its deps) — use `@workspace/api-zod` schemas instead.

## Product

- **Home**: Hero + 4 thematic sections (Energie, Kommunalpolitik, Zahlen & Daten with Klimaschutz-Chronologie, Praxis & Zukunft) + Newsletter-Box
- **Kategorie**: Artikel-Archiv je Rubrik
- **Artikel**: Volltext mit Bild, Breadcrumb, Lesezeit, verwandte Artikel, Sponsor-Box am Ende
- **Newsletter**: Anmeldeseite mit 7-Block-Format-Erklärung
- **16 Artikel** in 4 Rubriken (Stand: Projektstart), alle mit Unsplash-Bildern

## User preferences

- Domain: **germring.de**
- Sprache: Deutsch (de_DE)
- Kein Clickbait — sachlicher, ruhiger Ton
- Bilder: kostenlos via Unsplash CDN-URLs (kein API-Key)
- Monetarisierung: Native Sponsoring (Partner-Box am Artikelende), kein Display-Advertising
- Anrede: **Du** (informell), dieses Projekt gehört uns beiden — kein "Sie", kein formeller Ton

## Gotchas

- `zod` ist keine direkte Dependency von `@workspace/api-server` — Zod-Schemas immer über `@workspace/api-zod` importieren, nie `import { z } from "zod"` in API-Server-Routen.
- DB-Schema-Änderungen: nach `lib/db/src/schema/` editieren → `pnpm --filter @workspace/db run push` → `pnpm --filter @workspace/api-spec run codegen` wenn OpenAPI angepasst.
- Vite-Proxy nicht nötig: der Replit-Shared-Proxy routet `/api` automatisch zum API-Server.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
