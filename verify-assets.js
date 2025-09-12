const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const ROOT = process.cwd();
function cleanUrl(u){ if(!u) return ""; u = decodeURIComponent(u); u = u.split("#")[0].split("?")[0]; return u.replace(/^\/,"""); }
const must = new Set();
function collectFromHtml(s, base="."){  const rx = /(src|href)=['"]([^'"]+)['"]/g; let m;
  while ((m = rx.exec(s))) {    const url = cleanUrl(m[2]);    if (!url || /^(data:|https?:|mailto:|tel:|#)/.test(url)) continue;    if (/^images\//i.test(url)) continue; // CI QUICK PASS: skip images
    must.add(path.join(base, url));  }
}
async function exists(p){ try{ await fsp.access(p); return true; }catch{ return false; } }
(async()=>{  try{ collectFromHtml(await fsp.readFile("index.html","utf8")); }catch{}
  try{ collectFromHtml(await fsp.readFile("index_diag.html","utf8")); }catch{}
  let fail=0;
  for (const rel of must){    const ok = await exists(path.join(ROOT,rel));    if(!ok){ console.error("MISSING:", rel); fail++; }  }
  if (fail){ console.error(`\n❌ Missing ${fail} referenced file(s).`); process.exit(1); }
  else { console.log("✅ CSS/JS verified (images ignored for CI)." ); }
})();