# PROJECT HANDOFF

Generated: 2026-03-27T07:45:03.248Z

## Project

- Name: promotion-site
- Version: 0.1.0
- Repo: https://github.com/nmelh65-eng/promotion-site.git
- Branch: chore/bootstrap-base
- Commit: e58a325
- Production URL: https://promotion-site-nine.vercel.app
- Stack: Next.js + TypeScript + Tailwind
- Environment: Termux
- Storage: Vercel KV/Redis via REDIS_URL
- Deploy: GitHub + Vercel

## Implemented packages / features

- Live works CRUD via KV/Redis
- Live links CRUD via KV/Redis
- Views / likes persistence
- Admin auth with cookie session
- Admin works management
- Admin links management
- Admin analytics page and API
- Content workflow filters and quick actions
- Content moderation states (draft/review/published/archived/hidden)
- SEO package with canonical, OG, Twitter, robots and sitemap
- Content SEO expansion with JSON-LD
- Public UX filters and related works
- Search API
- Homepage optimization
- Author profile package
- Production hardening with proxy headers, health endpoint and login rate limit
- Release cleanup and final deployment checklist
- Slug-based public URLs with redirect from old id URLs

## Public routes

- /
- /about
- /contact
- /links
- /poetry
- /prose
- /poetry/[slug]
- /prose/[slug]

## Admin routes

- /admin
- /admin/login
- /admin/works
- /admin/works/new
- /admin/works/[id]
- /admin/links
- /admin/analytics

## API routes

- /api/health
- /api/search
- /api/stats
- /api/works
- /api/likes
- /api/analytics/click
- /api/admin/login
- /api/admin/logout
- /api/admin/works
- /api/admin/links
- /api/admin/analytics

## Environment keys from .env.example

- NEXT_PUBLIC_SITE_URL
- ADMIN_PASSWORD
- ADMIN_SECRET
- REDIS_URL
- STORAGE_URL
- KV_URL
- ADMIN_LOGIN_RATE_LIMIT_MAX
- ADMIN_LOGIN_RATE_LIMIT_WINDOW_SECONDS

## Important npm scripts

```json
{
  "dev": "next dev --webpack",
  "typecheck": "tsc --noEmit",
  "build:termux": "next build --webpack",
  "clean:termux": "node scripts/release-cleanup.mjs",
  "release:check": "node scripts/release-check.mjs",
  "release:termux": "npm run clean:termux && npm run typecheck && npm run build:termux && npm run release:check",
  "deploy:check": "node --env-file=.env.local scripts/final-deployment-check.mjs",
  "deploy:final": "npm run release:termux && npm run deploy:check",
  "handoff:generate": "node --env-file=.env.local scripts/generate-project-handoff.mjs",
  "handoff:termux": "npm run release:check && npm run handoff:generate"
}
```

## Public content URL model

- Public work URLs use slug-based paths.
- Old id-based URLs redirect to slug URLs.
- Sitemap uses slug URLs.

## Moderation model

- moderationState: draft | review | published | archived
- isHidden: hides published work from public pages
- review/draft/archived items are excluded from public pages

## Termux commands

### Local dev

```bash
cd ~/promotion-site && npm run dev
```

### Typecheck + build

```bash
cd ~/promotion-site && npm run typecheck && npm run build:termux
```

### Release verification

```bash
cd ~/promotion-site && npm run release:termux
```

### Final deployment verification

```bash
cd ~/promotion-site && npm run deploy:final
```

### Generate handoff file

```bash
cd ~/promotion-site && npm run handoff:termux
```

### Admin login (local)

```bash
cd ~/promotion-site && rm -f admin-cookie.txt && curl -s -c admin-cookie.txt -X POST "http://127.0.0.1:3000/api/admin/login" -H "Content-Type: application/json" --data "$(node --env-file=.env.local -e 'process.stdout.write(JSON.stringify({password: process.env.ADMIN_PASSWORD}))')" && echo
```

### Health check (production)

```bash
export SITE_URL="https://promotion-site-nine.vercel.app"
curl -s "$SITE_URL/api/health" && echo
```

### Search API example

```bash
export SITE_URL="https://promotion-site-nine.vercel.app"
curl -s "$SITE_URL/api/search?q=%D0%B1%D1%83%D0%B4%D1%83%D1%89%D0%B5%D0%B5" && echo
```

## Current git status

```bash
## chore/bootstrap-base...origin/chore/bootstrap-base
 M package.json
?? scripts/generate-project-handoff.mjs
```

## Notes

- Project is in release-ready baseline state.
- Final deployment checklist passes.
- Release cleanup and release-check scripts are included.
- Public and admin areas are already verified in production.
