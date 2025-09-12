// Minimal NC121-safe JS (no hard-coded image paths; safe for CI verifier)
document.addEventListener('DOMContentLoaded', () => {
  // Award reveal ~5s
  const award = document.querySelector('.award-vert');
  if (award) setTimeout(() => award.classList.add('show'), 5000);

  // Typewriter overlay text (shows if .overlayText exists)
  const overlayLines = [
    "Precision framing.",
    "All-weather fabric.",
    "Clean installs.",
    "Built to last."
  ];
  function typewriter(el, text, speed=28){
    if (!el) return Promise.resolve();
    el.textContent = "";
    let i = 0;
    return new Promise(resolve => {
      const tick = () => {
        el.textContent = text.slice(0, i++);
        if (i <= text.length) setTimeout(tick, speed);
        else resolve();
      };
      tick();
    });
  }

  // Optional mask pulse so something happens even without image swaps
  const panels = document.querySelectorAll('.panel');
  panels.forEach((panel, idx) => {
    const mask = panel.querySelector('.mask');
    const text = panel.querySelector('.overlayText');
    const cycle = async () => {
      if (!mask || !text) return;
      mask.classList.add('show');
      await typewriter(text, overlayLines[idx % overlayLines.length], 28);
      setTimeout(() => mask.classList.remove('show'), 450);
      setTimeout(cycle, 5200);
    };
    cycle();
  });
});
