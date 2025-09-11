
// Award delay (5s) + strap with typewriter
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(()=> {
    const a = document.getElementById('award');
    if(!a) return;
    a.classList.add('show');
    const strap = a.querySelector('.type');
    typewriter(strap, "Voted Best in the Business — 2025", 26);
  }, 5000);
});

function typewriter(node, text, cps=30){
  if(!node) return;
  node.textContent = "";
  let i = 0;
  const tick = () => {
    if(i <= text.length){
      node.textContent = text.slice(0,i) + (i<text.length ? "" : "");
      i++;
      setTimeout(tick, 1000/cps);
    }
  };
  tick();
}

// Panels and text lines
const panels = [
  ['images/gallery/Set01A.webp','images/gallery/Set01B.webp','images/gallery/Set02A.webp','images/gallery/Set02B.webp','images/gallery/Set03A.webp','images/gallery/Set03B.webp'],
  ['images/gallery/Set04A.webp','images/gallery/Set04B.webp','images/gallery/Set05A.webp','images/gallery/Set05B.webp','images/gallery/Set06A.webp','images/gallery/Set06B.webp'],
  ['images/gallery/Set07A.webp','images/gallery/Set07B.webp','images/gallery/Set08A.webp','images/gallery/Set08B.webp','images/gallery/Set09A.webp','images/gallery/Set09B.webp'],
  ['images/gallery/Set10A.webp','images/gallery/Set10B.webp','images/gallery/Set11A.webp','images/gallery/Set11B.webp','images/gallery/Set12A.webp','images/gallery/Set12B.webp'],
];
const panelText = [
  ["Factory-Direct. No Middleman.","Nationwide Install — Any Scale."],
  ["Storm-Rated Aluminum Frames.","Commercial Membranes. Welded Seams."],
  ["Trusted by National Restaurant Chains.","Permits, Drawings, Fast Turnarounds."],
  ["5-Year Craft Warranty. USA Built.","48-Hour Quotes. Best Price."]
];

function typewriterQuick(node, text){
  node.textContent = "";
  let i=0;
  const cps = 22; // approx chars per second
  const write = () => {
    if(i<=text.length){
      node.textContent = text.slice(0,i);
      i++;
      setTimeout(write, 1000/cps);
    }
  };
  write();
}

function runPanel(n){
  const el = document.querySelector(`.panel[data-panel="${n}"]`);
  if(!el) return;
  const img = el.querySelector('img'),
        mask = el.querySelector('.mask'),
        txt = el.querySelector('.overlayText');
  const list = panels[n]; let i=0, t=0;

  function cycle(){
    mask.style.opacity = 0; txt.style.opacity = 0;
    img.src = list[i % list.length];                // image for ~8s
    setTimeout(()=>{                                 // fade to black .35s
      mask.style.opacity = 1;
      setTimeout(()=>{
        // Typewriter text for ~0.9-1.2s shown window
        const message = panelText[n][t % 2];
        typewriterQuick(txt, message);
        txt.style.opacity = 1;
        setTimeout(()=>{
          txt.style.opacity = 0;                     // clear text
          setTimeout(()=>{                           // +1.0s empty black
            i++; t++; cycle();
          }, 1000);
        }, 900);
      }, 350);
    }, 8000);
  }
  cycle();
}

let started=false;
const galleryEl = document.getElementById('gallery');
if (galleryEl){
  new IntersectionObserver(es=>{
    if(es.some(e=>e.isIntersecting) && !started){
      started=true;
      [0,1,2,3].forEach(runPanel);
    }
  },{threshold:.2}).observe(galleryEl);
}

// Ensure brand link acts as Home
document.querySelector('.brand-float')?.setAttribute('href','/');
