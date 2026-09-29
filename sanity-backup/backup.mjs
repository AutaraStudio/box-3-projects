/**
 * Sanity content backup — Box 3 Projects (uwutffn5/production)
 * =============================================================
 * Dumps EVERY document in the dataset (published + drafts), downloads
 * every image/file asset, and writes human-readable markdown for each
 * document so the content survives even if Sanity disappears.
 *
 * Run from the project root:
 *   node sanity-backup/backup.mjs
 *
 * Output (all inside sanity-backup/):
 *   dataset/documents.ndjson   raw restore-grade dump (one doc per line)
 *   dataset/documents.json     same dump, pretty-printed JSON array
 *   content/<type>/<slug>.md   readable text of every field of every doc
 *   assets/images/…            every image, original quality
 *   assets/files/…             every file/video
 *   ASSET-MANIFEST.md          which asset is used where
 *   asset-manifest.json        same, machine-readable
 *
 * No dependencies — plain Node 18+ (fetch + fs).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname; // sanity-backup/
const PROJECT_ROOT = path.resolve(__dirname, "..");

/* ---------------------------------------------------------------- config */

const PROJECT_ID = "uwutffn5";
const DATASET = "production";
const API_VERSION = "2024-12-01";

function readToken() {
  try {
    const env = fs.readFileSync(path.join(PROJECT_ROOT, ".env.local"), "utf8");
    const m = env.match(/^SANITY_API_TOKEN=(.+)$/m);
    return m ? m[1].trim() : null;
  } catch {
    return null;
  }
}
const TOKEN = readToken();

const QUERY_URL = `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`;

/* ---------------------------------------------------------------- helpers */

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function sanitizeFilename(name) {
  return (
    String(name)
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, "-")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\.+$/, "") || "untitled"
  );
}

async function groq(query, params = {}) {
  const res = await fetch(QUERY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
    body: JSON.stringify({ query, params }),
  });
  if (!res.ok) {
    throw new Error(`GROQ query failed (${res.status}): ${await res.text()}`);
  }
  const json = await res.json();
  return json.result;
}

/* ------------------------------------------------------- 1. fetch all docs */

async function fetchAllDocuments() {
  const all = [];
  let lastId = "";
  const PAGE = 200;
  for (;;) {
    const page = await groq(
      `*[_id > $lastId] | order(_id asc) [0...${PAGE}]`,
      { lastId }
    );
    if (!page || page.length === 0) break;
    all.push(...page);
    lastId = page[page.length - 1]._id;
    process.stdout.write(`  fetched ${all.length} documents…\r`);
    if (page.length < PAGE) break;
  }
  console.log(`  fetched ${all.length} documents total.`);
  return all;
}

/* -------------------------------------------------- 2. asset ref discovery */

/**
 * Walk every non-asset document and record every asset _ref together
 * with the human path to the field that uses it.
 */
function collectAssetUsage(docs) {
  const usage = new Map(); // assetId -> [{ docId, docType, docTitle, fieldPath }]

  function walk(node, docMeta, fieldPath) {
    if (Array.isArray(node)) {
      node.forEach((item, i) => {
        const key = item && item._key ? `[${item._key}]` : `[${i}]`;
        walk(item, docMeta, `${fieldPath}${key}`);
      });
      return;
    }
    if (node && typeof node === "object") {
      if (
        typeof node._ref === "string" &&
        (node._ref.startsWith("image-") || node._ref.startsWith("file-"))
      ) {
        if (!usage.has(node._ref)) usage.set(node._ref, []);
        usage.get(node._ref).push({ ...docMeta, fieldPath });
        return;
      }
      for (const [k, v] of Object.entries(node)) {
        if (k.startsWith("_")) continue;
        walk(v, docMeta, fieldPath ? `${fieldPath}.${k}` : k);
      }
    }
  }

  for (const doc of docs) {
    if (doc._type === "sanity.imageAsset" || doc._type === "sanity.fileAsset")
      continue;
    const docMeta = {
      docId: doc._id,
      docType: doc._type,
      docTitle: docTitle(doc),
    };
    walk(doc, docMeta, "");
  }
  return usage;
}

function docTitle(doc) {
  return (
    doc.title ||
    doc.name ||
    doc.heading ||
    (doc.seo && doc.seo.title) ||
    (doc.slug && doc.slug.current) ||
    doc._id
  );
}

