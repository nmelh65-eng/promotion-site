# ROADMAP DAY 2 RELEASE

Generated for: promotion-site
Environment: Termux
Deploy target: GitHub + Vercel
Storage: Vercel KV / Redis

---

## 1. Current baseline

### Core
- [x] Next.js + TypeScript + Tailwind
- [x] Termux-only workflow
- [x] GitHub + Vercel deploy
- [x] Vercel KV / Redis integration

### Public content
- [x] Home page
- [x] About page
- [x] Contact page
- [x] Links page
- [x] Poetry listing
- [x] Prose listing
- [x] Poetry item page
- [x] Prose item page

### Content system
- [x] Live works store via KV/Redis
- [x] Admin works CRUD
- [x] Slug-based public work URLs
- [x] Redirect from old id URLs to slug URLs
- [x] Featured content section on homepage
- [x] Workflow filters and quick actions
- [x] Moderation states:
  - draft
  - review
  - published
  - archived
  - hidden

### Links system
- [x] Live links store via KV/Redis
- [x] Admin links management
- [x] Social / platform / referral click analytics

### Engagement + analytics
- [x] Views persistence
- [x] Likes persistence
- [x] Admin analytics page
- [x] Search API
- [x] Public search/filter UX

### SEO + hardening
- [x] Metadata / canonical / OG / Twitter
- [x] robots.txt
- [x] sitemap.xml
- [x] JSON-LD:
  - WebSite
  - Person
  - AboutPage
  - ContactPage
  - Article
  - BreadcrumbList
- [x] /api/health
- [x] Login rate limit
- [x] Security headers via proxy.ts
- [x] Release cleanup scripts
- [x] Final deployment checklist
- [x] Final handoff generator

---

## 2. Day 2 release goal

Build the next product layer on top of the stable baseline:

- capture audience
- strengthen author trust
- improve conversion flow
- prepare monetization
- keep release discipline

---

## 3. Priority order for Day 2

### Priority A — Audience capture
1. Newsletter capture starter
   - public subscribe form
   - POST /api/subscribe
   - KV-backed subscriber storage
   - duplicate protection

2. Admin subscribers page
   - /admin/subscribers
   - GET /api/admin/subscribers
   - export-friendly list

### Priority B — Author trust layer
3. Author media kit package
   - /media-kit
   - short bio
   - long bio
   - contact block
   - platform links

4. Press / collaboration landing block
   - collaboration CTA
   - trust / offer blocks

### Priority C — Content discovery
5. Tag landing pages package
   - /tags/[tag]
   - grouped discovery by tag

6. RSS / feed package
   - /feed.xml or /rss.xml
   - latest published works only

7. Unified global search UI package
   - public global search page
   - uses existing /api/search

### Priority D — Monetization starter
8. Support / donation starter
   - /support
   - donation / support blocks

9. Link builder package
   - helper fields for links admin
   - safer id / label workflow

### Priority E — Release discipline
10. Final production snapshot routine
    - npm run release:termux
    - npm run deploy:final
    - npm run handoff:termux

---

## 4. Recommended implementation order

1. Newsletter capture starter
2. Admin subscribers page
3. Author media kit
4. Tag landing pages
5. RSS / feed
6. Support / donation starter
7. Unified global search UI
8. Link builder

---

## 5. Definition of done for Day 2

Day 2 milestone is complete when all are true:

- [ ] subscriber capture works locally
- [ ] subscriber capture works on Vercel
- [ ] admin can view subscribers
- [ ] media kit / trust page exists
- [ ] at least one new discovery surface exists
- [ ] support / monetization entry point exists
- [ ] git status is clean
- [ ] npm run release:termux passes
- [ ] npm run deploy:final passes
- [ ] npm run handoff:termux regenerates handoff file

## 6. Day 2 command set

- Local baseline:
  `cd ~/promotion-site && npm run release:termux`

- Production verification:
  `cd ~/promotion-site && npm run deploy:final`

- Generate handoff:
  `cd ~/promotion-site && npm run handoff:termux`

- Check clean git:
  `cd ~/promotion-site && git status -sb`

---

## 7. Suggested next prompts

1. `Дайте newsletter capture starter только для Termux`
2. `Дайте admin subscribers package только для Termux`
3. `Дайте author media kit package только для Termux`
4. `Дайте tag landing pages package только для Termux`
5. `Дайте support starter package только для Termux`
6. `Дайте global search UI package только для Termux`

---

## 8. Notes

- Current project is already release-ready.
- Day 2 should focus on audience + trust + conversion.
- Avoid infrastructure changes unless a concrete issue appears.
- Every next package should end with:
  - clean git
  - successful release check
  - successful deploy check
  - updated handoff file
