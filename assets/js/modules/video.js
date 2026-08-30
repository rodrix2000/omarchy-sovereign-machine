// Linked posters work without JavaScript. Only explicitly marked homepage
// posters upgrade to the cinema dialog; legacy inline players stay independent.
// No embed is requested until someone chooses a video.

const PARAMS = 'autoplay=1&rel=0';

function embed(facade) {
  const id = facade.dataset.video;
  if (id == null || id === '') return;

  const iframe = document.createElement('iframe');
  iframe.title = facade.dataset.title ?? 'Video';
  iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?${PARAMS}`;
  iframe.allow =
    'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allowFullscreen = true;

  facade.replaceWith(iframe);
  iframe.focus();
}

function ready() {
  setupCinema();

  for (const facade of document.querySelectorAll('.video__facade[data-video]')) {
    facade.addEventListener('click', (event) => {
      event.preventDefault();
      embed(facade);
    }, { once: true });
  }
}

function setupCinema() {
  const dialog = document.querySelector('.home .video-dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const title = dialog.querySelector('#video-dialog-title');
  const screen = dialog.querySelector('.video-dialog__screen');
  const close = dialog.querySelector('.video-dialog__close');
  const youtube = dialog.querySelector('a');
  if (!title || !screen || !close || !youtube) return;

  let trigger;
  let scroll;
  let pressedBackdrop = false;

  // Native dialog handles modal focus containment and Escape. Removing the
  // iframe on every close stops both playback and background network activity.
  dialog.addEventListener('close', () => {
    screen.replaceChildren();
    trigger?.focus({ preventScroll: true });
    if (scroll) window.scrollTo({ ...scroll, behavior: 'instant' });
    trigger = null;
    scroll = null;
  });
  close.addEventListener('click', () => dialog.close());

  const leaveForYouTube = (event) => {
    if (event.defaultPrevented || (event.type === 'auxclick' && event.button !== 1)) return;
    // Stop immediately before the new tab can background this page; the native
    // close event still restores focus/scroll. Do not cancel the real link.
    screen.replaceChildren();
    dialog.close();
  };
  youtube.addEventListener('click', leaveForYouTube);
  youtube.addEventListener('auxclick', leaveForYouTube);

  const outside = (event) => {
    const rect = dialog.getBoundingClientRect();
    return event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom);
  };
  dialog.addEventListener('pointerdown', (event) => { pressedBackdrop = outside(event); });
  dialog.addEventListener('click', (event) => {
    if (pressedBackdrop && outside(event)) dialog.close();
    pressedBackdrop = false;
  });

  for (const facade of document.querySelectorAll('.home #watch .video__facade[data-video-dialog]')) {
    // Derive the embed only from the existing, exact YouTube destination.
    const id = facade.getAttribute('href')?.match(/^https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})$/)?.[1];
    const name = facade.closest('.media-card')?.querySelector('h3')?.textContent.trim();
    if (!id || !name) continue;

    facade.setAttribute('role', 'button');
    facade.setAttribute('aria-haspopup', 'dialog');
    facade.setAttribute('aria-controls', dialog.id);
    facade.setAttribute('aria-label', `Play ${name} (opens video dialog)`);
    facade.addEventListener('keydown', (event) => {
      if (event.key === ' ' && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
        event.preventDefault();
        if (!event.repeat) facade.click();
      }
    });
    facade.addEventListener('click', (event) => {
      // Preserve Cmd/Ctrl-click, Shift-click, middle-click and context menus.
      if (event.defaultPrevented || event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (dialog.open) return;

      title.textContent = name;
      youtube.href = facade.href;
      const position = { left: window.scrollX, top: window.scrollY };
      try {
        dialog.showModal();
      } catch {
        // If enhancement is unavailable, the original link still navigates.
        return;
      }
      event.preventDefault();
      trigger = facade;
      scroll = position;
      close.focus({ preventScroll: true });

      const iframe = document.createElement('iframe');
      iframe.title = name;
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?${PARAMS}&playsinline=1`;
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.allowFullscreen = true;
      screen.replaceChildren(iframe);
    });
  }
}

export { ready };
