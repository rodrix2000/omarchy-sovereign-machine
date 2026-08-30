const THEMES = {
  'tokyo-night': {
    name: 'Tokyo Night',
    image: '/manual/images/tokyo-night-preview.webp',
    alt: 'Tokyo Night theme running across an Omarchy desktop',
  },
  catppuccin: {
    name: 'Catppuccin',
    image: '/manual/images/catppuccin-preview.webp',
    alt: 'Catppuccin theme running across an Omarchy desktop',
  },
  gruvbox: {
    name: 'Gruvbox',
    image: '/manual/images/gruvbox-preview.webp',
    alt: 'Gruvbox theme running across an Omarchy desktop',
  },
};

const COMMAND_TEXT = `~ > omarchy
Omarchy command center

~ > omarchy theme list
~ > omarchy theme set <name>
~ > omarchy screenshot
~ > omarchy debug`;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function setupBootSequence() {
  if (prefersReducedMotion()) return;
  document.body.classList.add('home-boot');
  window.setTimeout(() => document.body.classList.remove('home-boot'), 1200);
}

function setupMobileNavigation() {
  const menu = document.querySelector('.site-menu');
  if (!(menu instanceof HTMLDetailsElement)) return;

  menu.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !menu.open) return;
    menu.open = false;
    menu.querySelector('summary')?.focus();
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menu.open = false;
    });
  });

  const desktop = window.matchMedia('(min-width: 64rem)');
  desktop.addEventListener('change', (event) => {
    if (event.matches) menu.open = false;
  });
}

function setupPaneFocus() {
  document.querySelectorAll('[data-pane-group]').forEach((group) => {
    if (!(group instanceof HTMLElement)) return;

    const panes = group.querySelectorAll('[data-pane]');
    const status = group.querySelector('[data-focus-status]');

    panes.forEach((pane) => {
      pane.addEventListener('click', () => {
        const focus = pane.getAttribute('data-pane');
        if (focus == null) return;

        group.dataset.focus = focus;
        panes.forEach((candidate) => {
          candidate.setAttribute('aria-pressed', String(candidate === pane));
        });
        if (status != null) status.textContent = `Focus: ${focus}`;
      });
    });
  });
}

function setupThemePreview() {
  const preview = document.querySelector('[data-theme-preview]');
  const image = preview?.querySelector('[data-theme-image]');
  const name = preview?.querySelector('[data-theme-name]');
  const status = preview?.querySelector('[data-theme-status]');
  if (!(preview instanceof HTMLElement) || !(image instanceof HTMLImageElement)) return;

  document.querySelectorAll('input[name="theme-preview"]').forEach((input) => {
    input.addEventListener('change', () => {
      if (!(input instanceof HTMLInputElement) || !input.checked) return;
      const theme = THEMES[input.value];
      if (theme == null) return;

      preview.dataset.themePreview = input.value;
      image.src = theme.image;
      image.alt = theme.alt;
      if (name != null) name.textContent = theme.name;
      if (status != null) status.textContent = `${theme.name} preview selected.`;
    });
  });
}

function setupCommandReplay() {
  const button = document.querySelector('[data-command-replay]');
  const output = document.querySelector('[data-command-output]');
  if (!(button instanceof HTMLButtonElement) || !(output instanceof HTMLElement)) return;

  let timer = 0;
  let line = 0;
  const lines = COMMAND_TEXT.split('\n');

  const finish = () => {
    if (timer !== 0) window.clearInterval(timer);
    timer = 0;
    output.textContent = COMMAND_TEXT;
    button.textContent = 'Replay command demo';
  };

  button.addEventListener('click', () => {
    if (timer !== 0) {
      finish();
      return;
    }
    if (prefersReducedMotion()) {
      finish();
      return;
    }

    line = 0;
    output.textContent = '';
    button.textContent = 'Stop animation';
    timer = window.setInterval(() => {
      output.textContent += `${line === 0 ? '' : '\n'}${lines[line]}`;
      line += 1;
      if (line >= lines.length) finish();
    }, 180);
  });
}

function ready() {
  if (!document.body.classList.contains('home')) return;
  setupBootSequence();
  setupMobileNavigation();
  setupPaneFocus();
  setupThemePreview();
  setupCommandReplay();
}

export { ready };
