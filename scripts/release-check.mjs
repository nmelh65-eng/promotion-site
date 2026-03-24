import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const skipDirs = new Set([".git", "node_modules", ".next", ".vercel"]);

const requiredFiles = [
  "app/page.tsx",
  "app/robots.ts",
  "app/sitemap.ts",
  "app/api/health/route.ts",
  "lib/seo.ts",
  "proxy.ts",
  "package.json",
  ".env.example"
];

function isForbidden(relPath) {
  const base = path.basename(relPath);

  return (
    base.endsWith(".bak") ||
    /^handoff.*\.txt$/i.test(base) ||
    /^admin-cookie.*\.txt$/i.test(base) ||
    /^kv-.*\.(json|txt)$/i.test(base) ||
    base === "typecheck.log" ||
    base === ".env.production.check" ||
    base === ".admin_password.tmp" ||
    base === ".admin_secret.tmp" ||
    base === ".site-url.tmp" ||
    /^\.env\.local\..*\.bak$/i.test(base) ||
    relPath === "app/api/admin/debug/route.ts" ||
    relPath.startsWith("app/api/admin/debug/")
  );
}

async function exists(target) {
  try {
    await fs.access(path.join(root, target));
    return true;
  } catch {
    return false;
  }
}

async function walk(dir, acc) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(root, fullPath);

    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) {
        continue;
      }

      await walk(fullPath, acc);
      continue;
    }

    if (isForbidden(relPath)) {
      acc.push(relPath);
    }
  }
}

const missing = [];
for (const file of requiredFiles) {
  if (!(await exists(file))) {
    missing.push(file);
  }
}

const forbidden = [];
await walk(root, forbidden);

if (missing.length || forbidden.length) {
  console.error(JSON.stringify({
    ok: false,
    missing,
    forbidden,
  }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  checked: {
    requiredFiles: requiredFiles.length,
    forbiddenMatches: forbidden.length,
  },
}, null, 2));
