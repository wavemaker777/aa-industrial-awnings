// build.js — creates dist_server/ (absolute paths) and dist_local/ (relative paths)
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
  await mkdirp(dst);
  for (const ent of await fsp.readdir(src, { withFileTypes: true })) {
    const s = path.join(src, ent.name), d = path.join(dst, ent.name);
    if (ent.isDirectory()) await cpDir(s, d);
    else await fsp.copyFile(s, d);
  }
}

function rewritePaths(html, mode) {
  const isServer = mode === "server";
  const cssHref  = isServer ? '/assets/style.css' : 'assets/style.css';
  const jsSrc    = isServer ? '/assets/app.js'    : 'assets/app.js';
  const homeHref = isServer ? '/'                 : 'index.html';

  html = html.replace(/href="[^"]*style\.css[^"]*"/, `href="${cssHref}?${BUST}"`);
  html = html.replace(/src="[^"]*app\.js[^"]*"/,     `src="${jsSrc}?${BUST}"`);
  html = html.replace(/href="\/"/g, `href="${homeHref}"`);

  if (isServer) {
    html = html
      .replace(/href="assets\//g, 'href="/assets/')
      .replace(/src="assets\//g,  'src="/assets/')
      .replace(/href="images\//g, 'href="/images/')
      .replace(/src="images\//g,  'src="/images/');
  } else {
    html = html
      .replace(/href="\/assets\//g, 'href="assets/')
      .replace(/src="\/assets\//g,  'src="assets/')
      .replace(/href="\/images\//g, 'href="images/')
      .replace(/src="\/images\//g,  'src="images/');
  }
  return html;
}

async function rewriteAppJsFor(mode) {
  const p = path.join(ROOT, "assets", "app.js");
  let s = await fsp.readFile(p, "utf8").catch(()=> "");
  if (!s) return s;
  if (mode === "server") s = s.replace(/(['"])images\//g, '$1/images/');
  else s = s.replace(/(['"])\/images\//g, '$1images/');
  return s;
}

async function writeBuild(mode) {
  const OUT = mode === "server" ? OUT_SERVER : OUT_LOCAL;
  await rmrf(OUT); await mkdirp(OUT);

  if (fs.existsSync(path.join(ROOT, "assets")))
    await cpDir(path.join(ROOT, "assets"), path.join(OUT, "assets"));
  if (fs.existsSync(path.join(ROOT, "images")))
    await cpDir(path.join(ROOT, "images"), path.join(OUT, "images"));

  const jsOut = await rewriteAppJsFor(mode);
  if (jsOut) await fsp.writeFile(path.join(OUT, "assets", "app.js"), jsOut, "utf8");

  if (fs.existsSync(path.join(ROOT, "assets", "style.css")))
    await fsp.copyFile(path.join(ROOT, "assets", "style.css"), path.join(OUT, "assets", "style.css"));

  for (const f of ["index.html", "index_diag.html"]) {
    if (!fs.existsSync(path.join(ROOT, f))) continue;
    let html = await fsp.readFile(path.join(ROOT, f), "utf8");
    html = rewritePaths(html, mode);
    await fsp.writeFile(path.join(OUT, f), html, "utf8");
  }

  if (mode === "server") {
    for (const f of [".htaccess", "contact.php"]) {
      if (fs.existsSync(path.join(ROOT, f)))
        await fsp.copyFile(path.join(ROOT, f), path.join(OUT, f));
    }
  }
}

(async () => {
  await writeBuild("server");
  await writeBuild("local");
  console.log("✅ Built dist_server/ and dist_local/ with", BUST);
})();
