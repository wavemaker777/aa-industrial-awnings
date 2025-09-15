// verify-assets.cjs  (use .js if your workflow calls node verify-assets.js)
const fs = require("fs"), fsp = fs.promises, path = require("path");
const ROOT = process.cwd();

// Minimal required files to package successfully
const REQUIRED = [
  "assets/style.css",
  "assets/app.js",
  "images/logo.webp",
  "images/award/top-banner.mp4",
  "images/award/top-banner.gif",
];

async function exists(p){ try{ await fsp.access(p); return true; }catch{ return false; } }

(async()=>{
  let fail = 0;
  for(const rel of REQUIRED){
    const ok = await exists(path.join(ROOT, rel));
    if(!ok){ console.error("MISSING:", rel); fail++; }
  }
  if(fail){
    console.error(`\n❌ Missing ${fail} required file(s).`);
    process.exit(1);
  }
  console.log("✅ Minimal assets present.");
})();
