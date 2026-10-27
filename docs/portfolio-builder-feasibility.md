# Portfolio Builder on Reactive Resume: Feasibility Study

_Prepared 27 Oct 2026. Upstream state: `reactive-resume/reactive-resume` @ `19770b1` (v6.0.7, released today)._

## TL;DR

- **This fork (`isti2415/reactive-resume`) is 2 major versions behind** (v4.5.0: NestJS + Prisma + Browserless). Upstream v6 is a total rewrite (Hono + oRPC + Drizzle + Better Auth + TanStack Router + Expo mobile app + in-house "Forme" PDF engine). **Do not build on this fork's code**; nothing here transfers cleanly.
- **Upstream just shipped "Share as a web page" + custom domains (v6.0.7, today).** The low end of the idea, "my resume as a website on my domain", is now free on rx.cv. Anything we build must be a *portfolio* (projects, media, case studies, multiple pages), not a reskinned resume page.
- **Technically very feasible.** The pieces worth reusing (resume schema, importers, builder UX patterns, custom-domain verification, AI plumbing) are MIT-licensed and well separated into packages.
- **Contributing upstream is the wrong vehicle for a full portfolio builder.** Upstream's renderer is page/print-centric (one template must render to PDF, native mobile, and HTML), the repo requires web↔mobile feature parity for every change, and the project has no paid tier, so we'd have no ownership or business.
- **Recommendation: build our own product, interoperable with Reactive Resume** (import RR JSON / JSON Resume / LinkedIn / PDF; optional live sync via RR's API/MCP). Selectively vendor RR's MIT packages where useful. Send upstream only small, generic PRs that help both projects.
- **The market is crowded but in churn.** read.cv (shut down 2025, acquired by Perplexity) and Bento.me (shut down Feb 2026, acquired by Linktree) left users burned. "Open source, self-hostable, export a static site, you own your data" is a real, defensible wedge. Monetisation is hard: Carrd is $19/yr and RR gives custom domains free.

---

## 1. What Reactive Resume is today (v6.0.7)

| Item | Detail |
|---|---|
| Positioning | Free, open-source resume builder and career manager. No ads, no tracking, **no paid tier** (donations only). MIT. |
| Scale | ~40k GitHub stars, ~4.4k forks; author claims ~1M users. ~900+ commits/yr, releases every few days. |
| Features | Live editor with autosave and version history; 18 templates; design controls; BYO-key AI assistant/agent; ATS checker; job/application tracker; cover letters; interview prep; career coach; import (PDF, LinkedIn, JSON Resume, DOCX via AI); export (PDF, DOCX, Markdown, JSON, ODT); MCP server + REST/oRPC API; 54 UI languages; iOS/Android apps; Docker/Vercel/Cloudflare/Cloudron self-hosting. |
| **New: Share mode** | Publishes the resume as a responsive web page in its template; public / password / private; hide contacts; search-engine opt-in; OG cards + JSON-LD `ProfilePage`; QR code; view/download stats; one **primary resume** at `rx.cv/<user>` and on **one DNS-verified custom domain per account** (works on hosted rx.cv too). |

### Architecture (TypeScript monorepo: pnpm + Turborepo, Node 24)

```
apps/web      (~71k LOC)  React 19 SPA, TanStack Router/Query, Tailwind, Vite
apps/server   (~6k)       Hono: /api/rpc (oRPC), auth, MCP, OpenAPI, static + public pages, custom-domain routing
apps/mobile   (~48k)      Expo/React Native, native Forme renderer. Parity with web is REQUIRED
packages/api  (~32k)      oRPC routers + business logic per feature
packages/pdf  (~24k)      React templates → Forme host tree → PDF (browser/server/native) and → HTML (web page)
packages/resume (~13k)    pure domain logic (JSON Patch, sharing paths, social meta)
packages/schema (~5k)     Zod schemas: ResumeData, templates, style rules
packages/{auth,db,import,docx,odt,mcp,ai,ui,email,env,fonts,utils}
```

Key facts for our purpose:

- **Data model** (`packages/schema/src/resume/data.ts`): `picture`, `basics`, `summary`, fixed `sections` (experience, education, projects, skills, profiles, awards, certifications, publications, volunteer, languages, interests, references), `customSections`, and `metadata` (template, layout pages main/sidebar, page format, design colours, typography, style rules, stylesheet, `web.showCredit`). `projectItem` is just `name`, `period`, `website`, HTML `description`. **There are no images, galleries, video, embeds, or case-study structure.**
- **Web page rendering** (`packages/pdf/src/html/web-page.tsx`): renders the *same* PDF template through the Forme reconciler, then `toHtml()` emits a "sheet" inside `.rr`. Pages are flattened into one column set. The docs put it plainly: "on a computer, the resume sits on the page like a sheet of paper". It is a document, not a site. Rendering happens per request (no-store) with an in-process cache.
- **Custom domains** (`packages/db/src/schema/custom-domain.ts`, `packages/api/src/features/custom-domain`, `apps/server/src/http/custom-domain.ts`): TXT token at `_rx-verify.<host>`, CNAME/A records, Traefik HTTP-provider endpoint issues routers and certs, auto-unverify after a week of failure. Nicely done and directly reusable.
- **Contribution constraints** (`AGENTS.md`): web/mobile feature parity is mandatory; a new template touches schema + `packages/pdf` + previews; Conventional Commits; package-boundary rules enforced by `turbo boundaries`.

### This fork vs upstream

| | This fork | Upstream |
|---|---|---|
| Version | 4.5.0 | 6.0.7 |
| Backend | NestJS + Prisma | Hono + oRPC + Drizzle |
| Auth | Passport | Better Auth (passkeys, 2FA, OAuth provider) |
| PDF | Browserless/Chromium | Forme (no Chromium) |
| Frontend | React Router, Nx | TanStack Router, Turborepo |
| Mobile | none | Expo app |

Merging is not realistic. If we fork at all, **re-fork from upstream `main`**.

## 2. The opportunity: resume ≠ portfolio

What a portfolio needs that RR (by design) doesn't do:

1. **Project-first content.** Cover images, galleries, video and Figma/YouTube/CodePen/GitHub embeds, case-study bodies (problem → process → outcome), tags/filters, metrics.
2. **Site structure.** Multiple pages (Home / Work / Project detail / About / Blog / Contact), navigation, per-page SEO, sitemap.
3. **Web-native design.** Responsive grids, hero sections, dark mode, motion. Not A4/Letter pagination.
4. **Engagement.** Contact form, booking link, testimonials, newsletter, analytics.
5. **Hosting.** Static/CDN delivery, custom domains, export to a static bundle (GitHub Pages, Netlify).

RR's strengths we want to keep: structured data (not a blank canvas), section-based builder with live preview, import from anything, AI assistance, privacy, self-hosting, and a single source of truth that also prints as a resume.

**Positioning:** _"The open-source portfolio builder that starts from your resume. Structured, AI-assisted, self-hostable, exportable. Your resume and your site stay in sync."_

## 3. Competition

| Segment | Players | Strength | Weakness we exploit |
|---|---|---|---|
| General site builders | Wix, Squarespace (~$16–25/mo), Webflow, Framer (~$10–30/mo) | Unlimited design freedom, polish | Blank canvas, time-consuming, closed, no resume sync |
| One-page builders | Carrd ($9–49/**yr**) | Very cheap and simple | Single page, weak for project depth; closed |
| Creative portfolios | Adobe Portfolio (bundled with CC), Cargo, Format, Behance, Dribbble | Visual work, communities | Designer-only; vendor lock-in |
| Resume-to-site (AI) | Seera, Butternut AI ($5–12/mo), self.cv (~$6/mo), Clickfolio, DesignCraft, Artfolio; Kickresume and Standard Resume as add-ons | "Upload PDF → site in 60s" | Shallow templates, closed, mostly thin AI wrappers |
| Open-source resume-to-site | self.so (OSS), Magic Self (Apache-2.0), GitProfile/Gitfolio (GitHub → Pages) | Free, devs trust it | One-shot generators, little editing or design control, no builder |
| Profile networks | Peerlist (~200k users, free), Contra (freelance, Pro ~$29/mo), Fueler; **read.cv (dead 2025)** | Network effects, discovery | Profiles, not owned sites; platform risk is proven |
| Link-in-bio | Linktree, Beacons, own.page; **Bento.me (dead Feb 2026)** | Massive reach | Not portfolios |
| **Reactive Resume itself** | Share mode + custom domain, free | 1M users, free, OSS | Document-shaped page; no projects/media/pages |

Takeaways:

- The "resume → website in 60 seconds" pitch is commoditised. Every AI wrapper does it and RR now does it for free.
- **Nobody combines** (a) a real structured builder, (b) open source/self-host/static export, (c) depth for projects and case studies, and (d) two-way sync with a resume tool. That combination is the gap.
- Platform shutdowns (read.cv, Bento, Koji) make **data ownership and exportability** a marketable feature rather than a footnote.

## 4. Options

### A. Contribute a portfolio mode to upstream
- **Pros:** Instant distribution (40k stars, ~1M users); reuse of everything; the maintainer is clearly moving toward web pages.
- **Cons:** The renderer must stay compatible with PDF and native Forme, so portfolio blocks (galleries, multi-page, motion) fight the architecture. Mandatory mobile parity roughly doubles the work. Acceptance is at the maintainer's discretion: a feature this large needs buy-in first, and could be rejected or rewritten. **We get zero ownership or monetisation.**
- **Verdict:** Only for small, generic PRs: e.g. project images/media fields in the schema, an "Open in …" export hook, JSON-Resume portfolio extensions.

### B. Hard fork v6 and bolt on portfolio
- **Pros:** Auth, dashboard, builder, AI, import, custom domains and the API all exist on day one.
- **Cons:** ~200k LOC plus a mobile app and career/job-tracking features we don't want; upstream moves daily, so rebasing becomes a permanent tax; we'd inherit its branding/credit obligations and a confusing "is this Reactive Resume?" identity.
- **Verdict:** The fastest prototype, but the worst long-term cost. Acceptable only as a throwaway spike.

### C. New product, interoperable with RR ✅ recommended
- Own codebase, purpose-built web renderer; **vendor or depend on** MIT packages where useful (`schema` types, `import` parsers, custom-domain approach, UI patterns), keeping the MIT notice.
- Interop: import RR JSON / JSON Resume / LinkedIn / PDF; optional **live sync** with an RR account via its public API/MCP (API keys exist), so users edit their resume in RR and see their portfolio update.
- Later, a small upstream PR adds a "Make a portfolio" link-out (if the maintainer agrees). That's a distribution channel without the coupling.

## 5. Proposed product and technical design (Option C)

**Stack (aligned with RR so code and people transfer):** TypeScript, React 19, TanStack Router/Query, Tailwind, Hono + oRPC, Drizzle + Postgres, Better Auth, S3-compatible storage. Sites render to **static HTML** at publish time (React SSR → files on CDN/R2; ISR-like republish), with zero-JS by default plus islands for galleries and forms.

**Data model:**
```
Portfolio
 ├─ profile        ← basics/picture/summary/profiles (RR-compatible)
 ├─ resume         ← full RR ResumeData (lossless; also exports PDF via RR or own renderer)
 ├─ projects[]     name, slug, role, dates, tags, cover, media[], links[], summary, body (rich blocks), metrics, featured
 ├─ pages[]        home | work | project-template | about | blog | custom → blocks[]
 ├─ blocks         hero, project-grid, featured-project, timeline(experience), skills, testimonials, logos, gallery, rich-text, cta/contact, embed
 ├─ theme          template id + design tokens (colours, type, radius, spacing, dark mode)
 └─ site           slug, custom domain, SEO, analytics opt-in, password, publish state
```

**Builder UX:** reuse RR's mental model (left: content and sections, centre: live preview with device toggle, right: design). Add page/block reordering via drag and drop, a media library, and an "AI: draft case study from repo/notes" action (BYO key, like RR).

**MVP scope (8–10 weeks for 1–2 devs):**
1. Auth, dashboard, one portfolio per user, subdomain `<user>.ourdomain`.
2. Import: RR JSON + JSON Resume + PDF (reuse RR parsers).
3. Projects with cover and gallery; 4 page types; ~8 block types; 3–4 themes.
4. Static publish to CDN; SEO (OG, sitemap, JSON-LD `Person`/`CreativeWork`).
5. Custom domain (port RR's TXT-verify flow; Cloudflare for SaaS or Caddy on-demand TLS instead of Traefik).
6. "Export as static site (.zip)" and Docker self-host. This is the trust feature.

**Later:** RR live sync, GitHub/Dribbble/Behance importers, blog (MDX), contact form, privacy-friendly analytics, theme marketplace, team/agency.

**Main technical risks:** custom-domain TLS at scale (use Cloudflare for SaaS from the start); storing and optimising user media (image CDN, size limits); keeping builder flexibility from turning into "a worse Framer" (stay structured and opinionated).

## 6. Business feasibility

- **Costs:** static hosting plus image CDN is cheap (cents per user/month); custom-domain SSL via Cloudflare for SaaS is ~$0.10/hostname/month after the free allotment. AI is BYO-key or metered.
- **Monetisation (open core):** free on a subdomain with a small credit; **Pro ~$4–8/mo or ~$40/yr** for custom domain, premium themes, analytics, forms, credit removal, more storage. Self-host stays free (MIT or AGPL; pick AGPL if you want to deter hosted clones).
- **Pricing pressure:** Carrd at $19/yr and RR's free custom domain cap what we can charge. Value must come from depth (case studies, media, sync, themes), not from the domain itself.
- **Go-to-market:** open-source launch (HN, Product Hunt, r/selfhosted), "migrate from read.cv / Bento" importers and landing pages, dev/design communities (Peerlist launches), SEO comparison pages (RR's own `docs/comparisons/` playbook works).

## 7. Recommended next steps

1. **Validate (1 week):** interview 10–15 target users (job-seeking devs, designers, freelancers); ship a landing page plus waitlist.
2. **Talk to upstream (parallel):** open a GitHub Discussion on `reactive-resume/reactive-resume` proposing project media fields and a portfolio link-out, and gauge the maintainer's stance before writing upstream code.
3. **Spike (1–2 weeks):** new repo; port `packages/schema` types plus importers; build the static renderer with 1 theme from an RR export.
4. **MVP (6–8 weeks)** per §5, then open-source launch.
5. **Housekeeping:** this fork is stale (v4.5). If we keep a fork for upstream PRs, reset it to upstream `main`.

## Sources

- Upstream repo, studied locally at commit `19770b1`: `AGENTS.md`, `packages/schema`, `packages/pdf/src/html`, `apps/server/src/static/resume-page.ts`, `docs/changelog`, `docs/guides/sharing-your-resume-publicly.mdx`, `docs/self-hosting/sharing-domains.mdx`
- [rxresu.me](https://rxresu.me/) (live site)
- [Star History: Reactive Resume](https://www.star-history.com/amruthpillai/reactive-resume), [ideaproof.io](https://ideaproof.io/open-source/project/reactive-resume), [gittrend.io](https://gittrend.io/repo/amruthpillai/reactive-resume)
- [TechCrunch: Perplexity acquires Read.cv](https://techcrunch.com/2025/01/17/perplexity-acquires-read-cv-a-social-media-platform-for-professionals/)
- [AlternativeTo: Bento to shut down in 2026](https://alternativeto.net/news/2025/12/bento-to-shut-down-in-2026-as-linktree-takes-over-and-offers-migration-path/)
- [Butternut: best AI portfolio builders 2026](https://www.butternut.ai/blogs/best-ai-portfolio-builders-2026), [Seera: best free portfolio builders](https://myseera.com/blog/best-free-portfolio-website-builders-2026), [Clickfolio: AI portfolio builders](https://clickfolio.me/blog/ai-portfolio-website-builders), [Magic Self](https://www.magic-self.dev/blog/ai-portfolio-generator)
- [Carrd pricing (nocode.mba)](https://www.nocode.mba/articles/carrd-pricing), [Framer vs Carrd](https://www.temperstack.com/versus/framer-vs-carrd/)
- [Peerlist (martech.zone)](https://martech.zone/peerlist-design-and-developer-network), [Contra pricing (toolradar)](https://toolradar.com/tools/contra/pricing)
- [self.so / resume-to-site guide](https://www.blog.brightcoding.dev/2025/12/04/turn-your-resume-linkedin-into-a-professional-website-the-ultimate-2025-guide-5-minute-setup), [self.cv on AlternativeTo](https://alternativeto.net/software/self-cv/about/)

_Third-party figures (stars, prices, user counts) come from vendor or aggregator pages and should be re-checked before any decision._