/* ------------------------------------------------------ 3. download assets */

async function downloadAssets(assetDocs, usage) {
  const imagesDir = path.join(ROOT, "assets", "images");
  const filesDir = path.join(ROOT, "assets", "files");
  ensureDir(imagesDir);
  ensureDir(filesDir);

  const manifest = [];
  const usedNames = new Set();
  let done = 0;
  const failures = [];

  // small concurrency pool
  const queue = [...assetDocs];
  const CONCURRENCY = 5;

  async function worker() {
    while (queue.length) {
      const asset = queue.shift();
      const isImage = asset._type === "sanity.imageAsset";
      const dir = isImage ? imagesDir : filesDir;
      const relDir = isImage ? "assets/images" : "assets/files";

      // pick a stable, readable filename
      const ext = asset.extension || "bin";
      let base = sanitizeFilename(
        asset.originalFilename
          ? asset.originalFilename.replace(/\.[^.]+$/, "")
          : asset._id
      );
      let filename = `${base}.${ext}`;
      let n = 2;
      while (usedNames.has(filename.toLowerCase())) {
        filename = `${base}-${n++}.${ext}`;
      }
      usedNames.add(filename.toLowerCase());

      const target = path.join(dir, filename);
      const entry = {
        assetId: asset._id,
        type: isImage ? "image" : "file",
        file: `${relDir}/${filename}`,
        originalFilename: asset.originalFilename || null,
        url: asset.url,
        mimeType: asset.mimeType || null,
        size: asset.size || null,
        dimensions:
          asset.metadata && asset.metadata.dimensions
            ? {
                width: asset.metadata.dimensions.width,
                height: asset.metadata.dimensions.height,
              }
            : null,
        usedBy: (usage.get(asset._id) || []).map((u) => ({
          document: `${u.docType} — ${u.docTitle}`,
          field: u.fieldPath,
        })),
      };

      try {
        if (!fs.existsSync(target) || fs.statSync(target).size === 0) {
          const res = await fetch(asset.url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const buf = Buffer.from(await res.arrayBuffer());
          fs.writeFileSync(target, buf);
        }
        entry.downloaded = true;
      } catch (err) {
        entry.downloaded = false;
        entry.error = String(err.message || err);
        failures.push(`${asset._id}: ${entry.error}`);
      }
      manifest.push(entry);
      done++;
      process.stdout.write(`  downloaded ${done}/${assetDocs.length} assets…\r`);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  console.log(`  downloaded ${done}/${assetDocs.length} assets.`);
  if (failures.length) {
    console.log(`  FAILED (${failures.length}):`);
    failures.forEach((f) => console.log(`    ${f}`));
  }

  manifest.sort((a, b) => a.file.localeCompare(b.file));
  return manifest;
}

/* --------------------------------------------- 4. human-readable markdown */

function portableTextToMarkdown(blocks) {
  const lines = [];
  for (const block of blocks) {
    if (!block || typeof block !== "object") continue;
    if (block._type === "block") {
      const text = (block.children || [])
        .map((c) => {
          let t = c.text || "";
          if (c.marks && c.marks.includes("strong")) t = `**${t}**`;
          if (c.marks && c.marks.includes("em")) t = `*${t}*`;
          return t;
        })
        .join("");
      const style = block.style || "normal";
      const prefix =
        style === "h1" ? "# "
        : style === "h2" ? "## "
        : style === "h3" ? "### "
        : style === "h4" ? "#### "
        : style === "h5" ? "##### "
        : style === "h6" ? "###### "
        : style === "blockquote" ? "> "
        : "";
      const bullet =
        block.listItem === "bullet" ? "- "
        : block.listItem === "number" ? "1. "
        : "";
      lines.push(`${bullet}${prefix}${text}`);
      lines.push("");
    } else {
      lines.push(`*(embedded ${block._type})*`);
      lines.push("");
    }
  }
  return lines.join("\n").trim();
}

function isPortableText(v) {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    v.every((b) => b && typeof b === "object" && b._type)  &&
    v.some((b) => b._type === "block")
  );
}

function renderValue(value, indentLevel, lines, ctx) {
  const indent = "  ".repeat(indentLevel);

  if (value === null || value === undefined) return;

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    lines.push(`${indent}${value}`);
    return;
  }

  if (isPortableText(value)) {
    const md = portableTextToMarkdown(value);
    lines.push(
      ...md.split("\n").map((l) => (l ? `${indent}${l}` : ""))
    );
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, i) => {
      if (item && typeof item === "object") {
        const label = item._type && item._type !== "object" ? ` (${item._type})` : "";
        lines.push(`${indent}- item ${i + 1}${label}:`);
        renderValue(item, indentLevel + 1, lines, ctx);
      } else {
        lines.push(`${indent}- ${item}`);
      }
    });
    return;
  }

  if (typeof value === "object") {
    // asset reference?
    if (typeof value._ref === "string") {
      if (value._ref.startsWith("image-") || value._ref.startsWith("file-")) {
        const file = ctx.assetFileById.get(value._ref);
        lines.push(
          `${indent}→ asset: ${file ? `\`${file}\`` : value._ref}`
        );
      } else {
        const refDoc = ctx.docById.get(value._ref);
        lines.push(
          `${indent}→ reference: ${
            refDoc ? `${refDoc._type} — ${docTitle(refDoc)}` : value._ref
          }`
        );
      }
      return;
    }
    // slug?
    if (value._type === "slug" && value.current) {
      lines.push(`${indent}${value.current}`);
      return;
    }
    for (const [k, v] of Object.entries(value)) {
      if (k.startsWith("_")) continue;
      if (v === null || v === undefined) continue;
      if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") {
        lines.push(`${indent}**${k}:** ${v}`);
      } else {
        lines.push(`${indent}**${k}:**`);
        renderValue(v, indentLevel + 1, lines, ctx);
      }
    }
  }
}

function documentToMarkdown(doc, ctx) {
  const lines = [];
  const isDraft = doc._id.startsWith("drafts.");
  lines.push(`# ${docTitle(doc)}${isDraft ? " (DRAFT)" : ""}`);
  lines.push("");
  lines.push(`- **Document type:** \`${doc._type}\``);
  lines.push(`- **Document ID:** \`${doc._id}\``);
  if (doc.slug && doc.slug.current) lines.push(`- **Slug:** \`${doc.slug.current}\``);
  lines.push(`- **Last updated:** ${doc._updatedAt}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  for (const [k, v] of Object.entries(doc)) {
    if (k.startsWith("_")) continue;
    if (k === "slug") continue;
    if (v === null || v === undefined) continue;
    lines.push(`## ${k}`);
    lines.push("");
    renderValue(v, 0, lines, ctx);
    lines.push("");
  }
  return lines.join("\n");
}

/* ----------------------------------------------------------------- main */

async function main() {
  console.log(`Backing up Sanity dataset ${PROJECT_ID}/${DATASET}…`);
  if (!TOKEN) {
    console.log("  (no SANITY_API_TOKEN found — drafts will be excluded)");
  }

  /* 1 — full dump */
  console.log("\n[1/4] Fetching all documents…");
  const docs = await fetchAllDocuments();

  const datasetDir = path.join(ROOT, "dataset");
  ensureDir(datasetDir);
  fs.writeFileSync(
    path.join(datasetDir, "documents.ndjson"),
    docs.map((d) => JSON.stringify(d)).join("\n")
  );
  fs.writeFileSync(
    path.join(datasetDir, "documents.json"),
    JSON.stringify(docs, null, 2)
  );

  const assetDocs = docs.filter(
    (d) => d._type === "sanity.imageAsset" || d._type === "sanity.fileAsset"
  );
  const contentDocs = docs.filter(
    (d) => d._type !== "sanity.imageAsset" && d._type !== "sanity.fileAsset"
  );

  /* 2 — asset usage map */
  console.log("\n[2/4] Mapping asset usage…");
  const usage = collectAssetUsage(docs);
  console.log(`  ${assetDocs.length} assets, ${usage.size} referenced.`);

  /* 3 — download assets */
  console.log("\n[3/4] Downloading assets…");
  const manifest = await downloadAssets(assetDocs, usage);
  fs.writeFileSync(
    path.join(ROOT, "asset-manifest.json"),
    JSON.stringify(manifest, null, 2)
  );

  // readable manifest
  const mLines = [
    "# Asset manifest",
    "",
    `Backup of ${PROJECT_ID}/${DATASET}, taken ${new Date().toISOString()}.`,
    "",
    "Every image/video/file in the dataset, and every place it is used.",
    "",
  ];
  for (const e of manifest) {
    mLines.push(`## \`${e.file}\``);
    mLines.push("");
    if (e.originalFilename) mLines.push(`- **Original filename:** ${e.originalFilename}`);
    mLines.push(`- **Asset ID:** \`${e.assetId}\``);
    if (e.dimensions) mLines.push(`- **Dimensions:** ${e.dimensions.width}×${e.dimensions.height}`);
    if (e.size) mLines.push(`- **Size:** ${(e.size / 1024 / 1024).toFixed(2)} MB`);
    mLines.push(`- **Source URL:** ${e.url}`);
    if (!e.downloaded) mLines.push(`- **⚠ DOWNLOAD FAILED:** ${e.error}`);
    if (e.usedBy.length) {
      mLines.push(`- **Used by:**`);
      for (const u of e.usedBy) {
        mLines.push(`  - ${u.document} → \`${u.field}\``);
      }
    } else {
      mLines.push(`- **Used by:** *(not referenced by any document — orphaned upload)*`);
    }
    mLines.push("");
  }
  fs.writeFileSync(path.join(ROOT, "ASSET-MANIFEST.md"), mLines.join("\n"));

  /* 4 — readable content files */
  console.log("\n[4/4] Writing readable content files…");
  const assetFileById = new Map(manifest.map((e) => [e.assetId, e.file]));
  const docById = new Map(docs.map((d) => [d._id, d]));
  const ctx = { assetFileById, docById };

  const usedPaths = new Set();
  let written = 0;
  for (const doc of contentDocs) {
    const typeDir = path.join(ROOT, "content", sanitizeFilename(doc._type));
    ensureDir(typeDir);
    const isDraft = doc._id.startsWith("drafts.");
    let base = sanitizeFilename(
      (doc.slug && doc.slug.current) || docTitle(doc)
    );
    if (isDraft) base = `DRAFT--${base}`;
    let file = path.join(typeDir, `${base}.md`);
    let n = 2;
    while (usedPaths.has(file.toLowerCase())) {
      file = path.join(typeDir, `${base}-${n++}.md`);
    }
    usedPaths.add(file.toLowerCase());
    fs.writeFileSync(file, documentToMarkdown(doc, ctx));
    written++;
  }
  console.log(`  wrote ${written} content files.`);

  /* README */
  const counts = {};
  for (const d of contentDocs) counts[d._type] = (counts[d._type] || 0) + 1;
  const readme = [
    "# Sanity content backup — Box 3 Projects",
    "",
    `Full backup of the Sanity dataset \`${PROJECT_ID}/${DATASET}\`,`,
    `taken **${new Date().toISOString()}**.`,
    "",
    "If Sanity ever goes down (or the account lapses), everything the",
    "site pulls from the CMS is preserved here.",
    "",
    "## What's in here",
    "",
    "| Path | Contents |",
    "| --- | --- |",
    "| `dataset/documents.ndjson` | Raw dump of every document, one per line — **restore-grade**. Can be re-imported with `sanity dataset import documents.ndjson <dataset>` |",
    "| `dataset/documents.json` | Same dump, pretty-printed for reading |",
    "| `content/<type>/<name>.md` | Human-readable version of every document — every heading, paragraph, button label, SEO title, meta description, etc. |",
    "| `assets/images/` | Every image, original quality |",
    "| `assets/files/` | Every file/video |",
    "| `ASSET-MANIFEST.md` | Every asset + exactly which document/field uses it |",
    "| `asset-manifest.json` | Same manifest, machine-readable |",
    "",
    "## Document counts",
    "",
    ...Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([t, c]) => `- \`${t}\`: ${c}`),
    `- image assets: ${assetDocs.filter((a) => a._type === "sanity.imageAsset").length}`,
    `- file assets: ${assetDocs.filter((a) => a._type === "sanity.fileAsset").length}`,
    "",
    "## Re-running the backup",
    "",
    "```",
    "node sanity-backup/backup.mjs",
    "```",
    "",
    "Safe to re-run any time — it re-fetches all content and only",
    "re-downloads assets that are missing.",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(ROOT, "README.md"), readme);

  console.log("\nDone. Backup written to sanity-backup/");
}

main().catch((err) => {
  console.error("\nBackup failed:", err);
  process.exit(1);
});
