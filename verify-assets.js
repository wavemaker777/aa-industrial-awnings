const fs = require("fs"), fsp = fs.promises, path = require("path");
const ROOT = process.cwd();
const REQUIRED = [
  "assets/style.css","assets/app.js",
  "images/hero/landing.gif","images/hero/landing.mp4",
  "images/award/trophy.gif","images/award/trophy.mp4",
  "images/logo.webp","images/logo_anim.gif",
  "images/workshop/design.webp","images/workshop/fabrication.webp","images/workshop/fabric.webp","images/workshop/install.webp",
  "images/gallery/Set01A.webp","images/gallery/Set01B.webp",
  "images/gallery/Set02A.webp","images/gallery/Set02B.webp",
  "images/gallery/Set03A.webp","images/gallery/Set03B.webp",
  "images/gallery/Set04A.webp","images/gallery/Set04B.webp",
  "images/gallery/Set05A.webp","images/gallery/Set05B.webp",
  "images/gallery/Set06A.webp","images/gallery/Set06B.webp",
  "images/gallery/Set07A.webp","images/gallery/Set07B.webp",
  "images/gallery/Set08A.webp","images/gallery/Set08B.webp",
  "images/gallery/Set09A.webp","images/gallery/Set09B.webp",
  "images/gallery/Set10A.webp","images/gallery/Set10B.webp",
  "images/gallery/Set11A.webp","images/gallery/Set11B.webp",
  "images/gallery/Set12A.webp","images/gallery/Set12B.webp",
];
async function exists(p){ try{ await fsp.access(p); return true; }catch{ return false; } }
(async()=>{
  let fail=0;
  for (const rel of REQUIRED){
    const ok = await exists(path.join(ROOT, rel));
    if(!ok){ console.error("MISSING:", rel); fail++; }
  }
  if(fail){ console.error(`\n❌ Missing ${fail} required file(s). NO PLACEHOLDERS CREATED.`); process.exit(1); }
  else { console.log("✅ All required CSS/JS/images present."); }
})();
