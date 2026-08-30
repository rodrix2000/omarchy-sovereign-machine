// Prepare this homepage's first paint: saved palette and optional wordmark
// entrance. The image is visible by default; enhancement is brief and fail-open.
(() => {
  const themes = ['sovereign', 'tokyo-night', 'catppuccin', 'gruvbox', 'black-gold', 'black-turq', 'vhs-80'];
  try {
    const saved = window.localStorage.getItem('omarchy-sovereign-theme');
    if (themes.includes(saved)) document.documentElement.dataset.siteTheme = saved;
  } catch {
    // Storage can be unavailable; the original design remains the fallback.
  }

  try {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Deep links should take the visitor straight to their destination.
    if (motion.matches || window.location.hash) return;

    const finish = () => {
      delete document.documentElement.dataset.wordmarkIntro;
      motion.removeEventListener('change', finish);
    };
    motion.addEventListener('change', finish, { once: true });
    // Schedule the fail-open cleanup before opting in. CSS completes even if
    // the main module fails; slow styles/images simply get the static mark.
    window.setTimeout(finish, 1800);
    document.documentElement.dataset.wordmarkIntro = 'true';
  } catch {
    // Unsupported motion APIs leave the native, accessible image untouched.
  }
})();
