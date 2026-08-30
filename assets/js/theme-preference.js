// Restore only this homepage's palette before its styles render. No tracking.
(() => {
  const themes = ['sovereign', 'tokyo-night', 'catppuccin', 'gruvbox', 'black-gold', 'black-turq', 'vhs-80'];
  try {
    const saved = window.localStorage.getItem('omarchy-sovereign-theme');
    if (themes.includes(saved)) document.documentElement.dataset.siteTheme = saved;
  } catch {
    // Storage can be unavailable; the original design remains the fallback.
  }
})();
