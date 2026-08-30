// A temporary, decorative low-resolution layer over the accessible SVG.
// Four tiny draws create coarse-to-fine pixels; there is no continuous loop.
function ready() {
  const root = document.documentElement;
  const frame = document.querySelector('.hero__wordmark-frame');
  const image = frame?.querySelector('.hero__wordmark');
  if (!root.dataset.wordmarkIntro || !(frame instanceof HTMLElement) || !(image instanceof HTMLImageElement)) return;

  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches) return;

  let canvas;
  let finished = false;
  const timers = [];
  const finish = () => {
    if (finished) return;
    finished = true;
    timers.forEach((timer) => window.clearTimeout(timer));
    canvas?.remove();
    delete frame.dataset.wordmarkPixels;
    image.removeEventListener('load', start);
    image.removeEventListener('error', finish);
    frame.removeEventListener('animationend', onAnimationEnd);
    motion.removeEventListener('change', finish);
  };
  const onAnimationEnd = (event) => {
    if (event.target === frame && event.animationName === 'wordmark-crt') finish();
  };
  const start = () => {
    if (finished || !root.dataset.wordmarkIntro || motion.matches || !image.naturalWidth) {
      finish();
      return;
    }
    try {
      canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) { finish(); return; }
      canvas.className = 'hero__wordmark-pixels';
      canvas.setAttribute('aria-hidden', 'true');

      const draw = (width) => {
        canvas.width = width;
        canvas.height = Math.round(width * image.naturalHeight / image.naturalWidth);
        context.imageSmoothingEnabled = false;
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
      };
      draw(48);
      frame.append(canvas);
      frame.dataset.wordmarkPixels = 'true';

      for (const [delay, width] of [[250, 64], [500, 108], [850, 216]]) {
        timers.push(window.setTimeout(() => {
          if (finished || !root.dataset.wordmarkIntro || motion.matches) { finish(); return; }
          try { draw(width); } catch { finish(); }
        }, delay));
      }
    } catch {
      finish();
    }
  };

  // A late image never delays the static fallback or starts a second entrance.
  timers.push(window.setTimeout(finish, 2000));
  frame.addEventListener('animationend', onAnimationEnd);
  motion.addEventListener('change', finish, { once: true });
  if (image.complete) start();
  else {
    image.addEventListener('load', start, { once: true });
    image.addEventListener('error', finish, { once: true });
  }
}

export { ready };
