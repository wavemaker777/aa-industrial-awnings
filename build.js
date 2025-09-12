// build.js — guarded dual build (absolute + relative) with cache-bust
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

const ROOT = process.cwd();
const OUT_SERVER = path.join(ROOT, "dist_server");
const OUT_LOCAL  = path.join(ROOT, "dist_local");
const BUST = `v=${Date.now()}`;

async function rmrf(p){ await fsp.rm(p, { recursive: true, force: true }); }
async function mkdirp(p){ await fsp.mkdir(p, { recursive: true }); }
async function cpDir(src, dst){
  if (!fs.existsSync(src)) return;
  await mkdirp(dst);
  for (const ent of await fsp.readdir(src, { withFileTypes: true })) {
    const s = path.join(src, ent.name), d = path.join(dst, ent.name);
    if (ent.isDirectory()) await cpDir(s, d);
    else await fsp.copyFile(s, d);
  }
}
function rewritePaths(html, mode) {
  if (!html) return "";
  const isServer = mode === "server";
  const cssHref  = isServer ? '/assets/style.css' : 'assets/style.css';
  const jsSrc    = isServer ? '/assets/app.js'    : 'assets/app.js';
  const homeHref = isServer ? '/'                 : 'index.html';
  html = html.replace(/href="[^"]*style\.css[^"]*"/, `href="${cssHref}?${BUST}"`);
  html = html.replace(/src="[^"]*app\.js[^"]*"/,     `src="${jsSrc}?${BUST}"`);
  html = html.replace(/href="\/"/g, `href="${homeHref}"`);
  if (isServer) {
    html = html.replace(/href="assets\//g, 'href="/assets/')
               .replace(/src="assets\//g,  'src="/assets/')
               .replace(/href="images\//g, 'href="/images/')
               .replace(/src="images\//g,  'src="/images/');
  } else {
    html = html.replace(/href="\/assets\//g, 'href="assets/')
               .replace(/src="\/assets\//g,  'src="assets/')
               .replace(/href="\/images\//g, 'href="images/')
               .replace(/src="\/images\//g,  'src="images/');
  }
  return html;
}
async function readOrEmpty(p){ try { return await fsp.readFile(p,"utf8"); } catch { return ""; } }
async function writeBuild(mode) {
  const OUT = mode === "server" ? OUT_SERVER : OUT_LOCAL;
  await rmrf(OUT); await mkdirp(OUT);
  await cpDir(path.join(ROOT, "assets"), path.join(OUT, "assets"));
  await cpDir(path.join(ROOT, "images"), path.join(OUT, "images"));
  const js = await readOrEmpty(path.join(ROOT,"assets","app.js"));
  if (js) {
    let s = js;
    s = mode === "server" ? s.replace(/(['"])images\//g,'$1/images/') :
                            s.replace(/(['"])\/images\//g,'$1images/');
    await fsp.writeFile(path.join(OUT,"assets","app.js"), s, "utf8");
  }
  const css = path.join(ROOT,"assets","style.css");
  if (fs.existsSync(css)) await fsp.copyFile(css, path.join(OUT,"assets","style.css"));
  for (const f of ["index.html","index_diag.html"]) {
    const src = path.join(ROOT,f);
    if (!fs.existsSync(src)) continue;
    const html = rewritePaths(await readOrEmpty(src), mode);
    await fsp.writeFile(path.join(OUT,f), html, "utf8");
  }
  if (mode === "server") {
    for (const f of [".htaccess","contact.php"]) {
      const p = path.join(ROOT,f);
      if (fs.existsSync(p)) await fsp.copyFile(p, path.join(OUT,f));
    }
  }
}
(async () => {
  await writeBuild("server");
  await writeBuild("local");
  console.log("✅ Built dist_server/ and dist_local/ with", BUST);
})();
