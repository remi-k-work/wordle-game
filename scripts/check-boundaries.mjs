// Boundary guard: Next.js client/server separation + no-barrel rule.
//
// Why this exists: a `"use client"` module that (transitively) imports a
// Node-only module (`node:net` via `@effect/sql-pg`, `next/server`, ...)
// fails the production build with an opaque Turbopack panic
// ("the chunking context does not support external modules").
//
// Two layers of protection:
// 1. `import "server-only"` markers on server-only entry points give a clear
//    build error at the Next.js boundary. NOTE: `pg-live`, `*-db` services,
//    chart queries and `services/open-router` deliberately have NO marker:
//    they are shared with `tsx` seed scripts and vitest e2e tests, where plain
//    node resolution would hit `server-only`'s throwing default export
//    (only the `react-server` condition resolves to the no-op). Those modules
//    are protected by check (4) below instead.
// 2. This script (static, dependency-free). Run via `npm run lint:boundaries`.
//
// Checks:
//  (a) deleted barrels stay deleted (`src/state/index.ts`, `src/hooks/index.ts`)
//  (b) no exact-barrel imports (`from "@/state"`, `from "@/hooks"`)
//  (c) `src/domain/index.ts` must not re-export `./helpers` (server-only)
//  (d) no `"use client"` module reaches a server-only module (transitive)
//  (e) `server-only` markers present on server-only entry points

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");

// --- config -----------------------------------------------------------------

const DELETED_BARRELS = ["src/state/index.ts", "src/hooks/index.ts"];

const FORBIDDEN_EXACT_IMPORTS = ["@/state", "@/hooks"];

const DOMAIN_BARREL = "src/domain/index.ts";
const DOMAIN_BARREL_FORBIDDEN = ["./helpers"];

const SERVER_ONLY_MARKED = [
  "src/domain/helpers.ts",
  "src/lib/runtime-server.ts",
  "src/features/game/rpc/handlers.ts",
  "src/features/high-score/rpc/handlers.ts",
  "src/features/telemetry/rpc/handlers.ts",
  "src/features/overdrive-hacks/rpc/handlers.ts",
];

// Modules a client chunk must never contain. Internal paths are relative to ROOT
// with forward slashes; external are bare specifiers (prefix match on "node:").
const CLIENT_DENY_INTERNAL = [
  "src/lib/pg-live.ts",
  "src/lib/runtime-server.ts",
  "src/domain/helpers.ts",
  "src/services/open-router.ts",
];

const CLIENT_DENY_EXTERNAL_PREFIXES = ["node:", "@effect/platform-node", "@effect/sql-pg", "@testcontainers/"];

const CLIENT_DENY_EXTERNAL_EXACT = ["next/server"];

// --- helpers -----------------------------------------------------------------

const failures = [];
const fail = (msg) => failures.push(msg);

function listFiles(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      // Skip tests, fixtures and generated output: they are never bundled.
      if (entry === "__tests__" || entry === "node_modules") continue;
      listFiles(full, out);
    } else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry) && !/\.d\.ts$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

const toPosix = (p) => p.replace(/\\/g, "/");
const relPosix = (abs) => toPosix(abs).replace(toPosix(ROOT) + "/", "");

// Static import specifiers in a file (skips `import type ...`, erased at build).
function importSpecifiers(source) {
  const specs = [];
  const staticRe = /^\s*import(?!\s+type\b)[^;]*?\bfrom\s*["']([^"']+)["']/gm;
  const sideEffectRe = /^\s*import\s*["']([^"']+)["']/gm;
  const exportFromRe = /^\s*export[^;]*?\bfrom\s*["']([^"']+)["']/gm;
  const dynamicRe = /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g;
  for (const re of [staticRe, sideEffectRe, exportFromRe, dynamicRe]) {
    let m;
    while ((m = re.exec(source)) !== null) specs.push(m[1]);
  }
  return specs;
}

