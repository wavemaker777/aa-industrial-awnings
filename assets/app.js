// NC120: deterministic show of award + robust gallery cycles (absolute paths)
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const a = document.getElementById('award');
    if (a) {
      a.classList.add('show');
      const strap = a.querySelector('.type');
      typewriter(strap, "Voted Best in the Business — 2025", 26);
    }
  }, 5000);

  // Start panels immediately (no observer gating to avoid “never starts”)
  [0,1,2,3].forEach(runPanel);
});

function typewriter(node, text, cps=30){
  if(!node) return;
  node.textContent = "";
  let i=0; (function tick(){ if(i<=text.length){ node.textContent = text.slice(0,i++); setTimeout(tick, 1000/cps);} })();
}
function typewriterQuick(node, text){
  node.textContent = ""; let i=0, cps=22;
  (function write(){ if(i<=text.length){ node.textContent = text.slice(0,i++); setTimeout(write, 1000/cps);} })();
}

// ABSOLUTE paths eliminate path/case issues
const panels = [
  ['/images/gallery/Set01A.webp','/images/gallery/Set01B.webp','/images/gallery/Set02A.webp','/images/gallery/Set02B.webp','/images/gallery/Set03A.webp','/images/gallery/Set03B.webp'],
  ['/images/gallery/Set04A.webp','/images/gallery/Set04B.webp','/images/gallery/Set05A.webp','/images/gallery/Set05B.webp','/images/gallery/Set06A.webp','/images/gallery/Set06B.webp'],
  ['/images/gallery/Set07A.webp','/images/gallery/Set07B.webp','/images/gallery/Set08A.webp','/images/gallery/Set08B.webp','/images/gallery/Set09A.webp','/images/gallery/Set09B.webp'],
  ['/images/gallery/Set10A.webp','/images/gallery/Set10B.webp','/images/gallery/Set11A.webp','/images/gallery/Set11B.webp','/images/gallery/Set12A.webp','/images/gallery/Set12B.webp'],
];
const panelText = [
  ["Factory-Direct. No Middleman.","Nationwide Install — Any Scale."],
  ["Storm-Rated Aluminum Frames.","Commercial Membranes. Welded Seams."],
  ["Trusted by National Restaurant Chains.","Permits, Drawings, Fast Turnarounds."],
  ["5-Year Craft Warranty. USA Built.","48-Hour Quotes. Best Price."]
];

function runPanel(n){
  const el = document.querySelector(`.panel[data-panel="${n}"]`);
  if(!el) return;
  const img = el.querySelector('img'), mask = el.querySelector('.mask'), txt = el.querySelector('.overlayText');
  const list = panels[n]; let i=0, t=0;

  function cycle(){
    mask.style.opacity = 0; txt.style.opacity = 0;
    img.src = list[i % list.length];                // show image ~8s
    setTimeout(()=>{                                // fade to black .35s
      mask.style.opacity = 1;
      setTimeout(()=>{
        typewriterQuick(txt, panelText[n][t % 2]);  // ~0.9s typewriter
        txt.style.opacity = 1;
        setTimeout(()=>{
          txt.style.opacity = 0;                    // +1.0s clean black
          setTimeout(()=>{ i++; t++; cycle(); }, 1000);
        }, 900);
      }, 350);
    }, 8000);
  }
  cycle();
}

// Ensure brand link acts as Home
document.querySelector('.brand-float')?.setAttribute('href','/');
