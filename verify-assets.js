// verify-assets.js — checks that every referenced asset exists (case-sensitive)
// FIX: strip ?query and #hash so cache-busted URLs don't false-fail.
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

const ROOT = process.cwd();
const must = new Set();

function cleanUrl(u) {
  if (!u) return "";
  u = decodeURIComponent(u);
  u = u.split("#")[0].split("?")[0];  // strip cache-bust & hashes
  return u.replace(/^\//, "");
}

function collectFromHtml(s, base = ".") {
  const rx = /(src|href)=["']([^"']+)["']/g;
  let m;
  while ((m = rx.exec(s))) {
    const url = cleanUrl(m[2]);
    if (!url || /^(data:|https?:|mailto:|tel:|#)/.test(url)) continue;
    must.add(path.join(base, url));
  }
}

function collectFromJs(s) {
  // grab '/images/..' or 'images/..' string literals
  const rx = /['"]\/?images\/[^'"]+['"]/g;
  let m;
  while ((m = rx.exec(s))) {
    const v = cleanUrl(m[0].slice(1, -1));
    if (v) must.add(v);
  }
}

async function exists(p) {
  try { await fsp.access(p); return true; } catch { return false; }
}

async function main() {
  let fail = 0;

  try { collectFromHtml(await fsp.readFile("index.html", "utf8")); } catch {}
  try { collectFromHtml(await fsp.readFile("index_diag.html", "utf8")); } catch {}
  try { collectFromJs(await fsp.readFile("assets/app.js", "utf8")); } catch {}

  // Optional diag PNG fallback: don’t require it
  must.delete("images/gallery/Set01A.png");
  must.delete("gallery/Set01A.png");

  for (const rel of must) {
    const abs = path.join(ROOT, rel);
    const ok = await exists(abs);
    if (!ok) { console.error("MISSING:", rel); fail++; }
  }

  if (fail) {
    console.error(`\n❌ Missing ${fail} referenced file(s).`);
    process.exit(1);
  } else {
    console.log("✅ All referenced assets exist.");
  }
}
main();
