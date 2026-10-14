// Injected into every page before the app loads (page.addInitScript).
// Headless Chromium draws no cursor, so this paints a macOS-style arrow and
// glides it between targets with eased motion. It never receives events
// (pointer-events: none); the real click is sent by Playwright underneath it.
(() => {
  const cfg = window.__SIZZLE__ || {};

  // Recording-only copy swap (e.g. the home greeting's name). The app itself is untouched.
  const swaps = cfg.textSwaps || [];
  if (swaps.length) {
    const apply = (node) => {
      if (node.nodeType === 3) {
        let t = node.nodeValue;
        for (const [from, to] of swaps) if (t.includes(from)) t = t.split(from).join(to);
        if (t !== node.nodeValue) node.nodeValue = t;
      } else if (node.childNodes) node.childNodes.forEach(apply);
    };
    new MutationObserver((muts) => muts.forEach((m) => {
      if (m.type === 'characterData') apply(m.target);
      m.addedNodes.forEach(apply);
    })).observe(document, { subtree: true, childList: true, characterData: true });
    document.addEventListener('DOMContentLoaded', () => apply(document.body));
  }

  const SVG = `<svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.5 2.8v16.9l4.4-4.1 2.9 6.5 2.7-1.2-2.9-6.3h6.1z" fill="#0A0A0A" stroke="#FFFFFF" stroke-width="1.6" stroke-linejoin="round"/></svg>`;

  function mount() {
    if (document.getElementById('__sizzle_cursor')) return;
    const el = document.createElement('div');
    el.id = '__sizzle_cursor';
    el.innerHTML = SVG + '<span></span>';
    Object.assign(el.style, {
      position: 'fixed', left: '0', top: '0', width: '26px', height: '26px',
      zIndex: '2147483647', pointerEvents: 'none', willChange: 'transform',
      filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.45))',
    });
    const ring = el.querySelector('span');
    Object.assign(ring.style, {
      position: 'absolute', left: '-14px', top: '-14px', width: '28px', height: '28px',
      borderRadius: '50%', border: '2px solid rgba(244,242,255,.85)', opacity: '0',
      transform: 'scale(.4)', pointerEvents: 'none',
    });
    document.documentElement.appendChild(el);
    const start = cfg.cursorStart || [300, 760];
    window.__cursorPos = { x: start[0], y: start[1] };
    place(el, start[0], start[1]);
  }
  // The arrow's tip sits at (4.5, 2.8) inside the 24-unit box; offset so the TIP is on target.
  function place(el, x, y) { el.style.transform = `translate(${x - 4.9}px, ${y - 3}px)`; }
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  window.__cursor = {
    moveTo(x, y, ms = 700) {
      mount();
      const el = document.getElementById('__sizzle_cursor');
      const from = { ...window.__cursorPos };
      // A slight arc reads as a hand, a straight line reads as a robot.
      const bend = Math.min(40, Math.hypot(x - from.x, y - from.y) * 0.12);
      return new Promise((resolve) => {
        const t0 = performance.now();
        const step = (now) => {
          const t = Math.min(1, (now - t0) / ms), e = ease(t);
          const cx = from.x + (x - from.x) * e;
          const cy = from.y + (y - from.y) * e - Math.sin(Math.PI * e) * bend;
          place(el, cx, cy);
          if (t < 1) requestAnimationFrame(step);
          else { window.__cursorPos = { x, y }; resolve(); }
        };
        requestAnimationFrame(step);
      });
    },
    pulse() {
      const el = document.getElementById('__sizzle_cursor');
      if (!el) return;
      const ring = el.querySelector('span');
      ring.animate(
        [{ opacity: 0.9, transform: 'scale(.4)' }, { opacity: 0, transform: 'scale(1.6)' }],
        { duration: 450, easing: 'cubic-bezier(.2,.7,.3,1)' },
      );
      el.animate([{ scale: 1 }, { scale: 0.86 }, { scale: 1 }], { duration: 220 });
    },
    show() { mount(); },
  };
  document.addEventListener('DOMContentLoaded', mount);
})();
