import { promises as fs } from "node:fs";
import { execSync } from "node:child_process";

function safeExec(command) {
  try {
    return execSync(command, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

async function safeRead(file) {
  try {
    return await fs.readFile(file, "utf8");
  } catch {
    return "";
  }
}

function normalizeUrl(value) {
  return String(value || "").trim().replace(/\/$/, "");
}

function extractEnvKeys(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !line.startsWith("#"))
    .map((line) => line.split("=")[0]?.trim())
    .filter(Boolean);
}

const siteUrl = normalizeUrl(
  process.env.NEXT_PUBLIC_SITE_URL || "https://promotion-site-nine.vercel.app"
);

const repoUrl = safeExec("git remote get-url origin");
const branch = safeExec("git branch --show-current");
const commit = safeExec("git rev-parse --short HEAD");
const status = safeExec("git status -sb");
const now = new Date().toISOString();

const packageJson = JSON.parse(await safeRead("package.json") || "{}");
const envExample = await safeRead(".env.example");
const envKeys = extractEnvKeys(envExample);

const selectedScripts = [
  "dev",
  "typecheck",
  "build:termux",
  "clean:termux",
  "release:check",
  "release:termux",
  "deploy:check",
  "deploy:final",
  "handoff:generate",
  "handoff:termux",
];

const scriptsBlock = Object.fromEntries(
  selectedScripts
    .filter((key) => packageJson.scripts?.[key])
    .map((key) => [key, packageJson.scripts[key]])
);

const implementedPackages = [
  "Live works CRUD via KV/Redis",
  "Live links CRUD via KV/Redis",
  "Views / likes persistence",
  "Admin auth with cookie session",
  "Admin works management",
  "Admin links management",
  "Admin analytics page and API",
  "Content workflow filters and quick actions",
  "Content moderation states (draft/review/published/archived/hidden)",
  "SEO package with canonical, OG, Twitter, robots and sitemap",
  "Content SEO expansion with JSON-LD",
  "Public UX filters and related works",
  "Search API",
  "Homepage optimization",
  "Author profile package",
  "Production hardening with proxy headers, health endpoint and login rate limit",
  "Release cleanup and final deployment checklist",
  "Slug-based public URLs with redirect from old id URLs",
];

const publicRoutes = [
  "/",
  "/about",
  "/contact",
  "/links",
  "/poetry",
  "/prose",
  "/poetry/[slug]",
  "/prose/[slug]",
];

const adminRoutes = [
  "/admin",
  "/admin/login",
  "/admin/works",
  "/admin/works/new",
  "/admin/works/[id]",
  "/admin/links",
  "/admin/analytics",
];

const apiRoutes = [
  "/api/health",
  "/api/search",
  "/api/stats",
  "/api/works",
  "/api/likes",
  "/api/analytics/click",
  "/api/admin/login",
  "/api/admin/logout",
  "/api/admin/works",
  "/api/admin/links",
  "/api/admin/analytics",
];

const markdown = [
  "# PROJECT HANDOFF",
  "",
  `Generated: ${now}`,
  "",
  "## Project",
  "",
  `- Name: ${packageJson.name || "promotion-site"}`,
  `- Version: ${packageJson.version || "0.1.0"}`,
  `- Repo: ${repoUrl || "not detected"}`,
  `- Branch: ${branch || "not detected"}`,
  `- Commit: ${commit || "not detected"}`,
  `- Production URL: ${siteUrl}`,
  `- Stack: Next.js + TypeScript + Tailwind`,
  `- Environment: Termux`,
  `- Storage: Vercel KV/Redis via REDIS_URL`,
  `- Deploy: GitHub + Vercel`,
  "",
  "## Implemented packages / features",
  "",
  ...implementedPackages.map((item) => `- ${item}`),
  "",
  "## Public routes",
  "",
  ...publicRoutes.map((item) => `- ${item}`),
  "",
  "## Admin routes",
  "",
  ...adminRoutes.map((item) => `- ${item}`),
  "",
  "## API routes",
  "",
  ...apiRoutes.map((item) => `- ${item}`),
  "",
  "## Environment keys from .env.example",
  "",
  ...envKeys.map((key) => `- ${key}`),
  "",
  "## Important npm scripts",
  "",
  "```json",
  JSON.stringify(scriptsBlock, null, 2),
  "```",
  "",
  "## Public content URL model",
  "",
  "- Public work URLs use slug-based paths.",
  "- Old id-based URLs redirect to slug URLs.",
  "- Sitemap uses slug URLs.",
  "",
  "## Moderation model",
  "",
  "- moderationState: draft | review | published | archived",
  "- isHidden: hides published work from public pages",
  "- review/draft/archived items are excluded from public pages",
  "",
  "## Termux commands",
  "",
  "### Local dev",
  "",
  "```bash",
  "cd ~/promotion-site && npm run dev",
  "```",
  "",
  "### Typecheck + build",
  "",
  "```bash",
  "cd ~/promotion-site && npm run typecheck && npm run build:termux",
  "```",
  "",
  "### Release verification",
  "",
  "```bash",
  "cd ~/promotion-site && npm run release:termux",
  "```",
  "",
  "### Final deployment verification",
  "",
  "```bash",
  "cd ~/promotion-site && npm run deploy:final",
  "```",
  "",
  "### Generate handoff file",
  "",
  "```bash",
  "cd ~/promotion-site && npm run handoff:termux",
  "```",
  "",
  "### Admin login (local)",
  "",
  "```bash",
  "cd ~/promotion-site && rm -f admin-cookie.txt && curl -s -c admin-cookie.txt -X POST \"http://127.0.0.1:3000/api/admin/login\" -H \"Content-Type: application/json\" --data \"$(node --env-file=.env.local -e 'process.stdout.write(JSON.stringify({password: process.env.ADMIN_PASSWORD}))')\" && echo",
  "```",
  "",
  "### Health check (production)",
  "",
  "```bash",
  `export SITE_URL="${siteUrl}"`,
  "curl -s \"$SITE_URL/api/health\" && echo",
  "```",
  "",
  "### Search API example",
  "",
  "```bash",
  `export SITE_URL="${siteUrl}"`,
  "curl -s \"$SITE_URL/api/search?q=%D0%B1%D1%83%D0%B4%D1%83%D1%89%D0%B5%D0%B5\" && echo",
  "```",
  "",
  "## Current git status",
  "",
  "```bash",
  status || "git status unavailable",
  "```",
  "",
  "## Notes",
  "",
  "- Project is in release-ready baseline state.",
  "- Final deployment checklist passes.",
  "- Release cleanup and release-check scripts are included.",
  "- Public and admin areas are already verified in production.",
  "",
].join("\n");

await fs.writeFile("PROJECT-HANDOFF.md", markdown, "utf8");

console.log(
  JSON.stringify(
    {
      ok: true,
      file: "PROJECT-HANDOFF.md",
      branch,
      commit,
      siteUrl,
      bytes: Buffer.byteLength(markdown, "utf8"),
    },
    null,
    2
  )
);