function resolveImport(spec, fromFile) {
  if (spec.startsWith("@/")) {
    return ["src/" + spec.slice(2)];
  }
  if (spec.startsWith(".")) {
    const base = toPosix(dirname(fromFile)).replace(toPosix(ROOT) + "/", "");
    const parts = (base + "/" + spec).split("/");
    const norm = [];
    for (const p of parts) {
      if (p === "." || p === "") continue;
      if (p === "..") norm.pop();
      else norm.push(p);
    }
    return [norm.join("/")];
  }
  return null; // external
}

function candidateFiles(base) {
  // base has no extension (or is a directory): try .ts/.tsx and /index.ts/.tsx
  return [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`];
}

// --- (a) deleted barrels ------------------------------------------------------

for (const barrel of DELETED_BARRELS) {
  if (existsSync(join(ROOT, barrel))) fail(`deleted barrel resurrected: ${barrel} (use deep imports instead)`);
}

// --- scan sources ---------------------------------------------------------------

const files = listFiles(SRC);
const sources = new Map(files.map((f) => [relPosix(f), readFileSync(f, "utf8")]));

const isClientEntry = (src) => src.includes('"use client"') || src.includes("'use client'");

// --- (b) exact-barrel imports -----------------------------------------------------

const exactRe = new RegExp(`from\\s*["'](${FORBIDDEN_EXACT_IMPORTS.map((s) => s.replace("/", "\\/")).join("|")})["']`);
for (const [rel, src] of sources) {
  if (exactRe.test(src)) fail(`barrel import in ${rel}: import from "@/state" / "@/hooks" directly (use deep imports)`);
}

// --- (c) domain barrel ---------------------------------------------------------------

const domainBarrel = sources.get(DOMAIN_BARREL);
if (domainBarrel === undefined) {
  fail(`${DOMAIN_BARREL} missing`);
} else {
  for (const forbidden of DOMAIN_BARREL_FORBIDDEN) {
    if (domainBarrel.includes(forbidden)) {
      fail(`${DOMAIN_BARREL} re-exports ${forbidden} (server-only: import from "@/domain/helpers" in server code)`);
    }
  }
}

// --- (e) server-only markers ----------------------------------------------------------

for (const rel of SERVER_ONLY_MARKED) {
  const src = sources.get(rel);
  if (src === undefined) {
    fail(`server-only entry missing: ${rel}`);
  } else if (!src.includes('from "server-only"') && !src.includes("from 'server-only'") && !src.includes('import "server-only"') && !src.includes("import 'server-only'")) {
    fail(`missing 'import "server-only"' in ${rel}`);
  }
}

// --- (d) client reachability ------------------------------------------------------------

function internalTargets(spec, fromRel) {
  const bases = resolveImport(spec, join(ROOT, fromRel));
  if (bases === null) return { external: spec };
  for (const base of candidateFiles(bases[0])) {
    if (sources.has(base)) return { internal: base };
  }
  // Unresolvable (asset, alias, generated types): ignore — bundler handles it.
  return {};
}

for (const [rel, src] of sources) {
  if (!isClientEntry(src)) continue;
  const seen = new Set([rel]);
  const queue = [rel];
  while (queue.length > 0) {
    const current = queue.pop();
    const currentSrc = sources.get(current);
    if (currentSrc === undefined) continue;
    for (const spec of importSpecifiers(currentSrc)) {
      const target = internalTargets(spec, current);
      if (target.external !== undefined) {
        const ext = target.external;
        if (
          CLIENT_DENY_EXTERNAL_PREFIXES.some((p) => ext === p || ext.startsWith(p)) ||
          CLIENT_DENY_EXTERNAL_EXACT.includes(ext)
        ) {
          fail(`client bundle violation: ${rel} reaches external "${ext}" via ${current}`);
        }
        continue;
      }
      if (target.internal !== undefined && !seen.has(target.internal)) {
        seen.add(target.internal);
        if (CLIENT_DENY_INTERNAL.includes(target.internal)) {
          fail(`client bundle violation: ${rel} reaches server-only ${target.internal} via ${current}`);
        }
        queue.push(target.internal);
      }
    }
  }
}

// --- report ----------------------------------------------------------------------

if (failures.length > 0) {
  console.error(`check-boundaries: ${failures.length} violation(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`check-boundaries: OK (${files.length} files scanned)`);
