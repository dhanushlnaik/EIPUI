import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pagesDir = path.join(root, "src/pages");
const appDir = path.join(root, "src/app");

const PAGE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".md", ".mdx"]);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(fullPath));
    else out.push(fullPath);
  }
  return out;
}

function normalizePathname(pathname) {
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  return pathname.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
}

function routeFromPagesPage(filePath) {
  const rel = path.relative(pagesDir, filePath).replaceAll(path.sep, "/");
  if (rel.startsWith("api/")) return null;
  if (rel.startsWith("_")) return null;

  const ext = path.extname(rel);
  if (!PAGE_EXTENSIONS.has(ext)) return null;

  let route = rel.slice(0, -ext.length);
  if (route === "404" || route === "500") return null;
  route = route.replace(/\/index$/, "");
  return normalizePathname(route);
}

function stripAppSegment(segment) {
  if (!segment || segment.startsWith("@")) return "";
  if (/^\(.*\)$/.test(segment)) return "";
  if (/^(\(\.)+/.test(segment)) return "";
  return segment;
}

function routeFromAppPage(filePath) {
  const rel = path.relative(appDir, filePath).replaceAll(path.sep, "/");
  if (rel.startsWith("api/")) return null;
  if (!/\/page\.(ts|tsx|js|jsx|md|mdx)$/.test(rel)) return null;

  const withoutPage = rel.replace(/\/page\.(ts|tsx|js|jsx|md|mdx)$/, "");
  const parts = withoutPage.split("/").map(stripAppSegment).filter(Boolean);
  return normalizePathname(parts.join("/"));
}

function routeFromPagesApi(filePath) {
  const rel = path.relative(path.join(pagesDir, "api"), filePath).replaceAll(path.sep, "/");
  const ext = path.extname(rel);
  if (!PAGE_EXTENSIONS.has(ext)) return null;

  let route = rel.slice(0, -ext.length).replace(/\/index$/, "");
  route = route.replace(/\/route$/, "");
  return normalizePathname(`api/${route}`);
}

function routeFromAppApi(filePath) {
  const rel = path.relative(path.join(appDir, "api"), filePath).replaceAll(path.sep, "/");
  if (!/\/route\.(ts|tsx|js|jsx)$/.test(rel)) return null;

  const withoutRoute = rel.replace(/\/route\.(ts|tsx|js|jsx)$/, "");
  const parts = withoutRoute.split("/").map(stripAppSegment).filter(Boolean);
  return normalizePathname(`api/${parts.join("/")}`);
}

function collect() {
  const pagesFiles = walk(pagesDir);
  const appFiles = walk(appDir);

  const pageRoutes = [];
  const apiRoutes = [];

  for (const file of pagesFiles) {
    const page = routeFromPagesPage(file);
    if (page) pageRoutes.push({ pathname: page, source: "pages", file });
  }
  for (const file of appFiles) {
    const page = routeFromAppPage(file);
    if (page) pageRoutes.push({ pathname: page, source: "app", file });
  }

  for (const file of walk(path.join(pagesDir, "api"))) {
    const api = routeFromPagesApi(file);
    if (api) apiRoutes.push({ pathname: api, source: "pages/api", file });
  }
  for (const file of walk(path.join(appDir, "api"))) {
    const api = routeFromAppApi(file);
    if (api) apiRoutes.push({ pathname: api, source: "app/api", file });
  }

  return { pageRoutes, apiRoutes };
}

function findConflicts(routes) {
  const map = new Map();
  for (const route of routes) {
    if (!map.has(route.pathname)) map.set(route.pathname, []);
    map.get(route.pathname).push(route);
  }
  return [...map.entries()]
    .filter(([, entries]) => entries.length > 1)
    .map(([pathname, entries]) => ({ pathname, entries }));
}

const { pageRoutes, apiRoutes } = collect();
const pageConflicts = findConflicts(pageRoutes);
const apiConflicts = findConflicts(apiRoutes);

if (pageConflicts.length === 0 && apiConflicts.length === 0) {
  console.log("No route collisions found between Pages Router and App Router.");
  process.exit(0);
}

console.error("Route collisions detected:");
for (const conflict of [...pageConflicts, ...apiConflicts]) {
  console.error(`- ${conflict.pathname}`);
  for (const entry of conflict.entries) {
    console.error(`  - [${entry.source}] ${path.relative(root, entry.file)}`);
  }
}
process.exit(1);
