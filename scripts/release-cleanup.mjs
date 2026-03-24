import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const skipDirs = new Set([".git", "node_modules", ".next", ".vercel"]);

function shouldRemove(relPath) {
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
    /^\.env\.local\..*\.bak$/i.test(base)
  );
}

async function exists(target) {
  try {
    await fs.access(target);
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

    if (shouldRemove(relPath)) {
      acc.push(fullPath);
    }
  }
}

const removed = [];

const nextDir = path.join(root, ".next");
if (await exists(nextDir)) {
  await fs.rm(nextDir, { recursive: true, force: true });
  removed.push(".next");
}

const matches = [];
await walk(root, matches);

for (const target of matches) {
  await fs.rm(target, { recursive: true, force: true });
  removed.push(path.relative(root, target));
}

console.log(JSON.stringify({
  ok: true,
  removedCount: removed.length,
  removed,
}, null, 2));
